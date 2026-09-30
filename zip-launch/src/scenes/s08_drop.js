// s08_drop.js (68–90 s): the launch build, the ZIP α drop, the value lines, the end card.
'use strict';
(() => {
  // ---------- helpers ----------
  function logo(ctx, x, y, s, t, o = {}) { // "ZIP α" lockup with a zipper through the wordmark
    const st = { f: 'any', w: 900, wd: 58, s };
    setFont(ctx, st); const wZ = ctx.measureText('ZIP').width, wa = tw(ctx, 'α', { f: 'ser', s: s * .9 }), gap = s * .08, total = wZ + gap + wa;
    ctx.save(); ctx.translate(x - total / 2, y);
    const split = o.split ?? 1, cut = -s * .36; // y of the zipper through the letters (relative to baseline)
    const draw = (col) => { for (let d = Math.round(s * .05); d >= 1; d -= 2) txt(ctx, 'ZIP', d, d, st, { fill: PAL.ink }); txt(ctx, 'ZIP', 0, 0, st, { fill: col }); };
    const off = s * .07 * split;
    ctx.save(); ctx.beginPath(); ctx.rect(-50, -s * 1.2, wZ + 100, s * 1.2 + cut); ctx.clip(); ctx.translate(0, -off); draw(o.col || PAL.cream); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(-50, cut, wZ + 100, s); ctx.clip(); ctx.translate(0, off); draw(o.col || PAL.cream); ctx.restore();
    if (split > .05) { const yy = cut; zipperTeeth(ctx, -10, wZ + 10, () => yy - off * .2, -1, { th: s * .07, pitch: s * .1 }); zipperTeeth(ctx, -10, wZ + 10, () => yy + off * .2, 1, { th: s * .07, pitch: s * .1 }); zipSlider(ctx, wZ + s * .02, yy, s * .09, -.3 + Math.sin(t * 5) * .15); }
    txt(ctx, 'α', wZ + gap + wa / 2, 0, { f: 'ser', s: s * .9 }, { align: 'center', fill: o.acol || PAL.yellow, stroke: [s * .025, PAL.ink], shadow: [s * .03, s * .04, PAL.ink, .5] });
    ctx.restore();
  }
  function bill(ctx, x, y, w, rot, fl = 1) {
    const h = w * .45; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(fl, 1);
    ctx.fillStyle = rgba(PAL.ink, .25); ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
    ctx.fillStyle = PAL.cream; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 3; ctx.strokeStyle = PAL.green; ctx.strokeRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
    ctx.beginPath(); ctx.ellipse(0, 0, h * .38, h * .34, 0, 0, TAU); ctx.fillStyle = PAL.green; ctx.fill();
    txt(ctx, 'Z', 0, h * .15, { f: 'any', w: 900, wd: 60, s: h * .45 }, { align: 'center', fill: PAL.cream });
    txt(ctx, '$', -w / 2 + 14, -h / 2 + h * .32, { f: 'mono', s: h * .26, w: 800 }, { fill: PAL.green });
    ctx.lineWidth = 2; ctx.strokeStyle = PAL.ink; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore();
  }
  function cashStack(ctx, x, yBase, w, n, o = {}) { // n bundles, side view
    const bh = 36;
    for (let i = 0; i < n; i++) {
      const y = yBase - (i + 1) * bh, jx = (hash(i + 70) - .5) * 14;
      ctx.fillStyle = rgba(PAL.ink, .2); ctx.fillRect(x - w / 2 + jx + 8, y + 8, w, bh - 2);
      ctx.fillStyle = mix(PAL.green, PAL.cream, .55); ctx.fillRect(x - w / 2 + jx, y, w, bh - 2);
      ctx.fillStyle = PAL.green; for (let k = 0; k < 4; k++) ctx.fillRect(x - w / 2 + jx, y + 6 + k * 7, w, 2);
      ctx.fillStyle = PAL.yellow; ctx.fillRect(x - 22 + jx, y, 44, bh - 2);
      ctx.lineWidth = 2.5; ctx.strokeStyle = PAL.ink; ctx.strokeRect(x - w / 2 + jx, y, w, bh - 2);
    }
    return yBase - n * bh;
  }
  function unicorn(ctx, x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const ink = PAL.ink, bob = Math.sin(t * 6) * 4 * (o.bob ?? 1);
    const P = (pts, fill, lw = 5) => piece(ctx, pts, { fill, ink, lw, sh: [8, 10], sha: .2 });
    // tail
    ctx.beginPath(); ctx.moveTo(-150, -190 + bob); ctx.bezierCurveTo(-240, -200, -250, -90, -200, -60); ctx.bezierCurveTo(-220, -120, -190, -150, -150, -160); ctx.closePath(); ctx.fillStyle = PAL.pink; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = ink; ctx.stroke();
    // legs
    [[-110, 0], [-60, 0], [60, 0], [110, 0]].forEach(([lx], i) => { const sw = Math.sin(t * 8 + i) * 4 * (o.walk ?? 0); P([[lx - 18 + sw, -120], [lx + 18 + sw, -120], [lx + 16 + sw, 0], [lx - 16 + sw, 0]], i % 2 ? PAL.cream : mix(PAL.cream, PAL.grey, .3)); ctx.fillStyle = PAL.violet; ctx.fillRect(lx - 16 + sw, -18, 32, 18); });
    // body
    ctx.save(); ctx.translate(0, bob); rr(ctx, -170, -250, 330, 150, 75); ctx.save(); ctx.translate(8, 10); ctx.fillStyle = rgba(ink, .2); ctx.fill(); ctx.restore(); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = ink; ctx.stroke();
    txt(ctx, '$', -20, -150, { f: 'any', w: 900, wd: 60, s: 80 }, { align: 'center', fill: PAL.pink });
    // neck + head
    P([[90, -230], [160, -330], [215, -300], [160, -200]], PAL.cream);
    ctx.save(); ctx.translate(205, -335); ctx.rotate(.25); rr(ctx, -55, -45, 140, 95, 45); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = ink; ctx.stroke(); ctx.restore();
    // horn
    P([[175, -390], [205, -392], [205, -500]], PAL.yellow, 4);
    ctx.beginPath(); for (let i = 1; i < 4; i++) { ctx.moveTo(178 + i * 6, -390 - i * 26); ctx.lineTo(204, -396 - i * 24); } ctx.lineWidth = 3; ctx.stroke();
    // mane
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(150 - i * 22, -370 + i * 34, 30, 0, TAU); ctx.fillStyle = i % 2 ? PAL.pink : PAL.blueLt; ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
    // face
    const ex = 240, ey = -345;
    if (o.heart) heart(ctx, ex, ey, 20, PAL.pink, ink, 3);
    else { ctx.beginPath(); ctx.ellipse(ex, ey, 11, 15, 0, 0, TAU); ctx.fillStyle = ink; ctx.fill(); ctx.fillStyle = PAL.cream; ctx.beginPath(); ctx.arc(ex + 4, ey - 5, 4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(ex - 8, ey - 14); ctx.lineTo(ex - 16, ey - 24); ctx.moveTo(ex, ey - 16); ctx.lineTo(ex - 2, ey - 28); ctx.lineWidth = 3; ctx.stroke(); }
    halftone(ctx, 245, -325, 290, -300, () => .8, { pitch: 8, color: PAL.pink });
    ctx.beginPath(); ctx.arc(290, -318, 5, 0, TAU); ctx.fillStyle = ink; ctx.fill();
    ctx.restore(); ctx.restore();
  }
  const cam = (ctx, t, ids, base = 1) => { let z = base; ids.forEach(id => { const d = t - T(id); if (d >= 0) z += Math.exp(-d * 9) * .035; }); camApply(ctx, { x: W / 2, y: H / 2, z }); };

  // ---------- launch build 68–72 ----------
  function launch(ctx, t) {
    const a = T('l.today'), b = T('l.launching'), c = T('l.first'), d = T('l.model'), g = T('l.gap');
    if (t >= g) { // the silent half beat: a zipper closes across a blank page
      ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
      const p = E.inQ(seg(t, g, 72)), sx = lerp(-100, W + 120, p);
      zipperTeeth(ctx, -40, W + 40, () => H / 2, -1, { th: 40, pitch: 64 }); zipperTeeth(ctx, -40, W + 40, () => H / 2, 1, { th: 40, pitch: 64 });
      zipSlider(ctx, sx, H / 2, 100, -.4 + p * .5);
      return;
    }
    const cols = [PAL.night, PAL.night, PAL.night, PAL.night, PAL.blue, PAL.violet, PAL.pink];
    const bi = Math.floor((t - 68) / .5); ctx.fillStyle = cols[clamp(bi, 0, cols.length - 1)]; ctx.fillRect(-100, -100, W + 200, H + 200);
    const build = seg(t, 68, 71.5);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(build * 1.1 - Math.hypot(x - W / 2, y - H / 2) / 1400) * .55, { pitch: 30, color: rgba(PAL.cream, .25) });
    const [sx, sy] = [noise1(t * 30, 1) * build * 14, noise1(t * 30, 2) * build * 14];
    ctx.save(); camApply(ctx, { x: W / 2 + sx, y: H / 2 + sy, z: 1 + build * .14 });
    if (t < c) {
      const k = slamIn(t, a); ctx.save(); ctx.translate(W / 2, 560); ctx.scale(k, k);
      txt(ctx, 'TODAY', 0, 0, { f: 'any', w: 900, wd: lerp(60, 150, E.outC(seg(t, a, a + 1.2))), s: 330 }, { align: 'center', fill: PAL.cream, mis: [10, 8, PAL.pink] }); ctx.restore();
      if (t > b - .06) { const k2 = popIn(t, b); ctx.save(); ctx.translate(W / 2, 800); ctx.scale(k2, k2); txt(ctx, 'WE ARE LAUNCHING', 0, 0, { f: 'any', w: 900, wd: 110, s: 110 }, { align: 'center', fill: PAL.yellow }); ctx.restore(); }
    } else {
      const k = popIn(t, c); ctx.save(); ctx.translate(W / 2, 340); ctx.scale(k, k); txt(ctx, 'OUR FIRST', 0, 0, { f: 'any', w: 900, wd: 110, s: 130 }, { align: 'center', fill: PAL.cream }); ctx.restore();
      if (t > d - .06) {
        const st = { f: 'any', w: 900, wd: 72 }, sz = fitSize(ctx, 'TOKEN COMPRESSION MODEL:', st, 1480);
        letters(ctx, 'TOKEN COMPRESSION MODEL:', W / 2, 640, { ...st, s: sz }, (i) => { const kk = clamp((t - d + .06 - i * .02) / .15); return { a: kk > 0 ? 1 : 0, dy: (1 - E.back(kk, 2)) * 70 }; }, { align: 'center', fill: PAL.cream, mis: [7, 6, PAL.pink] });
      }
      // what is coming: a blinking "???"-sized placeholder box
      const bk = seg(t, d + .4, d + .6); if (bk > 0) { ctx.save(); ctx.globalAlpha = bk; ctx.setLineDash([20, 14]); ctx.lineWidth = 8; ctx.strokeStyle = frac(t * 4) < .5 ? PAL.yellow : PAL.cream; rr(ctx, W / 2 - 300, 740, 600, 170, 20); ctx.stroke(); txt(ctx, 'loading…', W / 2, 850, { f: 'mono', s: 56, w: 800 }, { align: 'center', fill: PAL.cream }); ctx.restore(); }
    }
    ctx.restore();
  }

  // ---------- the drop 72–74 ----------
  function dropLogo(ctx, t) {
    const t0 = T('d.zipalpha'), dt = t - t0;
    const bgs = [PAL.pink, PAL.blue], bg = bgs[Math.floor(dt / .5) % 2];
    ctx.fillStyle = bg; ctx.fillRect(-100, -100, W + 200, H + 200);
    ctx.save(); ctx.globalAlpha = .45; sunburst(ctx, W / 2, 560, 30, 1500, t * .5, bg, bg === PAL.pink ? PAL.yellow : PAL.violet); ctx.restore();
    const [sx, sy] = shake(t, 30, t0, 6, 21);
    ctx.save(); camApply(ctx, { x: W / 2 + sx, y: H / 2 + sy, z: 1 + Math.exp(-dt * 5) * .25 + pulse(t, 8) * .02 });
    // confetti tokens
    for (let i = 0; i < 30; i++) { const x = hash(i + 200) * W, y = -100 + ((dt * (300 + hash(i + 201) * 500) + hash(i + 202) * 1200) % 1300); tokenChip(ctx, x, y, 22 + hash(i + 203) * 20, dt * 4 * (hash(i) - .5), { sx: Math.cos(dt * 5 + i) }); }
    const k = E.back(seg(t, t0 - .03, t0 + .25), 2);
    ctx.save(); ctx.translate(W / 2, 560); ctx.scale(k, k); logo(ctx, 0, 110, 420, t, { split: 1 - E.ioC(seg(t, t0 + .5, t0 + .9)) * .8 }); ctx.restore();
    zipChar(ctx, W / 2 + 700, 1020, 140, { t, eyes: 'star', mouth: .7, slider: .1, aL: 2.7, aR: 2.7, dy: -pulse(t, 6) * .3, seed: 14 });
    zipChar(ctx, W / 2 - 700, 1020, 140, { t, flip: true, eyes: 'star', mouth: .7, slider: .1, aL: 2.7, aR: 2.7, dy: -pulse(t, 6, .25) * .3, seed: 15 });
    txt(ctx, 'TOKEN COMPRESSION MODEL  ·  DEBUT', W / 2, 230, { f: 'mono', s: 40, w: 800 }, { align: 'center', fill: PAL.cream, alpha: seg(t, t0 + .3, t0 + .5) });
    ctx.restore();
    flash(ctx, Math.exp(-dt * 12) * .8, PAL.cream);
  }
  function grid(ctx, t) { // 73–74: K-pop member grid
    const t0 = 73, cols = [PAL.pink, PAL.yellow, PAL.blue, PAL.yellow, PAL.cream, PAL.pink, PAL.blue, PAL.pink, PAL.yellow];
    ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, W, H);
    const cw = W / 3, ch = H / 3;
    for (let i = 0; i < 9; i++) {
      const c = i % 3, r = Math.floor(i / 3), k = E.back(seg(t, t0 + i * .03 - .03, t0 + i * .03 + .15), 1.5); if (k <= 0) continue;
      ctx.save(); ctx.beginPath(); ctx.rect(c * cw + 4, r * ch + 4, cw - 8, ch - 8); ctx.clip();
      ctx.translate(c * cw + cw / 2, r * ch + ch / 2); ctx.scale(k, k); ctx.translate(-cw / 2, -ch / 2);
      ctx.fillStyle = cols[i]; ctx.fillRect(0, 0, cw, ch);
      if (i === 4) { logo(ctx, cw / 2, ch / 2 + 70, 190, t, { col: PAL.blue, split: .3 }); }
      else {
        const beatUp = Math.floor((t - t0) / .25) % 2 === (i % 2);
        zipChar(ctx, cw / 2, ch - 30, 95, { t: t + i * .1, col: cols[i] === PAL.blue ? PAL.pink : PAL.blue, eyes: i % 3 === 0 ? 'wink' : 'open', aL: beatUp ? 2.7 : .5, aR: beatUp ? .5 : 2.7, dy: beatUp ? -.2 : 0, flip: i % 2 === 1, seed: 20 + i, mouth: beatUp ? .5 : 0, slider: .3 });
      }
      ctx.restore();
    }
  }
  // ---------- 74–76 miles ahead ----------
  function miles(ctx, t) {
    const a = T('d.miles'), b = T('d.competitor');
    ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
    const scroll = (t - a) * 1400;
    // road
    ctx.fillStyle = mix(PAL.paper, PAL.ink, .12); ctx.fillRect(0, 770, W, 220);
    ctx.fillStyle = PAL.cream; for (let x = -((scroll) % 240); x < W; x += 240) ctx.fillRect(x, 870, 130, 16);
    // mile markers
    for (let m = 0; m < 6; m++) { const x = W - ((scroll * .9 + m * 520) % 3120); if (x < -200 || x > W + 200) continue; piece(ctx, [[x - 8, 560], [x + 8, 560], [x + 8, 770], [x - 8, 770]], { fill: PAL.ink, shadow: false }); piece(ctx, [[x - 70, 500], [x + 70, 500], [x + 70, 580], [x - 70, 580]], { fill: PAL.blue, ink: PAL.ink, lw: 4 }); txt(ctx, 'MILE ' + (99 - m), x, 552, { f: 'mono', s: 28, w: 800 }, { align: 'center', fill: PAL.cream }); }
    // the pack, far behind
    for (let i = 0; i < 5; i++) { const px = 90 + i * 34, py = 900 + Math.abs(Math.sin(t * 9 + i)) * -8; ctx.beginPath(); ctx.ellipse(px, py - 22, 20, 24, 0, 0, TAU); ctx.fillStyle = PAL.grey; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.stroke(); }
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(260 + i * 18, 905 - (i % 2) * 8, 12 - i, 0, TAU); ctx.fillStyle = rgba(PAL.cream, .8); ctx.fill(); }
    txt(ctx, 'everyone else', 180, 980, { f: 'mono', s: 26, w: 700 }, { align: 'center', fill: PAL.ink });
    // distance arrow
    ctx.strokeStyle = PAL.pink; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(330, 700); ctx.lineTo(1330, 700); ctx.stroke(); ctx.setLineDash([]);
    txt(ctx, '← miles →', 830, 690, { f: 'mono', s: 32, w: 800 }, { align: 'center', fill: PAL.pink });
    // Zip sprinting, far ahead
    zipChar(ctx, 1520, 910, 130, { t, eyes: 'determined', brow: 'angry', rot: .16, aL: 2.1, aR: .9, dy: -Math.abs(Math.sin(t * 18)) * .2, feet: [Math.max(0, Math.sin(t * 18)) * .3, Math.max(0, -Math.sin(t * 18)) * .3], seed: 30 });
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = rgba(PAL.ink, .35); ctx.lineWidth = 5; ctx.beginPath(); const yy = 740 + i * 30; ctx.moveTo(1300 - i * 20 - frac(t * 3 + i * .3) * 100, yy); ctx.lineTo(1360 - i * 20, yy); ctx.stroke(); }
    ctx.save(); cam(ctx, t, ['d.miles', 'd.competitor']);
    const k = slamIn(t, a); ctx.save(); ctx.translate(W / 2, 270); ctx.scale(k, k); txt(ctx, 'MILES AHEAD', 0, 0, { f: 'any', w: 900, wd: 130, s: 165 }, { align: 'center', fill: PAL.ink, mis: [8, 6, PAL.pink] }); ctx.restore();
    if (t > b - .06) { const k2 = popIn(t, b); ctx.save(); ctx.translate(W / 2, 420); ctx.scale(k2, k2); txt(ctx, 'OF EVERY COMPETITOR.', 0, 0, { f: 'any', w: 900, wd: 100, s: 96 }, { align: 'center', fill: PAL.blue }); ctx.restore(); }
    ctx.restore();
  }
  // ---------- 76–78 first usable, agentic coding ----------
  function agentic(ctx, t) {
    const a = T('d.first'), b = T('d.agentic');
    ctx.fillStyle = PAL.blue; ctx.fillRect(0, 0, W, H);
    ctx.save(); cam(ctx, t, ['d.first', 'd.agentic']);
    const k = popIn(t, a); ctx.save(); ctx.translate(W / 2, 250); ctx.scale(k, k);
    const st = { f: 'any', w: 900, wd: 80 }, sz = fitSize(ctx, 'THE FIRST USABLE COMPRESSION', st, 1720);
    txt(ctx, 'THE FIRST USABLE COMPRESSION', 0, 0, { ...st, s: sz }, { align: 'center', fill: PAL.cream, shadow: [6, 8, PAL.ink, .35] }); ctx.restore();
    if (t > b - .06) { const k2 = slamIn(t, b); ctx.save(); ctx.translate(W / 2, 450); ctx.scale(k2, k2); const w1 = tw(ctx, 'BUILT FOR ', { f: 'any', w: 900, wd: 100, s: 130 }), w2 = tw(ctx, 'agentic coding.', { f: 'ser', s: 190 }); txt(ctx, 'BUILT FOR', -(w1 + w2) / 2, 0, { f: 'any', w: 900, wd: 100, s: 130 }, { fill: PAL.cream }); txt(ctx, 'agentic coding.', -(w1 + w2) / 2 + w1, 0, { f: 'ser', s: 190 }, { fill: PAL.yellow, shadow: [6, 8, PAL.ink, .4] }); ctx.restore(); }
    // terminal with agent loop, payloads zipped
    const tx = 260, ty = 560, tw_ = 1400, th = 440;
    rr(ctx, tx, ty, tw_, th, 18); ctx.save(); ctx.translate(12, 16); ctx.fillStyle = rgba(PAL.ink, .35); ctx.fill(); ctx.restore(); ctx.fillStyle = PAL.night; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.ink; ctx.stroke();
    const lines = ['$ agent run --compress zip-α', '› plan    read 14 files       zip 41.2k → 32.6k tok', '› edit    src/api/router.ts  zip 18.9k → 14.8k tok', '› test    npm test            zip 26.4k → 20.7k tok', '› commit  "fix: retry logic"  ✓ cache hit'];
    const n = Math.floor(seg(t, a + .2, b + .9) * lines.length + .999);
    lines.slice(0, n).forEach((L, i) => txt(ctx, L, tx + 40, ty + 70 + i * 76, { f: 'mono', s: 40, w: i === 0 ? 800 : 500 }, { fill: i === 0 ? PAL.yellow : L.includes('cache') ? PAL.pinkLt : PAL.cream }));
    ctx.restore();
  }
  // ---------- 78–80 cache ----------
  function cache(ctx, t) {
    const a = T('d.andyes'), b = T('d.cache');
    ctx.fillStyle = PAL.yellow; ctx.fillRect(0, 0, W, H);
    ctx.save(); cam(ctx, t, ['d.andyes', 'd.cache']);
    const k = slamIn(t, a); ctx.save(); ctx.translate(140, 250); ctx.rotate(-.04); ctx.scale(k, k); txt(ctx, 'and yes,', 0, 0, { f: 'ser', s: 200 }, { fill: PAL.ink }); ctx.restore();
    if (t > b - .06) { const st = { f: 'any', w: 900, wd: 86 }, sz = fitSize(ctx, 'WE ACTUALLY OPTIMIZE FOR CACHE.', st, 1650), k2 = popIn(t, b); ctx.save(); ctx.translate(140, 440); ctx.scale(k2, k2); txt(ctx, 'WE ACTUALLY OPTIMIZE FOR CACHE.', 0, 0, { ...st, s: sz }, { fill: PAL.ink, mis: [6, 5, PAL.pink] }); ctx.restore(); }
    // two requests: identical zipped prefix → cache hit
    const rows = [['request 1', 620], ['request 2', 790]], bw = 118, bx = 330;
    rows.forEach(([lab, y], r) => {
      txt(ctx, lab, 140, y + 58, { f: 'mono', s: 30, w: 700 }, { fill: PAL.ink });
      for (let i = 0; i < 11; i++) {
        const pre = i < 7, kin = E.back(seg(t, a + .1 + r * .2 + i * .03, a + .3 + r * .2 + i * .03), 1.6); if (kin <= 0) continue;
        const x = bx + i * (bw + 12); ctx.save(); ctx.translate(x + bw / 2, y + 45); ctx.scale(kin, kin);
        piece(ctx, [[-bw / 2, -40], [bw / 2, -40], [bw / 2, 40], [-bw / 2, 40]], { fill: pre ? PAL.blue : (r ? PAL.pink : PAL.cream), ink: PAL.ink, lw: 4, sh: [6, 7] });
        txt(ctx, pre ? 'sys' + (i + 1) : 'msg', 0, 10, { f: 'mono', s: 26, w: 700 }, { align: 'center', fill: pre ? PAL.cream : PAL.ink });
        ctx.restore();
      }
    });
    const hk = E.back(seg(t, b + .35, b + .6), 1.8); if (hk > 0) {
      const x0 = bx - 10, x1 = bx + 7 * (bw + 12) - 2, y = 585;
      ctx.save(); ctx.globalAlpha = clamp(hk); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y + 20); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y + 20); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate((x0 + x1) / 2, y - 20); ctx.scale(hk, hk); rr(ctx, -210, -50, 420, 78, 39); ctx.fillStyle = PAL.ink; ctx.fill(); txt(ctx, '⚡ CACHE HIT ×2', 0, 4, { f: 'mono', s: 40, w: 800 }, { align: 'center', fill: PAL.yellow }); ctx.restore();
    }
    zipChar(ctx, 1700, 1020, 120, { t, eyes: 'wink', mouth: 0, look: [-.5, 0], aL: .5, aR: 2.4, seed: 31 });
    ctx.restore();
  }
  // ---------- 80–82 free money ----------
  function money(ctx, t) {
    const a = T('d.money'), b = T('d.nodown');
    ctx.fillStyle = PAL.green; ctx.fillRect(0, 0, W, H);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(Math.hypot(x - W / 2, y - H / 2) / 1000 - .2) * .6, { pitch: 26, color: rgba(PAL.ink, .35) });
    for (let i = 0; i < 26; i++) { const dt = t - a + hash(i + 300) * 2, x = hash(i + 301) * W + Math.sin(dt * 2 + i) * 60, y = -120 + ((dt * (260 + hash(i + 302) * 260)) % 1400); bill(ctx, x, y, 170 + hash(i + 303) * 60, Math.sin(dt * 1.7 + i) * .6, Math.cos(dt * 3 + i)); }
    ctx.save(); cam(ctx, t, ['d.money', 'd.nodown']);
    const k = slamIn(t, a); ctx.save(); ctx.translate(W / 2, 480); ctx.scale(k, k); txt(ctx, 'FREE MONEY,', 0, 0, { f: 'any', w: 900, wd: 90, s: 250 }, { align: 'center', fill: PAL.cream, stroke: [16, PAL.ink], shadow: [10, 14, PAL.ink, .4] }); ctx.restore();
    if (t > b - .06) {
      const k2 = popIn(t, b); ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k2, k2);
      const w1 = tw(ctx, 'NO ', { f: 'any', w: 900, wd: 100, s: 170 }), w2 = tw(ctx, 'DOWNSIDE.', { f: 'any', w: 900, wd: 100, s: 170 }), x0 = -(w1 + w2) / 2;
      txt(ctx, 'NO', x0, 0, { f: 'any', w: 900, wd: 100, s: 170 }, { fill: PAL.yellow, stroke: [12, PAL.ink] });
      txt(ctx, 'DOWNSIDE.', x0 + w1, 0, { f: 'any', w: 900, wd: 100, s: 170 }, { fill: PAL.yellow, stroke: [12, PAL.ink] });
      const pr = E.outC(seg(t, b + .2, b + .4)); ctx.lineCap = 'round'; ctx.strokeStyle = PAL.pink; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(x0 + w1 - 10, -55); ctx.lineTo(x0 + w1 - 10 + (w2 + 20) * pr, -55 + 18 * pr); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // ---------- 82–86 unicorn, $100M, save $20M ----------
  function uni(ctx, t) {
    const a = T('d.unicorn'), b = T('d.100m'), c = T('d.oncoding'), d = T('d.save'), e = T('d.20m');
    ctx.fillStyle = PAL.pinkLt; ctx.fillRect(0, 0, W, H);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(y / H - .3) * .5, { pitch: 22, color: rgba(PAL.pink, .6) });
    ctx.fillStyle = mix(PAL.pinkLt, PAL.ink, .12); ctx.fillRect(0, 930, W, 200);
    const push = E.ioC(seg(t, d - .3, d + .2));
    ctx.save(); camApply(ctx, { x: W / 2 + push * 120, y: H / 2 + push * 40, z: 1 + push * .06 + pulse(t, 8) * .006 });
    // unicorn
    const uk = E.back(seg(t, a - .1, a + .25), 1.4);
    ctx.save(); ctx.translate(560, 940 + (1 - uk) * 500); unicorn(ctx, 0, 0, 1.05, t, { heart: t > e + .3, bob: 1 }); ctx.restore();
    // stack: 12 bundles = $100M; the top 20 % gets zipped off
    const sx = 1260, n = 14, gone = E.ioC(seg(t, e - .1, e + .35)), stackK = seg(t, b - .05, b + .4) * n;
    const nShow = Math.floor(stackK);
    const keep = Math.round(n * .8);
    const topY = cashStack(ctx, sx, 940, 300, Math.min(nShow, t > e ? keep : n));
    if (t > e - .1 && nShow >= n) { // the zipped-off 20 % flies to the unicorn
      const bx = lerp(sx, 700, gone), by = lerp(940 - keep * 36, 1010, gone) - Math.sin(gone * Math.PI) * 300;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(-gone * .25 + Math.sin(gone * Math.PI) * .3); cashStack(ctx, 0, 0, 300, n - keep); ctx.restore();
      if (gone > .9) { const k = popIn(t, e + .3); ctx.save(); ctx.translate(1000, 400); ctx.rotate(-.1); ctx.scale(k, k); piece(ctx, starPts(0, 0, 115, .7, 12), { fill: PAL.yellow, ink: PAL.ink, lw: 5 }); txt(ctx, '+$20M', 0, 20, { f: 'any', w: 900, wd: 70, s: 66 }, { align: 'center', fill: PAL.ink }); ctx.restore(); }
    }
    if (nShow >= 1) { const lk = popIn(t, b + .3); ctx.save(); ctx.translate(sx + 250, topY + 20); ctx.rotate(.08); ctx.scale(lk, lk); piece(ctx, [[-10, -36], [220, -36], [250, 0], [220, 36], [-10, 36]], { fill: PAL.cream, ink: PAL.ink, lw: 4 }); txt(ctx, t > e + .2 ? '$80M' : '$100M', 110, 14, { f: 'mono', s: 40, w: 800 }, { align: 'center', fill: PAL.ink }); ctx.restore(); }
    // Zip zips the stack at 84
    if (t > d - .4) {
      const jk = E.back(seg(t, d - .4, d), 1.3), zipK = E.ioC(seg(t, e - .45, e - .05));
      const zx = lerp(W + 200, sx + 260, jk), zy = 940 - keep * 36 + 20;
      if (t > e - .5 && t < e + .1) { zipperTeeth(ctx, sx - 170, lerp(sx - 170, sx + 170, zipK), () => zy - 20, -1, { th: 18, pitch: 26 }); zipperTeeth(ctx, sx - 170, lerp(sx - 170, sx + 170, zipK), () => zy - 20, 1, { th: 18, pitch: 26 }); zipSlider(ctx, lerp(sx - 170, sx + 170, zipK), zy - 20, 30, .2); }
      zipChar(ctx, zx, 940, 125, { t, eyes: t > e ? 'wink' : 'determined', brow: t > e ? null : 'angry', mouth: t > e ? .5 : 0, slider: .3, aL: 2.2, aR: .6, look: [-.7, 0], dy: -pulse(t, 7) * .15, seed: 33 });
    }
    ctx.restore();
    // words (screen space)
    ctx.save(); cam(ctx, t, ['d.unicorn', 'd.100m', 'd.oncoding', 'd.save', 'd.20m']);
    if (t < d) {
      if (t > a - .06) txt(ctx, 'AN AVERAGE UNICORN', 120, 170, { f: 'any', w: 900, wd: 100, s: 96 }, { fill: PAL.ink, alpha: seg(t, a - .06, a + .05) });
      if (t > b - .06) { const k = slamIn(t, b); ctx.save(); ctx.translate(120, 330); ctx.scale(k, k); txt(ctx, 'SPENDS $100M', 0, 0, { f: 'any', w: 900, wd: 80, s: 150 }, { fill: PAL.pink, stroke: [10, PAL.cream], shadow: [7, 9, PAL.ink, .3] }); ctx.restore(); }
      if (t > c - .06) txt(ctx, 'ON AGENTIC CODING.', 120, 440, { f: 'any', w: 900, wd: 100, s: 80 }, { fill: PAL.ink, alpha: seg(t, c - .06, c + .05) });
    } else {
      const k = popIn(t, d); ctx.save(); ctx.translate(120, 200); ctx.scale(k, k); txt(ctx, 'WE CAN SAVE THEM', 0, 0, { f: 'any', w: 900, wd: 100, s: 110 }, { fill: PAL.ink }); ctx.restore();
      if (t > e - .06) { const k2 = slamIn(t, e); ctx.save(); ctx.translate(120, 470); ctx.rotate(-.03); ctx.scale(k2, k2); txt(ctx, '$20M.', 0, 0, { f: 'any', w: 900, wd: 70, s: 300 }, { fill: PAL.yellow, stroke: [16, PAL.ink], shadow: [12, 16, PAL.ink, .4] }); ctx.restore(); }
    }
    ctx.restore();
  }
  // ---------- 86–90 end card ----------
  function endCard(ctx, t) {
    const a = T('e.signup'), b = T('e.url'), z = T('e.zipmove');
    ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba(PAL.blue, .07); ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
    regMarks(ctx, PAL.pink, .6);
    const lk = E.back(seg(t, a - .1, a + .25), 1.6);
    ctx.save(); ctx.translate(W / 2 - 180, 450); ctx.scale(lk, lk); logo(ctx, 0, 0, 360, t, { col: PAL.blue, acol: PAL.pink, split: .25 }); ctx.restore();
    if (t > a - .06) { const k = popIn(t, a + .1); ctx.save(); ctx.translate(W / 2 - 180, 620); ctx.scale(k, k); txt(ctx, 'SIGN UP FOR THE WAITLIST', 0, 0, { f: 'any', w: 900, wd: 100, s: 76 }, { align: 'center', fill: PAL.ink }); ctx.restore(); }
    if (t > b - .06) {
      const k = E.back(seg(t, b - .06, b + .25), 1.8), press = t > 88.2 && t < 88.4 ? .96 : 1;
      ctx.save(); ctx.translate(W / 2 - 180, 800); ctx.scale(k * press, k * press);
      rr(ctx, -380, -80, 760, 150, 75); ctx.save(); ctx.translate(10, 14); ctx.fillStyle = rgba(PAL.ink, .3); ctx.fill(); ctx.restore();
      rr(ctx, -380, -80, 760, 150, 75); ctx.fillStyle = PAL.blue; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = PAL.ink; ctx.stroke();
      txt(ctx, 'zipailabs.com →', 0, 24, { f: 'mono', s: 70, w: 800 }, { align: 'center', fill: PAL.cream });
      ctx.restore();
      // cursor glides in and clicks
      const ck = E.ioC(seg(t, 87.4, 88.2)); if (ck > 0) { const cx = lerp(W + 50, W / 2 + 30, ck), cy = lerp(1100, 830, ck); ctx.save(); ctx.translate(cx, cy); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 54); ctx.lineTo(14, 40); ctx.lineTo(24, 62); ctx.lineTo(33, 57); ctx.lineTo(23, 37); ctx.lineTo(40, 37); ctx.closePath(); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore(); if (t > 88.2) { const r = (t - 88.2) * 300; ctx.beginPath(); ctx.arc(W / 2 + 30, 830, r, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = rgba(PAL.pink, clamp(1 - (t - 88.2) * 2)); ctx.stroke(); } }
    }
    // Zip: last zip-it and a wink, then idles
    const zk = E.ioC(seg(t, z + .1, z + .6)), zin = E.back(seg(t, a, a + .35), 1.3);
    const zo = { t, seed: 40, eyes: t > z + .6 ? 'wink' : 'open', look: [-.4, 0], mouth: t < z ? .5 : .75 * (1 - zk), slider: t < z ? .3 : lerp(0, 1, zk), aL: t < z ? 2.4 : .5, aR: .5, dy: -pulse(t, 5) * .05 };
    if (t >= z && t < z + .8) { zo.hR = [lerp(-.46, .46, zk), .66]; zo.cR = [lerp(.35, .85, zk), 1.05]; zo.pull = .2; }
    zipChar(ctx, 1560, 900 + (1 - zin) * 600, 190, zo);
    if (t > z + .6) sparkles(ctx, 1560, 640, 260, t, 6, 50);
    txt(ctx, 'ZIP LABS · token compression research since 2000', W / 2, H - 70, { f: 'mono', s: 26, w: 600 }, { align: 'center', fill: rgba(PAL.ink, .7), alpha: seg(t, b + .5, b + .8) });
  }

  scene('launch', 68, 72, (ctx, t) => launch(ctx, t));
  scene('drop', 72, 86, (ctx, t) => {
    if (t < 73) return dropLogo(ctx, t);
    if (t < 74) return grid(ctx, t);
    if (t < 76) return miles(ctx, t);
    if (t < 78) return agentic(ctx, t);
    if (t < 80) return cache(ctx, t);
    if (t < 82) return money(ctx, t);
    return uni(ctx, t);
  });
  scene('end', 86, 90.1, (ctx, t) => endCard(ctx, t));
})();
