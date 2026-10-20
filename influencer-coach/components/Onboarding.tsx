"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CHANNELS, PLATFORMS, TOPICS } from "@/lib/catalog.ts";
import type { Channel, CreatorPlatform, Experience } from "@/lib/types.ts";

const STAGES: { id: Experience; label: string }[] = [
  { id: "starting", label: "Just starting (<1k)" },
  { id: "growing", label: "Growing (1k-100k)" },
  { id: "established", label: "Established (100k+)" },
];

export default function Onboarding() {
  const router = useRouter();
  const [returning, setReturning] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<CreatorPlatform>("tiktok");
  const [niche, setNiche] = useState("");
  const [experience, setExperience] = useState<Experience>("growing");
  const [goals, setGoals] = useState<string[]>([]);
  const [struggle, setStruggle] = useState("");
  const [channel, setChannel] = useState<Channel>("web");
  const [contact, setContact] = useState("");
  const [localHour, setLocalHour] = useState(9);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setReturning(localStorage.getItem("cadence:id"));
    } catch {}
  }, []);

  const toggleGoal = (id: string) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : g.length < 4 ? [...g, id] : g));

  const ch = CHANNELS.find((c) => c.id === channel)!;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const offsetHours = new Date().getTimezoneOffset() / 60;
    const sendHourUtc = (((localHour + offsetHours) % 24) + 24) % 24;
    const res = await fetch("/api/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, platform, niche, experience, goals, struggle, channel, contact, sendHourUtc: Math.round(sendHourUtc) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setBusy(false);
      return;
    }
    try {
      localStorage.setItem("cadence:id", data.id);
    } catch {}
    router.push(`/u/${data.id}?welcome=1`);
  }

  return (
    <form className="card" onSubmit={submit}>
      {returning && (
        <div className="banner">
          Welcome back. <a href={`/u/${returning}`}>Open your dashboard</a>
        </div>
      )}
      <h2>Get your first tip in 30 seconds</h2>

      <div className="grid grid-2">
        <div>
          <label htmlFor="name">Your name or handle</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="@maya.makeup" required />
        </div>
        <div>
          <label htmlFor="platform">Main platform you create for</label>
          <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value as CreatorPlatform)}>
            {PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <label htmlFor="niche">Niche</label>
      <input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. affordable skincare, home cooking, B2B sales" />

      <label>Stage</label>
      <div className="chips">
        {STAGES.map((s) => (
          <button type="button" key={s.id} className="chip" aria-pressed={experience === s.id} onClick={() => setExperience(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <label>What do you want help with? (up to 4, it's a starting guess, the coach will learn the rest)</label>
      <div className="chips">
        {TOPICS.map((t) => (
          <button type="button" key={t.id} className="chip" aria-pressed={goals.includes(t.id)} onClick={() => toggleGoal(t.id)} title={t.blurb}>
            {t.label}
          </button>
        ))}
      </div>

      <label htmlFor="struggle">Biggest struggle right now, in your words</label>
      <textarea id="struggle" value={struggle} onChange={(e) => setStruggle(e.target.value)} placeholder="My views dropped after I changed niches and I'm losing motivation..." />

      <div className="grid grid-2">
        <div>
          <label htmlFor="channel">Where should tips arrive?</label>
          <select id="channel" value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
            {CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hour">Daily delivery time (your local time)</label>
          <select id="hour" value={localHour} onChange={(e) => setLocalHour(Number(e.target.value))}>
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>{`${h.toString().padStart(2, "0")}:00`}</option>
            ))}
          </select>
        </div>
      </div>
      {ch.contactLabel && (
        <>
          <label htmlFor="contact">{ch.contactLabel}</label>
          <input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={ch.placeholder} />
        </>
      )}

      {error && <p className="error">{error}</p>}
      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn" disabled={busy}>{busy ? "Writing your first tip..." : "Start coaching"}</button>
        <span className="small muted">No password. Your dashboard link is your key, keep it private.</span>
      </div>
    </form>
  );
}
