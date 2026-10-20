/**
 * Browser replacement for lib/store.ts in the hosted demo: same exports, kept in this
 * browser's localStorage (falls back to memory if storage is blocked).
 */
import type { Arm, Correction, Creator, PostReview } from "../lib/types.ts";

export const storageMode = "browser" as const;

export interface Population {
  topics: Record<string, Arm>;
  styles: Record<string, Arm>;
}

interface State {
  creators: Record<string, Creator>;
  population: Population;
  reviews: Record<string, PostReview>;
  reviewOrder: string[];
  corrections: Correction[];
}

const KEY = "cadence:demo-state";
const empty = (): State => ({ creators: {}, population: { topics: {}, styles: {} }, reviews: {}, reviewOrder: [], corrections: [] });

let state: State = empty();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = { ...empty(), ...JSON.parse(raw) };
} catch {}

function persist() {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return;
    } catch {
      // Out of space: drop screenshots from the oldest reviews first.
      const withImages = [...state.reviewOrder].reverse().filter((id) => state.reviews[id]?.input.images.length);
      if (!withImages.length) return;
      for (const id of withImages.slice(0, Math.ceil(withImages.length / 2))) state.reviews[id].input.images = [];
    }
  }
}

export function resetDemo() {
  state = empty();
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem("cadence:id");
  } catch {}
}

export async function getCreator(id: string): Promise<Creator | null> {
  return state.creators[id] ? structuredClone(state.creators[id]) : null;
}

export async function saveCreator(c: Creator): Promise<void> {
  c.tips = c.tips.slice(0, 60);
  c.notes = c.notes.slice(-40);
  state.creators[c.id] = structuredClone(c);
  persist();
}

export async function listCreatorIds(): Promise<string[]> {
  return Object.keys(state.creators);
}

export async function getPopulation(): Promise<Population> {
  return structuredClone(state.population);
}

export async function recordPopulation(topic: string, style: string, reward: number, weight: number) {
  for (const [bucket, id] of [[state.population.topics, topic], [state.population.styles, style]] as const) {
    const arm = (bucket[id] ??= { a: 0, b: 0, n: 0 });
    arm.a += weight * reward;
    arm.b += weight * (1 - reward);
    arm.n += weight;
  }
  persist();
}

export async function setTelegramChat() {}
export async function creatorForTelegramChat(): Promise<string | null> {
  return null;
}

export async function saveReview(r: PostReview, isNew = false): Promise<void> {
  state.reviews[r.id] = structuredClone(r);
  if (isNew) state.reviewOrder.unshift(r.id);
  persist();
}

export async function getReview(id: string): Promise<PostReview | null> {
  return state.reviews[id] ? structuredClone(state.reviews[id]) : null;
}

export async function getReviews(ids: string[]): Promise<PostReview[]> {
  return ids.map((id) => state.reviews[id]).filter(Boolean).map((r) => structuredClone(r));
}

export async function recentReviewIds(limit = 100): Promise<string[]> {
  return state.reviewOrder.slice(0, limit);
}

export async function getCorrections(): Promise<Correction[]> {
  return structuredClone(state.corrections);
}

export async function setCorrections(list: Correction[]): Promise<void> {
  state.corrections = list.slice(-30);
  persist();
}
