"use client";

import { useState } from "react";
import type { DashboardPayload } from "@/lib/api.ts";
import type { ReviewContent } from "@/lib/types.ts";

type Dim = { id: DashboardPayload["dimensions"][number]["id"]; label: string };

/** Downscale to a small JPEG in the browser so uploads stay well under storage limits. */
async function compress(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 800 / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  for (const q of [0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length < 240_000) return url;
  }
  return canvas.toDataURL("image/jpeg", 0.3);
}

export function ReviewBody({ content, dimensions }: { content: ReviewContent; dimensions: Dim[] }) {
  const label = (id: string) => dimensions.find((d) => d.id === id)?.label ?? id;
  return (
    <>
      <p>{content.summary}</p>
      <div className="bars" style={{ margin: "12px 0" }}>
        {dimensions.map((d) => (
          <div className="bar-row" key={d.id}>
            <span>{d.label}</span>
            <div className="bar-track" style={{ background: "var(--bg)" }}>
              <div className="bar-ci" style={{ left: 0, width: `${content.scores[d.id] * 10}%`, background: content.scores[d.id] <= 5 ? "var(--accent)" : content.scores[d.id] >= 8 ? "var(--good)" : "var(--series-2)" }} />
            </div>
            <span className="bar-num">{content.scores[d.id]}/10</span>
          </div>
        ))}
      </div>
      {content.strengths.length > 0 && (
        <>
          <h3>What works</h3>
          <ul className="small" style={{ marginTop: 0 }}>{content.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </>
      )}
      {content.fixes.length > 0 && (
        <>
          <h3>Fix next</h3>
          <ol className="small" style={{ marginTop: 0 }}>
            {content.fixes.map((f, i) => (
              <li key={i} style={{ marginBottom: 6 }}><span className="tag">{label(f.dimension)}</span>{f.issue} <b>{f.fix}</b></li>
            ))}
          </ol>
        </>
      )}
      {content.rewrittenHook && <div className="tip-action"><b>Try this hook:</b> {content.rewrittenHook}</div>}
      {content.nextExperiment && <p className="small"><b>Next experiment:</b> {content.nextExperiment}</p>}
      {content.caveats && <p className="small muted">Limits: {content.caveats} · confidence {content.confidence}</p>}
    </>
  );
}

export default function PostReviews({
  data,
  focus,
  call,
  busy,
}: {
  data: DashboardPayload;
  focus?: string;
  call: (path: string, method: string, body?: unknown, msg?: string) => Promise<boolean>;
  busy: boolean;
}) {
  const [open, setOpen] = useState(data.reviews.length === 0);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [goal, setGoal] = useState("");
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [imgError, setImgError] = useState("");

  async function addImages(files: FileList | null) {
    setImgError("");
    if (!files) return;
    const picked = [...files].slice(0, 3 - images.length);
    try {
      const out = await Promise.all(picked.map(compress));
      setImages((x) => [...x, ...out].slice(0, 3));
    } catch {
      setImgError("Couldn't read that image, try a PNG or JPEG screenshot.");
    }
  }

  async function submit() {
    const ok = await call("/reviews", "POST", { url, caption, goal, metrics, images }, "Sent for review");
    if (ok) {
      setCaption("");
      setUrl("");
      setGoal("");
      setMetrics({});
      setImages([]);
      setOpen(false);
    }
  }

  return (
    <div className="card" id="reviews">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Post feedback</h2>
        {!open && <button className="btn sm" onClick={() => setOpen(true)}>Review a post</button>}
      </div>
      <p className="small muted">
        Share a post you made (or a draft). You get scores, fixes and a better hook.
        {data.manualReview ? " A human coach checks every review before you see it." : ""}
      </p>

      {open && (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 6, marginBottom: 14 }}>
          <label htmlFor="pr-caption">Caption, script or transcript</label>
          <textarea id="pr-caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Paste what you said or wrote. For videos, the spoken script matters most." style={{ minHeight: 110 }} />
          <div className="grid grid-2">
            <div>
              <label htmlFor="pr-url">Link (optional)</label>
              <input id="pr-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@you/video/..." />
            </div>
            <div>
              <label htmlFor="pr-goal">What should this post do?</label>
              <input id="pr-goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Get saves, grow followers, sell..." />
            </div>
          </div>
          <label>Numbers so far (optional)</label>
          <div className="grid grid-3">
            {["views", "likes", "comments", "shares", "saves", "followers"].map((k) => (
              <input key={k} inputMode="numeric" aria-label={k} placeholder={k} value={metrics[k] ?? ""} onChange={(e) => setMetrics((m) => ({ ...m, [k]: e.target.value.replace(/[^\d]/g, "") }))} />
            ))}
          </div>
          <label htmlFor="pr-img">Screenshots: cover, key frames, insights (up to 3)</label>
          <input id="pr-img" type="file" accept="image/*" multiple disabled={images.length >= 3} onChange={(e) => addImages(e.target.files)} />
          {imgError && <p className="error">{imgError}</p>}
          {images.length > 0 && (
            <div className="row" style={{ marginTop: 8 }}>
              {images.map((src, i) => (
                <button key={i} type="button" className="chip" onClick={() => setImages((x) => x.filter((_, j) => j !== i))} title="Remove">
                  <img src={src} alt="" style={{ height: 48, borderRadius: 6, verticalAlign: "middle" }} /> ✕
                </button>
              ))}
            </div>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn sm" disabled={busy || (!caption.trim() && !images.length)} onClick={submit}>{busy ? "Reviewing..." : "Get feedback"}</button>
            {data.reviews.length > 0 && <button className="btn ghost sm" onClick={() => setOpen(false)}>Cancel</button>}
          </div>
        </div>
      )}

      <div className="grid">
        {data.reviews.map((r) => (
          <div key={r.id} className="card soft" style={focus === r.id ? { outline: "2px solid var(--accent)" } : undefined}>
            <div className="row between small muted">
              <span>{new Date(r.createdAt).toLocaleDateString()} · {r.input.caption.slice(0, 60) || "Screenshot review"}{r.input.caption.length > 60 ? "..." : ""}</span>
              <span>{r.status === "approved" ? (r.humanChecked ? "✓ Human-checked" : "Ready") : r.status === "pending" ? "In review" : "Couldn't review"}</span>
            </div>
            {r.status === "pending" && <p className="small">A coach is double-checking your feedback. You&apos;ll get a message when it&apos;s ready, usually within a day.</p>}
            {r.status === "rejected" && <p className="small">We couldn&apos;t give useful feedback on this one. Try adding the script or a clearer screenshot.</p>}
            {r.status === "approved" && r.content && (
              <>
                <ReviewBody content={r.content} dimensions={data.dimensions} />
                {r.adminNote && <div className="banner" style={{ marginTop: 10 }}><b>Coach&apos;s note:</b> {r.adminNote}</div>}
                {r.creatorReaction ? (
                  <p className="small muted">Thanks for rating this review.</p>
                ) : (
                  <div className="row">
                    <span className="small muted">Was this review helpful?</span>
                    <button className="btn ghost sm" disabled={busy} onClick={() => call(`/reviews/${r.id}`, "POST", { reaction: "up" })}>👍</button>
                    <button className="btn ghost sm" disabled={busy} onClick={() => call(`/reviews/${r.id}`, "POST", { reaction: "down" })}>👎</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
