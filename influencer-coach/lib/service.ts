import { CHANNELS, PLATFORMS, TOPICS } from "./catalog.ts";
import { deliver, validWebhook } from "./channels.ts";
import { writeTip } from "./coach.ts";
import { initLearner, learn, pickNext, prefer } from "./learner.ts";
import { getPopulation, recordPopulation, saveCreator } from "./store.ts";
import type { Channel, Creator, CreatorPlatform, Experience, FeedbackTag, Reaction, Tip } from "./types.ts";

const newId = (len: number) => crypto.randomUUID().replace(/-/g, "").slice(0, len);

export interface CreatorInput {
  name: string;
  platform: CreatorPlatform;
  niche: string;
  goals: string[];
  experience: Experience;
  struggle: string;
  channel: Channel;
  contact: string;
  sendHourUtc: number;
}

const FEEDBACK_TAGS: FeedbackTag[] = [
  "too_long", "too_short", "too_generic", "too_basic", "too_advanced", "wrong_platform", "loved_example", "too_harsh", "too_soft",
];

export function validateInput(raw: Record<string, unknown>): { ok: true; value: CreatorInput } | { ok: false; error: string } {
  const str = (k: string, max = 300) => (typeof raw[k] === "string" ? (raw[k] as string).trim().slice(0, max) : "");
  const platform = str("platform") as CreatorPlatform;
  const channel = str("channel") as Channel;
  const experience = str("experience") as Experience;
  if (!str("name")) return { ok: false, error: "Name is required" };
  if (!PLATFORMS.some((p) => p.id === platform)) return { ok: false, error: "Pick your main platform" };
  if (!CHANNELS.some((c) => c.id === channel)) return { ok: false, error: "Pick a delivery channel" };
  if (!["starting", "growing", "established"].includes(experience)) return { ok: false, error: "Pick your stage" };
  const contact = str("contact", 500);
  if ((channel === "discord" || channel === "slack") && !validWebhook(channel, contact)) {
    return { ok: false, error: `That doesn't look like a ${channel} webhook URL` };
  }
  if (channel === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact)) return { ok: false, error: "Enter a valid email" };
  if ((channel === "sms" || channel === "whatsapp") && !/^\+\d{8,15}$/.test(contact)) return { ok: false, error: "Phone must look like +14155550123" };
  const goals = Array.isArray(raw.goals) ? raw.goals.filter((g): g is string => TOPICS.some((t) => t.id === g)).slice(0, 4) : [];
  const hour = Number(raw.sendHourUtc);
  return {
    ok: true,
    value: {
      name: str("name", 60),
      platform,
      niche: str("niche", 80),
      goals,
      experience,
      struggle: str("struggle", 400),
      channel,
      contact,
      sendHourUtc: Number.isInteger(hour) && hour >= 0 && hour < 24 ? hour : 16,
    },
  };
}

export async function createCreator(input: CreatorInput): Promise<Creator> {
  const now = new Date().toISOString();
  const c: Creator = {
    id: newId(16),
    createdAt: now,
    ...input,
    paused: false,
    learner: initLearner(input.goals, input.experience, await getPopulation()),
    notes: input.struggle ? [{ at: now, text: `Onboarding: my biggest struggle is "${input.struggle}"` }] : [],
    tips: [],
  };
  await saveCreator(c);
  return c;
}

/** Tips left unanswered by the time the next one goes out count as a weak negative. */
function applyIgnored(c: Creator) {
  for (const t of c.tips) {
    if (!t.feedback && !t.decayed) {
      c.learner = learn(c.learner, t.topic, t.style, "ignored");
      t.decayed = true;
    }
  }
}

export async function sendTip(c: Creator): Promise<Tip> {
  applyIgnored(c);
  const pick = pickNext(c.learner, c.tips.map((t) => t.topic));
  const draft = await writeTip(c, pick);
  const tip: Tip = {
    id: newId(8),
    createdAt: new Date().toISOString(),
    topic: pick.topic,
    style: pick.style,
    title: draft.title,
    body: draft.body,
    action: draft.action,
    why: draft.why,
    source: draft.source,
    rationale: pick.rationale,
    delivery: { channel: c.channel, ok: false, simulated: false },
  };
  tip.delivery = await deliver(c, tip);
  c.tips.unshift(tip);
  await saveCreator(c);
  return tip;
}

export async function applyFeedback(
  c: Creator,
  tipId: string,
  reaction: Reaction,
  rawTags: unknown,
  note: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const tip = c.tips.find((t) => t.id === tipId);
  if (!tip) return { ok: false, error: "Tip not found" };
  if (tip.feedback?.reaction) return { ok: false, error: "Already rated" };
  const tags = Array.isArray(rawTags) ? rawTags.filter((t): t is FeedbackTag => FEEDBACK_TAGS.includes(t)) : [];
  const text = typeof note === "string" ? note.trim().slice(0, 400) : "";
  const now = new Date().toISOString();

  c.learner = learn(c.learner, tip.topic, tip.style, reaction, tags);
  tip.feedback = { reaction, tags, note: text || undefined, at: now };
  if (text) c.notes.push({ at: now, text: `About "${tip.title}": ${text}` });
  await recordPopulation(tip.topic, tip.style, reaction === "down" ? 0 : 1, reaction === "did" ? 2 : 1);
  await saveCreator(c);
  return { ok: true };
}

/** Weekly check-in: "more of this topic" / "less of this topic". */
export async function applyPreference(c: Creator, topic: string, more: boolean): Promise<boolean> {
  if (!TOPICS.some((t) => t.id === topic)) return false;
  c.learner = prefer(c.learner, topic, more);
  c.checkins = [...(c.checkins ?? []), { at: new Date().toISOString(), topic, more }].slice(-50);
  await saveCreator(c);
  return true;
}

export async function addNote(c: Creator, text: string) {
  c.notes.push({ at: new Date().toISOString(), text: text.trim().slice(0, 400) });
  await saveCreator(c);
}
