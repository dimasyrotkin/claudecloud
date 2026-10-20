import { NextResponse } from "next/server";
import { CHANNELS } from "@/lib/catalog.ts";
import { validWebhook } from "@/lib/channels.ts";
import { dashboardPayload } from "@/lib/api.ts";
import { addNote, applyPreference } from "@/lib/service.ts";
import { getCreator, saveCreator } from "@/lib/store.ts";
import type { Channel } from "@/lib/types.ts";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const c = await getCreator((await params).id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await dashboardPayload(c));
}

export async function PATCH(req: Request, { params }: Ctx) {
  const c = await getCreator((await params).id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));

  if (typeof body.channel === "string") {
    if (!CHANNELS.some((ch) => ch.id === body.channel)) return NextResponse.json({ error: "Unknown channel" }, { status: 400 });
    const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 500) : c.contact;
    const ch = body.channel as Channel;
    if ((ch === "discord" || ch === "slack") && !validWebhook(ch, contact)) {
      return NextResponse.json({ error: `That doesn't look like a ${ch} webhook URL` }, { status: 400 });
    }
    c.channel = ch;
    c.contact = contact;
  }
  if (typeof body.paused === "boolean") c.paused = body.paused;
  if (Number.isInteger(body.sendHourUtc) && body.sendHourUtc >= 0 && body.sendHourUtc < 24) c.sendHourUtc = body.sendHourUtc;
  if (body.prefer && typeof body.prefer.topic === "string") {
    if (!(await applyPreference(c, body.prefer.topic, body.prefer.more !== false))) {
      return NextResponse.json({ error: "Unknown topic" }, { status: 400 });
    }
    return NextResponse.json(await dashboardPayload(c));
  }
  if (typeof body.note === "string" && body.note.trim()) {
    await addNote(c, body.note);
  } else {
    await saveCreator(c);
  }
  return NextResponse.json(await dashboardPayload(c));
}
