import { NextResponse } from "next/server";
import { appUrl } from "@/lib/channels.ts";

/** One-time: GET /api/telegram/setup?key=<CRON_SECRET> registers the bot webhook. */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET first" }, { status: 400 });
  }
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: `${appUrl()}/api/telegram`, secret_token: process.env.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ["message", "callback_query"] }),
  });
  return NextResponse.json(await res.json());
}
