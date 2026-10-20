import { getCorrections, setCorrections } from "./store.ts";
import type { Correction } from "./types.ts";

export async function addCorrection(rule: string, from: Correction["from"]): Promise<Correction> {
  const c: Correction = {
    id: crypto.randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
    rule: rule.trim().slice(0, 300),
    from,
  };
  await setCorrections([...(await getCorrections()), c]);
  return c;
}

export async function removeCorrection(id: string): Promise<void> {
  await setCorrections((await getCorrections()).filter((c) => c.id !== id));
}
