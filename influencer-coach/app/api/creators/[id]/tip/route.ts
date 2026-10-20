import { NextResponse } from "next/server";
import { dashboardPayload } from "@/lib/api.ts";
import { sendTip } from "@/lib/service.ts";
import { getCreator } from "@/lib/store.ts";

const MAX_PER_DAY = 8; // manual "send now" cap, protects the model budget

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await getCreator((await params).id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  if (c.tips.filter((t) => Date.parse(t.createdAt) > dayAgo).length >= MAX_PER_DAY) {
    return NextResponse.json({ error: "Daily limit reached, come back tomorrow" }, { status: 429 });
  }
  await sendTip(c);
  return NextResponse.json(dashboardPayload(c));
}
