// type.js: variable-width display type (Anybody 50–150 %), serif accent, mono. Kinetic helpers.
'use strict';
const WD_STEP = 2;
async function loadFonts() {
  const get = async u => (await fetch(u)).arrayBuffer();
  const any = await get('assets/fonts/anybody.woff2');
  const faces = [];
  for (let w = 50; w <= 150; w += WD_STEP) faces.push(new FontFace('any' + w, any, { stretch: w + '%', weight: '100 900' }));
  faces.push(new FontFace('ser', await get('assets/fonts/instrument-italic.woff2'), { style: 'normal' }));
  faces.push(new FontFace('serR', await get('assets/fonts/instrument.woff2')));
  faces.push(new FontFace('mono', await get('assets/fonts/jbmono.woff2'), { weight: '100 800' }));
  await Promise.all(faces.map(f => f.load()));
  faces.forEach(f => document.fonts.add(f));
}
// style: { f: 'any'|'ser'|'serR'|'mono', s: size px, w: weight, wd: width % }
function fontStr(st) {
  const f = st.f || 'any', s = st.s || 100;
  if (f === 'any') { const wd = clamp(Math.round((st.wd ?? 100) / WD_STEP) * WD_STEP, 50, 150); return `${st.w ?? 900} ${s}px any${wd}`; }
  if (f === 'mono') return `${st.w ?? 600} ${s}px mono`;
  return `400 ${s}px ${f}`;
}
function setFont(ctx, st) { ctx.font = fontStr(st); ctx.letterSpacing = (st.ls || 0) + 'px'; }
function tw(ctx, str, st) { setFont(ctx, st); return ctx.measureText(str).width; }
// size that fits str into maxW
function fitSize(ctx, str, st, maxW) { const w = tw(ctx, str, { ...st, s: 100 }); return 100 * maxW / w; }

// draw text with optional riso misregistration plate, hard shadow and stroke. align: 'left'|'center'|'right'. baseline: alphabetic by default.
function txt(ctx, str, x, y, st, o = {}) {
  setFont(ctx, st);
  ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
  if (o.alpha !== undefined) { ctx.save(); ctx.globalAlpha *= o.alpha; }
  if (o.shadow) { const [sx, sy, c, a] = o.shadow; ctx.fillStyle = rgba(c || PAL.ink, a ?? .25); ctx.fillText(str, x + sx, y + sy); }
  if (o.mis) { // second plate, multiplied, offset
    let [mx, my, mc] = o.mis; const kk = Math.exp(-frac((NOW - .5) / 1.0) * 7) * 1.1; mx += Math.sign(mx) * kk * 7; my += Math.sign(my) * kk * 4; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = mc || PAL.pink; ctx.fillText(str, x + mx, y + my); ctx.restore();
  }
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.stroke[0]; ctx.strokeStyle = o.stroke[1]; ctx.strokeText(str, x, y); }
  if (o.fill !== null) { ctx.fillStyle = o.fill || PAL.ink; if (o.multiply) { ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillText(str, x, y); ctx.restore(); } else ctx.fillText(str, x, y); }
  if (o.alpha !== undefined) ctx.restore();
  ctx.letterSpacing = '0px';
}

// per-letter kinetic text. fn(i, n, ch) returns { dx, dy, s (scale), r (rot), a (alpha), wd (width override), fill }
// letters are laid out from their own widths (so width can vary per letter), anchored by align.
function letters(ctx, str, x, y, st, fn, o = {}) {
  const chars = [...str], n = chars.length, L = chars.map((ch, i) => { const f = fn ? fn(i, n, ch) : {}; const s2 = { ...st, wd: f.wd ?? st.wd }; return { ch, f, s2, w: tw(ctx, ch, s2) + (st.ls || 0) }; });
  const total = L.reduce((a, l) => a + l.w, 0) - (st.ls || 0);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  for (const l of L) {
    const f = l.f; if ((f.a ?? 1) <= 0) { cx += l.w; continue; }
    ctx.save(); ctx.translate(cx + l.w / 2 + (f.dx || 0), y + (f.dy || 0)); ctx.rotate(f.r || 0); ctx.scale(f.s ?? 1, f.sy ?? f.s ?? 1);
    txt(ctx, l.ch, 0, 0, { ...l.s2, ls: 0 }, { ...o, align: 'center', alpha: f.a ?? 1, fill: f.fill || o.fill });
    ctx.restore(); cx += l.w;
  }
  return total;
}

// pop-in scale for a word landing at t0 (with anticipation lead-in so frame at t0 already reads)
const popIn = (t, t0, dur = .28) => t < t0 - .06 ? 0 : E.back(clamp((t - t0 + .06) / dur), 2.2);
const slamIn = (t, t0) => { const k = clamp((t - t0 + .05) / .18); return t < t0 - .05 ? 0 : lerp(2.2, 1, E.outX(k)); };

// ransom-note scrap: text on a torn paper piece
function scrap(ctx, str, x, y, st, o = {}) {
  const w = tw(ctx, str, st), pad = o.pad ?? st.s * .18, h = st.s * (o.hk ?? .92);
  const pts = tornPts(-w / 2 - pad, -h / 2 - pad * .6, w + pad * 2, h + pad * 1.2, o.seed || 1, o.torn ?? 3, 14, o.t ?? null);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(o.s ?? 1, o.s ?? 1);
  piece(ctx, pts, { fill: o.bg || PAL.cream, sh: o.sh || [10, 12], sha: o.sha ?? .28 });
  txt(ctx, str, 0, h * .36, st, { align: 'center', fill: o.fg || PAL.ink, mis: o.mis });
  ctx.restore();
  return { w: w + pad * 2, h: h + pad * 1.2 };
}
// rubber stamp: rotated rounded box outline + text, ink texture via halftone knockouts
function stamp(ctx, str, x, y, st, o = {}) {
  const k = o.k ?? 1; if (k <= 0) return;
  const w = tw(ctx, str, st), pad = st.s * .3, h = st.s * 1.1;
  const sc = lerp(1.9, 1, E.outX(clamp(k * 1.4))), a = clamp(k * 3);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -.12); ctx.scale(sc, sc); ctx.globalAlpha *= a;
  const col = o.color || PAL.pink;
  ctx.save(); ctx.globalCompositeOperation = o.multiply === false ? 'source-over' : 'multiply';
  rr(ctx, -w / 2 - pad, -h / 2, w + pad * 2, h, st.s * .16); ctx.lineWidth = st.s * .09; ctx.strokeStyle = col; ctx.stroke();
  if (o.fillBox) { ctx.fillStyle = col; ctx.fill(); }
  txt(ctx, str, 0, st.s * .36, st, { align: 'center', fill: o.fillBox ? (o.fg || PAL.cream) : col });
  ctx.restore();
  // worn ink: knock a few paper-coloured specks out of the stamp
  const r = rng(o.seed || 5); ctx.fillStyle = rgba(o.paper || PAL.paper, .55);
  for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc((r() - .5) * (w + pad * 2), (r() - .5) * h, 1 + r() * st.s * .03, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// odometer number rolling from a to b (integers), per digit vertical roll
function odometer(ctx, x, y, from, to, k, st, o = {}) {
  const v = lerp(from, to, k), str = (o.fmt || (n => String(Math.round(n))))(v);
  txt(ctx, str, x, y, st, o);
  return str;
}
