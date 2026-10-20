import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin.ts";
import { platformLabel } from "@/lib/catalog.ts";
import { manualReview } from "@/lib/review.ts";
import { getCorrections, getCreator, getReviews, listCreatorIds, recentReviewIds, storageMode } from "@/lib/store.ts";

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const reviews = await getReviews(await recentReviewIds(150));
  const creators = new Map<string, { name: string; platform: string; niche: string }>();
  const tips = [];
  for (const id of await listCreatorIds()) {
    const c = await getCreator(id);
    if (!c) continue;
    creators.set(id, { name: c.name, platform: platformLabel(c.platform), niche: c.niche });
    for (const t of c.tips.slice(0, 5)) tips.push({ ...t, creatorId: id, creatorName: c.name });
  }
  tips.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({
    creators: Object.fromEntries(creators),
    pending: reviews.filter((r) => r.status === "pending"),
    done: reviews.filter((r) => r.status !== "pending").slice(0, 40),
    tips: tips.slice(0, 60),
    corrections: await getCorrections(),
    config: { manualReview: manualReview(), storageMode, aiEnabled: !!process.env.ANTHROPIC_API_KEY },
  });
}
