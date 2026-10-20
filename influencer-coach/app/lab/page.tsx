import Lab from "@/components/Lab.tsx";

export const metadata = { title: "Learning lab · Cadence Coach" };

export default function LabPage() {
  return (
    <>
      <h1 style={{ fontSize: 34 }}>Learning lab</h1>
      <p className="lede">
        Synthetic creators with hidden preferences react to 3 months of daily tips. This runs the exact learning code used in
        production, in your browser, so you can see how fast it adapts and where it struggles.
      </p>
      <Lab />
      <div className="card soft" style={{ marginTop: 16 }}>
        <h2>How the learner works</h2>
        <ol className="steps small">
          <li><b>Cold start.</b> Population averages (what helps creators in general) plus the goals you pick at signup become a weak prior, worth ~2 tips of feedback. Unpicked topics start skeptical (est. 33%): for most creators only 3-4 topics are the real lever.</li>
          <li><b>Pick.</b> Two Thompson-sampling bandits choose tomorrow&apos;s topic (14 options) and format (5 options). Uncertain options get tried, proven ones get repeated, 5% of picks force exploration, and the last 2 topics are skipped to avoid ruts.</li>
          <li><b>Write.</b> Claude writes the tip using your profile, notes, last 10 tips and reactions, and 4 calibration dials (length, specificity, tone, level).</li>
          <li><b>Learn.</b> 👍 = success, ✅ &quot;I did it&quot; = double success (acting beats liking), 👎 = failure, silence = weak failure. Tags like &quot;too long&quot; move the dials and mostly blame the format, not the topic.</li>
          <li><b>Weekly check-in.</b> Once a week the creator taps the topics they want more of. One tap carries as much signal as 3 daily reactions, and in simulation it lifts results by roughly 10-25%.</li>
          <li><b>Forget slowly.</b> Every update discounts old evidence by 1%, so the coach follows you as you grow (toggle the drift event above).</li>
        </ol>
      </div>
    </>
  );
}
