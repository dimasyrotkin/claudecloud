// cast.js: props and supporting characters.
'use strict';
// token chip: rounded hexagon, yellow, ink outline. o: face, col, t
function tokenChip(ctx, x, y, r, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(o.sx ?? 1, 1);
  const hex = k => { const p = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.PI / 6; p.push([Math.cos(a) * r * k, Math.sin(a) * r * k]); } return p; };
  if (o.shadow !== false) { ctx.save(); ctx.translate(r * .12, r * .16); smoothPts(ctx, hex(1), true, .18); ctx.fillStyle = rgba(PAL.ink, .22); ctx.fill(); ctx.restore(); }
  smoothPts(ctx, hex(1), true, .18); ctx.fillStyle = o.col || PAL.yellow; ctx.fill(); ctx.lineWidth = Math.max(1.5, r * .09); ctx.strokeStyle = PAL.ink; ctx.stroke();
  smoothPts(ctx, hex(.68), true, .18); ctx.lineWidth = Math.max(1, r * .05); ctx.strokeStyle = rgba(PAL.ink, .55); ctx.stroke();
  if (o.face) {
    ctx.fillStyle = PAL.ink; [-1, 1].forEach(k => { ctx.beginPath(); ctx.ellipse(k * r * .22, -r * .05, r * .07, r * .1, 0, 0, TAU); ctx.fill(); });
    ctx.beginPath(); ctx.arc(0, r * .12, r * .1, .15 * Math.PI, .85 * Math.PI); ctx.lineWidth = r * .05; ctx.stroke();
  } else {
    txt(ctx, 'T', 0, r * .2, { f: 'any', s: r * .62, w: 900, wd: 80 }, { align: 'center', fill: rgba(PAL.ink, .7) });
  }
  ctx.fillStyle = rgba(PAL.cream, .8); ctx.beginPath(); ctx.ellipse(-r * .42, -r * .42, r * .16, r * .07, -.7, 0, TAU); ctx.fill();
  ctx.restore();
}
// scissors, pivot at (x, y), pointing +x. open = blade angle (rad)
function scissors(ctx, x, y, s, open = .3, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const blade = sg => {
    ctx.save(); ctx.rotate(sg * open / 2);
    // shadow
    ctx.save(); ctx.translate(s * .06, s * .09); ctx.beginPath(); ctx.moveTo(-s * .1, 0); ctx.quadraticCurveTo(s * .5, -sg * s * .09, s * 1.15, sg * s * .01); ctx.lineTo(s * .45, sg * s * .08); ctx.lineTo(-s * .1, sg * s * .06); ctx.closePath(); ctx.fillStyle = rgba(PAL.ink, .2); ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-s * .1, 0); ctx.quadraticCurveTo(s * .5, -sg * s * .09, s * 1.15, sg * s * .01); ctx.lineTo(s * .45, sg * s * .08); ctx.lineTo(-s * .1, sg * s * .06); ctx.closePath();
    ctx.fillStyle = PAL.metal; ctx.fill(); ctx.lineWidth = s * .025; ctx.strokeStyle = PAL.ink; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * .05, -sg * s * .015); ctx.lineTo(s * .9, -sg * s * .02); ctx.lineWidth = s * .015; ctx.strokeStyle = rgba(PAL.cream, .9); ctx.stroke();
    // handle loop
    ctx.save(); ctx.translate(-s * .42, sg * s * .16); ctx.rotate(-sg * .35);
    ctx.beginPath(); ctx.ellipse(0, 0, s * .3, s * .18, 0, 0, TAU); ctx.ellipse(0, 0, s * .17, s * .08, 0, TAU, 0, true);
    ctx.fillStyle = PAL.pink; ctx.fill('evenodd'); ctx.lineWidth = s * .025; ctx.strokeStyle = PAL.ink; ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-s * .12, sg * s * .03); ctx.lineTo(-s * .2, sg * s * .1); ctx.lineWidth = s * .09; ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round'; ctx.stroke();
    ctx.lineWidth = s * .05; ctx.strokeStyle = PAL.pink; ctx.stroke();
    ctx.restore();
  };
  blade(1); blade(-1);
  ctx.beginPath(); ctx.arc(0, 0, s * .045, 0, TAU); ctx.fillStyle = PAL.metalDk; ctx.fill(); ctx.lineWidth = s * .02; ctx.strokeStyle = PAL.ink; ctx.stroke();
  ctx.restore();
}
const BLOAT_TXT = ['{"role":"system","content":"You are a helpful', 'Traceback (most recent call last):', '  File "/app/main.py", line 4096', 'import os, sys, json, re, time, math', '<!-- TODO: remove this -->', '"messages": [{"role":"user",', '[INFO] 2026-09-30 retrying... retrying...', 'lorem ipsum dolor sit amet lorem ipsum', 'node_modules/node_modules/node_modules/', '    at Object.<anonymous> (index.js:1:1)', '############################', '...(truncated 48,213 lines)...', 'def helper_helper_helper(self, *args):', '"tool_result": "OK OK OK OK OK OK OK"'];
// Bloat: overinflated blob stuffed with tokens. (x, y) centre, r radius. o: t, puff (0..1 breathing), squeeze (0..1 zipped), eyes, mouth
function bloat(ctx, x, y, r, o = {}) {
  const t = o.t ?? 0, sq = clamp(o.squeeze ?? 0), puff = o.puff ?? Math.sin(t * 3) * .5 + .5;
  ctx.save(); ctx.translate(x, y);
  const sx = lerp(1 + puff * .04, .42, E.ioC(sq)), sy = lerp(1 - puff * .03, .42, E.ioC(sq));
  ctx.scale(sx, sy);
  const pts = blobPts(0, 0, r, 56, lerp(.1, .02, sq), 7, t * .4, .004, t);
  // shadow
  ctx.save(); ctx.translate(r * .05, r * .07); smoothPts(ctx, pts); ctx.fillStyle = rgba(PAL.ink, .22); ctx.fill(); ctx.restore();
  // sticker border
  smoothPts(ctx, pts); ctx.lineWidth = r * .07; ctx.strokeStyle = PAL.cream; ctx.lineJoin = 'round'; ctx.stroke();
  smoothPts(ctx, pts); ctx.fillStyle = o.col || PAL.yellowLt; ctx.fill();
  ctx.save(); smoothPts(ctx, pts); ctx.clip();
  // stuffed text
  ctx.globalAlpha = .45; const lh = r * .085;
  for (let i = 0, row = -14; row < 14; row++, i++) {
    const line = BLOAT_TXT[(i * 5 + 3) % BLOAT_TXT.length];
    txt(ctx, line + '  ' + line, -r * 1.4 + ((row * 37) % 60) - (t * 20 % 200), row * lh, { f: 'mono', s: lh * .78, w: 500 }, { fill: PAL.ink });
  }
  ctx.globalAlpha = 1;
  halftone(ctx, -r * 1.2, -r * 1.2, r * 1.2, r * 1.2, (px, py) => clamp((px / r * .5 + py / r * .7 - .1) * 1.2), { pitch: r * .07, color: rgba(PAL.pink, .75), angle: .3 });
  ctx.fillStyle = rgba(PAL.cream, .8); ctx.beginPath(); ctx.ellipse(-r * .45, -r * .55, r * .25, r * .1, -.6, 0, TAU); ctx.fill();
  ctx.restore();
  smoothPts(ctx, pts); ctx.lineWidth = r * .025; ctx.strokeStyle = PAL.ink; ctx.stroke();
  // face
  const eyes = o.eyes || 'tired';
  [-1, 1].forEach(k => {
    const ex = k * r * .28, ey = -r * .12;
    if (eyes === 'tired') {
      ctx.beginPath(); ctx.ellipse(ex, ey, r * .11, r * .09, 0, 0, TAU); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.lineWidth = r * .016; ctx.strokeStyle = PAL.ink; ctx.stroke();
      ctx.beginPath(); ctx.arc(ex + r * .02, ey + r * .025, r * .045, 0, TAU); ctx.fillStyle = PAL.ink; ctx.fill();
      ctx.beginPath(); ctx.ellipse(ex, ey, r * .115, r * .095, 0, Math.PI, TAU); ctx.fillStyle = mix(o.col || PAL.yellowLt, PAL.pink, .25); ctx.fill(); ctx.stroke();
      // eye bags
      ctx.beginPath(); ctx.arc(ex, ey + r * .08, r * .08, .2 * Math.PI, .8 * Math.PI); ctx.lineWidth = r * .01; ctx.stroke();
    } else if (eyes === 'x') {
      ctx.lineWidth = r * .03; ctx.strokeStyle = PAL.ink; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - r * .07, ey - r * .07); ctx.lineTo(ex + r * .07, ey + r * .07); ctx.moveTo(ex + r * .07, ey - r * .07); ctx.lineTo(ex - r * .07, ey + r * .07); ctx.stroke();
    } else if (eyes === 'dot') {
      ctx.beginPath(); ctx.ellipse(ex, ey, r * .1, r * .13, 0, 0, TAU); ctx.fillStyle = PAL.ink; ctx.fill(); ctx.fillStyle = PAL.cream; ctx.beginPath(); ctx.arc(ex + r * .035, ey - r * .04, r * .04, 0, TAU); ctx.fill();
    }
  });
  const mo = o.mouth ?? .7;
  ctx.beginPath(); ctx.ellipse(r * .02, r * .2, r * .2, r * .03 + r * .12 * mo, .05, 0, TAU); ctx.fillStyle = PAL.violet; ctx.fill(); ctx.lineWidth = r * .02; ctx.strokeStyle = PAL.ink; ctx.stroke();
  if (mo > .3) { ctx.save(); ctx.beginPath(); ctx.ellipse(r * .02, r * .2, r * .2, r * .03 + r * .12 * mo, .05, 0, TAU); ctx.clip(); ctx.fillStyle = PAL.pink; ctx.beginPath(); ctx.ellipse(r * .06, r * .3, r * .12, r * .07, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // sweat
  if (o.sweat !== false) {
    [[.55, -.45], [-.62, -.3]].forEach(([dx, dy], i) => {
      const ph = frac(t * .7 + i * .5), yy = dy * r + ph * r * .25;
      ctx.save(); ctx.translate(dx * r, yy); ctx.globalAlpha = 1 - ph * .6;
      ctx.beginPath(); ctx.moveTo(0, -r * .07); ctx.quadraticCurveTo(r * .05, 0, 0, r * .04); ctx.quadraticCurveTo(-r * .05, 0, 0, -r * .07);
      ctx.fillStyle = PAL.blueLt; ctx.fill(); ctx.lineWidth = r * .012; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore();
    });
  }
  ctx.restore();
}
