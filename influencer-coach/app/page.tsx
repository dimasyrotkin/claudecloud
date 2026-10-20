import Link from "next/link";
import Onboarding from "@/components/Onboarding.tsx";

export default function Home() {
  return (
    <>
      <section style={{ marginBottom: 40 }}>
        <h1>One tip a day.<br />Tuned to you, a little more every day.</h1>
        <p className="lede">
          Cadence is a content coach for creators. It sends one practical tip each morning on the channel you
          already live in, and learns from your reactions which topics, formats and tone actually move you.
        </p>
        <div className="row">
          <a className="btn" href="#start">Start free</a>
          <Link className="btn ghost" href="/lab">Watch it learn (simulation)</Link>
        </div>
      </section>

      <section id="how" className="grid grid-3" style={{ marginBottom: 40 }}>
        <div className="card">
          <h3>1. Pick your channel</h3>
          <p className="muted small">Email, Telegram, WhatsApp, SMS, Discord, Slack, or just the web inbox. Switch anytime.</p>
        </div>
        <div className="card">
          <h3>2. React in one tap</h3>
          <p className="muted small">👍 useful, ✅ I did it, 👎 not for me. Optionally say why: too long, too basic, wrong platform...</p>
        </div>
        <div className="card">
          <h3>3. It adapts</h3>
          <p className="muted small">
            A bandit model picks tomorrow's topic and format, an AI coach writes it with your history in mind. You can see exactly what it learned.
          </p>
        </div>
      </section>

      <section id="start">
        <Onboarding />
      </section>
    </>
  );
}
