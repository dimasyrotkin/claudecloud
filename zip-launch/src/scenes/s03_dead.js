// s03_dead.js (16–24 s): TOKENMAXING inflates and pops. A tombstone rises: "is dead." Zip lays a flower.
// 20: a balance scale. Tokens pile up until they outweigh the engineer. Halftone dissolve into the race.
'use strict';
(() => {
  function inflateWord(ctx, t) {
    const t0 = T('t.tokenmaxing'), tp = T('t.pop');
    ctx.fillStyle = PAL.yellow; ctx.fillRect(-100, -100, W + 200, H + 200);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(Math.hypot(x - W / 2, y - H / 2) / 1100 - .25) * .8, { pitch: 24, color: rgba(PAL.pink, .55), angle: .5 });
    if (t >= tp) return;
    const k = seg(t, t0, tp), inflate = E.inQ(k);
    const st = { f: 'any', w: 900, wd: lerp(62, 150, E.outC(k)) }, s0 = fitSize(ctx, 'TOKENMAXING', { f: 'any', w: 900, wd: 62 }, 1150), sz = lerp(s0, fitSize(ctx, 'TOKENMAXING', { f: 'any', w: 900, wd: 150 }, 1760), E.outC(k));
    const shakeA = inflate * 10;
    ctx.save(); ctx.translate(W / 2 + noise1(t * 30, 1) * shakeA, 590 + noise1(t * 30, 2) * shakeA);
    letters(ctx, 'TOKENMAXING', 0, 0, { ...st, s: sz }, (i, n) => {
      const ph = t * 6 + i * .7; return { dy: Math.sin(ph) * 10 * (.3 + inflate), s: 1 + inflate * .12 * (1 + Math.sin(ph * 1.3)) * .5, sy: 1 + inflate * .45, r: Math.sin(ph * .8) * .04 * inflate };
    }, { align: 'center', fill: mix(PAL.ink, PAL.red, inflate * .7), stroke: [10, PAL.cream], shadow: [8, 12, PAL.ink, .25] });
    ctx.restore();
    // sweat + strain marks
    if (inflate > .3) for (let i = 0; i < 4; i++) { const ph = frac(t * 1.5 + i * .25), x = W / 2 + (i - 1.5) * 380, y = 380 - ph * 40; ctx.save(); ctx.globalAlpha = 1 - ph; ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(12, 0, 0, 10); ctx.quadraticCurveTo(-12, 0, 0, -16); ctx.fillStyle = PAL.blueLt; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore(); }
    txt(ctx, '#tokenmaxing', 120, 150, { f: 'mono', s: 36, w: 700 }, { fill: PAL.ink, alpha: seg(t, t0 + .1, t0 + .3) });
    txt(ctx, 'LEADERBOARD  #1  ▲', W - 120, 150, { f: 'mono', s: 36, w: 500 }, { align: 'right', fill: PAL.ink, alpha: seg(t, t0 + .4, t0 + .6) });
  }
  function popBurst(ctx, t) {
    const tp = T('t.pop'), dt = t - tp; if (dt < 0 || dt > 1.2) return;
    for (let i = 0; i < 70; i++) {
      const a = hash(i + 7) * TAU, v = 500 + hash(i + 8) * 1500, x = W / 2 + (hash(i + 9) - .5) * 1400 + Math.cos(a) * v * dt, y = 590 + Math.sin(a) * v * dt * .7 + 1800 * dt * dt;
      const cols = [PAL.ink, PAL.pink, PAL.cream, PAL.blue]; ctx.save(); ctx.translate(x, y); ctx.rotate(dt * 10 * (hash(i + 3) - .5) * 3); ctx.scale(Math.cos(dt * 12 + i), 1);
      pathPts(ctx, tornPts(-18, -12, 36, 24, i + 50, 3, 10)); ctx.fillStyle = cols[i % 4]; ctx.fill(); ctx.restore();
    }
    if (dt < .35) { // comic POP
      const k = popIn(t, tp, .15); ctx.save(); ctx.translate(W / 2, 560); ctx.rotate(-.1); ctx.scale(k, k);
      piece(ctx, starPts(0, 0, 330, .62, 14), { fill: PAL.cream, ink: PAL.ink, lw: 8, sh: [14, 18] });
      txt(ctx, 'POP!', 0, 70, { f: 'any', w: 900, wd: 70, s: 200 }, { align: 'center', fill: PAL.pink, mis: [8, 6, PAL.blue] });
      ctx.restore();
    }
  }
  function tombstone(ctx, x, y, s, t) {
    const w = 460 * s, h = 560 * s;
    ctx.save(); ctx.translate(x, y);
    const pts = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; pts.push([Math.cos(a) * w / 2, -h + w / 2 + Math.sin(a) * w / 2]); }
    pts.push([w / 2, 0], [-w / 2, 0]);
    piece(ctx, pts, { fill: PAL.grey, ink: PAL.ink, lw: 6, sh: [18, 14], sha: .3 });
    ctx.save(); pathPts(ctx, pts); ctx.clip();
    halftone(ctx, -w / 2, -h, w / 2, 0, (px, py) => clamp(px / w * 1.2 + .1), { pitch: 14, color: rgba(PAL.ink, .35) });
    ctx.restore();
    txt(ctx, 'R.I.P.', 0, -h + 190 * s, { f: 'serR', s: 90 * s }, { align: 'center', fill: PAL.ink });
    const st = { f: 'any', w: 900, wd: 52 }, sz = fitSize(ctx, 'TOKENMAXING', st, w * .82);
    txt(ctx, 'TOKENMAXING', 0, -h + 310 * s, { ...st, s: sz }, { align: 'center', fill: PAL.ink, shadow: [2, 3, PAL.cream, .5] });
    txt(ctx, '2024 – 2026', 0, -h + 380 * s, { f: 'mono', s: 34 * s, w: 700 }, { align: 'center', fill: PAL.ink });
    txt(ctx, '"it was only 40M tokens"', 0, -h + 440 * s, { f: 'ser', s: 30 * s }, { align: 'center', fill: rgba(PAL.ink, .8) });
    ctx.restore();
  }
  function flower(ctx, x, y, s, col, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(8 * s, -40 * s, 0, -80 * s); ctx.lineWidth = 7 * s; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.lineWidth = 4 * s; ctx.strokeStyle = PAL.teal; ctx.stroke();
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 16 * s, -80 * s + Math.sin(a) * 16 * s, 12 * s, 9 * s, a, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 3 * s; ctx.strokeStyle = PAL.ink; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, -80 * s, 10 * s, 0, TAU); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function grave(ctx, t) {
    const t0 = T('t.isdead'), dt = t - t0;
    ctx.fillStyle = PAL.blueLt; ctx.fillRect(-100, -100, W + 200, H + 200);
    halftone(ctx, 0, 0, W, H, (x, y) => clamp(y / H * 1.1 - .2) * .7, { pitch: 22, color: rgba(PAL.blue, .5), angle: .3 });
    // moon
    ctx.beginPath(); ctx.arc(1640, 210, 90, 0, TAU); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.beginPath(); ctx.arc(1680, 190, 80, 0, TAU); ctx.fillStyle = PAL.blueLt; ctx.fill();
    // ground
    const gy = 860; ctx.beginPath(); ctx.moveTo(-50, gy); for (let x = -50; x <= W + 50; x += 60) ctx.lineTo(x, gy + noise1(x / 200, 3) * 14); ctx.lineTo(W + 50, H + 50); ctx.lineTo(-50, H + 50); ctx.closePath(); ctx.fillStyle = PAL.teal; ctx.fill();
    // tombstone rises
    const rise = E.back(seg(t, t0 - .02, t0 + .3), 1.3), [sx, sy] = shake(t, 14, t0 + .1, 8, 7);
    ctx.save(); ctx.beginPath(); ctx.rect(-100, -100, W + 200, gy + 20 + 100); ctx.clip();
    tombstone(ctx, 1230 + sx, gy + 30 + (1 - rise) * 640 + sy, 1, t);
    ctx.restore();
    // mound + flowers
    ctx.beginPath(); ctx.ellipse(1230, gy + 60, 360, 60, 0, Math.PI, TAU); ctx.fillStyle = mix(PAL.teal, PAL.ink, .3); ctx.fill();
    // ghost token floats up
    if (dt > .3) { const g = dt - .3; ctx.save(); ctx.globalAlpha = clamp(1 - g / 1.6) * .85; tokenChip(ctx, 1230 + Math.sin(g * 4) * 30, 540 - g * 220, 44, Math.sin(g * 3) * .3, { face: true, shadow: false }); ctx.beginPath(); ctx.ellipse(1230 + Math.sin(g * 4) * 30, 540 - g * 220 - 62, 34, 10, 0, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = PAL.yellow; ctx.stroke(); ctx.restore(); }
    // Zip brings a flower
    const walk = seg(t, t0 + .5, t0 + 1.0), zx = lerp(W + 150, 1640, E.outC(walk)), bow = seg(t, t0 + 1.1, t0 + 1.4);
    zipChar(ctx, zx, gy + 40, 120, { t, eyes: 'closed', mouth: 0, dy: -Math.abs(Math.sin(walk * Math.PI * 4)) * .12 * (1 - walk), rot: -bow * .18, hL: [-1.25, .35 - bow * .1], cL: [-1.05, .7], aR: .4, seed: 9 });
    const fx = zx - 1.25 * 120, fy = gy + 40 - 1.05 * 120 + (.35 - bow * .1) * 120;
    if (t < t0 + 1.25) flower(ctx, fx, fy + 60, 1.7, PAL.pink, -.4 - bow * .3); else flower(ctx, 1440, gy + 55, 1.7, PAL.pink, -.25);
    flower(ctx, 1010, gy + 55, 1.5, PAL.cream, .2); flower(ctx, 1080, gy + 60, 1.2, PAL.yellow, -.1);
    // "is dead."
    const k = slamIn(t, t0 + .05);
    ctx.save(); ctx.translate(430, 520); ctx.rotate(-.04); ctx.scale(k, k);
    txt(ctx, 'is dead.', 0, 0, { f: 'ser', s: 250 }, { align: 'center', fill: PAL.ink, shadow: [8, 10, PAL.blue, .45] });
    ctx.restore();
    txt(ctx, 'TOKENMAXING', 430, 290, { f: 'any', w: 900, wd: 62, s: 96 }, { align: 'center', fill: PAL.cream, shadow: [5, 7, PAL.ink, .3] });
  }
  function engineer(ctx, x, y, s, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
    const ink = PAL.ink, lw = 5 * s;
    const P = (pts, fill) => piece(ctx, pts.map(([a, b]) => [a * s, b * s]), { fill, ink, lw, sh: [6 * s, 8 * s], sha: .2 });
    // legs (sitting, knees forward)
    P([[-30, -20], [60, -30], [70, 0], [-30, 0]], PAL.ink);
    // torso hoodie
    ctx.save(); rr(ctx, -55 * s, -150 * s, 90 * s, 135 * s, 34 * s); ctx.fillStyle = PAL.pink; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke(); ctx.restore();
    // laptop
    P([[10, -40], [95, -40], [100, -30], [5, -30]], PAL.metal);
    P([[-5, -40], [70, -118], [80, -112], [8, -34]], PAL.metal);
    ctx.save(); ctx.translate(40 * s, -78 * s); ctx.rotate(-.8); tokenChip(ctx, 0, 0, 8 * s, 0, { shadow: false }); ctx.restore();
    // arm
    ctx.beginPath(); ctx.moveTo(10 * s, -120 * s); ctx.quadraticCurveTo(40 * s, -70 * s, 55 * s, -48 * s); ctx.lineWidth = 22 * s; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 13 * s; ctx.strokeStyle = PAL.pink; ctx.stroke();
    // head
    ctx.beginPath(); ctx.arc(-8 * s, -190 * s, 42 * s, 0, TAU); ctx.fillStyle = '#B97A57'; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke();
    // hair + bun
    ctx.beginPath(); ctx.arc(-8 * s, -196 * s, 44 * s, Math.PI * 1.05, Math.PI * 2.05); ctx.fillStyle = ink; ctx.fill();
    ctx.beginPath(); ctx.arc(-22 * s, -246 * s, 20 * s, 0, TAU); ctx.fill();
    // headphones
    ctx.beginPath(); ctx.arc(-8 * s, -196 * s, 50 * s, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 9 * s; ctx.strokeStyle = PAL.yellow; ctx.stroke();
    rr(ctx, 26 * s, -212 * s, 18 * s, 34 * s, 8 * s); ctx.fillStyle = PAL.yellow; ctx.fill(); ctx.lineWidth = 3 * s; ctx.strokeStyle = ink; ctx.stroke();
    // face
    const sc = o.scared;
    ctx.fillStyle = ink; [[4, -188], [26, -188]].forEach(([a, b]) => { ctx.beginPath(); sc ? ctx.arc(a * s, b * s, 6 * s, 0, TAU) : ctx.ellipse(a * s, b * s, 4 * s, 5 * s, 0, 0, TAU); ctx.fill(); });
    ctx.beginPath(); if (sc) ctx.ellipse(16 * s, -166 * s, 7 * s, 9 * s, 0, 0, TAU); else ctx.arc(16 * s, -172 * s, 8 * s, .1 * Math.PI, .9 * Math.PI); sc ? ctx.fill() : (ctx.lineWidth = 3 * s, ctx.stroke());
    ctx.restore();
  }
  function scale(ctx, t) {
    const t0 = T('t.forsome'), tEng = T('t.engineers');
    ctx.fillStyle = PAL.paper; ctx.fillRect(-100, -100, W + 200, H + 200);
    // text column
    const x = 110;
    if (t > t0 - .06) txt(ctx, 'FOR SOME AI TEAMS,', x, 230, { f: 'mono', s: 58, w: 800 }, { fill: PAL.ink, alpha: seg(t, t0 - .06, t0 + .06) });
    const a = T('t.tokens'); if (t > a - .06) { const k = popIn(t, a); ctx.save(); ctx.translate(x, 400); ctx.scale(k, k); txt(ctx, 'TOKENS NOW COST', 0, 0, { f: 'any', w: 900, wd: 70, s: fitSize(ctx, 'TOKENS NOW COST', { f: 'any', w: 900, wd: 70 }, 740) }, { fill: PAL.ink, mis: [5, 4, PAL.pink] }); ctx.restore(); }
    const b = T('t.more'); if (t > b - .06) txt(ctx, 'MORE THAN', x, 540, { f: 'any', w: 900, wd: 100, s: 110 }, { fill: PAL.ink, alpha: seg(t, b - .06, b + .04) });
    if (t > tEng - .06) { const k = slamIn(t, tEng); ctx.save(); ctx.translate(x, 740); ctx.scale(k, k); txt(ctx, 'engineers.', 0, 0, { f: 'ser', s: 220 }, { fill: PAL.pink, shadow: [7, 9, PAL.ink, .25] }); ctx.restore(); }
    // balance scale
    const cx = 1470, cy = 330, arm = 330;
    const nTok = Math.floor(clamp(seg(t, t0 + .1, tEng) * 1.05) * 26);
    const tip = tEng <= t ? lerp(-.03, .32, E.back(seg(t, tEng - .05, tEng + .25), 2.2)) : lerp(-.12, -.03, seg(t, t0, tEng)) + Math.sin(t * 7) * .01 * (t > t0 + .5 ? 1 : 0);
    // post
    piece(ctx, [[cx - 22, cy], [cx + 22, cy], [cx + 30, 930], [cx - 30, 930]], { fill: PAL.yellow, ink: PAL.ink, lw: 5 });
    piece(ctx, [[cx - 170, 930], [cx + 170, 930], [cx + 150, 980], [cx - 150, 980]], { fill: PAL.yellow, ink: PAL.ink, lw: 5 });
    // beam
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tip);
    piece(ctx, [[-arm - 20, -14], [arm + 20, -14], [arm + 20, 14], [-arm - 20, 14]], { fill: PAL.ink, sh: [8, 10] });
    ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, 30, 0, TAU); ctx.fillStyle = PAL.pink; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.ink; ctx.stroke();
    const pan = (sg) => { const px = cx + Math.cos(tip) * arm * sg, py = cy + Math.sin(tip) * arm * sg; return [px, py]; };
    const drawPan = ([px, py], fill) => {
      ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 150, py + 250); ctx.moveTo(px, py); ctx.lineTo(px + 150, py + 250); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 180, py + 250); ctx.quadraticCurveTo(px, py + 330, px + 180, py + 250); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
      return [px, py + 250];
    };
    const L = drawPan(pan(-1), PAL.metal), R = drawPan(pan(1), PAL.metal);
    // engineer sits on the left pan; launched a little at the slam
    const hop = t > tEng ? Math.max(0, Math.sin((t - tEng) * 7)) * 60 * Math.exp(-(t - tEng) * 3) : 0;
    engineer(ctx, L[0] - 20, L[1] - 4 - hop, 1.2, { scared: t > tEng, rot: t > tEng ? -.08 : 0 });
    // token pile on the right pan
    for (let i = 0; i < nTok; i++) {
      const row = Math.floor(Math.sqrt(i * 2)), col_ = i - row * (row + 1) / 2;
      const land = t0 + .1 + (i + 1) / 26 * (tEng - t0 - .1), drop = E.inQ(clamp((t - land + .18) / .18));
      const tx = R[0] - 120 + ((i * 53) % 240), ty = R[1] - 30 - Math.floor(i / 5) * 34 - (1 - drop) * 400;
      tokenChip(ctx, tx, ty, 34, hash(i) * .6 - .3, { face: i % 7 === 3 });
    }
    // price tags
    const tag = (x0, y0, str, col, k) => { if (k <= 0) return; ctx.save(); ctx.translate(x0, y0); ctx.rotate(-.12); ctx.scale(k, k); piece(ctx, [[-10, -34], [150, -34], [180, 0], [150, 34], [-10, 34]], { fill: col, ink: PAL.ink, lw: 4 }); ctx.beginPath(); ctx.arc(150, 0, 7, 0, TAU); ctx.fillStyle = PAL.paper; ctx.fill(); ctx.stroke(); txt(ctx, str, 60, 14, { f: 'mono', s: 36, w: 800 }, { align: 'center', fill: PAL.ink }); ctx.restore(); };
    tag(L[0] - 250, L[1] - 300, '$', PAL.cream, popIn(t, T('t.more')));
    tag(R[0] + 60, R[1] - 360, '$$$$', PAL.yellow, popIn(t, tEng));
  }
  function deadFrame(ctx, t) {
    if (t < T('t.isdead')) { inflateWord(ctx, t); popBurst(ctx, t); return; }
    if (t < T('t.forsome')) return grave(ctx, t);
    scale(ctx, t);
  }
  scene('dead', 16, 24, (ctx, t) => {
    const w0 = 23.45, w1 = 24.1;
    if (t < w0) return deadFrame(ctx, t);
    const A = buf('deadA'), ax = A.getContext('2d'); ax.setTransform(1, 0, 0, 1, 0, 0); deadFrame(ax, t);
    const B = sceneTo('race', t, 'deadB');
    dotWipe(ctx, A, B, E.inQ(seg(t, w0, w1)), { cx: 1470, cy: 700, pitch: 60 });
  });
})();
