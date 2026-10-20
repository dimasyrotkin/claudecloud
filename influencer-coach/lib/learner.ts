/**
 * Per-creator preference learner.
 *
 * Two independent Thompson-sampling bandits (topic x style, factorised so each arm learns
 * from every tip instead of 14*5 = 70 joint arms that each see a tip every ~2 months),
 * plus four continuous "dials" that explicit feedback tags nudge. Posteriors are
 * discounted towards the prior on every update so the coach keeps up as the creator
 * grows and their needs change.
 */
import { STYLES, TOPICS, topicLabel, styleLabel } from "./catalog.ts";
import type { Arm, Dials, Experience, FeedbackTag, LearnerState, Reaction } from "./types.ts";

export const DISCOUNT = 0.99;          // forgetting factor per update (~100-update memory)
export const EXPLORE_FLOOR = 0.05;      // share of picks forced onto the least-observed arm
export const IGNORE_WEIGHT = 0.3;      // weak negative signal when a tip gets no response

export type Rng = () => number;

// ---------- Beta sampling (Marsaglia-Tsang gamma) ----------

function gaussian(rng: Rng): number {
  let u = 0;
  while (u === 0) u = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function gamma(shape: number, rng: Rng): number {
  if (shape < 1) return gamma(shape + 1, rng) * Math.pow(rng(), 1 / shape);
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do {
      x = gaussian(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x ** 4) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function sampleBeta(a: number, b: number, rng: Rng): number {
  const x = gamma(a, rng);
  const y = gamma(b, rng);
  return x / (x + y);
}

export const mean = (arm: Arm) => arm.a / (arm.a + arm.b);
export const sd = (arm: Arm) => {
  const s = arm.a + arm.b;
  return Math.sqrt((arm.a * arm.b) / (s * s * (s + 1)));
};

/** Deterministic PRNG for the simulator and tests. */
export function mulberry32(seed: number): Rng {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Cold start ----------

/** Population data needs this many observations on an arm before it shapes priors. */
const POP_MIN_N = 20;
/** How many pseudo-observations the population prior is worth for a new creator. */
const POP_STRENGTH = 2;

function prior(pop: Arm | undefined): Arm {
  if (!pop || pop.n < POP_MIN_N) return { a: 1, b: 2, n: 0 };
  const m = pop.a / (pop.a + pop.b);
  return { a: 1 + POP_STRENGTH * m, b: 1 + POP_STRENGTH * (1 - m), n: 0 };
}

/**
 * Cold start: what works for creators in general (population) plus what this creator said
 * they want at onboarding (worth ~2 thumbs-up). Both are quickly overridden by their own feedback.
 */
export function initLearner(
  goals: string[],
  experience: Experience,
  population?: { topics: Record<string, Arm>; styles: Record<string, Arm> },
): LearnerState {
  const topics: Record<string, Arm> = {};
  for (const t of TOPICS) {
    topics[t.id] = prior(population?.topics[t.id]);
    if (goals.includes(t.id)) topics[t.id].a += 2;
  }
  const styles: Record<string, Arm> = {};
  for (const s of STYLES) styles[s.id] = prior(population?.styles[s.id]);
  if (experience === "starting") styles.quick_win.a += 1;
  if (experience === "established") {
    styles.framework.a += 1;
    styles.teardown.a += 1;
  }
  const level = experience === "starting" ? -0.5 : experience === "established" ? 0.5 : 0;
  return { topics, styles, dials: { length: 0, specificity: 0, tone: 0, level }, updates: 0 };
}

// ---------- Choosing the next tip ----------

export interface Pick {
  topic: string;
  style: string;
  explored: boolean;
  rationale: string;
}

function pickArm(arms: Record<string, Arm>, exclude: string[], rng: Rng): { id: string; explored: boolean } {
  const ids = Object.keys(arms).filter((id) => !exclude.includes(id));
  if (rng() < EXPLORE_FLOOR) {
    const minN = Math.min(...ids.map((id) => arms[id].n));
    const cold = ids.filter((id) => arms[id].n === minN);
    return { id: cold[Math.floor(rng() * cold.length)], explored: true };
  }
  let best = ids[0];
  let bestDraw = -1;
  for (const id of ids) {
    const draw = sampleBeta(arms[id].a, arms[id].b, rng);
    if (draw > bestDraw) {
      bestDraw = draw;
      best = id;
    }
  }
  const topMean = Math.max(...ids.map((id) => mean(arms[id])));
  return { id: best, explored: mean(arms[best]) < topMean - 1e-9 };
}

/** recentTopics: newest first. The last two topics are excluded so the feed never gets stuck. */
export function pickNext(state: LearnerState, recentTopics: string[], rng: Rng = Math.random): Pick {
  const t = pickArm(state.topics, recentTopics.slice(0, 2), rng);
  const s = pickArm(state.styles, [], rng);
  const arm = state.topics[t.id];
  const pct = Math.round(mean(arm) * 100);
  const ci = Math.round(1.96 * sd(arm) * 100);
  const rationale = t.explored
    ? `Exploring ${topicLabel(t.id)} (est. ${pct}% ±${ci}%): not enough signal yet to rule it out.`
    : `${topicLabel(t.id)} is one of your highest-rated areas (est. ${pct}% ±${ci}%), delivered as a ${styleLabel(s.id).toLowerCase()}.`;
  return { topic: t.id, style: s.id, explored: t.explored, rationale };
}

// ---------- Learning from feedback ----------

const FORMAT_TAGS: FeedbackTag[] = ["too_long", "too_short", "too_harsh", "too_soft", "too_generic", "loved_example"];

function decayArm(arm: Arm) {
  // Shrink towards Beta(1,1) rather than to zero so priors never collapse.
  arm.a = 1 + DISCOUNT * (arm.a - 1);
  arm.b = 1 + DISCOUNT * (arm.b - 1);
  arm.n *= DISCOUNT;
}

function observe(arm: Arm, reward: number, weight: number) {
  arm.a += weight * reward;
  arm.b += weight * (1 - reward);
  arm.n += weight;
}

const clamp = (x: number) => Math.max(-1, Math.min(1, x));

const DIAL_NUDGES: Partial<Record<FeedbackTag, Partial<Dials>>> = {
  too_long: { length: -0.35 },
  too_short: { length: 0.35 },
  too_generic: { specificity: 0.35 },
  loved_example: { specificity: 0.2 },
  too_harsh: { tone: -0.35 },
  too_soft: { tone: 0.35 },
  too_basic: { level: 0.35 },
  too_advanced: { level: -0.35 },
};

/**
 * Apply one feedback event. Returns a new state (input is not mutated).
 *
 * Credit assignment: a thumbs-down that only comes with format tags ("too long") is mostly
 * about the *style*, so the topic arm only gets a light penalty. "I did it" counts double
 * because acting on advice is the outcome we actually care about, not liking it.
 */
export function learn(
  prev: LearnerState,
  topic: string,
  style: string,
  reaction: Reaction | "ignored",
  tags: FeedbackTag[] = [],
): LearnerState {
  const state: LearnerState = structuredClone(prev);
  for (const arm of Object.values(state.topics)) decayArm(arm);
  for (const arm of Object.values(state.styles)) decayArm(arm);

  const reward = reaction === "down" || reaction === "ignored" ? 0 : 1;
  const weight = reaction === "did" ? 2 : reaction === "ignored" ? IGNORE_WEIGHT : 1;
  const formatOnly = reaction === "down" && tags.length > 0 && tags.every((t) => FORMAT_TAGS.includes(t));

  if (state.topics[topic]) observe(state.topics[topic], reward, formatOnly ? weight * 0.3 : weight);
  if (state.styles[style]) observe(state.styles[style], reward, weight);

  for (const tag of tags) {
    const nudge = DIAL_NUDGES[tag];
    if (!nudge) continue;
    for (const [k, v] of Object.entries(nudge) as [keyof Dials, number][]) {
      state.dials[k] = clamp(state.dials[k] + v);
    }
  }
  state.updates += 1;
  return state;
}

/**
 * Explicit preference from the weekly check-in ("more of this" / "less of this").
 * One daily tip yields one noisy bit; a check-in is the creator telling us directly,
 * so it is the fastest way to escape the cold start.
 */
export function prefer(prev: LearnerState, topic: string, more: boolean, weight = 3): LearnerState {
  const state: LearnerState = structuredClone(prev);
  const arm = state.topics[topic];
  if (arm) observe(arm, more ? 1 : 0, weight);
  return state;
}

// ---------- Explaining the model ----------

export interface ArmView {
  id: string;
  label: string;
  mean: number;
  lo: number;
  hi: number;
  n: number;
}

export function view(arms: Record<string, Arm>, label: (id: string) => string): ArmView[] {
  return Object.entries(arms)
    .map(([id, arm]) => {
      const m = mean(arm);
      const e = 1.96 * sd(arm);
      return { id, label: label(id), mean: m, lo: Math.max(0, m - e), hi: Math.min(1, m + e), n: arm.n };
    })
    .sort((x, y) => y.mean - x.mean);
}

export function describeDials(d: Dials): string[] {
  // Five tiers per dial, so a single tag shifts the coach one notch rather than to an extreme.
  const tier = (v: number, opts: [string, string, string, string, string]) =>
    opts[v <= -0.6 ? 0 : v <= -0.2 ? 1 : v < 0.2 ? 2 : v < 0.6 ? 3 : 4];
  return [
    tier(d.length, [
      "Keep it very short: 2-3 sentences max.",
      "Keep it short: around 50-70 words.",
      "Keep it concise: around 80-120 words.",
      "They like some depth: around 130-160 words.",
      "They like depth: up to ~200 words with detail.",
    ]),
    tier(d.specificity, [
      "Principles are fine, don't over-script.",
      "Mostly principles with one concrete pointer.",
      "Be concrete.",
      "Be specific: include an example or exact wording.",
      "Be hyper-specific: give exact words, scripts, numbers or a worked example.",
    ]),
    tier(d.tone, [
      "Very warm, encouraging tone.",
      "Warm, supportive tone.",
      "Friendly but direct tone.",
      "Direct, no-fluff tone.",
      "Blunt, demanding-coach tone.",
    ]),
    tier(d.level, [
      "Assume beginner: explain every term.",
      "Mostly beginner-friendly.",
      "Intermediate level.",
      "Upper-intermediate: skip the obvious basics.",
      "Advanced: skip basics, go for nuance.",
    ]),
  ];
}
