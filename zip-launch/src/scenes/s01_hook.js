// s01_hook.js (0–8 s): ransom-note collage slams in on the beat, scissors cut the page in half, "in half?" in the gap,
// then the page unzips into Zip's debut.
'use strict';
(() => {
  const SCRAPS = () => [
    { id: 'h.did', s: 'DID', x: 330, y: 205, st: { f: 'any', w: 900, wd: 60 }, tw: 300, bg: PAL.ink, fg: PAL.cream, rot: -.07, seed: 11 },
    { id: 'h.openai', s: 'OPENAI', x: 830, y: 190, st: { f: 'any', w: 900, wd: 132 }, tw: 560, bg: PAL.yellow, fg: PAL.ink, rot: .035, seed: 12 },
    { id: 'h.just', s: 'just', x: 1330, y: 215, st: { f: 'ser' }, tw: 300, bg: PAL.cream, fg: PAL.ink, rot: -.05, seed: 13 },
    { id: 'h.cut', s: 'CUT', x: 1665, y: 190, st: { f: 'any', w: 900, wd: 50 }, tw: 250, bg: PAL.pink, fg: PAL.cream, rot: .1, seed: 14, mis: true },
    { id: 'h.your', s: 'YOUR', x: 520, y: 425, st: { f: 'mono', w: 800 }, tw: 400, bg: PAL.blue, fg: PAL.cream, rot: .045, seed: 15 },
    { id: 'h.proplan', s: 'PRO PLAN', x: 1210, y: 430, st: { f: 'any', w: 900, wd: 88 }, tw: 780, bg: PAL.ink, fg: PAL.yellow, rot: -.03, seed: 16 },
    { id: 'h.tokens', s: 'TOKENS', x: 960, y: 720, st: { f: 'any', w: 900, wd: 116 }, tw: 1480, bg: PAL.yellow, fg: PAL.ink, rot: -.02, seed: 17, big: true },
  ];
  const CUT = { x0: -60, y0: 748, x1: W + 60, y1: 700 }; // the scissors line, through the middle of TOKENS
  const cutY = x => lerp(CUT.y0, CUT.y1, inv(CUT.x0, CUT.x1, x));

  function collage(ctx, t, o = {}) {
    ctx.fillStyle = PAL.paper; ctx.fillRect(-200, -200, W + 400, H + 400);
    // faint print grid
    ctx.strokeStyle = rgba(PAL.blue, .07); ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, -200); ctx.lineTo(x, H + 200); } for (let y = 0; y <= H; y += 60) { ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); } ctx.stroke();
    for (const sc of SCRAPS()) {
      const t0 = sc.id === 'h.did' ? -.12 : T(sc.id); if (t < t0 - .06) continue;
      const k = clamp((t - t0 + .06) / .2), e = E.outX(k), sz = fitSize(ctx, sc.s, sc.st, sc.tw);
      const sc_ = lerp(sc.big ? 1.6 : 2.1, 1, e), lift = lerp(46, 12, e);
      const wob = Math.sin((t - t0) * 18) * Math.exp(-(t - t0) * 7) * .04;
      scrap(ctx, sc.s, sc.x, sc.y, { ...sc.st, s: sz }, { bg: sc.bg, fg: sc.fg, rot: sc.rot + wob + (1 - e) * .12, s: sc_, seed: sc.seed, sh: [lift * .7, lift], sha: lerp(.12, .3, e), t, mis: sc.mis ? [6, 4, PAL.blue] : sc.big ? [7, 5, PAL.pink] : null, torn: 3.5 });
    }
    // dashed cut line + scissors
    const c0 = 2.9, c1 = 4.0;
    if (t >= c0) {
      const k = seg(t, c0, c0 + .25);
      ctx.save(); ctx.setLineDash([26, 18]); ctx.lineDashOffset = -t * 60; ctx.lineWidth = 6; ctx.strokeStyle = rgba(PAL.ink, .85 * k);
      ctx.beginPath(); ctx.moveTo(CUT.x0, CUT.y0); ctx.lineTo(CUT.x1, CUT.y1); ctx.stroke(); ctx.restore();
      if (!o.noScissors && t < c1 + .05) {
        // snips on the eighth notes, advancing along the line
        const p = seg(t, 3.0, 4.0), snipPh = frac((t - 3.0) / .25), open = t < 3.0 ? .7 : .08 + .6 * Math.abs(Math.cos(snipPh * Math.PI));
        const sx = lerp(260, CUT.x1 + 60, E.ioC(p) * .85 + p * .15);
        // cut already made behind the scissors: a thin gap
        ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.ink; ctx.beginPath(); ctx.moveTo(CUT.x0, CUT.y0); ctx.lineTo(sx, cutY(sx)); ctx.stroke(); ctx.restore();
        const ang = Math.atan2(CUT.y1 - CUT.y0, CUT.x1 - CUT.x0);
        scissors(ctx, sx - 40, cutY(sx - 40), 300, open * lerp(.4, 1, seg(t, 2.9, 3.1)), ang);
      }
    }
  }

  function pinkUnder(ctx, t) {
    // what is under the page: pink flood + "in half?"
    ctx.fillStyle = PAL.pink; ctx.fillRect(-100, -100, W + 200, H + 200);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(.35 - Math.hypot(x - W / 2, y - H / 2) / 1400) * .9, { pitch: 26, color: rgba(PAL.violet, .35), angle: .4 });
    const t0 = T('h.inhalf');
    // falling tokens behind the text
    spill(ctx, t, t0, 0);
    const k = clamp((t - t0 + .03) / .22), sc = lerp(1.8, 1, E.outX(k)) * (1 + pulse(t, 8) * .015);
    const slice = E.outX(seg(t, 5.0, 5.25)) * 38; // the words get cut in half too
    ctx.save(); ctx.translate(W / 2, 800); ctx.scale(sc, sc);
    const st = { f: 'ser', s: 430 };
    const draw = () => { txt(ctx, 'in half?', 0, 0, st, { align: 'center', fill: PAL.cream, mis: [9, 7, PAL.blue], shadow: [12, 16, PAL.violet, .45] }); };
    if (slice > .5) {
      ctx.save(); ctx.beginPath(); ctx.rect(-1300, -700, 2600, 700 - 125); ctx.clip(); ctx.translate(-slice, -slice * .3); draw(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(-1300, -125, 2600, 700); ctx.clip(); ctx.translate(slice, slice * .3); draw(); ctx.restore();
    } else draw();
    ctx.restore();
    spill(ctx, t, t0, 1);
    // the weekly token meter, cut in half
    const mx = 460, my = 930, mw = 1000, mh = 56, cutT = t0 + .12, dt2 = t - cutT;
    txt(ctx, 'WEEKLY TOKENS', mx, my - 18, { f: 'mono', s: 28, w: 800 }, { fill: PAL.cream });
    rr(ctx, mx, my, mw, mh, 28); ctx.fillStyle = rgba(PAL.violet, .45); ctx.fill();
    ctx.save(); rr(ctx, mx, my, mw, mh, 28); ctx.clip(); ctx.fillStyle = PAL.yellow; ctx.fillRect(mx, my, mw / 2, mh); ctx.restore();
    if (dt2 < 1.6) { // the right half falls away
      const fy = dt2 > 0 ? dt2 * dt2 * 1400 : 0, fr = dt2 > 0 ? dt2 * 1.2 : 0;
      ctx.save(); ctx.translate(mx + mw * .75, my + mh / 2 + fy); ctx.rotate(fr); rr(ctx, -mw / 4, -mh / 2, mw / 2, mh, 10); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore();
    }
    rr(ctx, mx, my, mw, mh, 28); ctx.lineWidth = 5; ctx.strokeStyle = PAL.ink; ctx.stroke();
    ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = 4; ctx.strokeStyle = PAL.ink; ctx.beginPath(); ctx.moveTo(mx + mw / 2, my - 16); ctx.lineTo(mx + mw / 2, my + mh + 16); ctx.stroke(); ctx.restore();
    const pk = popIn(t, cutT + .2); ctx.save(); ctx.translate(mx + mw + 90, my + 44); ctx.scale(pk, pk); txt(ctx, '50%', 0, 0, { f: 'any', s: 64, w: 900, wd: 70 }, { align: 'center', fill: PAL.cream, shadow: [4, 5, PAL.violet, .5] }); ctx.restore();
    // small print
    txt(ctx, '−50%', 180, 190, { f: 'mono', s: 44, w: 700 }, { fill: PAL.cream, alpha: seg(t, 4.5, 4.7) });
    txt(ctx, 'EXHIBIT A', W - 180, 190, { f: 'mono', s: 34, w: 700 }, { align: 'right', fill: rgba(PAL.ink, .8), alpha: seg(t, 4.75, 4.95) });
  }
  function spill(ctx, t, t0, layer) {
    const dt = t - t0; if (dt < 0) return;
    if (layer === 0) for (let i = 0; i < 14; i++) { const x = hash(i + 700) * W, y = -80 + ((dt * (160 + hash(i + 701) * 140) + hash(i + 702) * 300) % 1250); tokenChip(ctx, x, y, 22 + hash(i + 703) * 16, dt * (hash(i + 704) - .5) * 4, { sx: Math.cos(dt * 3 + i), shadow: false }); }
    for (let i = 0; i < 26; i++) {
      if ((hash(i + 900) < .7 ? 0 : 1) !== layer) continue;
      const side = hash(i + 1) < .5 ? -1 : 1, x0 = W / 2 + side * lerp(560, 900, hash(i + 11)), y0 = cutY(x0), vx = side * (150 + hash(i + 2) * 700), vy = -400 - hash(i + 3) * 1000, g = 2600;
      const x = x0 + vx * dt, y = y0 + vy * dt + .5 * g * dt * dt; if (y > H + 100) continue;
      tokenChip(ctx, x, y, 26 + hash(i + 4) * 26, dt * (hash(i + 5) - .5) * 12, { face: hash(i + 6) < .35, sx: Math.cos(dt * 6 + i) });
    }
  }

  function hookFrame(ctx, t) {
    const tc = T('h.inhalf');
    // camera push + beat shakes
    const slams = ['h.did', 'h.openai', 'h.just', 'h.cut', 'h.your', 'h.proplan', 'h.tokens'].map(T).filter(s => s <= t);
    const last = slams.length ? slams[slams.length - 1] : -9;
    const [shx, shy] = shake(t, last === T('h.tokens') ? 22 : 9, last, 9, 3);
    const FOC = [['h.did', 330, 215, 2.1, -.03], ['h.openai', 830, 200, 1.9, .02], ['h.just', 1330, 220, 2.0, -.02], ['h.cut', 1640, 205, 2.2, .04], ['h.your', 560, 420, 1.75, .02], ['h.proplan', 1180, 430, 1.55, -.02], ['h.tokens', 960, 540, 1.0, 0]];
    let cx = FOC[0][1], cy = FOC[0][2], cz = FOC[0][3], cr = FOC[0][4];
    for (let i = 1; i < FOC.length; i++) {
      const [id, x, y, z, r] = FOC[i], a = T(id) - .07, k = E.outX(seg(t, a, a + (id === 'h.tokens' ? .3 : .16)));
      cx = lerp(cx, x, k); cy = lerp(cy, y, k); cz = lerp(cz, z, k); cr = lerp(cr, r, k);
    }
    cz *= 1 + seg(t, 3.0, 3.95) * .06 + pulse(t, 10) * .012;
    const cam = { x: cx + shx, y: cy + shy, z: cz, r: cr };
    if (t < tc) {
      ctx.save(); camApply(ctx, cam); collage(ctx, t); ctx.restore();
      if (t < 3.8) regMarks(ctx, PAL.pink, .55);
      return;
    }
    // after the cut: pink under, page halves fly apart
    const [sx2, sy2] = shake(t, 28, tc, 7, 5);
    ctx.save(); const pz = 1 + E.sm(seg(t, tc, tc + 2)) * .06; ctx.translate(W / 2 + sx2, H / 2 + sy2); ctx.scale(pz, pz); ctx.translate(-W / 2, -H / 2); pinkUnder(ctx, t); ctx.restore();
    const page = buf('hookPage'), px = page.getContext('2d');
    px.setTransform(1, 0, 0, 1, 0, 0); camApply(px, { x: W / 2, y: H / 2, z: 1.0 }); collage(px, tc - .001, { noScissors: true });
    const dt = t - tc;
    const topY = -E.outX(clamp(dt / .35)) * 430 - Math.max(0, dt - .9) * 1400, topR = -E.outC(clamp(dt / .5)) * .05;
    const botY = 150 * E.outX(clamp(dt / .2)) + Math.max(0, dt - .1) ** 2 * 3600, botR = E.inQ(clamp(dt / 1.2)) * .25 + .02 * E.outC(clamp(dt / .25));
    const half = (top, dy, r) => {
      ctx.save(); ctx.translate(W / 2 + sx2, cutY(W / 2) + dy + sy2); ctx.rotate(r); ctx.translate(-W / 2, -cutY(W / 2));
      // shadow of the half
      ctx.save(); ctx.beginPath(); if (top) { ctx.moveTo(-400, -1400); ctx.lineTo(W + 400, -1400); ctx.lineTo(CUT.x1 + 400, cutY(W + 400)); ctx.lineTo(CUT.x0 - 400, cutY(-400)); } else { ctx.moveTo(-400, H + 1400); ctx.lineTo(W + 400, H + 1400); ctx.lineTo(W + 400, cutY(W + 400)); ctx.lineTo(-400, cutY(-400)); }
      ctx.closePath(); ctx.translate(18, 26); ctx.fillStyle = rgba(PAL.ink, .3); ctx.fill(); ctx.restore();
      ctx.beginPath(); if (top) { ctx.moveTo(-400, -1400); ctx.lineTo(W + 400, -1400); ctx.lineTo(W + 400, cutY(W + 400)); ctx.lineTo(-400, cutY(-400)); } else { ctx.moveTo(-400, H + 1400); ctx.lineTo(W + 400, H + 1400); ctx.lineTo(W + 400, cutY(W + 400)); ctx.lineTo(-400, cutY(-400)); }
      ctx.closePath(); ctx.clip();
      ctx.fillStyle = PAL.paper; ctx.fillRect(-400, -1400, W + 800, H + 2800);
      ctx.drawImage(page, 0, 0);
      ctx.restore();
    };
    if (dt < 2.2) { half(false, botY, botR); half(true, topY, topR); }
  }

  scene('hook', 0, 8, (ctx, t) => {
    const w0 = 6.0, w1 = 7.8;
    if (t < w0) return hookFrame(ctx, t);
    const A = buf('hookA'), ax = A.getContext('2d'); ax.setTransform(1, 0, 0, 1, 0, 0); hookFrame(ax, t);
    const B = sceneTo('debut', t, 'hookB');
    zipWipe(ctx, A, B, seg(t, w0, w1), { y: 560, s: 110 });
  });
})();
