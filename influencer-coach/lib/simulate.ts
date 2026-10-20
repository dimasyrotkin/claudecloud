/**
 * Offline simulator: synthetic creators with hidden preferences react to daily tips.
 * Used by /lab to show the learner converging, and by `npm test` as a regression check.
 */
import { STYLES, TOPICS } from "./catalog.ts";
import { initLearner, learn, mulberry32, pickNext, prefer, type Rng } from "./learner.ts";
import type { Dials, Experience, FeedbackTag, LearnerState, Reaction } from "./types.ts";

export interface Persona {
  id: string;
  name: string;
  summary: string;
  goals: string[];          // what they *say* they want at onboarding
  experience: Experience;
  topicTaste: Record<string, number>; // hidden P(useful) per topic
  styleTaste: Record<string, number>; // hidden multiplier per style
  dials: Dials;             // hidden ideal dials
  responseRate: number;
  drift?: { day: number; topicTaste: Record<string, number>; note: string };
}

const base = (v: number) => Object.fromEntries(TOPICS.map((t) => [t.id, v]));
const styles = (v: number) => Object.fromEntries(STYLES.map((s) => [s.id, v]));

export const PERSONAS: Persona[] = [
  {
    id: "maya",
    name: "Maya, TikTok beauty, 8k followers",
    summary: "Says she wants brand deals, actually needs hooks and editing first. Hates long tips. Gets hate comments.",
    goals: ["monetization", "trends"],
    experience: "growing",
    topicTaste: { ...base(0.2), hooks: 0.85, editing: 0.75, wellbeing: 0.7, safety: 0.6, monetization: 0.35, trends: 0.4 },
    styleTaste: { ...styles(0.8), quick_win: 1.1, challenge: 1.0, framework: 0.6 },
    dials: { length: -0.8, specificity: 0.5, tone: -0.3, level: 0 },
    responseRate: 0.7,
    drift: { day: 50, topicTaste: { ...base(0.2), monetization: 0.9, collabs: 0.75, hooks: 0.5, wellbeing: 0.6 }, note: "Day 50: Maya hits 50k and brand deals become her real bottleneck" },
  },
  {
    id: "dev",
    name: "Dev, YouTube tech reviews, 120k subs",
    summary: "Established. Wants frameworks and data, blunt feedback, advanced level. Bored by basics.",
    goals: ["visuals", "analytics", "monetization"],
    experience: "established",
    topicTaste: { ...base(0.25), visuals: 0.8, analytics: 0.85, storytelling: 0.7, repurposing: 0.6, monetization: 0.55 },
    styleTaste: { ...styles(0.7), framework: 1.1, teardown: 1.1, reframe: 0.5 },
    dials: { length: 0.6, specificity: 0.8, tone: 0.7, level: 0.9 },
    responseRate: 0.5,
  },
  {
    id: "lena",
    name: "Lena, LinkedIn career coach, 2k followers",
    summary: "Just starting. Inconsistent posting and impostor feelings are her real problems. Prefers gentle tone.",
    goals: ["niche", "hooks"],
    experience: "starting",
    topicTaste: { ...base(0.3), consistency: 0.9, psychology: 0.8, niche: 0.75, community: 0.7, hooks: 0.55, wellbeing: 0.6 },
    styleTaste: { ...styles(0.8), quick_win: 1.1, reframe: 1.0, challenge: 0.6 },
    dials: { length: -0.2, specificity: 0.3, tone: -0.7, level: -0.6 },
    responseRate: 0.8,
  },
];

export interface DayResult {
  day: number;
  topic: string;
  style: string;
  pUseful: number;       // expected usefulness under the learner's pick
  pRandom: number;       // expected usefulness of a random pick (baseline)
  pOracle: number;       // ceiling: rotating the 3 truly best topics with perfect format
  reaction: Reaction | "ignored";
  tags: FeedbackTag[];
}

export interface SimResult {
  days: DayResult[];
  final: LearnerState;
  snapshots: { day: number; state: LearnerState }[];
}

function feedbackFor(p: Persona, dials: Dials, pUseful: number, rng: Rng): { reaction: Reaction | "ignored"; tags: FeedbackTag[] } {
  if (rng() > p.responseRate) return { reaction: "ignored", tags: [] };
  const useful = rng() < pUseful;
  const tags: FeedbackTag[] = [];
  const gap = (k: keyof Dials) => dials[k] - p.dials[k];
  if (gap("length") > 0.4 && rng() < 0.5) tags.push("too_long");
  if (gap("length") < -0.4 && rng() < 0.5) tags.push("too_short");
  if (gap("specificity") < -0.4 && rng() < 0.4) tags.push("too_generic");
  if (gap("tone") > 0.4 && rng() < 0.4) tags.push("too_harsh");
  if (gap("tone") < -0.4 && rng() < 0.4) tags.push("too_soft");
  if (gap("level") < -0.4 && rng() < 0.4) tags.push("too_basic");
  if (gap("level") > 0.4 && rng() < 0.4) tags.push("too_advanced");
  if (!useful) return { reaction: "down", tags };
  return { reaction: rng() < 0.35 ? "did" : "up", tags };
}

function weeklyPicks(taste: Record<string, number>, rng: Rng): string[] {
  const pool = Object.entries(taste).map(([id, v]) => ({ id, w: v ** 3 }));
  const out: string[] = [];
  for (let k = 0; k < 2; k++) {
    const total = pool.reduce((a, x) => a + x.w, 0);
    let r = rng() * total;
    const i = pool.findIndex((x) => (r -= x.w) <= 0);
    out.push(pool.splice(i < 0 ? pool.length - 1 : i, 1)[0].id);
  }
  return out;
}

/** Usefulness also drops when the format is far from what the creator wants. */
function usefulness(p: Persona, taste: Record<string, number>, topic: string, style: string, dials: Dials): number {
  const mismatch = (["length", "specificity", "tone", "level"] as (keyof Dials)[])
    .reduce((acc, k) => acc + Math.abs(dials[k] - p.dials[k]), 0) / 8; // 0..1
  return Math.max(0, Math.min(1, taste[topic] * p.styleTaste[style] * (1 - 0.4 * mismatch)));
}

export function simulate(p: Persona, days = 90, seed = 7, withDrift = true, checkins = true): SimResult {
  const rng = mulberry32(seed);
  let state = initLearner(p.goals, p.experience);
  const recent: string[] = [];
  const out: DayResult[] = [];
  const snapshots: { day: number; state: LearnerState }[] = [{ day: 0, state }];

  for (let day = 1; day <= days; day++) {
    const taste = withDrift && p.drift && day >= p.drift.day ? p.drift.topicTaste : p.topicTaste;
    const pick = pickNext(state, recent, rng);
    const pUseful = usefulness(p, taste, pick.topic, pick.style, state.dials);
    let pRandom = 0;
    for (const t of TOPICS) for (const s of STYLES) pRandom += usefulness(p, taste, t.id, s.id, { length: 0, specificity: 0, tone: 0, level: 0 });
    pRandom /= TOPICS.length * STYLES.length;
    const bestStyle = STYLES.reduce((b, s) => (p.styleTaste[s.id] > p.styleTaste[b] ? s.id : b), STYLES[0].id);
    const top3 = TOPICS.map((t) => t.id).sort((x, y) => taste[y] - taste[x]).slice(0, 3);
    const pOracle = top3.reduce((a, t) => a + usefulness(p, taste, t, bestStyle, p.dials), 0) / 3;

    const fb = feedbackFor(p, state.dials, pUseful, rng);
    state = learn(state, pick.topic, pick.style, fb.reaction, fb.tags);
    recent.unshift(pick.topic);
    if (checkins && day % 7 === 0 && rng() < p.responseRate) {
      // Weekly check-in: the creator taps the 2 topics they want more of (noisy: sampled by taste^3).
      for (const t of weeklyPicks(taste, rng)) state = prefer(state, t, true);
    }
    out.push({ day, topic: pick.topic, style: pick.style, pUseful, pRandom, pOracle, ...fb });
    if (day % 15 === 0) snapshots.push({ day, state });
  }
  return { days: out, final: state, snapshots };
}

export interface WeekStat { week: number; learner: number; random: number; oracle: number }

export function weekly(days: DayResult[]): WeekStat[] {
  const weeks: WeekStat[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    weeks.push({
      week: i / 7 + 1,
      learner: chunk.reduce((a, d) => a + d.pUseful, 0) / chunk.length,
      random: chunk.reduce((a, d) => a + d.pRandom, 0) / chunk.length,
      oracle: chunk.reduce((a, d) => a + d.pOracle, 0) / chunk.length,
    });
  }
  return weeks;
}
