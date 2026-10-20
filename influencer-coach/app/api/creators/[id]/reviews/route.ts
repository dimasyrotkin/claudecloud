import { NextResponse } from "next/server";
import { dashboardPayload } from "@/lib/api.ts";
import { createReview, validatePostInput } from "@/lib/review.ts";
import { getCreator, getReviews } from "@/lib/store.ts";

export const maxDuration = 120;
const MAX_PER_DAY = 5;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCreator((await params).id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const recent = (await getReviews((c.reviewIds ?? []).slice(0, MAX_PER_DAY))).filter((r) => Date.parse(r.createdAt) > dayAgo);
  if (recent.length >= MAX_PER_DAY) return NextResponse.json({ error: "You can submit 5 posts a day" }, { status: 429 });

  const parsed = validatePostInput(await req.json().catch(() => ({})));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await createReview(c, parsed.value);
  return NextResponse.json(await dashboardPayload(c));
}
