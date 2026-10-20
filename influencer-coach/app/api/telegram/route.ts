import { NextResponse } from "next/server";
import { addNote, applyFeedback } from "@/lib/service.ts";
import { creatorForTelegramChat, getCreator, saveCreator, setTelegramChat } from "@/lib/store.ts";
import type { Reaction } from "@/lib/types.ts";

const api = (method: string, body: unknown) =>
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/** Telegram bot webhook: account linking (/start <id>), rating buttons, and free-text replies. */
export async function POST(req: Request) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ ok: false }, { status: 404 });
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || req.headers.get("x-telegram-bot-api-secret-token") !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const update = await req.json();

  if (update.callback_query) {
    const q = update.callback_query;
    const chatId = String(q.message?.chat?.id ?? "");
    const [kind, tipId, reaction] = String(q.data ?? "").split("|");
    const creatorId = await creatorForTelegramChat(chatId);
    const c = creatorId ? await getCreator(creatorId) : null;
    let text = "Couldn't find your account. Open your dashboard and reconnect Telegram.";
    if (c && kind === "fb" && ["up", "down", "did"].includes(reaction)) {
      const r = await applyFeedback(c, tipId, reaction as Reaction, [], "");
      text = r.ok
        ? reaction === "down"
          ? "Noted, I'll adjust. Reply with what was off (too long? too basic?) to help me more."
          : reaction === "did"
            ? "Amazing, that's the signal I value most 🙌"
            : "Thanks! More like this."
        : (r.error ?? "Already rated");
    }
    await api("answerCallbackQuery", { callback_query_id: q.id, text });
    return NextResponse.json({ ok: true });
  }

  const msg = update.message;
  if (!msg?.text) return NextResponse.json({ ok: true });
  const chatId = String(msg.chat.id);
  const text: string = msg.text;

  if (text.startsWith("/start")) {
    const creatorId = text.split(" ")[1]?.trim();
    const c = creatorId ? await getCreator(creatorId) : null;
    if (!c) {
      await api("sendMessage", { chat_id: chatId, text: "Hi! Sign up on the Cadence web app first, then tap 'Connect Telegram' on your dashboard." });
      return NextResponse.json({ ok: true });
    }
    c.channel = "telegram";
    c.contact = chatId;
    await saveCreator(c);
    await setTelegramChat(c.id, chatId);
    await api("sendMessage", { chat_id: chatId, text: `Connected, ${c.name}! Your daily tips will arrive here. Reply anytime to tell me what you want more or less of.` });
    return NextResponse.json({ ok: true });
  }

  const creatorId = await creatorForTelegramChat(chatId);
  const c = creatorId ? await getCreator(creatorId) : null;
  if (c) {
    await addNote(c, text);
    await api("sendMessage", { chat_id: chatId, text: "Got it, I'll factor that into your next tips. 📝" });
  }
  return NextResponse.json({ ok: true });
}
