// s05_chorus.js (36–48 s): six shots, one per line, colour set changes on every downbeat.
// only solution · doesn't degrade (shred → zip restores) · improves it (ascending letters) · context bloat (Zip zips Bloat) · fewer turns (tickets cut + zipped) · finish faster (Zip sprints)
'use strict';
(() => {
  const shotCam = (ctx, t, t0, ids) => {
    let z = 1 + seg(t, t0, t0 + 2) * .04;
    ids.forEach(id => { const d = t - T(id); if (d >= 0) z += Math.exp(-d * 9) * .035; });
    const [sx, sy] = shake(t, 10, ids.map(T).filter(v => v <= t).pop() ?? -9, 10, 13);
    camApply(ctx, { x: W / 2 + sx, y: H / 2 + sy, z });
  };
  function only(ctx, t) {
    ctx.fillStyle = PAL.blue; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.save(); ctx.globalAlpha = .5; sunburst(ctx, W / 2, 620, 26, 1500, t * .12, PAL.blue, PAL.violet); ctx.restore();
    ctx.save(); shotCam(ctx, t, 36, ['c.weare', 'c.only', 'c.solution']);
    const a = T('c.weare'), b = T('c.only'), c = T('c.solution');
    if (t > a - .06) { const k = popIn(t, a); ctx.save(); ctx.translate(W / 2, 300); ctx.scale(k, k); txt(ctx, 'WE ARE THE', 0, 0, { f: 'any', w: 900, wd: 120, s: 100 }, { align: 'center', fill: PAL.cream, shadow: [6, 8, PAL.ink, .3] }); ctx.restore(); }
    if (t > b - .06) { const k = slamIn(t, b); ctx.save(); ctx.translate(W / 2, 610); ctx.rotate(-.05); ctx.scale(k, k); txt(ctx, 'only', 0, 0, { f: 'ser', s: 360 }, { align: 'center', fill: PAL.pink, stroke: [14, PAL.cream], shadow: [12, 16, PAL.ink, .35] }); ctx.restore(); scribble(ctx, W / 2 - 300, 660, W / 2 + 330, 640, { color: PAL.yellow, lw: 16, n: 1, amp: 0, seed: 3, prog: E.outC(seg(t, b + .1, b + .35)) }); }
    if (t > c - .06) {
      const st = { f: 'any', w: 900, wd: 76 }, sz = fitSize(ctx, 'SOLUTION', st, 1300);
      letters(ctx, 'SOLUTION', W / 2, 930, { ...st, s: sz }, (i) => { const k = clamp((t - c + .06 - i * .03) / .18); return { a: k > 0 ? 1 : 0, dy: (1 - E.back(k, 2.5)) * 90, s: lerp(.5, 1, E.back(k)) }; }, { align: 'center', fill: PAL.cream, mis: [7, 6, PAL.pink] });
    }
    ctx.restore();
  }
  function degrade(ctx, t) {
    ctx.fillStyle = PAL.yellow; ctx.fillRect(-200, -200, W + 400, H + 400);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(.5 - y / H) * .5, { pitch: 22, color: rgba(PAL.pink, .6) });
    ctx.save(); shotCam(ctx, t, 38, ['c.doesnt', 'c.degrade', 'c.perf']);
    const a = T('c.doesnt'), b = T('c.degrade'), c = T('c.perf');
    if (t > a - .06) { const k = popIn(t, a); ctx.save(); ctx.translate(W / 2, 270); ctx.scale(k, k); txt(ctx, "THAT DOESN'T", 0, 0, { f: 'any', w: 900, wd: 110, s: 110 }, { align: 'center', fill: PAL.ink }); ctx.restore(); }
    if (t > b - .06) {
      const st = { f: 'any', w: 900, wd: 92 }, sz = fitSize(ctx, 'DEGRADE', st, 1400), k0 = slamIn(t, b);
      // render the word to a buffer, then draw it in strips
      const tb = buf('shred'), tx = tb.getContext('2d'); tx.setTransform(1, 0, 0, 1, 0, 0); tx.clearRect(0, 0, W, H);
      txt(tx, 'DEGRADE', W / 2, 540 + sz * .36, { ...st, s: sz }, { align: 'center', fill: PAL.ink, mis: [8, 6, PAL.pink] });
      const shred = E.outC(seg(t, b + .08, b + .35)), zx = lerp(-100, W + 200, E.ioC(seg(t, c - .05, c + .35))); // zipper runs across and restores
      const N = 28, sw = 1400 / N, x0 = W / 2 - 700;
      ctx.save(); ctx.translate(W / 2, 540); ctx.scale(k0, k0); ctx.translate(-W / 2, -540);
      for (let i = 0; i < N; i++) {
        const sx = x0 + i * sw, restored = t > c - .05 && sx + sw / 2 < zx, k = restored ? 0 : shred;
        const dy = (hash(i + 3) - .5) * 220 * k, dx = (i - N / 2) * 7 * k, r = (hash(i + 9) - .5) * .25 * k;
        ctx.save(); ctx.translate(sx + sw / 2 + dx, 540 + dy); ctx.rotate(r);
        ctx.drawImage(tb, sx, 540 - sz * .5, sw + 1, sz * 1.1, -sw / 2, -sz * .5, sw + 1, sz * 1.1);
        ctx.restore();
      }
      ctx.restore();
      if (t > c - .05 && t < c + .45) { zipperTeeth(ctx, -40, zx, () => 560, -1, { th: 30, pitch: 46 }); zipperTeeth(ctx, -40, zx, () => 560, 1, { th: 30, pitch: 46 }); zipSlider(ctx, zx, 560, 60, -.2); }
      // lossy → lossless tag
      const lossy = t < c;
      ctx.save(); ctx.translate(W / 2 + 560, 380); ctx.rotate(.08); const kk = (lossy ? popIn(t, b + .15) : popIn(t, c + .2)) * 1.6;
      ctx.scale(kk, kk); rr(ctx, -120, -40, 240, 70, 35); ctx.fillStyle = lossy ? PAL.pink : PAL.blue; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.ink; ctx.stroke();
      txt(ctx, lossy ? 'lossy ✗' : 'lossless ✓', 0, 10, { f: 'mono', s: 34, w: 800 }, { align: 'center', fill: PAL.cream }); ctx.restore();
    }
    if (t > c - .06) { const st = { f: 'any', w: 900, wd: 84 }, sz = fitSize(ctx, 'MODEL PERFORMANCE', st, 1250), k = popIn(t, c); ctx.save(); ctx.translate(W / 2, 920); ctx.scale(k, k); txt(ctx, 'MODEL PERFORMANCE', 0, 0, { ...st, s: sz }, { align: 'center', fill: PAL.blue, shadow: [6, 8, PAL.ink, .25] }); ctx.restore(); }
    ctx.restore();
  }
  function improves(ctx, t) {
    ctx.fillStyle = PAL.pink; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.save(); shotCam(ctx, t, 40, ['c.but', 'c.improves']);
    const a = T('c.but'), b = T('c.improves');
    // baseline
    ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = 6; ctx.strokeStyle = rgba(PAL.ink, .7); ctx.beginPath(); ctx.moveTo(80, 790); ctx.lineTo(W - 80, 790); ctx.stroke(); ctx.restore();
    txt(ctx, 'baseline (no compression)', 90, 840, { f: 'mono', s: 30, w: 700 }, { fill: PAL.ink });
    if (t > a - .06) { const k = popIn(t, a); ctx.save(); ctx.translate(140, 250); ctx.scale(k, k); txt(ctx, 'BUT ACTUALLY', 0, 0, { f: 'any', w: 900, wd: 110, s: 110 }, { fill: PAL.cream, shadow: [6, 8, PAL.violet, .4] }); ctx.restore(); }
    if (t > b - .06) {
      const st = { f: 'any', w: 900, wd: 74, s: 230 };
      letters(ctx, 'IMPROVES IT', 140, 740, st, (i) => { const k = clamp((t - b + .06 - i * .035) / .22); return { a: k > 0 ? 1 : 0, dy: -i * 26 * E.back(k, 1.6) + (1 - k) * 80 }; }, { fill: PAL.cream, mis: [8, 7, PAL.blue], shadow: [8, 10, PAL.violet, .4] });
      // arrow up
      const ak = E.back(seg(t, b + .35, b + .6), 2); if (ak > 0) { ctx.save(); ctx.translate(1720, 470); ctx.scale(ak, ak); piece(ctx, [[0, -150], [95, -30], [38, -30], [38, 110], [-38, 110], [-38, -30], [-95, -30]], { fill: PAL.yellow, ink: PAL.ink, lw: 7, sh: [10, 12] }); ctx.restore(); }
    }
    zipChar(ctx, 1620, 1040, 95, { t, eyes: 'happy', mouth: .6, slider: .2, aL: 2.5, aR: 2.5, dy: -pulse(t, 6) * .25 - .1, seed: 4 });
    ctx.restore();
  }
  function bloatShot(ctx, t) {
    ctx.fillStyle = PAL.paper; ctx.fillRect(-200, -200, W + 400, H + 400);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(1 - Math.hypot(x - 700, y - 640) / 700) * .45, { pitch: 26, color: rgba(PAL.pink, .6) });
    ctx.save(); shotCam(ctx, t, 42, ['c.cutting', 'c.bloat', 'c.zipmove']);
    const a = T('c.cutting'), b = T('c.bloat'), z = T('c.zipmove');
    const k = E.ioC(seg(t, z + .15, z + .85)); // zip progress
    const squeeze = E.outC(seg(t, z + .3, z + .9));
    const inflate = E.back(seg(t, a - .1, a + .4), 1.4);
    const bx = 680, by = 640 + squeeze * 170;
    if (inflate > 0) bloat(ctx, bx, by, 290 * inflate, { t, squeeze, eyes: squeeze > .9 ? 'dot' : 'tired', mouth: lerp(.8, .05, squeeze), sweat: squeeze < .5, col: squeeze > .95 ? PAL.yellow : PAL.yellowLt });
    if (squeeze > .95) sparkles(ctx, bx, by, 150, t, 6, 31);
    // zip: pinches and zips shut, Bloat is squeezed
    zipChar(ctx, 1560, 930, 175, { t, look: [-.6, 0], eyes: k > .95 ? 'wink' : 'determined', brow: k > .95 ? null : 'angry', mouth: .75 * (1 - k), slider: lerp(0, 1, k), hR: t > z - .1 ? [lerp(-.46, .46, k), .66] : null, cR: t > z - .1 ? [lerp(.35, .85, k), 1.05] : null, aR: .5, aL: .5, pull: .2, seed: 6 });
    if (t > a - .06) txt(ctx, 'BY CUTTING', 120, 190, { f: 'any', w: 900, wd: 100, s: 90 }, { fill: PAL.ink, alpha: seg(t, a - .06, a + .05) });
    if (t > b - .06) {
      const kk = popIn(t, b); ctx.save(); ctx.translate(120, 330); ctx.scale(kk, kk);
      const w1 = txtW('CONTEXT ', { f: 'any', w: 900, wd: 90, s: 130 });
      txt(ctx, 'CONTEXT', 0, 0, { f: 'any', w: 900, wd: 90, s: 130 }, { fill: PAL.ink });
      txt(ctx, 'BLOAT.', w1, 0, { f: 'any', w: 900, wd: lerp(150, 50, squeeze), s: 130 }, { fill: PAL.pink, mis: [6, 5, PAL.blue] });
      ctx.restore();
    }
    ctx.restore();
    function txtW(str, st) { return tw(ctx, str, st); }
  }
  function fewer(ctx, t) {
    ctx.fillStyle = PAL.blue; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.save(); shotCam(ctx, t, 44, ['c.agent', 'c.fewer']);
    const a = T('c.agent'), b = T('c.fewer');
    if (t > a - .06) { const k = popIn(t, a); ctx.save(); ctx.translate(W / 2, 230); ctx.scale(k, k); txt(ctx, 'THE AGENT ALSO TAKES', 0, 0, { f: 'any', w: 900, wd: 110, s: 96 }, { align: 'center', fill: PAL.cream }); ctx.restore(); }
    if (t > b - .06) { const k = slamIn(t, b); ctx.save(); ctx.translate(W / 2, 430); ctx.scale(k, k); txt(ctx, 'FEWER TURNS,', 0, 0, { f: 'any', w: 900, wd: 80, s: 190 }, { align: 'center', fill: PAL.yellow, shadow: [8, 10, PAL.violet, .6], mis: [7, 6, PAL.pink] }); ctx.restore(); }
    // tickets: some get cut out, the row zips closed
    const N = 10, cut = [2, 5, 7], tw_ = 150, gap = 18, y = 720;
    const cutK = E.outC(seg(t, b + .2, b + .6)), close = E.ioC(seg(t, b + .7, b + 1.2));
    const keep = [...Array(N).keys()].filter(i => !cut.includes(i));
    const fullW = N * tw_ + (N - 1) * gap, keepW = keep.length * tw_ + (keep.length - 1) * gap;
    for (let i = 0; i < N; i++) {
      const isCut = cut.includes(i), x0 = W / 2 - fullW / 2 + i * (tw_ + gap);
      const ki = keep.indexOf(i), x1 = ki >= 0 ? W / 2 - keepW / 2 + ki * (tw_ + gap) : x0;
      let x = lerp(x0, x1, close), yy = y, r = (hash(i) - .5) * .06;
      if (isCut) { yy += cutK * cutK * 700; r += cutK * (hash(i + 4) - .5) * 2; }
      const kIn = E.back(seg(t, a + i * .04, a + .25 + i * .04), 1.5); if (kIn <= 0) continue;
      ctx.save(); ctx.translate(x + tw_ / 2, yy + (1 - kIn) * 300); ctx.rotate(r);
      piece(ctx, tornPts(-tw_ / 2, -52, tw_, 104, 60 + i, 2.5, 14), { fill: isCut ? PAL.pink : PAL.cream, ink: PAL.ink, lw: 4, sh: [7, 9] });
      txt(ctx, 'turn', 0, -8, { f: 'mono', s: 24, w: 500 }, { align: 'center', fill: PAL.ink });
      txt(ctx, String(i + 1).padStart(2, '0'), 0, 36, { f: 'mono', s: 44, w: 800 }, { align: 'center', fill: PAL.ink });
      ctx.restore();
    }
    if (t > b + .15 && t < b + .65) { const p = seg(t, b + .15, b + .6), sx = lerp(W / 2 - fullW / 2 - 100, W / 2 + fullW / 2, p); scissors(ctx, sx, y - 90, 170, .08 + .5 * Math.abs(Math.cos(p * 18)), .12); }
    zipChar(ctx, W / 2, 1060, 80, { t, eyes: 'open', look: [0, -.8], aL: 1.5, aR: 1.5, dy: -pulse(t, 6) * .2, seed: 7 });
    ctx.restore();
  }
  function faster(ctx, t) {
    ctx.fillStyle = PAL.yellow; ctx.fillRect(-200, -200, W + 400, H + 400);
    // speed lines
    ctx.strokeStyle = rgba(PAL.ink, .12); ctx.lineCap = 'round';
    for (let i = 0; i < 40; i++) { const y = hash(i + 5) * H, L = 200 + hash(i + 6) * 500, x = W - frac(t * (1.5 + hash(i) * 2) + hash(i + 7)) * (W + L * 2) + L; ctx.lineWidth = 4 + hash(i + 8) * 10; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + L, y); ctx.stroke(); }
    ctx.save(); shotCam(ctx, t, 46, ['c.so', 'c.faster']);
    const a = T('c.so'), b = T('c.faster');
    if (t > a - .06) { const k = popIn(t, a); ctx.save(); ctx.translate(140, 260); ctx.scale(k, k); txt(ctx, 'SO TASKS', 0, 0, { f: 'any', w: 900, wd: 110, s: 120 }, { fill: PAL.ink }); ctx.restore(); }
    if (t > b - .06) {
      const k = clamp((t - b + .06) / .25), dx = (1 - E.outX(k)) * -900;
      ctx.save(); ctx.translate(140 + dx, 540); ctx.transform(1, 0, -.22, 1, 0, 0);
      txt(ctx, 'FINISH FASTER.', 0, 0, { f: 'any', w: 900, wd: 76, s: fitSize(ctx, 'FINISH FASTER.', { f: 'any', w: 900, wd: 76 }, 1500) }, { fill: PAL.ink, mis: [-14, 5, PAL.pink] });
      ctx.restore();
    }
    // finish line + Zip sprint
    const fx = 1540; ctx.save(); ctx.translate(fx, 640);
    for (let r = 0; r < 12; r++) for (let c2 = 0; c2 < 2; c2++) { ctx.fillStyle = (r + c2) % 2 ? PAL.ink : PAL.cream; ctx.fillRect(c2 * 28, r * 28, 28, 28); }
    ctx.restore();
    const run = seg(t, b - .35, b + 1.35), zx = lerp(-250, W + 300, E.ioC(run));
    const tape = zx > fx + 40;
    ctx.strokeStyle = PAL.pink; ctx.lineWidth = 10; ctx.beginPath();
    if (!tape) { ctx.moveTo(fx - 40, 820); ctx.quadraticCurveTo(Math.min(zx + 150, fx + 30), 830, fx + 100, 820); }
    else { const f = t - (b + .5); ctx.moveTo(fx - 40, 820); ctx.quadraticCurveTo(fx - 80, 880 + f * 100, fx - 60, 930); ctx.moveTo(fx + 100, 820); ctx.quadraticCurveTo(fx + 140, 880 + f * 100, fx + 120, 930); }
    ctx.stroke();
    if (run > 0 && run < 1) {
      for (let g = 4; g >= 1; g--) { ctx.save(); ctx.globalAlpha = .12 * (5 - g); zipChar(ctx, zx - g * 70, 960, 120, { t, eyes: 'determined', rot: .18, sticker: false, shadow: false, aL: 2.2, aR: 1.0, seed: 8 }); ctx.restore(); }
      zipChar(ctx, zx, 960, 120, { t, eyes: 'determined', brow: 'angry', rot: .18, aL: 2.2, aR: .9, dy: -Math.abs(Math.sin(t * 20)) * .2, feet: [Math.max(0, Math.sin(t * 20)) * .3, Math.max(0, -Math.sin(t * 20)) * .3], seed: 8 });
    }
    ctx.restore();
  }
  function chorusFrame(ctx, t) {
    if (t < 38) return only(ctx, t);
    if (t < 40) return degrade(ctx, t);
    if (t < 42) return improves(ctx, t);
    if (t < 44) return bloatShot(ctx, t);
    if (t < 46) return fewer(ctx, t);
    return faster(ctx, t);
  }
  scene('chorus', 36, 48, (ctx, t) => chorusFrame(ctx, t));
})();
