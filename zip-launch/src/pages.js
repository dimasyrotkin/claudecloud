// pages.js: standalone sheets (character sheet, style sheet), printed with the same finish as the film.
'use strict';
function sheetHeader(ctx, title, sub) {
  ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = rgba(PAL.blue, .06); ctx.lineWidth = 2; ctx.beginPath();
  for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
  regMarks(ctx, PAL.pink, .55);
  txt(ctx, title, 70, 130, { f: 'any', s: 104, w: 900, wd: 62 }, { fill: PAL.ink, mis: [5, 4, PAL.pink] });
  txt(ctx, sub, 72, 172, { f: 'mono', s: 24, w: 600 }, { fill: rgba(PAL.ink, .75) });
}
const label = (ctx, s, x, y, o = {}) => txt(ctx, s, x, y, { f: 'mono', s: o.s || 21, w: 700 }, { align: o.align || 'center', fill: o.fill || PAL.ink });

PAGES.charsheet = (ctx, t) => {
  sheetHeader(ctx, 'ZIP · CAST', 'character sheet · zip α launch film · riso idol');
  // hero turnaround-ish: neutral, 3/4 look left, 3/4 look right
  zipChar(ctx, 270, 690, 175, { t: 1.2, blink: 0 });
  label(ctx, 'ZIP · neutral (zipped)', 270, 745);
  label(ctx, 'die-cut sticker · squircle "pouch" · zipper mouth', 270, 775, { s: 17 });
  zipChar(ctx, 620, 560, 95, { t: 1.2, blink: 0, look: [-.9, 0], sx: .93 }); label(ctx, 'look L', 620, 605);
  zipChar(ctx, 620, 830, 95, { t: 1.2, blink: 0, look: [.9, 0], sx: .93 }); label(ctx, 'look R', 620, 875);
  // expressions
  const ex = [['open', {}], ['happy', { mouth: .5, slider: .3, aL: 2.6, aR: 2.6 }], ['wink', { aR: 2.2 }], ['star', { mouth: .6, slider: .15 }], ['wide', { mouth: .8, slider: .1, brow: 'up' }], ['determined', { brow: 'angry' }], ['heart', {}], ['closed', {}]];
  ex.forEach(([e, o], i) => { const x = 860 + (i % 4) * 190, y = 480 + Math.floor(i / 4) * 290; zipChar(ctx, x, y, 66, { t: 1.2, blink: 0, eyes: e, ...o }); label(ctx, e, x, y + 36); });
  // point move
  txt(ctx, 'POINT MOVE · "zip it"', 1640, 250, { f: 'any', s: 34, w: 900, wd: 80 }, { align: 'center', fill: PAL.blue });
  [0, .5, 1].forEach((k, i) => { const x = 1640, y = 450 + i * 230; zipChar(ctx, x, y, 62, { t: 1.2, blink: 0, eyes: k > .9 ? 'wink' : 'open', mouth: .75 * (1 - k), slider: k, hR: [lerp(-.46, .46, k), .66], cR: [lerp(.35, .85, k), 1.05], pull: .2 }); label(ctx, ['pinch', 'pull', 'wink'][i], x + 130, y - 60); });
  // supporting cast strip
  ctx.fillStyle = rgba(PAL.ink, .08); ctx.fillRect(40, 905, W - 80, 150);
  bloat(ctx, 150, 980, 62, { t: 1.2 }); label(ctx, 'BLOAT', 150, 1060, { s: 18 });
  bloat(ctx, 330, 1000, 62, { t: 1.2, squeeze: 1, eyes: 'dot', mouth: .05, col: PAL.yellow, sweat: false }); label(ctx, 'bloat, zipped', 330, 1060, { s: 18 });
  tokenChip(ctx, 500, 975, 34, .1, { face: true }); tokenChip(ctx, 570, 990, 26, -.2); label(ctx, 'tokens', 535, 1060, { s: 18 });
  scissors(ctx, 700, 980, 110, .45, -.3); label(ctx, 'scissors', 700, 1060, { s: 18 });
  zipSlider(ctx, 880, 965, 38, -.2); label(ctx, 'the slider', 880, 1060, { s: 18 });
  label(ctx, 'engineer · unicorn · 2000 lab: flat paper figures, same ink line', 1400, 990, { s: 20 });
  finish(ctx, 1.2);
};

PAGES.stylesheet = (ctx, t) => {
  sheetHeader(ctx, 'RISO IDOL', 'style sheet · a K-pop debut teaser printed on a risograph');
  // inks
  const inks = [['paper', PAL.paper, '#F4EDE0'], ['ink', PAL.ink, '#1B1A2B'], ['blue', PAL.blue, '#2748E8'], ['pink', PAL.pink, '#FF4FB0'], ['yellow', PAL.yellow, '#FFD84D']];
  txt(ctx, 'INKS', 70, 250, { f: 'any', s: 34, w: 900, wd: 80 }, { fill: PAL.ink });
  inks.forEach(([n, c, h], i) => { const x = 70 + i * 150; piece(ctx, [[x, 275], [x + 130, 275], [x + 130, 405], [x, 405]], { fill: c, ink: PAL.ink, lw: 3, sh: [6, 7] }); label(ctx, n, x + 65, 435, { s: 19 }); label(ctx, h, x + 65, 458, { s: 16 }); });
  // overprint demo
  txt(ctx, 'OVERPRINT (multiply)', 70, 530, { f: 'any', s: 34, w: 900, wd: 80 }, { fill: PAL.ink });
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  [[PAL.blue, 190, 670], [PAL.pink, 290, 670], [PAL.yellow, 240, 760]].forEach(([c, x, y]) => { ctx.beginPath(); ctx.arc(x, y, 95, 0, TAU); ctx.fillStyle = c; ctx.fill(); });
  ctx.restore();
  label(ctx, 'three translucent inks → every shadow', 245, 890, { s: 18 });
  // halftone
  txt(ctx, 'HALFTONE', 520, 530, { f: 'any', s: 34, w: 900, wd: 80 }, { fill: PAL.ink });
  halftone(ctx, 520, 560, 820, 860, (x) => (x - 520) / 300, { pitch: 16, color: PAL.blue });
  // type
  txt(ctx, 'TYPE', 900, 250, { f: 'any', s: 34, w: 900, wd: 80 }, { fill: PAL.ink });
  [50, 75, 100, 125, 150].forEach((wd, i) => txt(ctx, 'BLOAT → ZIP', 900, 330 + i * 70, { f: 'any', s: 62, w: 900, wd }, { fill: i === 4 ? PAL.pink : i === 0 ? PAL.blue : PAL.ink }));
  label(ctx, 'Anybody 900 · width 50–150: zipped ↔ bloated, still legible', 900, 690, { align: 'left', s: 18 });
  txt(ctx, 'only, in half, improves', 900, 780, { f: 'ser', s: 72 }, { fill: PAL.ink });
  label(ctx, 'Instrument Serif Italic · one accent word per line', 900, 815, { align: 'left', s: 18 });
  txt(ctx, '$ agent run --compress zip-α', 900, 880, { f: 'mono', s: 38, w: 700 }, { fill: PAL.ink });
  label(ctx, 'JetBrains Mono · terminals, labels, fine print', 900, 915, { align: 'left', s: 18 });
  // motifs
  txt(ctx, 'MOTIFS', 1560, 250, { f: 'any', s: 34, w: 900, wd: 80 }, { fill: PAL.ink });
  ctx.save(); ctx.beginPath(); ctx.rect(1550, 270, 300, 110); ctx.clip(); zipperTeeth(ctx, 1560, 1840, () => 320, -1, { th: 26, pitch: 40 }); zipperTeeth(ctx, 1560, 1840, () => 320, 1, { th: 26, pitch: 40 }); ctx.restore(); zipSlider(ctx, 1800, 320, 40, -.2);
  label(ctx, '1 · the zipper (signature wipe)', 1710, 390, { s: 17 });
  scrap(ctx, 'CUT', 1640, 470, { f: 'any', s: 64, w: 900, wd: 50 }, { bg: PAL.pink, fg: PAL.cream, rot: .08, seed: 3 });
  stamp(ctx, 'STAMP', 1790, 470, { f: 'any', s: 44, w: 900, wd: 80 }, { k: 1, color: PAL.blue, multiply: false, rot: -.1 });
  label(ctx, '2 · paper cut · ransom scraps · stamps', 1710, 560, { s: 17 });
  txt(ctx, 'MIS', 1600, 680, { f: 'any', s: 120, w: 900, wd: 80 }, { fill: PAL.ink, mis: [8, 6, PAL.pink] });
  label(ctx, '3 · misregistration kicks on snares', 1710, 720, { s: 17 });
  sparkles(ctx, 1710, 830, 90, 1.7, 7, 3);
  label(ctx, '4 · idol sparkles · 5 · halftone', 1710, 920, { s: 17 });
  label(ctx, 'rules: a cut or a word on every beat · type left, character right · nothing holds still > 1.2 s · lines boil at 12 fps', W / 2, 1020, { s: 20 });
  finish(ctx, 1.2);
};
