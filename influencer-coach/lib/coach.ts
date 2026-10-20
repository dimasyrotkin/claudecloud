/**
 * Turns the learner's pick (topic + style + dials) into an actual tip.
 * Claude writes it when ANTHROPIC_API_KEY is set; otherwise the offline library is used.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { LIBRARY, STYLES, platformLabel, topicLabel, TOPICS } from "./catalog.ts";
import { describeDials, type Pick } from "./learner.ts";
import { AUDIENCE, PSYCHOLOGY, rulesBlock } from "./prompting.ts";
import { getCorrections } from "./store.ts";
import { aiHooks } from "./ai-hooks.ts";
import type { Creator } from "./types.ts";

const MODEL = process.env.COACH_MODEL ?? "claude-opus-5-5";

const TipSchema = z.object({
  title: z.string().describe("Punchy title, max 8 words"),
  body: z.string().describe("The tip itself, plain text, no markdown headers"),
  action: z.string().describe("One concrete action for today, max 25 words"),
  why: z.string().describe("One sentence on why this matters for this creator specifically"),
});

export type TipDraft = z.infer<typeof TipSchema> & { source: "claude" | "library" };

const SYSTEM = `You are Cadence, a sharp, warm content coach for social media creators. Each day you send one tip.
Rules:
- Write for the creator's main platform and niche. Never give advice that only applies to another platform.
- Be specific and practical. No generic "be authentic" advice. No hashtags or emoji spam.
- Never repeat a tip they already received. Build on what they liked; avoid what they disliked.
- Respect their notes and replies; they override your defaults.
- Do not invent statistics. If you cite a number, frame it as a rule of thumb.
- Where it is genuinely relevant, account for risks creators face unevenly (harassment, safety, pay gaps), without lecturing.
- If their notes mention a recent post review, build on its weakest areas and next experiment.
${AUDIENCE}
${PSYCHOLOGY}`;

function buildPrompt(c: Creator, pick: Pick): string {
  const style = STYLES.find((s) => s.id === pick.style)!;
  const topic = TOPICS.find((t) => t.id === pick.topic)!;
  const history = c.tips
    .slice(0, 10)
    .map((t) => {
      const r = t.feedback?.reaction ? ` -> ${t.feedback.reaction}${t.feedback.tags?.length ? ` (${t.feedback.tags.join(", ")})` : ""}` : " -> no response";
      return `- [${topicLabel(t.topic)}] ${t.title}${r}`;
    })
    .join("\n");
  const notes = c.notes.slice(-8).map((n) => `- ${n.text}`).join("\n");
  return `Creator profile:
- Name: ${c.name}
- Main platform: ${platformLabel(c.platform)}
- Niche: ${c.niche}
- Stage: ${c.experience}
- Biggest struggle (their words): ${c.struggle || "not given"}

Their notes and replies to you (most recent last):
${notes || "- none yet"}

Recent tips and their reactions (newest first):
${history || "- none yet, this is the first tip"}

Today's tip:
- Topic: ${topic.label} (${topic.blurb})
- Format: ${style.label}. ${style.instruction}
- Calibration learned from their feedback:
${describeDials(c.learner.dials).map((d) => `  - ${d}`).join("\n")}`;
}

export async function writeTip(c: Creator, pick: Pick): Promise<TipDraft> {
  if (aiHooks.json) {
    try {
      const out = TipSchema.safeParse(
        await aiHooks.json(
          SYSTEM + rulesBlock(await getCorrections()),
          `${buildPrompt(c, pick)}\n\nReply with JSON only: {"title": string (max 8 words), "body": string, "action": string (max 25 words), "why": string (one sentence)}`,
        ),
      );
      if (out.success) return { ...out.data, source: "claude" };
    } catch (err) {
      console.error("Tip generation failed", err);
    }
    return libraryTip(c, pick);
  }
  if (!process.env.ANTHROPIC_API_KEY) return libraryTip(c, pick);
  try {
    const client = new Anthropic();
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(TipSchema) },
      system: SYSTEM + rulesBlock(await getCorrections()),
      messages: [{ role: "user", content: buildPrompt(c, pick) }],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return libraryTip(c, pick);
    return { ...res.parsed_output, source: "claude" };
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error(`Claude API error ${err.status}: ${err.message}`);
    else console.error("Tip generation failed", err);
    return libraryTip(c, pick);
  }
}

export function libraryTip(c: Creator, pick: Pick): TipDraft {
  const used = new Set(c.tips.map((t) => t.title));
  const options = LIBRARY[pick.topic] ?? LIBRARY.hooks;
  const tpl = options.find((o) => !used.has(o.title)) ?? options[c.tips.length % options.length];
  const fill = (s: string) => s.replaceAll("{platform}", platformLabel(c.platform)).replaceAll("{niche}", c.niche || "your niche");
  let body = fill(tpl.body);
  if (c.learner.dials.length <= -0.2) body = body.split(/(?<=\.)\s/)[0];
  return {
    title: tpl.title,
    body,
    action: fill(tpl.action),
    why: pick.explored
      ? `Testing whether ${topicLabel(pick.topic).toLowerCase()} is a lever for you.`
      : `${topicLabel(pick.topic)} tips have worked well for you so far.`,
    source: "library",
  };
}
