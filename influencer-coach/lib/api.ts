import { CHANNELS } from "./catalog.ts";
import { channelConfigured } from "./channels.ts";
import { describeDials, view } from "./learner.ts";
import { styleLabel, topicLabel } from "./catalog.ts";
import { manualReview, creatorView, DIMENSIONS } from "./review.ts";
import { getReviews, storageMode } from "./store.ts";
import { aiHooks } from "./ai-hooks.ts";
import type { Creator } from "./types.ts";

/** Everything the dashboard needs, computed server-side. */
export async function dashboardPayload(c: Creator) {
  const reviews = await getReviews(c.reviewIds ?? []);
  return {
    creator: c,
    topics: view(c.learner.topics, topicLabel),
    styles: view(c.learner.styles, styleLabel),
    dials: describeDials(c.learner.dials),
    storageMode,
    aiEnabled: !!process.env.ANTHROPIC_API_KEY || !!aiHooks.json,
    channels: CHANNELS.map((ch) => ({ ...ch, configured: channelConfigured(ch.id) })),
    telegramBot: process.env.TELEGRAM_BOT_USERNAME ?? null,
    reviews: reviews.map(creatorView),
    manualReview: manualReview(),
    dimensions: DIMENSIONS,
  };
}

export type DashboardPayload = Awaited<ReturnType<typeof dashboardPayload>>;
