export type CreatorPlatform =
  | "tiktok" | "instagram" | "youtube" | "linkedin" | "x" | "twitch" | "pinterest" | "substack";

export type Channel = "web" | "email" | "telegram" | "whatsapp" | "sms" | "discord" | "slack";

export type Experience = "starting" | "growing" | "established";

/** A Beta(alpha, beta) posterior over "this arm produces a useful tip for this creator". */
export interface Arm {
  a: number;
  b: number;
  n: number; // number of (decayed) observations, for display
}

/** Continuous preferences nudged by explicit feedback tags. Each is in [-1, 1]. */
export interface Dials {
  length: number;      // -1 = ultra short, +1 = detailed
  specificity: number; // -1 = broad principles, +1 = hyper-concrete scripts/examples
  tone: number;        // -1 = gentle/encouraging, +1 = blunt/direct
  level: number;       // -1 = beginner fundamentals, +1 = advanced nuance
}

export interface LearnerState {
  topics: Record<string, Arm>;
  styles: Record<string, Arm>;
  dials: Dials;
  updates: number;
}

export type Reaction = "up" | "down" | "did";

export type FeedbackTag =
  | "too_long" | "too_short" | "too_generic" | "too_basic" | "too_advanced"
  | "wrong_platform" | "loved_example" | "too_harsh" | "too_soft";

export interface Tip {
  id: string;
  createdAt: string;
  topic: string;
  style: string;
  title: string;
  body: string;
  action: string;
  why: string;
  source: "claude" | "library";
  /** Why the learner picked this topic/style, shown to the creator for transparency. */
  rationale: string;
  delivery: { channel: Channel; ok: boolean; simulated: boolean; detail?: string };
  feedback?: { reaction?: Reaction; tags?: FeedbackTag[]; note?: string; at: string };
  /** True once a "no response" weak signal has been applied. */
  decayed?: boolean;
  /** Set by an admin who caught a mistake in this tip. */
  flagged?: string;
}

export interface Creator {
  id: string;
  createdAt: string;
  name: string;
  platform: CreatorPlatform;
  niche: string;
  goals: string[];         // topic ids the creator said they care about
  experience: Experience;
  struggle: string;        // free text from onboarding
  channel: Channel;
  contact: string;         // email / phone / webhook url / telegram chat id
  sendHourUtc: number;
  paused: boolean;
  learner: LearnerState;
  notes: { at: string; text: string }[];  // free-text memory: replies, onboarding answers
  tips: Tip[];             // newest first, capped
  checkins?: { at: string; topic: string; more: boolean }[];
  reviewIds?: string[];    // newest first
}

// ---------- Post reviews (human-in-the-loop) ----------

export type ReviewDimension = "hook" | "storytelling" | "visuals" | "pacing" | "engagement" | "positioning";

export interface ReviewContent {
  summary: string;
  scores: Record<ReviewDimension, number>; // 1-10
  strengths: string[];
  fixes: { dimension: ReviewDimension; issue: string; fix: string }[];
  rewrittenHook: string;
  nextExperiment: string;
  confidence: "low" | "medium" | "high";
  caveats: string; // what the reviewer could not see or judge
}

export interface PostInput {
  url: string;
  caption: string;   // caption, script or transcript
  goal: string;      // what the creator wanted the post to do
  metrics: { views?: number; likes?: number; comments?: number; shares?: number; saves?: number; followers?: number };
  images: string[];  // compressed JPEG data URLs (cover, key frames)
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface PostReview {
  id: string;
  creatorId: string;
  createdAt: string;
  status: ReviewStatus;
  input: PostInput;
  ai: ReviewContent;
  source: "claude" | "heuristic";
  final?: ReviewContent;      // what the creator sees, after human edits
  edited?: boolean;
  adminNote?: string;         // shown to the creator ("Coach's note")
  rejectReason?: string;      // internal
  reviewedAt?: string;
  creatorReaction?: "up" | "down";
}

/** A rule an admin wrote after catching a mistake. Injected into every future prompt. */
export interface Correction {
  id: string;
  createdAt: string;
  rule: string;
  from: { kind: "review" | "tip"; id: string; creatorId: string };
}
