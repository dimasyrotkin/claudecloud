// core.js: constants, math, seeded noise, colour, paper/riso textures, drawing primitives, camera.
// Everything is a pure function of t. No Math.random, no clocks.
'use strict';
const W = 1920, H = 1080, FPS = 30, BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;
const TAU = Math.PI * 2;

const PAL = {
  paper: '#F4EDE0', paper2: '#EFE6D5', ink: '#1B1A2B', blue: '#2748E8', pink: '#FF4FB0', yellow: '#FFD84D',
  violet: '#27169F', red: '#FF4535', teal: '#274046', green: '#00A95C', cream: '#FFF8EC', grey: '#B9B2A6',
  blueLt: '#8FA2F5', pinkLt: '#FFB3DB', yellowLt: '#FFEBA6', metal: '#D9D6CF', metalDk: '#8E8A84', night: '#15142A',
};

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => (x - a) / (b - a);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const frac = x => x - Math.floor(x);
const E = {
  lin: x => x,
  sm: x => x * x * (3 - 2 * x),
  inQ: x => x * x, outQ: x => 1 - (1 - x) * (1 - x),
  inC: x => x * x * x, outC: x => 1 - Math.pow(1 - x, 3), ioC: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outQt: x => 1 - Math.pow(1 - x, 4), ioQt: x => x < .5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2,
  inX: x => x === 0 ? 0 : Math.pow(2, 10 * x - 10), outX: x => x === 1 ? 1 : 1 - Math.pow(2, -10 * x),
  ioX: x => x === 0 ? 0 : x === 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  back: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  inBack: (x, s = 1.70158) => (s + 1) * x * x * x - s * x * x,
  el: x => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1,
};
// damped spring 0→1 after time dt (s). f = frequency (Hz), z = damping ratio
const spring = (dt, f = 3, z = .35) => { if (dt <= 0) return 0; const w = TAU * f, wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + z * w / wd * Math.sin(wd * dt)); };
// keyframes: kf(t, [[t0, v0], [t1, v1, ease?], ...]) values may be numbers or arrays
function kf(t, keys, ease = E.ioC) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1], k = (e || ease)((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------- seeded randomness ----------
function hash(n) { let x = Math.imul((n | 0) ^ 0x9E3779B9, 0x85EBCA6B); x ^= x >>> 13; x = Math.imul(x, 0xC2B2AE35); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
const hash2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash2(i, seed), hash2(i + 1, seed), u) * 2 - 1; }
function noise2(x, y, seed = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const h = (a, b) => hash(Math.imul(a, 374761393) ^ Math.imul(b, 668265263) ^ Math.imul(seed, 2246822519));
  return lerp(lerp(h(i, j), h(i + 1, j), u), lerp(h(i, j + 1), h(i + 1, j + 1), u), v) * 2 - 1;
}
// stop-motion boil: 12 drawings per second
const boilN = t => Math.floor(t * 12 + 1e-6);
const jit = (t, i, amp = 1) => (hash2(boilN(t) * 7 + 3, i) * 2 - 1) * amp;

// ---------- beat ----------
const bpos = t => t / BEAT;
const pulse = (t, k = 6, off = 0) => { const p = frac((t - off) / BEAT); return Math.exp(-p * k); };
const pulseBar = (t, k = 4) => Math.exp(-frac(t / BAR) * k);
const onBeat = (t, t0) => t >= t0;

// ---------- colour ----------
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => lerp(v, B[i], k))); };
const mul = (a, b) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v * B[i] / 255)); };
const rgba = (h, a) => { const c = hexRgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

// ---------- canvases & textures ----------
function mkCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const TEX = {};
function buildTextures() {
  // paper luminance maps (multiplied over the frame): near white with tooth, fibres, soft tone. 3 variants for boil.
  TEX.paper = [0, 1, 2].map(k => {
    const c = mkCanvas(), x = c.getContext('2d'), img = x.createImageData(W, H), d = img.data, r = rng(101 + k);
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const i = (py * W + px) * 4;
      const tone = noise2(px / 380, py / 380, 7) * 4 + noise2(px / 90, py / 90, 9 + k) * 2.5;
      const tooth = (r() - .5) * 13;
      const v = 247 + tone + tooth;
      d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 4; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    // fibres
    for (let n = 0; n < 2600; n++) {
      const fx = r() * W, fy = r() * H, a = r() * TAU, L = 6 + r() * 26, dark = r() < .7;
      x.strokeStyle = dark ? `rgba(120,105,85,${.05 + r() * .09})` : `rgba(255,255,255,${.25 + r() * .3})`;
      x.lineWidth = .5 + r() * .9; x.beginPath(); x.moveTo(fx, fy);
      x.quadraticCurveTo(fx + Math.cos(a) * L * .5 + (r() - .5) * 6, fy + Math.sin(a) * L * .5 + (r() - .5) * 6, fx + Math.cos(a) * L, fy + Math.sin(a) * L); x.stroke();
    }
    // a few flecks
    for (let n = 0; n < 220; n++) { x.fillStyle = `rgba(90,80,70,${.08 + r() * .15})`; x.beginPath(); x.arc(r() * W, r() * H, .6 + r() * 1.3, 0, TAU); x.fill(); }
    return c;
  });
  // riso ink mottle (screened over the frame): lightens solid inks unevenly, invisible on paper
  TEX.mottle = [0, 1, 2].map(k => {
    const c = mkCanvas(W / 2, H / 2), x = c.getContext('2d'), img = x.createImageData(W / 2, H / 2), d = img.data, r = rng(301 + k);
    for (let py = 0; py < H / 2; py++) for (let px = 0; px < W / 2; px++) {
      const i = (py * W / 2 + px) * 4;
      const m = Math.max(0, noise2(px / 40, py / 40, 30 + k) * 18 + noise2(px / 9, py / 9, 40 + k) * 10 + (r() < .035 ? 60 + r() * 60 : 0));
      d[i] = d[i + 1] = d[i + 2] = m; d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0); return c;
  });
  // vignette
  TEX.vig = mkCanvas(); { const x = TEX.vig.getContext('2d'), g = x.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, '#fff'); g.addColorStop(1, '#d9d0c4'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
}

// final print pass: ink mottle, paper tooth, vignette
function finish(ctx, t, o = {}) {
  const k = boilN(t) % 3;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.mottle ?? .55; ctx.drawImage(TEX.mottle[k], 0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = o.paper ?? 1; ctx.drawImage(TEX.paper[k], 0, 0);
  ctx.globalAlpha = o.vig ?? .8; ctx.drawImage(TEX.vig, 0, 0);
  ctx.restore();
}

// ---------- geometry ----------
function pathPts(ctx, pts, close = true) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
// smooth closed path through points (Catmull-Rom → Bezier)
function smoothPts(ctx, pts, close = true, tension = .5) {
  const n = pts.length; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  const P = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const m = close ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k = tension / 3;
    ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  if (close) ctx.closePath();
}
function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// superellipse (squircle) points
function squirclePts(cx, cy, rx, ry, n = 4.2, N = 64, wob = 0, seed = 0, t = 0) {
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * TAU, c = Math.cos(a), s = Math.sin(a);
    const j = wob ? 1 + jit(t, seed * 1000 + i, wob) : 1;
    pts.push([cx + Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * rx * j, cy + Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * ry * j]);
  }
  return pts;
}
function ellPts(cx, cy, rx, ry, N = 48, wob = 0, seed = 0, t = 0, rot = 0) {
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * TAU + rot, j = wob ? 1 + jit(t, seed * 1000 + i, wob) : 1;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return pts;
}
// organic blob with noise radius (for Bloat, clouds)
function blobPts(cx, cy, r, N = 40, amp = .12, seed = 0, phase = 0, wob = 0, t = 0) {
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * TAU;
    const rr_ = r * (1 + amp * noise1(Math.cos(a) * 2 + phase, seed) + amp * .6 * noise1(Math.sin(a) * 3 + phase * 1.3, seed + 5) + (wob ? jit(t, seed * 999 + i, wob) : 0));
    pts.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]);
  }
  return pts;
}
// torn / hand-cut paper rectangle: jagged edges, stable per seed, boils slightly
function tornPts(x, y, w, h, seed = 0, amp = 4, step = 18, t = null) {
  const pts = [], r = rng(seed);
  const edge = (x0, y0, x1, y1, nx, ny) => {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / step));
    for (let i = 0; i < n; i++) {
      const k = i / n, d = (r() - .5) * 2 * amp + (t !== null ? jit(t, seed * 31 + pts.length, amp * .25) : 0);
      pts.push([lerp(x0, x1, k) + nx * d, lerp(y0, y1, k) + ny * d]);
    }
  };
  edge(x, y, x + w, y, 0, -1); edge(x + w, y, x + w, y + h, 1, 0); edge(x + w, y + h, x, y + h, 0, 1); edge(x, y + h, x, y, -1, 0);
  return pts;
}
const tr = (pts, dx, dy, s = 1) => pts.map(p => [p[0] * s + dx, p[1] * s + dy]);

// ---------- paint helpers ----------
// a paper piece: hard offset shadow + fill + optional ink line
function piece(ctx, pts, o = {}) {
  const smooth = o.smooth ?? false, draw = () => smooth ? smoothPts(ctx, pts) : pathPts(ctx, pts);
  if (o.shadow !== false) {
    const [sx, sy] = o.sh || [8, 10];
    ctx.save(); ctx.translate(sx, sy); draw(); ctx.fillStyle = rgba(o.shc || PAL.ink, o.sha ?? .22); ctx.fill(); ctx.restore();
  }
  draw();
  if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); }
  if (o.ink) { ctx.lineWidth = o.lw || 3; ctx.strokeStyle = o.ink; ctx.lineJoin = 'round'; ctx.stroke(); }
}
// halftone dots in a rectangle; fn(x, y) returns 0..1 coverage
function halftone(ctx, x0, y0, x1, y1, fn, o = {}) {
  const p = o.pitch || 12, ang = o.angle ?? .26, ca = Math.cos(ang), sa = Math.sin(ang);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + p;
  ctx.fillStyle = o.color || PAL.ink; ctx.beginPath();
  for (let v = -R; v <= R; v += p) for (let u = -R; u <= R; u += p) {
    const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
    if (x < x0 - p || x > x1 + p || y < y0 - p || y > y1 + p) continue;
    const k = fn(x, y); if (k <= .02) continue;
    const r = Math.sqrt(clamp(k)) * p * .62;
    ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU);
  }
  ctx.fill();
}
// 4-point sparkle
function sparkle(ctx, x, y, r, rot = 0, col = PAL.cream, thin = .22) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr_ = i % 2 ? r * thin : r; ctx.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.restore();
}
function starPts(cx, cy, r, inner = .45, n = 5, rot = -Math.PI / 2) { const pts = []; for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, rr_ = i % 2 ? r * inner : r; pts.push([cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); } return pts; }
// scribble underline / marker stroke
function scribble(ctx, x0, y0, x1, y1, o = {}) {
  const n = o.n || 3, amp = o.amp || 10, seed = o.seed || 1, prog = o.prog ?? 1;
  ctx.save(); ctx.strokeStyle = o.color || PAL.pink; ctx.lineWidth = o.lw || 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); const steps = 40 * n, lim = Math.floor(steps * prog);
  for (let i = 0; i <= lim; i++) {
    const k = i / steps, pass = Math.floor(k * n), kk = frac(k * n), dir = pass % 2 ? 1 - kk : kk;
    const x = lerp(x0, x1, dir) + noise1(i * .3, seed) * 4, y = lerp(y0, y1, dir) + (pass - (n - 1) / 2) * amp * .5 + noise1(i * .2, seed + 3) * amp * .3;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke(); ctx.restore();
}
// flat full-frame flood
function flood(ctx, col) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// sunburst (idol stage) behind characters
function sunburst(ctx, cx, cy, n, R, rot, colA, colB) {
  ctx.fillStyle = colA; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.fillStyle = colB; ctx.beginPath();
  for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = a0 + TAU / n / 2; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); ctx.lineTo(cx + Math.cos(a1) * R, cy + Math.sin(a1) * R); ctx.closePath(); }
  ctx.fill();
}

// ---------- camera ----------
// put world point (x, y) at screen centre with zoom z and rotation r
function camApply(ctx, c) { ctx.translate(W / 2, H / 2); ctx.rotate(c.r || 0); ctx.scale(c.z || 1, c.z || 1); ctx.translate(-(c.x ?? W / 2), -(c.y ?? H / 2)); }
function shake(t, amp, t0 = -99, decay = 6, seed = 1) {
  const k = t >= t0 ? Math.exp(-(t - t0) * decay) : 0; const a = amp * k;
  return [noise1(t * 40, seed) * a, noise1(t * 40, seed + 9) * a];
}
