// s02_debut.js (8–16 s): Zip drops onto the stage mark. "We can make your subscription last at least 20% longer." Zip pulls LONGER.
// Downbeat 12: pink set, "with no DOWNSIDE" (letters sag, struck out). 14: first zip-it point move in close-up, whip down.
'use strict';
(() => {
  const ZX = 1540, ZY = 890, ZS = 195;
  function stage(ctx, t, bg, disc) {
    ctx.fillStyle = bg; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.save(); ctx.beginPath(); ctx.arc(ZX, 600, 420, 0, TAU); ctx.clip();
    sunburst(ctx, ZX, 600, 22, 440, t * .15, disc, mix(disc, PAL.cream, .45));
    ctx.restore();
    halftone(ctx, ZX - 560, 40, ZX + 560, 1160, (x, y) => { const d = Math.hypot(x - ZX, y - 600); return d > 420 ? clamp(1 - (d - 420) / 140) * .9 : 0; }, { pitch: 20, color: disc, angle: .3 });
    ctx.fillStyle = mix(bg, PAL.ink, .1); ctx.fillRect(-200, ZY - 6, W + 400, 400);
    ctx.fillStyle = rgba(PAL.ink, .12); ctx.fillRect(-200, ZY - 6, W + 400, 10);
    ctx.save(); ctx.translate(ZX, ZY + 34); ctx.scale(1, .35); ctx.fillStyle = PAL.pink; ctx.rotate(.7); ctx.fillRect(-80, -10, 160, 20); ctx.rotate(-1.4); ctx.fillRect(-80, -10, 160, 20); ctx.restore();
  }
  function zipPose(t) {
    const t0 = T('z.debut');
    const o = { t, seed: 3 };
    if (t < t0) { // falling in
      const k = seg(t, t0 - .45, t0); o.dy = -lerp(9, 0, E.inQ(k)); o.sq = -.12; o.eyes = 'closed'; o.aL = 2.8; o.aR = 2.8; o.shadow = k > .1;
      return o;
    }
    const dt = t - t0;
    o.sq = Math.exp(-dt * 7) * Math.cos(dt * 30) * .22; o.dy = -pulse(t, 7) * .06;
    o.eyes = 'open'; o.mouth = 0; o.slider = 1;
    o.aL = .5; o.aR = kf(dt, [[0, 2.6], [.4, .6, E.outQ]]);
    if (t > T('z.subscription') - .1 && t < T('z.20')) { o.aL = kf(t, [[T('z.subscription') - .1, .5], [T('z.subscription') + .15, 1.75, E.back]]); o.look = [-.9, -.2]; }
    if (t >= T('z.20') && t < T('z.with')) {
      o.look = [-.8, 0];
      o.eyes = t > T('z.longer') + .3 ? 'happy' : 'determined'; o.brow = t > T('z.longer') + .3 ? null : 'angry';
      o.mouth = t > T('z.longer') + .3 ? .5 : 0; o.slider = .25;
    }
    if (t >= T('z.with')) {
      const d2 = t - T('z.with');
      o.look = [-.5, 0]; o.eyes = 'open'; o.aL = .6; o.aR = .6;
      o.sq = Math.exp(-d2 * 7) * Math.cos(d2 * 30) * .12;
      if (t >= T('z.no')) { const d3 = t - T('z.no'); o.eyes = 'happy'; o.aL = kf(d3, [[0, .6], [.15, 2.5, E.back]]); o.aR = o.aL; o.dy = -Math.max(0, Math.sin(d3 * TAU)) * .25 * Math.exp(-d3 * 2); o.mouth = .6; o.slider = .2; }
    }
    return o;
  }
  function wordsA(ctx, t) { // 8–12
    const x = 120;
    const a = T('z.wecan'), b = T('z.subscription'), c = T('z.last'), d = T('z.20'), e = T('z.longer');
    if (t > a - .06) txt(ctx, 'WE CAN MAKE YOUR', x, 250, { f: 'any', w: 900, wd: 92, s: 84 }, { fill: PAL.ink, alpha: seg(t, a - .06, a + .05) });
    if (t > b - .06) {
      const st = { f: 'any', w: 900, wd: 64 }, s = fitSize(ctx, 'SUBSCRIPTION', st, 1120);
      letters(ctx, 'SUBSCRIPTION', x, 445, { ...st, s }, (i, n) => { const k = clamp((t - b + .06 - i * .025) / .2); return { dy: (1 - E.back(k, 2)) * 60, a: k > 0 ? 1 : 0, s: lerp(.6, 1, E.back(k)) }; }, { fill: PAL.ink, mis: [6, 5, PAL.pink] });
    }
    if (t > c - .06) txt(ctx, 'LAST AT LEAST', x, 580, { f: 'any', w: 900, wd: 92, s: 104 }, { fill: PAL.ink, alpha: seg(t, c - .06, c + .05) });
    let hand = null;
    if (t > d - .06) {
      const k = E.outX(seg(t, d - .03, d + .4)), sc = lerp(1.6, 1, E.outX(seg(t, d - .06, d + .15)));
      ctx.save(); ctx.translate(x, 810); ctx.scale(sc, sc);
      txt(ctx, Math.round(k * 20) + '%', 0, 0, { f: 'any', w: 900, wd: 70, s: 250 }, { fill: PAL.pink, mis: [7, 6, PAL.blue], shadow: [8, 10, PAL.ink, .2] });
      ctx.restore();
      // LONGER, pulled by Zip (its stretched width stops short of Zip)
      const pull = t < e ? 0 : clamp(spring(t - e, 1.6, .38));
      const lx = x + 470, sMax = fitSize(ctx, 'LONGER', { f: 'any', w: 900, wd: 150 }, ZX - ZS * 1.55 - lx);
      const st = { f: 'any', w: 900, wd: lerp(50, 150, pull), s: Math.min(170, sMax) };
      const w_ = tw(ctx, 'LONGER', st);
      if (t > e - .5) {
        txt(ctx, 'LONGER', lx, 810, st, { fill: PAL.ink, alpha: seg(t, e - .5, e - .35), shadow: [6, 8, PAL.ink, .15] });
        hand = [lx + w_ + 22, 760];
        if (t > e + .25) { // dimension line
          const a2 = seg(t, e + .25, e + .45), y = 870, x0 = lx, x1 = lx + w_;
          ctx.save(); ctx.globalAlpha = a2; ctx.strokeStyle = PAL.blue; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(x0, y - 16); ctx.lineTo(x0, y + 16); ctx.moveTo(x1, y - 16); ctx.lineTo(x1, y + 16); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
          [[x0, 1], [x1, -1]].forEach(([ax, s_]) => { ctx.beginPath(); ctx.moveTo(ax, y); ctx.lineTo(ax + s_ * 18, y - 9); ctx.lineTo(ax + s_ * 18, y + 9); ctx.closePath(); ctx.fillStyle = PAL.blue; ctx.fill(); });
          ctx.fillStyle = PAL.paper; ctx.fillRect((x0 + x1) / 2 - 90, y - 22, 180, 44);
          txt(ctx, '× 1.2+', (x0 + x1) / 2, y + 13, { f: 'mono', s: 36, w: 700 }, { align: 'center', fill: PAL.blue });
          ctx.restore();
        }
      }
    }
    return hand;
  }
  function wordsB(ctx, t) { // 12–14 on pink
    const a = T('z.with'), b = T('z.downside'), c = T('z.no'), x = 130;
    if (t > a - .06) { const k = popIn(t, a); ctx.save(); ctx.translate(x, 340); ctx.scale(k, k); txt(ctx, 'WITH NO', 0, 0, { f: 'any', w: 900, wd: 100, s: 170 }, { fill: PAL.cream, shadow: [7, 9, PAL.violet, .4] }); ctx.restore(); }
    if (t > b - .06) {
      const st = { f: 'any', w: 900, wd: 118 }, sz = fitSize(ctx, 'DOWNSIDE', st, 1080), w_ = tw(ctx, 'DOWNSIDE', { ...st, s: sz });
      const k = slamIn(t, b);
      ctx.save(); ctx.translate(x + w_ / 2, 600); ctx.scale(k, k); ctx.translate(-w_ / 2, 0);
      letters(ctx, 'DOWNSIDE', 0, sz * .36, { ...st, s: sz }, (i) => { const sag = E.outC(seg(t, b + .15 + i * .03, b + .5 + i * .03)); return { dy: sag * (18 + i * 7), r: sag * (hash(i + 40) - .5) * .35 }; }, { fill: PAL.ink, mis: [-6, 5, PAL.blue] });
      ctx.restore();
      if (t > c - .03) { const pr = E.outC(seg(t, c - .03, c + .18)); ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = PAL.cream; ctx.lineWidth = 28; ctx.beginPath(); ctx.moveTo(x - 30, 600); ctx.lineTo(lerp(x - 30, x + w_ + 40, pr), 600 + pr * 40); ctx.stroke(); ctx.restore(); }
    }
  }
  function nameTag(ctx, t) {
    const t0 = T('z.debut') + .2; if (t < t0) return;
    const k = popIn(t, t0, .3), x = ZX - 60, y = 320 + Math.sin(t * 2.5) * 6;
    ctx.save(); ctx.translate(x, y); ctx.rotate(.06); ctx.scale(k * 1.35, k * 1.35);
    rr(ctx, -12, -54, 300, 76, 38); ctx.fillStyle = rgba(PAL.ink, .25); ctx.save(); ctx.translate(6, 8); ctx.fill(); ctx.restore();
    rr(ctx, -12, -54, 300, 76, 38); ctx.fillStyle = PAL.pink; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.ink; ctx.stroke();
    txt(ctx, 'ZIP', 28, 2, { f: 'any', w: 900, wd: 70, s: 58 }, { fill: PAL.cream });
    txt(ctx, 'the compressor', 112, -8, { f: 'mono', s: 17, w: 700 }, { fill: PAL.cream });
    txt(ctx, 'debut 2026', 112, 12, { f: 'mono', s: 17, w: 500 }, { fill: rgba(PAL.cream, .85) });
    ctx.restore();
  }
  function closeup(ctx, t) { // 14–16: zip-it point move in close-up
    const t0 = T('z.zipmove'), dt = t - t0;
    stage(ctx, t, PAL.pink, PAL.yellow);
    const push = E.outX(clamp(dt / .35));
    const s = lerp(ZS, 460, push), x = lerp(ZX, W / 2 + 200, push), y = lerp(ZY, 60 + 2.28 * 460, push);
    const k = E.ioC(seg(t, t0 + .25, t0 + .8));
    const o = { t, seed: 3, eyes: k > .95 ? 'wink' : 'open', look: [0, 0], mouth: .75 * (1 - k), slider: lerp(0, 1, k),
      hR: [lerp(-.46, .46, k), .66], cR: [lerp(.35, .85, k), 1.05], pull: .2, aL: .5, blush: 1 + (k > .95 ? .3 : 0) };
    zipChar(ctx, x, y, s, o);
    if (k > .95) sparkles(ctx, x + s * .5, y - s * 1.2, s * 1.1, t, 7, 21);
    if (dt > .8) { const kk = popIn(t, t0 + .8); ctx.save(); ctx.translate(400, 330); ctx.rotate(-.08); ctx.scale(kk, kk); txt(ctx, 'zip it.', 0, 0, { f: 'ser', s: 230 }, { align: 'center', fill: PAL.cream, shadow: [8, 11, PAL.violet, .45] }); ctx.restore(); }
  }
  function debutFrame(ctx, t) {
    if (t >= T('z.zipmove')) return closeup(ctx, t);
    const pinkSet = t >= T('z.with');
    stage(ctx, t, pinkSet ? PAL.pink : PAL.paper, PAL.yellow);
    let hand = null;
    if (!pinkSet) hand = wordsA(ctx, t); else wordsB(ctx, t);
    const o = zipPose(t);
    if (hand && t >= T('z.20') && t < T('z.with')) {
      const reach = E.back(seg(t, T('z.longer') - .45, T('z.longer') - .15), 1.2);
      const hx = lerp(ZX - ZS * 1.2, hand[0], reach), hy = lerp(ZY - ZS * .8, hand[1], reach);
      o.hL = [(hx - ZX) / ZS, (hy - ZY) / ZS + 1.05]; o.cL = [(lerp(hx, ZX - ZS, .5) - ZX) / ZS, (hy - ZY) / ZS + 1.05 + .45];
    }
    zipChar(ctx, ZX, ZY, ZS, o);
    if (t > T('z.debut') && t < T('z.debut') + 1.2) sparkles(ctx, ZX, ZY - ZS * 1.1, ZS * 1.6, t, 8, 5);
    nameTag(ctx, t);
    const dl = t - T('z.debut'); if (dl > 0 && dl < .5) { for (let i = 0; i < 6; i++) { const s_ = i % 2 ? 1 : -1, r = 18 + i * 4, k = dl / .5; ctx.beginPath(); ctx.arc(ZX + s_ * (ZS * .9 + k * 120 + i * 12), ZY - 10 - k * 30 * (i % 3), r * (1 - k), 0, TAU); ctx.fillStyle = rgba(PAL.cream, .9); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(PAL.ink, .6); ctx.stroke(); } }
  }
  scene('debut', 8, 16, (ctx, t) => {
    const w0 = 15.25, w1 = 16.0;
    if (t < w0) return debutFrame(ctx, t);
    const A = buf('debA'), ax = A.getContext('2d'); ax.setTransform(1, 0, 0, 1, 0, 0); debutFrame(ax, t);
    const B = sceneTo('dead', t, 'debB'), k = seg(t, w0, w1);
    pushWipe(ctx, A, B, k, [0, -1]);
    smear(ctx, 0, -Math.sin(k * Math.PI) * 120, 5);
  });
})();
