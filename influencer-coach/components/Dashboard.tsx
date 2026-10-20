"use client";

import { useCallback, useEffect, useState } from "react";
import { TOPICS, styleLabel, topicLabel } from "@/lib/catalog.ts";
import type { DashboardPayload } from "@/lib/api.ts";
import type { ArmView } from "@/lib/learner.ts";
import type { Channel, FeedbackTag, Reaction, Tip } from "@/lib/types.ts";
import PostReviews from "./PostReviews.tsx";

const TAGS: { id: FeedbackTag; label: string }[] = [
  { id: "too_long", label: "Too long" },
  { id: "too_short", label: "Too short" },
  { id: "too_generic", label: "Too generic" },
  { id: "too_basic", label: "Too basic" },
  { id: "too_advanced", label: "Too advanced" },
  { id: "too_harsh", label: "Too harsh" },
  { id: "too_soft", label: "Too soft" },
  { id: "wrong_platform", label: "Wrong platform" },
  { id: "loved_example", label: "Loved the example" },
];

const REACTION_LABEL: Record<Reaction, string> = { up: "👍 Useful", did: "✅ Did it", down: "👎 Not for me" };

export function Bars({ arms }: { arms: ArmView[] }) {
  return (
    <div className="bars">
      {arms.map((a) => (
        <div className="bar-row" key={a.id} title={`${a.n.toFixed(1)} weighted observations`}>
          <span>{a.label}</span>
          <div className="bar-track">
            <div className="bar-ci" style={{ left: `${a.lo * 100}%`, width: `${(a.hi - a.lo) * 100}%` }} />
            <div className="bar-mean" style={{ left: `${a.mean * 100}%` }} />
          </div>
          <span className="bar-num">{Math.round(a.mean * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

function TipCard({ tip, onRate, busy }: { tip: Tip; onRate: (r: Reaction, tags: FeedbackTag[], note: string) => void; busy: boolean }) {
  const [tags, setTags] = useState<FeedbackTag[]>([]);
  const [note, setNote] = useState("");
  const rated = tip.feedback?.reaction;
  const toggle = (t: FeedbackTag) => setTags((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));

  return (
    <div className="card">
      <div className="row between">
        <div>
          <span className="tag">{topicLabel(tip.topic)}</span>
          <span className="tag">{styleLabel(tip.style)}</span>
        </div>
        <span className="small muted">{new Date(tip.createdAt).toLocaleString()}</span>
      </div>
      <h2 className="tip-title">{tip.title}</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{tip.body}</p>
      <div className="tip-action"><b>Today:</b> {tip.action}</div>
      <p className="small muted">{tip.why}</p>
      <p className="small muted">
        <b>Why this tip:</b> {tip.rationale} · written by {tip.source === "claude" ? "Claude" : "the offline library"} · delivery:{" "}
        {tip.delivery.simulated ? `${tip.delivery.channel} (simulated)` : tip.delivery.ok ? tip.delivery.channel : `failed (${tip.delivery.detail})`}
      </p>

      {rated ? (
        <p className="small"><span className="tag good">{REACTION_LABEL[rated]}</span> Thanks, the coach has updated.</p>
      ) : (
        <div style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 14 }}>
          <div className="small muted" style={{ marginBottom: 8 }}>Optional: what was off or great?</div>
          <div className="chips" style={{ marginBottom: 10 }}>
            {TAGS.map((t) => (
              <button type="button" key={t.id} className="chip" aria-pressed={tags.includes(t.id)} onClick={() => toggle(t.id)}>{t.label}</button>
            ))}
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else? e.g. 'more about Reels, less theory'" style={{ marginBottom: 10 }} />
          <div className="row">
            {(["up", "did", "down"] as Reaction[]).map((r) => (
              <button key={r} className={`btn sm ${r === "down" ? "ghost" : ""}`} disabled={busy} onClick={() => onRate(r, tags, note)}>{REACTION_LABEL[r]}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ id, focusTip, focusReview, welcome }: { id: string; focusTip?: string; focusReview?: string; welcome?: boolean }) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [channel, setChannel] = useState<Channel>("web");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState("");

  const apply = useCallback((d: DashboardPayload) => {
    setData(d);
    setChannel(d.creator.channel);
    setContact(d.creator.contact);
  }, []);

  useEffect(() => {
    fetch(`/api/creators/${id}`)
      .then(async (r) => (r.ok ? apply(await r.json()) : setError("Dashboard not found. If the server restarted in demo storage mode, sign up again.")))
      .catch(() => setError("Network error"));
    try {
      localStorage.setItem("cadence:id", id);
    } catch {}
  }, [id, apply]);

  async function call(path: string, method: string, body?: unknown, msg?: string): Promise<boolean> {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/creators/${id}${path}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const d = await r.json().catch(() => ({ error: r.status === 413 ? "Images too large" : "Something went wrong" }));
      if (!r.ok) {
        setError(d.error ?? "Something went wrong");
        return false;
      }
      apply(d);
      if (msg) {
        setSaved(msg);
        setTimeout(() => setSaved(""), 2500);
      }
      return true;
    } catch {
      setError("Network error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) return <div className="card"><p className="error">{error}</p><a href="/">Back to start</a></div>;
  if (!data) return <p className="muted">Loading your coach...</p>;

  const c = data.creator;
  const current = (focusTip && c.tips.find((t) => t.id === focusTip)) || c.tips[0];
  const chMeta = data.channels.find((x) => x.id === channel)!;

  return (
    <>
      {welcome && <div className="banner">You're in, {c.name}. Here's your first tip. Bookmark this page: it's your private dashboard.</div>}
      {data.storageMode === "memory" && (
        <div className="banner">Demo storage: data lives in server memory and can reset. Connect Upstash Redis on Vercel to persist.</div>
      )}
      {!data.aiEnabled && <div className="banner">AI writing is off (no ANTHROPIC_API_KEY), tips come from the built-in library. The learning still works.</div>}

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="grid">
          {current ? (
            <TipCard key={current.id} tip={current} busy={busy} onRate={(reaction, tags, n) => call("/feedback", "POST", { tipId: current.id, reaction, tags, note: n })} />
          ) : (
            <div className="card">No tips yet.</div>
          )}
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button className="btn ghost sm" disabled={busy} onClick={() => call("/tip", "POST")}>{busy ? "Working..." : "Send me another tip now"}</button>
            <button className="btn ghost sm" disabled={busy} onClick={() => call("", "PATCH", { paused: !c.paused }, c.paused ? "Resumed" : "Paused")}>
              {c.paused ? "Resume daily tips" : "Pause daily tips"}
            </button>
            {saved && <span className="small muted">{saved}</span>}
          </div>

          <PostReviews data={data} focus={focusReview} call={call} busy={busy} />

          <div className="card">
            <h2>History</h2>
            <div className="history">
              {c.tips.map((t) => (
                <a key={t.id} className="history-item" href={`/u/${id}?tip=${t.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                  <span>
                    <b>{t.title}</b>
                    <br />
                    <span className="small muted">{topicLabel(t.topic)} · {styleLabel(t.style)}</span>
                  </span>
                  <span className="small">
                    {t.feedback?.reaction ? REACTION_LABEL[t.feedback.reaction] : t.decayed ? <span className="muted">no reply</span> : <span className="muted">unrated</span>}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h2>What your coach has learned</h2>
            <p className="small muted">
              Estimated chance a tip on each topic is useful to you, with 95% uncertainty band. Wide bands = still exploring. Based on {c.learner.updates} signals.
            </p>
            <Bars arms={data.topics} />
            <h3 style={{ marginTop: 20 }}>Formats</h3>
            <Bars arms={data.styles} />
            <h3 style={{ marginTop: 20 }}>Calibration</h3>
            <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
              {data.dials.map((d) => <li key={d}>{d}</li>)}
            </ul>
            {c.notes.length > 0 && (
              <>
                <h3 style={{ marginTop: 20 }}>Remembered notes</h3>
                <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
                  {c.notes.slice(-5).map((n) => <li key={n.at}>{n.text}</li>)}
                </ul>
              </>
            )}
          </div>

          <div className="card" id="checkin">
            <h2>Weekly check-in</h2>
            <p className="small muted">Tap what you want more of next week. This teaches the coach faster than anything else.</p>
            <div className="chips">
              {TOPICS.map((t) => {
                const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
                const done = (c.checkins ?? []).some((x) => x.topic === t.id && Date.parse(x.at) > weekAgo);
                return (
                  <button type="button" key={t.id} className="chip" aria-pressed={done} disabled={busy || done} title={t.blurb}
                    onClick={() => call("", "PATCH", { prefer: { topic: t.id, more: true } }, `More ${t.label.toLowerCase()} coming`)}>
                    {done ? "✓ " : "+ "}{t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2>Tell your coach something</h2>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="I'm launching a course next month, help me prepare content for it" />
            <button className="btn sm" style={{ marginTop: 10 }} disabled={busy || !note.trim()} onClick={() => { call("", "PATCH", { note }, "Noted"); setNote(""); }}>Save note</button>
          </div>

          <div className="card">
            <h2>Delivery</h2>
            <label htmlFor="ch">Channel</label>
            <select id="ch" value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
              {data.channels.map((x) => (
                <option key={x.id} value={x.id}>{x.label}{x.configured ? "" : " (not configured on server yet)"}</option>
              ))}
            </select>
            {chMeta.contactLabel && (
              <>
                <label htmlFor="contact">{chMeta.contactLabel}</label>
                <input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={chMeta.placeholder} />
              </>
            )}
            {channel === "telegram" && data.telegramBot && (
              <p className="small"><a href={`https://t.me/${data.telegramBot}?start=${id}`} target="_blank" rel="noreferrer">Connect Telegram in one tap →</a></p>
            )}
            <button className="btn sm" style={{ marginTop: 12 }} disabled={busy} onClick={() => call("", "PATCH", { channel, contact }, "Saved")}>Save delivery</button>
          </div>
        </div>
      </div>
    </>
  );
}
