/**
 * Delivery adapters. Each channel sends for real when its credentials are configured and
 * otherwise reports `simulated: true`; the tip is always kept in the creator's web inbox.
 */
import { topicLabel } from "./catalog.ts";
import type { Channel, Creator, Tip } from "./types.ts";

export function appUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function channelConfigured(ch: Channel): boolean {
  const e = process.env;
  switch (ch) {
    case "web":
    case "discord":
    case "slack":
      return true;
    case "email":
      return !!e.RESEND_API_KEY;
    case "telegram":
      return !!e.TELEGRAM_BOT_TOKEN;
    case "whatsapp":
      return !!(e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_WHATSAPP_FROM);
    case "sms":
      return !!(e.TWILIO_ACCOUNT_SID && e.TWILIO_AUTH_TOKEN && e.TWILIO_SMS_FROM);
  }
}

/** Only allow webhook URLs on the official hosts so creators can't point the server elsewhere. */
export function validWebhook(ch: "discord" | "slack", url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    if (ch === "discord") return ["discord.com", "discordapp.com"].includes(u.hostname) && u.pathname.startsWith("/api/webhooks/");
    return u.hostname === "hooks.slack.com" && u.pathname.startsWith("/services/");
  } catch {
    return false;
  }
}

/**
 * Feedback links open the dashboard where the creator taps a button (a POST), instead of
 * recording a reaction on GET: email scanners and Slack/Discord unfurlers pre-fetch links
 * and would otherwise flood the learner with fake thumbs-ups.
 */
export const feedbackUrl = (c: Creator, tip: Tip) => `${appUrl()}/u/${c.id}?tip=${tip.id}`;

/** Every 7th tip asks for the weekly check-in, the strongest learning signal we get. */
export const isCheckinDay = (c: Creator) => c.tips.length > 0 && c.tips.length % 7 === 0;
const checkinLine = (c: Creator) => (isCheckinDay(c) ? `\n\n🗓 Weekly check-in: tap what you want more of next week: ${appUrl()}/u/${c.id}#checkin` : "");

function plainText(c: Creator, tip: Tip): string {
  return `☀️ ${tip.title}\n\n${tip.body}\n\n👉 Today: ${tip.action}\n\nWhy you: ${tip.why}\n\nRate it (helps me learn): ${feedbackUrl(c, tip)}${checkinLine(c)}`;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

async function post(url: string, init: RequestInit): Promise<{ ok: boolean; detail?: string }> {
  const res = await fetch(url, init);
  if (res.ok) return { ok: true };
  return { ok: false, detail: `${res.status} ${(await res.text()).slice(0, 200)}` };
}

async function twilio(to: string, from: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  return post(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
}

/** One message, rendered per channel. */
interface Outgoing {
  subject: string;
  text: string;          // WhatsApp, Discord, Slack
  sms: string;
  html: string;          // email body
  telegramHtml: string;
  buttons?: { text: string; callback_data: string }[];
}

async function send(c: Creator, m: Outgoing): Promise<Tip["delivery"]> {
  const ch = c.channel;
  if (ch === "web") return { channel: ch, ok: true, simulated: false, detail: "Web inbox" };
  if (!channelConfigured(ch)) {
    return { channel: ch, ok: true, simulated: true, detail: `${ch} not configured on the server, shown in web inbox only` };
  }
  if (!c.contact) return { channel: ch, ok: false, simulated: false, detail: "No contact set" };

  try {
    let r: { ok: boolean; detail?: string };
    switch (ch) {
      case "email":
        r = await post("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM ?? "Cadence Coach <onboarding@resend.dev>",
            to: c.contact,
            subject: m.subject,
            html: `<div style="font-family:system-ui;max-width:560px;line-height:1.5">${m.html}</div>`,
          }),
        });
        break;
      case "telegram":
        r = await post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: c.contact,
            text: m.telegramHtml,
            parse_mode: "HTML",
            ...(m.buttons ? { reply_markup: { inline_keyboard: [m.buttons] } } : {}),
          }),
        });
        break;
      case "whatsapp":
        r = await twilio(`whatsapp:${c.contact}`, `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, m.text);
        break;
      case "sms":
        r = await twilio(c.contact, process.env.TWILIO_SMS_FROM!, m.sms);
        break;
      case "discord":
        if (!validWebhook("discord", c.contact)) return { channel: ch, ok: false, simulated: false, detail: "Invalid Discord webhook URL" };
        r = await post(c.contact, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: m.text }) });
        break;
      case "slack":
        if (!validWebhook("slack", c.contact)) return { channel: ch, ok: false, simulated: false, detail: "Invalid Slack webhook URL" };
        r = await post(c.contact, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: m.text }) });
        break;
    }
    return { channel: ch, ok: r.ok, simulated: false, detail: r.detail };
  } catch (err) {
    return { channel: ch, ok: false, simulated: false, detail: String(err).slice(0, 200) };
  }
}

export function deliver(c: Creator, tip: Tip): Promise<Tip["delivery"]> {
  return send(c, {
    subject: `Today's tip: ${tip.title}`,
    text: plainText(c, tip),
    sms: `${tip.title}: ${tip.action} Rate: ${feedbackUrl(c, tip)}`,
    html: `<p style="color:#888;font-size:13px">${esc(topicLabel(tip.topic))}</p>
      <h2>${esc(tip.title)}</h2><p>${esc(tip.body)}</p>
      <p><b>Today:</b> ${esc(tip.action)}</p><p style="color:#666">${esc(tip.why)}</p>
      <p><a href="${feedbackUrl(c, tip)}">Rate this tip</a> so tomorrow's is better.</p>
      ${isCheckinDay(c) ? `<p>🗓 <a href="${appUrl()}/u/${c.id}#checkin">Weekly check-in</a>: tell me what you want more of next week.</p>` : ""}`,
    telegramHtml: `☀️ <b>${esc(tip.title)}</b>\n\n${esc(tip.body)}\n\n👉 <b>Today:</b> ${esc(tip.action)}\n\n<i>${esc(tip.why)}</i>\n\nReply with any message to tell me what you want more or less of.${esc(checkinLine(c))}`,
    buttons: [
      { text: "👍 Useful", callback_data: `fb|${tip.id}|up` },
      { text: "✅ I did it", callback_data: `fb|${tip.id}|did` },
      { text: "👎 Not for me", callback_data: `fb|${tip.id}|down` },
    ],
  });
}

export function notifyReviewReady(c: Creator, reviewId: string, summary: string): Promise<Tip["delivery"]> {
  const url = `${appUrl()}/u/${c.id}?review=${reviewId}#reviews`;
  return send(c, {
    subject: "Your post review is ready",
    text: `📝 Your post review is ready.\n\n${summary}\n\nSee the scores, fixes and a rewritten hook: ${url}`,
    sms: `Your Cadence post review is ready: ${url}`,
    html: `<h2>Your post review is ready</h2><p>${esc(summary)}</p><p><a href="${url}">See scores, fixes and a rewritten hook</a></p>`,
    telegramHtml: `📝 <b>Your post review is ready</b>\n\n${esc(summary)}\n\n<a href="${esc(url)}">See scores, fixes and a rewritten hook</a>`,
  });
}

/** Optional heads-up to the human reviewer when something lands in the queue. */
export async function notifyAdmin(subject: string, text: string): Promise<void> {
  if (!process.env.ADMIN_EMAIL || !process.env.RESEND_API_KEY) return;
  await post("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Cadence Coach <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject,
      html: `<p>${esc(text)}</p><p><a href="${appUrl()}/admin">Open review queue</a></p>`,
    }),
  }).catch(() => undefined);
}
