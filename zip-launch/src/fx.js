// fx.js: transitions and full-frame effects.
'use strict';
// giant zipper teeth along a horizontal line. y(x) gives the edge; side -1 top, +1 bottom
function zipperTeeth(ctx, x0, x1, yFn, side, o = {}) {
  const p = o.pitch || 46, tw_ = p * .56, th = o.th || 30;
  // tape
  ctx.beginPath(); for (let x = x0; x <= x1; x += 10) ctx.lineTo(x, yFn(x) + side * th * .55);
  ctx.lineWidth = th * .9; ctx.strokeStyle = o.tape || PAL.violet; ctx.lineCap = 'butt'; ctx.stroke();
  const off = side < 0 ? 0 : p / 2;
  for (let x = Math.floor(x0 / p) * p + off; x <= x1 + p; x += p) {
    if (x < x0 - p / 2) continue;
    const y = yFn(x) + side * th * .1;
    ctx.save(); ctx.translate(x, y);
    rr(ctx, -tw_ / 2, -th / 2, tw_, th, th * .25); ctx.fillStyle = PAL.metal; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.stroke();
    ctx.fillStyle = rgba(PAL.cream, .9); ctx.fillRect(-tw_ * .3, -th * .3, tw_ * .16, th * .45);
    ctx.restore();
  }
}
function zipSlider(ctx, x, y, s, ang = 0, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  // shadow
  ctx.save(); ctx.translate(s * .1, s * .14); ctx.fillStyle = rgba(PAL.ink, .25); rr(ctx, -s * .6, -s * .45, s * 1.2, s * .9, s * .2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(0, s * .15); ctx.rotate(ang);
  rr(ctx, -s * .3, 0, s * .6, s * 1.25, s * .25); ctx.fillStyle = PAL.metal; ctx.fill(); ctx.lineWidth = s * .08; ctx.strokeStyle = PAL.ink; ctx.stroke();
  rr(ctx, -s * .12, s * .72, s * .24, s * .34, s * .12); ctx.fillStyle = PAL.ink; ctx.fill();
  ctx.fillStyle = rgba(PAL.cream, .9); ctx.fillRect(-s * .2, s * .15, s * .07, s * .45);
  ctx.restore();
  rr(ctx, -s * .6, -s * .45, s * 1.2, s * .9, s * .2); ctx.fillStyle = PAL.metal; ctx.fill(); ctx.lineWidth = s * .08; ctx.strokeStyle = PAL.ink; ctx.stroke();
  ctx.fillStyle = PAL.metalDk; ctx.fillRect(-s * .35, -s * .08, s * .7, s * .16);
  ctx.fillStyle = rgba(PAL.cream, .85); ctx.fillRect(-s * .45, -s * .32, s * .5, s * .08);
  ctx.restore();
}
// Signature transition: the outgoing frame unzips along a horizontal line, revealing the incoming frame.
// k 0..1. A: outgoing canvas, B: incoming canvas (or null = leave what's drawn). o.y line height, o.slope wedge
function zipWipe(ctx, A, B, k, o = {}) {
  const y0 = o.y ?? H / 2, m = o.slope ?? .42, s = o.s ?? 70;
  const sx = lerp(-160, W + 260, E.ioC(clamp(k / .85)));
  const fly = E.inC(seg(k, .78, 1)) * H * .75;
  const gap = x => Math.max(0, sx - x) * m;
  if (B) ctx.drawImage(B, 0, 0);
  // soft shadow cast by the two peeling halves onto the incoming frame (edge bands only)
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  const shK = 1 - seg(k, .7, .9);
  for (const [sg, a_] of [[-1, .18], [1, .22]]) {
    ctx.fillStyle = rgba(PAL.ink, a_ * shK); ctx.beginPath();
    const e = x => y0 + sg * (gap(x) / 2 + fly);
    ctx.moveTo(-10, e(-10)); ctx.lineTo(sx, y0); ctx.lineTo(sx, y0 + 30); ctx.lineTo(-10, e(-10) + (sg < 0 ? 46 : 46)); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // top half: region x<sx sheared upward; x>=sx untouched
  const half = (top) => {
    const sg = top ? -1 : 1;
    ctx.save();
    // closed part (right of slider)
    ctx.beginPath(); ctx.rect(sx, top ? -10 : y0, W - sx + 10, top ? y0 + 10 : H - y0 + 10); ctx.clip();
    ctx.translate(0, sg * fly); ctx.drawImage(A, 0, 0); ctx.restore();
    // open part (left of slider), sheared: y' = y + sg * (sx - x) * m / 2
    ctx.save();
    ctx.beginPath();
    if (top) { ctx.moveTo(-10, -H); ctx.lineTo(sx, -H); ctx.lineTo(sx, y0); ctx.lineTo(-10, y0 - gap(-10) / 2 - fly); }
    else { ctx.moveTo(-10, H * 2); ctx.lineTo(sx, H * 2); ctx.lineTo(sx, y0); ctx.lineTo(-10, y0 + gap(-10) / 2 + fly); }
    ctx.closePath(); ctx.clip();
    ctx.translate(0, sg * fly);
    ctx.transform(1, -sg * m / 2, 0, 1, 0, sg * sx * m / 2); // y += sg*(sx - x)*m/2
    ctx.beginPath(); ctx.rect(-10, top ? -H : y0, sx + 10, top ? H + y0 : H * 2); ctx.clip();
    ctx.drawImage(A, 0, 0);
    ctx.restore();
  };
  half(true); half(false);
  // teeth on both edges
  const yTop = x => y0 - gap(x) / 2 - (x < sx ? fly : fly), yBot = x => y0 + gap(x) / 2 + fly;
  zipperTeeth(ctx, -40, W + 40, yTop, -1, { th: s * .42, pitch: s * .66 });
  zipperTeeth(ctx, -40, W + 40, yBot, 1, { th: s * .42, pitch: s * .66 });
  if (k < .86) zipSlider(ctx, sx, y0, s, -.25 + Math.sin(k * 30) * .1);
}
// incoming frame revealed by growing halftone dots (riso dissolve)
function dotWipe(ctx, A, B, k, o = {}) {
  ctx.drawImage(A, 0, 0);
  if (k <= 0) return;
  const p = o.pitch || 64, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, D = Math.hypot(W, H) / 2;
  ctx.save(); ctx.beginPath();
  for (let y = -p; y < H + p; y += p) for (let x = -p; x < W + p; x += p) {
    const xx = x + ((y / p) % 2 ? p / 2 : 0), d = Math.hypot(xx - cx, y - cy) / D;
    const r = clamp((k * 1.6 - d * .6) * 1.25) * p * .75; if (r <= 0) continue;
    ctx.moveTo(xx + r, y); ctx.arc(xx, y, r, 0, TAU);
  }
  ctx.clip(); ctx.drawImage(B, 0, 0); ctx.restore();
}
// push: A slides out, B slides in (with paper shadow on the leading edge)
function pushWipe(ctx, A, B, k, dir = [-1, 0]) {
  const e = E.ioQt(clamp(k)), dx = dir[0] * W * e, dy = dir[1] * H * e;
  ctx.drawImage(A, dx, dy);
  ctx.save(); ctx.translate(dx - dir[0] * W, dy - dir[1] * H);
  ctx.fillStyle = rgba(PAL.ink, .3); ctx.fillRect(-dir[0] * 18, -dir[1] * 18, W, H);
  ctx.drawImage(B, 0, 0); ctx.restore();
}
// directional smear (whip-pan motion blur) of what is on ctx
function smear(ctx, dx, dy, n = 6) {
  if (Math.abs(dx) + Math.abs(dy) < 1) return;
  const c = buf('_smear'), x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.drawImage(ctx.canvas, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 1; i <= n; i++) { ctx.globalAlpha = .5 / i; ctx.drawImage(c, dx * i / n, dy * i / n); }
  ctx.restore();
}
// flash of a flat ink at strength k (screen-space)
function flash(ctx, k, col = PAL.cream) { if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(k); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// riso crop + registration marks in the corners
function regMarks(ctx, col = PAL.pink, a = .7) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.strokeStyle = rgba(col, a); ctx.lineWidth = 2;
  const m = 34, L = 26;
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(x - sx * 10, y); ctx.lineTo(x + sx * L, y); ctx.moveTo(x, y - sy * 10); ctx.lineTo(x, y + sy * L); ctx.stroke();
  });
  const reg = (x, y) => { ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.moveTo(x - 15, y); ctx.lineTo(x + 15, y); ctx.moveTo(x, y - 15); ctx.lineTo(x, y + 15); ctx.stroke(); };
  reg(W / 2, 22); reg(W / 2, H - 22);
  ctx.restore();
}
