import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin.ts";
import { addCorrection, removeCorrection } from "@/lib/corrections.ts";
import { getCorrections } from "@/lib/store.ts";

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (typeof body.rule !== "string" || !body.rule.trim()) return NextResponse.json({ error: "Rule is empty" }, { status: 400 });
  await addCorrection(body.rule, { kind: "tip", id: "manual", creatorId: "" });
  return NextResponse.json({ corrections: await getCorrections() });
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await removeCorrection(String(body.id ?? ""));
  return NextResponse.json({ corrections: await getCorrections() });
}
