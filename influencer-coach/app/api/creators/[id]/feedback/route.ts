import { NextResponse } from "next/server";
import { dashboardPayload } from "@/lib/api.ts";
import { applyFeedback } from "@/lib/service.ts";
import { getCreator } from "@/lib/store.ts";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCreator((await params).id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  if (!["up", "down", "did"].includes(body.reaction)) return NextResponse.json({ error: "Bad reaction" }, { status: 400 });
  const r = await applyFeedback(c, String(body.tipId ?? ""), body.reaction, body.tags, body.note);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json(await dashboardPayload(c));
}
