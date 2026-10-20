/**
 * Persistence. Uses Upstash Redis (Vercel Marketplace "Upstash for Redis" sets these env vars)
 * and falls back to process memory so the prototype runs with zero setup. Memory mode
 * loses data on cold starts, which the UI flags.
 */
import { Redis } from "@upstash/redis";
import type { Arm, Creator } from "./types.ts";

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

export const storageMode: "redis" | "memory" = redis ? "redis" : "memory";

type Mem = { creators: Map<string, Creator>; population: Population; telegramLinks: Map<string, string> };
const g = globalThis as unknown as { __cadence?: Mem };
const mem: Mem = (g.__cadence ??= { creators: new Map(), population: { topics: {}, styles: {} }, telegramLinks: new Map() });

export async function getCreator(id: string): Promise<Creator | null> {
  if (redis) return (await redis.get<Creator>(`creator:${id}`)) ?? null;
  return mem.creators.get(id) ?? null;
}

export async function saveCreator(c: Creator): Promise<void> {
  c.tips = c.tips.slice(0, 120);
  c.notes = c.notes.slice(-40);
  if (redis) {
    await redis.set(`creator:${c.id}`, c);
    await redis.sadd("creators", c.id);
  } else {
    mem.creators.set(c.id, structuredClone(c));
  }
  // Rating buttons in Telegram arrive with only a chat id, so keep the reverse lookup current.
  if (c.channel === "telegram" && /^-?\d+$/.test(c.contact)) await setTelegramChat(c.id, c.contact);
}

export async function listCreatorIds(): Promise<string[]> {
  if (redis) return (await redis.smembers("creators")) as string[];
  return [...mem.creators.keys()];
}

// ---------- Population prior: aggregate reward across all creators ----------

export interface Population {
  topics: Record<string, Arm>;
  styles: Record<string, Arm>;
}

export async function getPopulation(): Promise<Population> {
  if (redis) return (await redis.get<Population>("population")) ?? { topics: {}, styles: {} };
  return mem.population;
}

export async function recordPopulation(topic: string, style: string, reward: number, weight: number) {
  const pop = await getPopulation();
  for (const [bucket, id] of [[pop.topics, topic], [pop.styles, style]] as const) {
    const arm = (bucket[id] ??= { a: 0, b: 0, n: 0 });
    arm.a += weight * reward;
    arm.b += weight * (1 - reward);
    arm.n += weight;
  }
  if (redis) await redis.set("population", pop);
}

// ---------- Telegram deep-link tokens ----------

export async function setTelegramChat(creatorId: string, chatId: string) {
  if (redis) await redis.set(`tg:${chatId}`, creatorId);
  else mem.telegramLinks.set(chatId, creatorId);
}

export async function creatorForTelegramChat(chatId: string): Promise<string | null> {
  if (redis) return (await redis.get<string>(`tg:${chatId}`)) ?? null;
  return mem.telegramLinks.get(chatId) ?? null;
}
