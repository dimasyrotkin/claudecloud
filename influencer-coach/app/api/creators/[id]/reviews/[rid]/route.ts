import { NextResponse } from "next/server";
import { dashboardPayload } from "@/lib/api.ts";
import { getCreator, getReview, saveReview } from "@/lib/store.ts";

/** Creator rates an approved review: 👍 helpful / 👎 off. Low ratings surface in the admin queue. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string; rid: string }> }) {
  const { id, rid } = await params;
  const c = await getCreator(id);
  const r = await getReview(rid);
  if (!c || !r || r.creatorId !== c.id || r.status !== "approved") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  if (body.reaction !== "up" && body.reaction !== "down") return NextResponse.json({ error: "Bad reaction" }, { status: 400 });
  r.creatorReaction = body.reaction;
  await saveReview(r);
  return NextResponse.json(await dashboardPayload(c));
}
