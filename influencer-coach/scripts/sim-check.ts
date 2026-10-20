// Regression check: across seeds, the learner must beat a non-learning baseline
// once it has had a few weeks of feedback.
import { PERSONAS, simulate, weekly } from "../lib/simulate.ts";

let failed = false;
for (const checkins of [false, true]) {
console.log(checkins ? "With weekly check-in:" : "Daily reactions only:");
for (const p of PERSONAS) {
  const lifts: number[] = [];
  const gaps: number[] = [];
  for (let seed = 1; seed <= 20; seed++) {
    const w = weekly(simulate(p, 63, seed, false, checkins).days);
    const late = w.slice(-4);
    const learner = late.reduce((a, x) => a + x.learner, 0) / late.length;
    const random = late.reduce((a, x) => a + x.random, 0) / late.length;
    const oracle = late.reduce((a, x) => a + x.oracle, 0) / late.length;
    lifts.push(learner / random);
    gaps.push((learner - random) / (oracle - random));
  }
  const avg = lifts.reduce((a, b) => a + b, 0) / lifts.length;
  const worst = Math.min(...lifts);
  console.log(`${p.id.padEnd(6)} weeks 6-9 usefulness lift vs random: avg ${avg.toFixed(2)}x, worst seed ${worst.toFixed(2)}x, closes ${Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 100)}% of gap to oracle`);
  if (avg < (checkins ? 1.5 : 1.3)) failed = true;
}
}
if (failed) {
  console.error("FAIL: learner below expected lift over baseline");
  process.exit(1);
}
console.log("OK");
