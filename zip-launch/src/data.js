// data.js: every number shown on screen. ⚠ PLACEHOLDERS: replace with Zip Labs' real results before posting.
'use strict';
const DATA = {
  placeholder: true, // while true, the benchmark and race shots carry a small "sample data" tag
  // terminal race (one representative Codex run on a Terminal-Bench task)
  race: {
    task: 'terminal-bench · fix-flaky-parser',
    base: { turns: 31, secs: 372, cost: 1.84, ctx: .94 },   // without Zip
    zip:  { turns: 24, secs: 291, cost: 1.47, ctx: .58 },   // with Zip  (1.47 / 1.84 = −20 %)
  },
  // benchmarks: score with each compressor; baseline = no compression
  bench: [
    { name: 'TERMINAL-BENCH', unit: '% solved', base: 42.0, rows: [['Microsoft LLMLingua-2', 36.1], ['The Token Company', 39.4], ['Zip α', 44.8]] },
    { name: 'HUMANEVAL',      unit: 'pass@1',   base: 90.2, rows: [['Microsoft LLMLingua-2', 84.7], ['The Token Company', 88.1], ['Zip α', 91.5]] },
    { name: 'SWE-BENCH VERIFIED', unit: '% resolved', base: 68.0, rows: [['Microsoft LLMLingua-2', 61.2], ['The Token Company', 65.3], ['Zip α', 69.4]] },
  ],
};
