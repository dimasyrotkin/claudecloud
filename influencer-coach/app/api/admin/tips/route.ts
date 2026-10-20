import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin.ts";
import { addCorrection } from "@/lib/corrections.ts";
import { getCreator, saveCreator } from "@/lib/store.ts";

/** Flag a tip that already went out. The reason becomes a rule for all future tips and reviews. */
export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const c = await getCreator(String(body.creatorId ?? ""));
  const tip = c?.tips.find((t) => t.id === body.tipId);
  if (!c || !tip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const rule = typeof body.rule === "string" ? body.rule.trim() : "";
  if (!rule) return NextResponse.json({ error: "Say what was wrong, as a rule" }, { status: 400 });
  tip.flagged = rule.slice(0, 300);
  await saveCreator(c);
  await addCorrection(rule, { kind: "tip", id: tip.id, creatorId: c.id });
  return NextResponse.json({ ok: true });
}
