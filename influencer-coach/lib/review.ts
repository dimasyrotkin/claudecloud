/**
 * Post reviews. Claude reviews a post (caption/script, screenshots, metrics), the review waits
 * for a human to approve or edit it, and only then reaches the creator. Approved scores feed
 * the learner: the weakest areas of real posts are stronger evidence of need than stated goals.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { platformLabel } from "./catalog.ts";
import { notifyAdmin, notifyReviewReady } from "./channels.ts";
import { prefer } from "./learner.ts";
import { AUDIENCE, PSYCHOLOGY, rulesBlock } from "./prompting.ts";
import { getCorrections, saveCreator, saveReview } from "./store.ts";
import type { Creator, PostInput, PostReview, ReviewContent, ReviewDimension } from "./types.ts";

const MODEL = process.env.REVIEW_MODEL ?? process.env.COACH_MODEL ?? "claude-opus-5-5";

export const DIMENSIONS: { id: ReviewDimension; label: string; topic: string }[] = [
  { id: "hook", label: "Hook", topic: "hooks" },
  { id: "storytelling", label: "Story & structure", topic: "storytelling" },
  { id: "visuals", label: "Visuals & cover", topic: "visuals" },
  { id: "pacing", label: "Pacing & editing", topic: "editing" },
  { id: "engagement", label: "Engagement & CTA", topic: "community" },
  { id: "positioning", label: "Niche & positioning", topic: "niche" },
];

/** Human reviewers approve before creators see anything, unless no admin is configured. */
export const manualReview = () => !!process.env.ADMIN_KEY && process.env.REVIEW_MODE !== "auto";

const Dim = z.enum(["hook", "storytelling", "visuals", "pacing", "engagement", "positioning"]);
const ReviewSchema = z.object({
  summary: z.string().describe("2-3 sentences: overall verdict and the single most important change"),
  scores: z.object({
    hook: z.number().int().describe("1-10"),
    storytelling: z.number().int().describe("1-10"),
    visuals: z.number().int().describe("1-10, use 5 if no image was provided"),
    pacing: z.number().int().describe("1-10, use 5 if it cannot be judged from the material"),
    engagement: z.number().int().describe("1-10"),
    positioning: z.number().int().describe("1-10"),
  }),
  strengths: z.array(z.string()).describe("2-3 specific things that work"),
  fixes: z.array(z.object({ dimension: Dim, issue: z.string(), fix: z.string() })).describe("2-4 fixes, most impactful first"),
  rewrittenHook: z.string().describe("A better opening line or first-2-seconds script, in the creator's voice"),
  nextExperiment: z.string().describe("One concrete A/B-style experiment for the next post"),
  confidence: z.enum(["low", "medium", "high"]),
  caveats: z.string().describe("What you could not see or judge (e.g. no video, no audio). Empty string if none."),
});

const clamp10 = (n: number) => Math.max(1, Math.min(10, Math.round(Number(n) || 5)));

export function sanitizeContent(raw: ReviewContent): ReviewContent {
  const scores = {} as Record<ReviewDimension, number>;
  for (const d of DIMENSIONS) scores[d.id] = clamp10(raw.scores?.[d.id] ?? 5);
  const str = (s: unknown, max = 1200) => (typeof s === "string" ? s.trim().slice(0, max) : "");
  return {
    summary: str(raw.summary),
    scores,
    strengths: (raw.strengths ?? []).map((s) => str(s, 400)).filter(Boolean).slice(0, 5),
    fixes: (raw.fixes ?? [])
      .filter((f) => DIMENSIONS.some((d) => d.id === f.dimension))
      .map((f) => ({ dimension: f.dimension, issue: str(f.issue, 400), fix: str(f.fix, 600) }))
      .filter((f) => f.issue || f.fix)
      .slice(0, 6),
    rewrittenHook: str(raw.rewrittenHook, 500),
    nextExperiment: str(raw.nextExperiment, 500),
    confidence: (["low", "medium", "high"] as const).includes(raw.confidence) ? raw.confidence : "medium",
    caveats: str(raw.caveats, 500),
  };
}

function describeInput(c: Creator, p: PostInput): string {
  const m = Object.entries(p.metrics).filter(([, v]) => typeof v === "number");
  return `Creator: ${c.name}, ${platformLabel(c.platform)}, niche "${c.niche}", stage ${c.experience}.
Their notes: ${c.notes.slice(-4).map((n) => n.text).join(" | ") || "none"}

Post URL: ${p.url || "not given"}
What the creator wanted this post to do: ${p.goal || "not given"}
Metrics: ${m.length ? m.map(([k, v]) => `${k}=${v}`).join(", ") : "not given"}
Screenshots attached: ${p.images.length}

Caption / script / transcript:
"""
${p.caption || "(none provided)"}
"""`;
}

async function claudeReview(c: Creator, p: PostInput): Promise<ReviewContent | null> {
  const client = new Anthropic();
  const images: Anthropic.Beta.BetaImageBlockParam[] = p.images.map((d) => ({
    type: "image",
    source: { type: "base64", media_type: "image/jpeg", data: d.replace(/^data:image\/\w+;base64,/, "") },
  }));
  const res = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(ReviewSchema) },
    system: `You review social media posts for creators and give honest, specific, kind feedback. A human coach checks your review before the creator sees it.
${AUDIENCE}
${PSYCHOLOGY}
Rules:
- Judge for their platform and goal. Quote their actual words when pointing at a problem.
- Only judge what you can see. If there is no video, say so in caveats and do not invent details about it.
- Metrics: interpret relative to typical micro-creator ranges as rules of thumb, never as precise benchmarks. Saves and shares per view matter more than likes.
- Be encouraging about effort and direct about fixes. Never comment on the creator's body or appearance unless they asked.${rulesBlock(await getCorrections())}`,
    messages: [{ role: "user", content: [...images, { type: "text", text: describeInput(c, p) }] }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) return null;
  return res.parsed_output;
}

/** Offline fallback: transparent rules of thumb, flagged as low confidence. */
export function heuristicReview(p: PostInput): ReviewContent {
  const text = p.caption.trim();
  const firstLine = text.split(/\n|(?<=[.!?])\s/)[0] ?? "";
  const words = firstLine.split(/\s+/).filter(Boolean).length;
  const hashtags = (text.match(/#\w+/g) ?? []).length;
  // A call to action lives at the end: look at the last ~200 chars without hashtags.
  const ending = text.replace(/#\w+/g, "").trim().slice(-200);
  const hasCta = /\b(comment|save this|share this|follow for|tell me|let me know|link in bio|which one|what do you|drop a)\b/i.test(ending) || ending.includes("?");
  const curiosity = /\d|\?|\byou\b|\bstop\b|\bsecret\b|\bmistake/i.test(firstLine);

  const hook = clamp10((words > 0 && words <= 12 ? 6 : 4) + (curiosity ? 2 : 0));
  const engagement = clamp10((hasCta ? 7 : 4) - (hashtags > 8 ? 1 : 0));
  const views = p.metrics.views ?? 0;
  const saveRate = views ? ((p.metrics.saves ?? 0) + (p.metrics.shares ?? 0)) / views : null;

  const fixes: ReviewContent["fixes"] = [];
  if (hook < 7) fixes.push({ dimension: "hook", issue: `Opening line "${firstLine.slice(0, 80)}" takes a while to get to the point.`, fix: "Lead with the result or a specific promise in under 10 words." });
  if (!hasCta) fixes.push({ dimension: "engagement", issue: "No call to action.", fix: "End with one specific question your audience can answer in a few words." });
  if (hashtags > 8) fixes.push({ dimension: "engagement", issue: `${hashtags} hashtags reads as spammy.`, fix: "Keep 3-5 specific hashtags." });
  if (saveRate !== null && saveRate < 0.01) fixes.push({ dimension: "positioning", issue: "Few saves or shares for the views it got.", fix: "Add one takeaway people would want to come back to (a list, a script, a recipe)." });

  return {
    summary: `Automated first pass (no AI configured). ${fixes.length ? `Biggest lever: ${fixes[0].fix}` : "The basics look solid."}`,
    scores: { hook, storytelling: 5, visuals: 5, pacing: 5, engagement, positioning: saveRate !== null && saveRate < 0.01 ? 4 : 5 },
    strengths: [hasCta ? "Has a clear call to action." : "", curiosity ? "The opening has a curiosity trigger." : ""].filter(Boolean),
    fixes,
    rewrittenHook: 'Template: "I [result] in [time]. Here\'s the one thing that made it work."',
    nextExperiment: "Post the same idea with two different first lines on two days and compare 3-second hold rate.",
    confidence: "low",
    caveats: "Rule-of-thumb checks on the text only. Visuals, pacing and story weren't assessed.",
  };
}

const newId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 10);

export async function createReview(c: Creator, input: PostInput): Promise<PostReview> {
  let ai: ReviewContent | null = null;
  let source: PostReview["source"] = "heuristic";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      ai = await claudeReview(c, input);
      if (ai) source = "claude";
    } catch (err) {
      if (err instanceof Anthropic.APIError) console.error(`Claude API error ${err.status}: ${err.message}`);
      else console.error("Review generation failed", err);
    }
  }
  const review: PostReview = {
    id: newId(),
    creatorId: c.id,
    createdAt: new Date().toISOString(),
    status: "pending",
    input,
    ai: sanitizeContent(ai ?? heuristicReview(input)),
    source,
  };
  c.reviewIds = [review.id, ...(c.reviewIds ?? [])].slice(0, 50);
  await saveReview(review, true);

  if (manualReview()) {
    await saveCreator(c);
    await notifyAdmin("New post review to check", `${c.name} (${platformLabel(c.platform)}) submitted a post. AI summary: ${review.ai.summary}`);
  } else {
    await approve(c, review, review.ai, "");
  }
  return review;
}

/** Publish a review to the creator and let its (human-checked) scores inform the learner. */
export async function approve(c: Creator, review: PostReview, content: ReviewContent, note: string): Promise<void> {
  const final = sanitizeContent(content);
  review.final = final;
  review.edited = JSON.stringify(final) !== JSON.stringify(review.ai);
  review.adminNote = note.trim().slice(0, 600) || undefined;
  review.status = "approved";
  review.reviewedAt = new Date().toISOString();

  const weakest = DIMENSIONS.map((d) => ({ d, s: final.scores[d.id] }))
    .filter((x) => x.s <= 6)
    .sort((a, b) => a.s - b.s)
    .slice(0, 2);
  for (const { d } of weakest) c.learner = prefer(c.learner, d.topic, true, 1.5);
  c.notes.push({
    at: review.reviewedAt,
    text: `Post review: weakest areas ${weakest.map((w) => w.d.label).join(", ") || "none"}. Next experiment: ${final.nextExperiment}`,
  });

  await saveReview(review);
  await saveCreator(c);
  await notifyReviewReady(c, review.id, final.summary);
}

export async function reject(review: PostReview, reason: string): Promise<void> {
  review.status = "rejected";
  review.rejectReason = reason.trim().slice(0, 600);
  review.reviewedAt = new Date().toISOString();
  await saveReview(review);
}

/** What the creator is allowed to see. Unapproved AI drafts and internal reasons stay hidden. */
export function creatorView(r: PostReview) {
  return {
    id: r.id,
    createdAt: r.createdAt,
    status: r.status,
    input: { url: r.input.url, caption: r.input.caption, goal: r.input.goal, images: r.input.images.slice(0, 1) },
    content: r.status === "approved" ? r.final : undefined,
    adminNote: r.status === "approved" ? r.adminNote : undefined,
    humanChecked: manualReview() && r.status === "approved",
    creatorReaction: r.creatorReaction,
  };
}
export type CreatorReviewView = ReturnType<typeof creatorView>;

export function validatePostInput(raw: Record<string, unknown>): { ok: true; value: PostInput } | { ok: false; error: string } {
  const str = (k: string, max: number) => (typeof raw[k] === "string" ? (raw[k] as string).trim().slice(0, max) : "");
  const caption = str("caption", 5000);
  const images = Array.isArray(raw.images)
    ? raw.images.filter((i): i is string => typeof i === "string" && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(i) && i.length < 250_000).slice(0, 3)
    : [];
  if (!caption && !images.length) return { ok: false, error: "Add the caption/script or at least one screenshot" };
  const url = str("url", 500);
  if (url && !/^https?:\/\//.test(url)) return { ok: false, error: "Post link should start with https://" };
  const metrics: PostInput["metrics"] = {};
  const rawMetrics = (raw.metrics ?? {}) as Record<string, unknown>;
  for (const k of ["views", "likes", "comments", "shares", "saves", "followers"] as const) {
    const n = Number(rawMetrics[k]);
    if (rawMetrics[k] !== "" && rawMetrics[k] != null && Number.isFinite(n) && n >= 0) metrics[k] = Math.round(n);
  }
  return { ok: true, value: { url, caption, goal: str("goal", 300), metrics, images } };
}
