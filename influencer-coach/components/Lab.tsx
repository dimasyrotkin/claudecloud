"use client";

import { useMemo, useState } from "react";
import { styleLabel, topicLabel } from "@/lib/catalog.ts";
import { view } from "@/lib/learner.ts";
import { PERSONAS, simulate, weekly, type WeekStat } from "@/lib/simulate.ts";
import { Bars } from "./Dashboard.tsx";

function Chart({ weeks, driftWeek }: { weeks: WeekStat[]; driftWeek?: number }) {
  const W = 640, H = 220, P = 32;
  const x = (i: number) => P + (i / Math.max(1, weeks.length - 1)) * (W - 2 * P);
  const y = (v: number) => H - P - v * (H - 2 * P);
  const line = (k: keyof WeekStat) => weeks.map((w, i) => `${i ? "L" : "M"}${x(i)},${y(w[k] as number)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Weekly tip usefulness: learner vs random vs ceiling">
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={P} x2={W - P} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={4} y={y(v) + 4}>{Math.round(v * 100)}%</text>
        </g>
      ))}
      {weeks.map((w, i) => (i % 2 === 0 ? <text key={i} x={x(i) - 8} y={H - 8}>w{w.week}</text> : null))}
      {driftWeek && driftWeek <= weeks.length && (
        <line x1={x(driftWeek - 1)} x2={x(driftWeek - 1)} y1={P} y2={H - P} stroke="var(--muted)" strokeDasharray="4 4" />
      )}
      <path d={line("oracle")} fill="none" stroke="var(--series-3)" strokeWidth={2} strokeDasharray="5 4" />
      <path d={line("random")} fill="none" stroke="var(--series-2)" strokeWidth={2} />
      <path d={line("learner")} fill="none" stroke="var(--series-1)" strokeWidth={3} />
    </svg>
  );
}

export default function Lab() {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [days, setDays] = useState(91);
  const [drift, setDrift] = useState(true);
  const [checkins, setCheckins] = useState(true);
  const [seeds, setSeeds] = useState(20);
  const [seedBase, setSeedBase] = useState(1);
  const p = PERSONAS.find((x) => x.id === personaId)!;

  const { avgWeeks, single } = useMemo(() => {
    const runs = Array.from({ length: seeds }, (_, i) => simulate(p, days, seedBase + i, drift, checkins));
    const ws = runs.map((r) => weekly(r.days));
    const avgWeeks: WeekStat[] = ws[0].map((w, i) => ({
      week: w.week,
      learner: ws.reduce((a, x) => a + x[i].learner, 0) / ws.length,
      random: ws.reduce((a, x) => a + x[i].random, 0) / ws.length,
      oracle: ws.reduce((a, x) => a + x[i].oracle, 0) / ws.length,
    }));
    return { avgWeeks, single: runs[0] };
  }, [p, days, drift, checkins, seeds, seedBase]);

  const truth = drift && p.drift && days >= p.drift.day ? p.drift.topicTaste : p.topicTaste;
  const topTruth = Object.entries(truth).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id]) => topicLabel(id));
  const late = avgWeeks.slice(-4);
  const lift = late.reduce((a, w) => a + w.learner, 0) / late.reduce((a, w) => a + w.random, 0);

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid grid-3">
          <div>
            <label htmlFor="persona">Synthetic creator</label>
            <select id="persona" value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
              {PERSONAS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="days">Days simulated: {days}</label>
            <input id="days" type="range" min={21} max={182} step={7} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </div>
          <div>
            <label htmlFor="seeds">Averaged over {seeds} runs</label>
            <input id="seeds" type="range" min={1} max={50} value={seeds} onChange={(e) => setSeeds(Number(e.target.value))} />
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>{p.summary}</p>
        <div className="row">
          {p.drift && (
            <label className="small" style={{ display: "flex", gap: 8, alignItems: "center", margin: 0, fontWeight: 400 }}>
              <input type="checkbox" checked={drift} onChange={(e) => setDrift(e.target.checked)} style={{ width: "auto" }} /> {p.drift.note}
            </label>
          )}
          <label className="small" style={{ display: "flex", gap: 8, alignItems: "center", margin: 0, fontWeight: 400 }}>
            <input type="checkbox" checked={checkins} onChange={(e) => setCheckins(e.target.checked)} style={{ width: "auto" }} /> Weekly check-ins
          </label>
          <button className="btn ghost sm" onClick={() => setSeedBase((s) => s + seeds)}>Re-roll</button>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <h2>Weekly usefulness of tips</h2>
          <p className="small muted">Expected chance the creator finds that week's tips useful. Last 4 weeks: <b>{lift.toFixed(2)}x</b> a non-learning coach.</p>
          <Chart weeks={avgWeeks} driftWeek={drift && p.drift ? Math.ceil(p.drift.day / 7) : undefined} />
          <div className="legend">
            <span><i style={{ background: "var(--series-1)" }} />Cadence learner</span>
            <span><i style={{ background: "var(--series-2)" }} />Random tips (no learning)</span>
            <span><i style={{ background: "var(--series-3)" }} />Ceiling (knows the hidden truth)</span>
          </div>
        </div>
        <div className="card">
          <h2>What it learned (run #1)</h2>
          <p className="small muted">Hidden truth, top topics: <b>{topTruth.join(", ")}</b>. Stated goals at signup: {p.goals.map(topicLabel).join(", ")}.</p>
          <Bars arms={view(single.final.topics, topicLabel)} />
          <h3 style={{ marginTop: 16 }}>Formats</h3>
          <Bars arms={view(single.final.styles, styleLabel)} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Last 10 days (run #1)</h2>
        <div className="history">
          {single.days.slice(-10).reverse().map((d) => (
            <div className="history-item" key={d.day}>
              <span>Day {d.day}: <b>{topicLabel(d.topic)}</b> <span className="muted small">· {styleLabel(d.style)}</span></span>
              <span className="small">
                {d.reaction === "ignored" ? <span className="muted">no reply</span> : d.reaction === "down" ? "👎" : d.reaction === "did" ? "✅" : "👍"}{" "}
                <span className="muted">{d.tags.join(", ")}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
