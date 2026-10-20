import { CHANNELS } from "./catalog.ts";
import { channelConfigured } from "./channels.ts";
import { describeDials, view } from "./learner.ts";
import { styleLabel, topicLabel } from "./catalog.ts";
import { storageMode } from "./store.ts";
import type { Creator } from "./types.ts";

/** Everything the dashboard needs, computed server-side. */
export function dashboardPayload(c: Creator) {
  return {
    creator: c,
    topics: view(c.learner.topics, topicLabel),
    styles: view(c.learner.styles, styleLabel),
    dials: describeDials(c.learner.dials),
    storageMode,
    aiEnabled: !!process.env.ANTHROPIC_API_KEY,
    channels: CHANNELS.map((ch) => ({ ...ch, configured: channelConfigured(ch.id) })),
    telegramBot: process.env.TELEGRAM_BOT_USERNAME ?? null,
  };
}

export type DashboardPayload = ReturnType<typeof dashboardPayload>;
