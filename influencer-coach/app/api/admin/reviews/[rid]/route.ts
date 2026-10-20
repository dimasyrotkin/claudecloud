import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin.ts";
import { addCorrection } from "@/lib/corrections.ts";
import { approve, reject } from "@/lib/review.ts";
import { getCreator, getReview } from "@/lib/store.ts";
import type { ReviewContent } from "@/lib/types.ts";

export async function POST(req: Request, { params }: { params: Promise<{ rid: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const review = await getReview((await params).rid);
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.status !== "pending") return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
  const c = await getCreator(review.creatorId);
  if (!c) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (typeof body.rule === "string" && body.rule.trim()) {
    await addCorrection(body.rule, { kind: "review", id: review.id, creatorId: c.id });
  }
  if (body.action === "approve") {
    await approve(c, review, (body.content as ReviewContent) ?? review.ai, String(body.note ?? ""));
  } else if (body.action === "reject") {
    await reject(review, String(body.reason ?? ""));
  } else {
    return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, review });
}
