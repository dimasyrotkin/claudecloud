// s06_bench.js (48–58 s): three benchmark cards. Honest zero-based bars, a dashed "no compression" baseline.
// Competitors land below it, Zip α lands above it. Cards flip like paper between panels.
'use strict';
(() => {
  const CX = 120, CY = 250, CW = W - 240, CH = 760;
  function panel(ctx, t, i, t0) {
    const B = DATA.bench[i], max = Math.max(B.base, ...B.rows.map(r => r[1])) * 1.12;
    piece(ctx, [[0, 0], [CW, 0], [CW, CH], [0, CH]], { fill: PAL.cream, ink: PAL.ink, lw: 5, sh: [14, 18], sha: .28 });
    // header
    txt(ctx, B.name, 50, 105, { f: 'any', w: 900, wd: 86, s: 92 }, { fill: PAL.ink, mis: [5, 4, PAL.pink] });
    txt(ctx, B.unit + '  ·  higher is better', 54, 150, { f: 'mono', s: 28, w: 600 }, { fill: rgba(PAL.ink, .7) });
    txt(ctx, `${i + 1} / ${DATA.bench.length}`, CW - 50, 100, { f: 'mono', s: 34, w: 800 }, { align: 'right', fill: PAL.ink });
    if (DATA.placeholder) { ctx.save(); ctx.translate(CW - 190, 150); ctx.rotate(.04); rr(ctx, -150, -26, 300, 44, 22); ctx.fillStyle = PAL.pink; ctx.fill(); txt(ctx, 'PLACEHOLDER DATA', 0, 6, { f: 'mono', s: 22, w: 800 }, { align: 'center', fill: PAL.cream }); ctx.restore(); }
    // bars
    const bx = 540, bw = CW - bx - 190, y0 = 250, rowH = 150;
    const xOf = v => bx + bw * v / max;
    B.rows.forEach(([name, v], r) => {
      const isZ = name.startsWith('Zip'), tr = t0 + (isZ ? 2.0 : .5 + r * .5), g = E.outX(seg(t, tr - .04, tr + .35));
      const y = y0 + r * rowH;
      txt(ctx, isZ ? name : name.replace('Microsoft ', 'MSFT '), 50, y + 58, { f: isZ ? 'any' : 'mono', s: isZ ? 64 : 38, w: isZ ? 900 : 700, wd: 90 }, { fill: isZ ? PAL.blue : PAL.ink });
      if (g <= 0) return;
      const x1 = lerp(bx, xOf(v), g);
      piece(ctx, [[bx, y], [x1, y], [x1, y + 88], [bx, y + 88]], { fill: isZ ? PAL.blue : PAL.grey, ink: PAL.ink, lw: 4, sh: [8, 10] });
      ctx.save(); ctx.beginPath(); ctx.rect(bx, y, x1 - bx, 88); ctx.clip();
      halftone(ctx, bx, y, x1, y + 88, (px) => clamp((px - bx) / (bw) * .8), { pitch: 14, color: rgba(isZ ? PAL.violet : PAL.ink, .35) });
      ctx.restore();
      const d = v - B.base;
      if (g > .9) {
        txt(ctx, v.toFixed(1), x1 + 18, y + 60, { f: 'mono', s: 44, w: 800 }, { fill: PAL.ink });
        const dk = popIn(t, tr + .3); ctx.save(); ctx.translate(x1 + 18 + 120, y + 16); ctx.scale(dk, dk);
        rr(ctx, 0, -24, 150, 44, 22); ctx.fillStyle = d >= 0 ? PAL.blue : PAL.pink; ctx.fill();
        txt(ctx, (d >= 0 ? '▲ +' : '▼ ') + d.toFixed(1), 75, 8, { f: 'mono', s: 26, w: 800 }, { align: 'center', fill: PAL.cream }); ctx.restore();
      }
      if (isZ && g > .95) {
        zipChar(ctx, 410, y + 86, 44, { t, eyes: 'happy', mouth: .6, slider: .2, aL: 2.6, aR: 2.6, dy: -pulse(t, 7) * .3, shadow: false, seed: 12 });
        sparkles(ctx, x1 - 40, y + 40, 130, t, 5, 40 + i);
      }
    });
    // baseline
    const bxl = xOf(B.base), bk = seg(t, t0 + .2, t0 + .5);
    ctx.save(); ctx.globalAlpha = bk; ctx.setLineDash([18, 12]); ctx.lineWidth = 6; ctx.strokeStyle = PAL.ink;
    ctx.beginPath(); ctx.moveTo(bxl, y0 - 40); ctx.lineTo(bxl, y0 + rowH * 3 - 30); ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, bxl - 170, y0 + rowH * 3 - 18, 340, 50, 10); ctx.fillStyle = PAL.ink; ctx.fill();
    txt(ctx, 'no compression ' + B.base.toFixed(1), bxl, y0 + rowH * 3 + 16, { f: 'mono', s: 26, w: 700 }, { align: 'center', fill: PAL.cream });
    ctx.restore();
  }
  function benchFrame(ctx, t) {
    ctx.fillStyle = PAL.blue; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.strokeStyle = rgba(PAL.cream, .1); ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
    const t0 = T('b.title'), hk = slamIn(t, t0);
    ctx.save(); ctx.translate(CX, 170); ctx.scale(hk, hk); txt(ctx, 'BENCHMARKS', 0, 0, { f: 'any', w: 900, wd: 60, s: 150 }, { fill: PAL.cream, shadow: [7, 9, PAL.ink, .35] }); ctx.restore();
    txt(ctx, 'vs Microsoft LLMLingua-2 · The Token Company', W - CX, 150, { f: 'mono', s: 30, w: 700 }, { align: 'right', fill: PAL.cream, alpha: seg(t, t0 + .2, t0 + .4) });
    const P = [T('b.p1'), T('b.p2'), T('b.p3'), 57.5];
    let i = P.findIndex((p, j) => t >= p && t < P[j + 1]); if (i < 0) i = t < P[0] ? 0 : 2;
    const p0 = P[i], p1 = P[i + 1];
    // flip in / out
    const fin = i === 0 ? E.back(seg(t, p0 - .1, p0 + .25), 1.2) : E.outC(seg(t, p0, p0 + .18));
    const fout = i === 2 ? 1 : 1 - E.inC(seg(t, p1 - .18, p1));
    const sx = Math.max(.001, i === 0 ? Math.min(1, fin) : fin) * fout;
    const yIn = i === 0 ? (1 - clamp(fin)) * 600 : 0;
    const pz = 1 + seg(t, p0, p1) * .035 + pulse(t, 9) * .004; ctx.save(); ctx.translate(CX + CW / 2, CY + CH / 2 + yIn); ctx.scale(sx * pz, pz); ctx.rotate((i - 1) * .006); ctx.translate(-CW / 2, -CH / 2);
    panel(ctx, t, i, p0);
    ctx.restore();
  }
  scene('bench', 48, 58, (ctx, t) => {
    benchFrame(ctx, t);
    // VHS-style rewind into 2000
    const r = seg(t, T('y.rewind'), 58);
    if (r > 0) {
      const c = buf('rw'), x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(ctx.canvas, 0, 0);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (let b = 0; b < 18; b++) { const y = b * 60, off = (hash2(b, boilN(t)) - .5) * 260 * r + (b % 3 === 0 ? r * 120 : 0); ctx.drawImage(c, 0, y, W, 60, off, y + (-r * t * 900 % 60), W, 60); }
      flash(ctx, r * .25, PAL.cream);
      txt(ctx, '◀◀ REWIND', 80, 110, { f: 'mono', s: 60, w: 800 }, { fill: PAL.cream, shadow: [4, 4, PAL.ink, .6] });
      txt(ctx, String(Math.round(lerp(2026, 2000, E.inQ(r)))), W - 80, 110, { f: 'mono', s: 60, w: 800 }, { align: 'right', fill: PAL.yellow, shadow: [4, 4, PAL.ink, .6] });
      ctx.restore();
    }
  });
})();
