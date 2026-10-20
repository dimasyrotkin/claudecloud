import { NextResponse } from "next/server";
import { createCreator, sendTip, validateInput } from "@/lib/service.ts";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = validateInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const creator = await createCreator(parsed.value);
  // First tip goes out immediately so the creator sees the loop working.
  await sendTip(creator);
  return NextResponse.json({ id: creator.id });
}
