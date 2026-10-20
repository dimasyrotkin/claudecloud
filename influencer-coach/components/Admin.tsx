"use client";

import { useCallback, useEffect, useState } from "react";
import { styleLabel, topicLabel } from "@/lib/catalog.ts";
import type { Correction, PostReview, ReviewContent, ReviewDimension, Tip } from "@/lib/types.ts";
import { ReviewBody } from "./PostReviews.tsx";

const DIMS: { id: ReviewDimension; label: string }[] = [
  { id: "hook", label: "Hook" },
  { id: "storytelling", label: "Story & structure" },
  { id: "visuals", label: "Visuals & cover" },
  { id: "pacing", label: "Pacing & editing" },
  { id: "engagement", label: "Engagement & CTA" },
  { id: "positioning", label: "Niche & positioning" },
];

interface AdminData {
  creators: Record<string, { name: string; platform: string; niche: string }>;
  pending: PostReview[];
  done: PostReview[];
  tips: (Tip & { creatorId: string; creatorName: string })[];
  corrections: Correction[];
  config: { manualReview: boolean; storageMode: string; aiEnabled: boolean };
}

function Editor({ review, creator, onDone, api }: {
  review: PostReview;
  creator?: AdminData["creators"][string];
  onDone: () => void;
  api: (path: string, method: string, body?: unknown) => Promise<boolean>;
}) {
  const [c, setC] = useState<ReviewContent>(structuredClone(review.ai));
  const [note, setNote] = useState("");
  const [rule, setRule] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ReviewContent>(k: K, v: ReviewContent[K]) => setC((x) => ({ ...x, [k]: v }));
  const m = Object.entries(review.input.metrics);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    const ok = await api(`/reviews/${review.id}`, "POST", { action, content: c, note, reason, rule });
    setBusy(false);
    if (ok) onDone();
  }

  return (
    <div className="card">
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div>
          <span className="tag">{review.source === "claude" ? "Claude draft" : "Heuristic draft"}</span>
          <span className="tag">{new Date(review.createdAt).toLocaleString()}</span>
          <h3 style={{ marginTop: 10 }}>{creator?.name ?? review.creatorId} · {creator?.platform} · {creator?.niche}</h3>
          <p className="small"><b>Goal:</b> {review.input.goal || "not given"}</p>
          {review.input.url && <p className="small"><a href={review.input.url} target="_blank" rel="noreferrer">Open post ↗</a></p>}
          {m.length > 0 && <p className="small muted">{m.map(([k, v]) => `${k} ${v}`).join(" · ")}</p>}
          <pre className="small" style={{ whiteSpace: "pre-wrap", background: "var(--surface-2)", padding: 12, borderRadius: 10, fontFamily: "inherit" }}>{review.input.caption || "(no text)"}</pre>
          <div className="row">
            {review.input.images.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noreferrer"><img src={src} alt="" style={{ maxHeight: 160, borderRadius: 8 }} /></a>
            ))}
          </div>
        </div>

        <div>
          <label>Summary</label>
          <textarea value={c.summary} onChange={(e) => set("summary", e.target.value)} />
          <label>Scores (1-10)</label>
          <div className="grid grid-3">
            {DIMS.map((d) => (
              <div key={d.id}>
                <span className="small muted">{d.label}</span>
                <input type="number" min={1} max={10} value={c.scores[d.id]} onChange={(e) => set("scores", { ...c.scores, [d.id]: Number(e.target.value) })} />
              </div>
            ))}
          </div>
          <label>Strengths (one per line)</label>
          <textarea value={c.strengths.join("\n")} onChange={(e) => set("strengths", e.target.value.split("\n"))} />
          <label>Fixes</label>
          {c.fixes.map((f, i) => (
            <div key={i} className="card soft" style={{ padding: 10, marginBottom: 8 }}>
              <div className="row between">
                <select value={f.dimension} onChange={(e) => set("fixes", c.fixes.map((x, j) => (j === i ? { ...x, dimension: e.target.value as ReviewDimension } : x)))} style={{ width: "auto" }}>
                  {DIMS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
                <button className="btn ghost sm" onClick={() => set("fixes", c.fixes.filter((_, j) => j !== i))}>Remove</button>
              </div>
              <input style={{ marginTop: 6 }} value={f.issue} placeholder="Issue" onChange={(e) => set("fixes", c.fixes.map((x, j) => (j === i ? { ...x, issue: e.target.value } : x)))} />
              <input style={{ marginTop: 6 }} value={f.fix} placeholder="Fix" onChange={(e) => set("fixes", c.fixes.map((x, j) => (j === i ? { ...x, fix: e.target.value } : x)))} />
            </div>
          ))}
          <button className="btn ghost sm" onClick={() => set("fixes", [...c.fixes, { dimension: "hook", issue: "", fix: "" }])}>+ Add fix</button>
          <label>Rewritten hook</label>
          <input value={c.rewrittenHook} onChange={(e) => set("rewrittenHook", e.target.value)} />
          <label>Next experiment</label>
          <input value={c.nextExperiment} onChange={(e) => set("nextExperiment", e.target.value)} />
          <label>Caveats shown to creator</label>
          <input value={c.caveats} onChange={(e) => set("caveats", e.target.value)} />

          <div style={{ borderTop: "1px solid var(--line)", marginTop: 16, paddingTop: 6 }}>
            <label>Coach&apos;s note to the creator (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Love the energy here. One thing from me..." />
            <label>Caught a mistake? Turn it into a rule for all future AI output (optional)</label>
            <input value={rule} onChange={(e) => setRule(e.target.value)} placeholder="e.g. Never suggest trending sounds for LinkedIn posts" />
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" disabled={busy} onClick={() => act("approve")}>Approve & send</button>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reject reason (internal)" style={{ flex: 1, minWidth: 160 }} />
              <button className="btn ghost" disabled={busy} onClick={() => act("reject")}>Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlagReview({ review, api }: { review: PostReview; api: (path: string, method: string, body?: unknown) => Promise<boolean> }) {
  const [rule, setRule] = useState("");
  const [saved, setSaved] = useState(false);
  if (saved) return <p className="small tag good">Rule saved</p>;
  return (
    <div className="row" style={{ marginTop: 10 }}>
      <input value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Mistake here? Write the rule that prevents it" style={{ flex: 1, minWidth: 200 }} />
      <button className="btn sm" disabled={!rule.trim()} onClick={async () => (await api("/corrections", "POST", { rule, from: { kind: "review", id: review.id, creatorId: review.creatorId } })) && setSaved(true)}>Save rule</button>
    </div>
  );
}

function FlagTip({ tip, api, onDone }: { tip: AdminData["tips"][number]; api: (path: string, method: string, body?: unknown) => Promise<boolean>; onDone: () => void }) {
  const [rule, setRule] = useState("");
  const [open, setOpen] = useState(false);
  if (tip.flagged) return <span className="tag bad">Flagged: {tip.flagged}</span>;
  if (!open) return <button className="btn ghost sm" onClick={() => setOpen(true)}>Flag mistake</button>;
  return (
    <div className="row" style={{ marginTop: 6 }}>
      <input value={rule} onChange={(e) => setRule(e.target.value)} placeholder="Rule to prevent this, e.g. 'Don't cite exact algorithm numbers'" style={{ flex: 1, minWidth: 200 }} />
      <button className="btn sm" disabled={!rule.trim()} onClick={async () => (await api("/tips", "POST", { creatorId: tip.creatorId, tipId: tip.id, rule })) && onDone()}>Save rule</button>
    </div>
  );
}

export default function Admin() {
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<"queue" | "done" | "tips" | "rules">("done");
  const [error, setError] = useState("");
  const [newRule, setNewRule] = useState("");

  const load = useCallback(async (k: string) => {
    const r = await fetch("/api/admin", { headers: { "x-admin-key": k } });
    if (!r.ok) {
      setError(r.status === 401 ? "Wrong key, or ADMIN_KEY is not set on the server." : "Failed to load");
      setData(null);
      return;
    }
    setError("");
    setData(await r.json());
  }, []);

  useEffect(() => {
    try {
      const k = localStorage.getItem("cadence:admin") ?? "";
      if (k) {
        setKey(k);
        load(k);
      }
    } catch {}
  }, [load]);

  async function api(path: string, method: string, body?: unknown): Promise<boolean> {
    const r = await fetch(`/api/admin${path}`, { method, headers: { "Content-Type": "application/json", "x-admin-key": key }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) {
      setError((await r.json().catch(() => ({}))).error ?? "Request failed");
      return false;
    }
    await load(key);
    return true;
  }

  if (!data) {
    return (
      <div className="card" style={{ maxWidth: 420 }}>
        <h2>Coach console</h2>
        <label htmlFor="key">Admin key</label>
        <input id="key" type="password" value={input} onChange={(e) => setInput(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="btn" style={{ marginTop: 12 }} onClick={() => { try { localStorage.setItem("cadence:admin", input); } catch {} setKey(input); load(input); }}>Open</button>
      </div>
    );
  }

  const tabs = [
    ...(data.config.manualReview || data.pending.length ? ([["queue", `Review queue (${data.pending.length})`]] as const) : []),
    ["done", "Reviewed"],
    ["tips", "Tips sent"],
    ["rules", `Rules (${data.corrections.length})`],
  ] as const;

  return (
    <>
      {!data.config.manualReview && <div className="banner">Reviews publish immediately. Spot-check them under &quot;Reviewed&quot; and turn mistakes into rules. Set REVIEW_MODE=manual to hold them for approval.</div>}
      {data.config.storageMode === "memory" && <div className="banner">Demo storage: the queue resets when the server restarts.</div>}
      <div className="chips" style={{ marginBottom: 16 }}>
        {tabs.map(([id, label]) => (
          <button key={id} className="chip" aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>
        ))}
        <button className="chip" onClick={() => load(key)}>↻ Refresh</button>
      </div>
      {error && <p className="error">{error}</p>}

      {tab === "queue" && (
        <div className="grid">
          {data.pending.length === 0 && <div className="card muted">Queue is empty. 🎉</div>}
          {data.pending.map((r) => (
            <Editor key={r.id} review={r} creator={data.creators[r.creatorId]} api={api} onDone={() => undefined} />
          ))}
        </div>
      )}

      {tab === "done" && (
        <div className="grid">
          {data.done.map((r) => (
            <details key={r.id} className="card">
              <summary className="row between" style={{ cursor: "pointer" }}>
                <span><b>{data.creators[r.creatorId]?.name}</b> <span className="small muted">{r.input.caption.slice(0, 70)}</span></span>
                <span className="small">
                  <span className={`tag ${r.status === "approved" ? "good" : "bad"}`}>{r.status}</span>
                  {r.edited && <span className="tag">edited</span>}
                  {r.creatorReaction && <span className={`tag ${r.creatorReaction === "up" ? "good" : "bad"}`}>creator {r.creatorReaction === "up" ? "👍" : "👎"}</span>}
                </span>
              </summary>
              {r.final ? <ReviewBody content={r.final} dimensions={DIMS} /> : <p className="small">Rejected: {r.rejectReason || "no reason"}</p>}
              {r.final && <FlagReview review={r} api={api} />}
            </details>
          ))}
        </div>
      )}

      {tab === "tips" && (
        <div className="card">
          <p className="small muted">Daily tips go out without approval. Spot-check them here. Flagging one turns your reason into a rule for all future output.</p>
          <div className="history">
            {data.tips.map((t) => (
              <details key={`${t.creatorId}-${t.id}`} className="history-item" style={{ display: "block" }}>
                <summary className="row between" style={{ cursor: "pointer" }}>
                  <span><b>{t.title}</b> <span className="small muted">· {t.creatorName} · {topicLabel(t.topic)} · {styleLabel(t.style)} · {t.source}</span></span>
                  <span className="small">{t.feedback?.reaction ?? <span className="muted">unrated</span>}</span>
                </summary>
                <p className="small">{t.body}</p>
                <p className="small"><b>Today:</b> {t.action}</p>
                <FlagTip tip={t} api={api} onDone={() => undefined} />
              </details>
            ))}
          </div>
        </div>
      )}

      {tab === "rules" && (
        <div className="card">
          <p className="small muted">Every rule is added to the system prompt for tips and post reviews. Keep them short and specific (max 30).</p>
          <ul>
            {data.corrections.map((c) => (
              <li key={c.id} style={{ marginBottom: 6 }}>
                {c.rule} <span className="small muted">({c.from.kind}, {new Date(c.createdAt).toLocaleDateString()})</span>{" "}
                <button className="btn ghost sm" onClick={() => api("/corrections", "DELETE", { id: c.id })}>Delete</button>
              </li>
            ))}
          </ul>
          <div className="row">
            <input value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Add a rule" style={{ flex: 1, minWidth: 200 }} />
            <button className="btn sm" disabled={!newRule.trim()} onClick={async () => (await api("/corrections", "POST", { rule: newRule })) && setNewRule("")}>Add</button>
          </div>
        </div>
      )}
    </>
  );
}
