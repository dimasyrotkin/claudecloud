import { NextResponse } from "next/server";
import { sendTip } from "@/lib/service.ts";
import { getCreator, listCreatorIds } from "@/lib/store.ts";

export const maxDuration = 300;

/**
 * Called by Vercel Cron (see vercel.json). Hobby plans allow one run per day, so by default
 * everyone gets their tip in that run. Set CRON_MODE=hourly (and an hourly schedule, Pro plan)
 * to respect each creator's preferred hour.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hourly = process.env.CRON_MODE === "hourly";
  const hour = new Date().getUTCHours();
  const results: { id: string; status: string }[] = [];

  for (const id of await listCreatorIds()) {
    const c = await getCreator(id);
    if (!c || c.paused) continue;
    if (hourly && c.sendHourUtc !== hour) continue;
    const last = c.tips[0] ? Date.parse(c.tips[0].createdAt) : 0;
    if (Date.now() - last < 20 * 3600 * 1000) {
      results.push({ id, status: "skipped (sent recently)" });
      continue;
    }
    try {
      const tip = await sendTip(c);
      results.push({ id, status: tip.delivery.ok ? `sent via ${tip.delivery.channel}` : `failed: ${tip.delivery.detail}` });
    } catch (err) {
      results.push({ id, status: `error: ${String(err).slice(0, 120)}` });
    }
  }
  return NextResponse.json({ ran: new Date().toISOString(), results });
}
