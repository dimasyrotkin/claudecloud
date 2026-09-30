// zip.js: Zip, the mascot. A die-cut sticker idol: blue squircle, zipper mouth, sparkle eyes.
// zipChar(ctx, x, y, s, o): (x, y) = ground point under the feet, s = unit (body half-width in px).
// o: dy (hop, in s), sq (squash +wide), rot, flip, look [lx, ly], eyes, blink, brow, mouth (open 0..1), slider (0..1, 1 = right end),
//    hL/hR hand targets in body-local s units [x, y] (origin = body centre) or aL/aR arm angles (0 = down, PI/2 = out, PI = up),
//    blush, col, t (for boil), pull (tab swing angle), noFeet, sticker, shadow, emote
'use strict';
function zipChar(ctx, x, y, s, o = {}) {
  const t = o.t ?? 0, col = o.col || PAL.blue, colDk = mul(col, '#8C7FD0'), ink = PAL.ink, lw = s * .055;
  const sq = o.sq || 0, flip = o.flip ? -1 : 1;
  ctx.save();
  ctx.translate(x, y);
  // ground shadow (not affected by hop height except shrink)
  if (o.shadow !== false) {
    const hop = Math.max(0, -(o.dy || 0)); const k = 1 / (1 + hop * .8);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(PAL.ink, .16 * k);
    ctx.beginPath(); ctx.ellipse(0, 0, s * 1.05 * k * (1 + sq), s * .16 * k, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.translate(0, (o.dy || 0) * s);
  ctx.rotate(o.rot || 0);
  ctx.scale(flip * (1 + sq) * (o.sx || 1), (1 - sq) * (o.sy || 1));
  const by = -1.05 * s; // body centre
  const bw = s, bh = s * .9;
  const body = squirclePts(0, by, bw, bh, 4.0, 72, .006, 11, t).map(([px, py]) => [px * (.93 + .07 * (py - by) / bh), py]);
  // arms: shoulder + hand target → rubber-hose curve
  const arm = side => {
    const sgn = side === 'L' ? -1 : 1, sh = [sgn * bw * .9, by + s * .3];
    let hnd;
    const target = side === 'L' ? o.hL : o.hR;
    if (target) hnd = [target[0] * s, by + target[1] * s];
    else { const a = (side === 'L' ? o.aL : o.aR) ?? .45, L = s * .5; hnd = [sh[0] + sgn * Math.sin(a) * L, sh[1] + Math.cos(a) * L]; }
    let mx = (sh[0] + hnd[0]) / 2 + sgn * s * .12, my = (sh[1] + hnd[1]) / 2 + s * .08;
    const cc = side === 'L' ? o.cL : o.cR; if (cc) { mx = cc[0] * s; my = by + cc[1] * s; }
    return { sh, hnd, c: [mx, my], sgn };
  };
  const AL = arm('L'), AR = arm('R');
  const feet = o.noFeet ? [] : [[-.4, 1], [.4, 1]].map(([fx], i) => { const lift = o.feet ? o.feet[i] : 0; return ellPts(fx * s, -s * .09 - lift * s, s * .22, s * .12, 20); });
  const armPath = A => { ctx.moveTo(A.sh[0], A.sh[1]); ctx.quadraticCurveTo(A.c[0], A.c[1], A.hnd[0], A.hnd[1]); };
  const ahogeSway = o.ahoge ?? Math.sin(t * 5) * .08;
  const ahoge = () => { const sw_ = ahogeSway; ctx.moveTo(-s * .07, by - bh * .95); ctx.bezierCurveTo(s * (-.1 + sw_), by - bh * 1.3, s * (.25 + sw_), by - bh * 1.5, s * (.3 + sw_ * 1.5), by - bh * 1.28); ctx.bezierCurveTo(s * (.12 + sw_), by - bh * 1.36, s * (.04 + sw_ * .5), by - bh * 1.2, s * .09, by - bh * .95); ctx.closePath(); };

  // --- sticker border + drop shadow (one union path, so no double darkening) ---
  if (o.sticker !== false) {
    const b = s * .09;
    const union = () => {
      ctx.beginPath(); pathPts(ctx, body); feet.forEach(f => { ctx.moveTo(f[0][0], f[0][1]); f.forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath(); });
    };
    const strokes = w => { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = w; ctx.beginPath(); armPath(AL); armPath(AR); ctx.stroke();
      ctx.beginPath(); [AL, AR].forEach(A => { ctx.moveTo(A.hnd[0] + s * .15, A.hnd[1]); ctx.arc(A.hnd[0], A.hnd[1], s * .15, 0, TAU); }); ctx.fill(); };
    // shadow
    ctx.save(); ctx.translate(s * .07, s * .09); ctx.fillStyle = ctx.strokeStyle = rgba(PAL.ink, .22);
    union(); ctx.lineWidth = b * 2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fill(); strokes(s * .18 + b * 2); ctx.beginPath(); ahoge(); ctx.lineWidth = b * 2; ctx.stroke(); ctx.fill(); ctx.restore();
    // cream border
    ctx.fillStyle = ctx.strokeStyle = o.border || PAL.cream;
    union(); ctx.lineWidth = b * 2; ctx.lineJoin = 'round'; ctx.stroke(); ctx.fill(); strokes(s * .18 + b * 2); ctx.beginPath(); ahoge(); ctx.lineWidth = b * 2; ctx.stroke(); ctx.fill();
  }
  // --- feet ---
  feet.forEach(f => { pathPts(ctx, f); ctx.fillStyle = colDk; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke(); });
  // --- body ---
  pathPts(ctx, body); ctx.fillStyle = col; ctx.fill();
  ctx.save(); pathPts(ctx, body); ctx.clip();
  // halftone shading, lower right
  halftone(ctx, -bw, by - bh, bw, by + bh, (px, py) => clamp(((px / bw) * .6 + ((py - by) / bh) * .8 - .45) * 1.3), { pitch: s * .09, color: rgba(PAL.violet, .6), angle: .5 });
  // glossy sticker highlight
  ctx.fillStyle = rgba(PAL.cream, .85);
  ctx.beginPath(); ctx.ellipse(-bw * .52, by - bh * .6, bw * .2, bh * .09, -.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(-bw * .78, by - bh * .32, bw * .05, 0, TAU); ctx.fill();
  ctx.restore();
  pathPts(ctx, body); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.lineJoin = 'round'; ctx.stroke();
  // --- ahoge ---
  ctx.beginPath(); ahoge(); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.stroke();
  // pink star hair clip
  if (o.clip !== false) { ctx.save(); ctx.translate(bw * .62, by - bh * .78); ctx.rotate(.3 + Math.sin(t * 3) * .05); const sp = starPts(0, 0, s * .17, .5, 5); piece(ctx, sp, { fill: PAL.pink, ink, lw: s * .035, sh: [s * .03, s * .04], sha: .25 }); ctx.beginPath(); ctx.arc(-s * .04, -s * .04, s * .03, 0, TAU); ctx.fillStyle = rgba(PAL.cream, .9); ctx.fill(); ctx.restore(); }

  // --- face ---
  const [lx, ly] = o.look || [0, 0];
  ctx.save(); ctx.translate(lx * s * .16, by + ly * s * .1);
  // blush
  if ((o.blush ?? 1) > 0) {
    [-1, 1].forEach(k => {
      const cx = k * s * .64, cy = s * .12, rx = s * .17, ry = s * .1;
      halftone(ctx, cx - rx, cy - ry, cx + rx, cy + ry, (px, py) => clamp((1 - Math.hypot((px - cx) / rx, (py - cy) / ry)) * 2.2) * (o.blush ?? 1), { pitch: s * .045, color: PAL.pink, angle: .2 });
    });
  }
  zipEyes(ctx, s, o, t);
  zipMouth(ctx, s, o, t);
  ctx.restore();

  // --- arms (in front) ---
  [AL, AR].forEach(A => {
    ctx.lineCap = 'round'; ctx.beginPath(); armPath(A); ctx.lineWidth = s * .18 + lw * 2; ctx.strokeStyle = ink; ctx.stroke();
    ctx.beginPath(); armPath(A); ctx.lineWidth = s * .18; ctx.strokeStyle = col; ctx.stroke();
    ctx.beginPath(); ctx.arc(A.hnd[0], A.hnd[1], s * .135, 0, TAU); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.stroke();
    // tiny highlight on the mitt
    ctx.beginPath(); ctx.arc(A.hnd[0] - s * .05, A.hnd[1] - s * .05, s * .035, 0, TAU); ctx.fillStyle = rgba(PAL.cream, .8); ctx.fill();
  });
  // pinch indicator: when the right hand holds the zipper pull, draw the tab over the mitt
  ctx.restore();
}

function zipEyes(ctx, s, o, t) {
  const ink = PAL.ink, ex = s * .38, ey = -s * .06, rx = s * .185, ry = s * .245;
  const kind = o.eyes || 'open';
  const blink = o.blink ?? autoBlink(t, o.seed || 0);
  [-1, 1].forEach(k => {
    const cx = k * ex, cy = ey;
    let kd = kind;
    if (kind === 'wink') kd = k === 1 ? 'happy' : 'open';
    if (kd === 'open' || kd === 'star' || kd === 'wide') {
      const sy = 1 - blink * .92, rX = kd === 'wide' ? rx * 1.15 : rx, rY = (kd === 'wide' ? ry * 1.12 : ry) * sy;
      ctx.beginPath(); ctx.ellipse(cx, cy, rX, rY, 0, 0, TAU); ctx.fillStyle = ink; ctx.fill();
      if (sy > .3) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, rX, rY, 0, 0, TAU); ctx.clip();
        // idol-eye colour pooling at the bottom of the iris
        ctx.fillStyle = rgba(PAL.blue, .95); ctx.beginPath(); ctx.ellipse(cx, cy + rY * .75, rX * 1.05, rY * .6, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = rgba(PAL.pink, .8); ctx.beginPath(); ctx.ellipse(cx, cy + rY * 1.02, rX * .8, rY * .38, 0, 0, TAU); ctx.fill();
        ctx.restore();
        if (kd === 'wide') { ctx.beginPath(); ctx.ellipse(cx, cy, rX * .45, rY * .45, 0, 0, TAU); ctx.fillStyle = ink; ctx.fill(); }
        // highlights
        if (kd === 'star') { ctx.fillStyle = PAL.cream; ctx.beginPath(); ctx.arc(cx + rX * .32, cy - rY * .42, rX * .3, 0, TAU); ctx.fill(); sparkle(ctx, cx - rX * .15, cy + rY * .05, rX * .62, Math.PI / 4 * 0, PAL.cream, .3); }
        else { ctx.fillStyle = PAL.cream; ctx.beginPath(); ctx.arc(cx + rX * .3, cy - rY * .38, rX * .42, 0, TAU); ctx.fill(); }
        ctx.fillStyle = PAL.cream; ctx.beginPath(); ctx.arc(cx - rX * .35, cy + rY * .3, rX * .17, 0, TAU); ctx.fill();
      }
    } else if (kd === 'happy') {
      ctx.beginPath(); ctx.moveTo(cx - rx * 1.05, cy + ry * .25); ctx.quadraticCurveTo(cx, cy - ry * 1.05, cx + rx * 1.05, cy + ry * .25);
      ctx.lineWidth = s * .075; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.stroke();
    } else if (kd === 'closed') {
      ctx.beginPath(); ctx.moveTo(cx - rx, cy); ctx.quadraticCurveTo(cx, cy + ry * .7, cx + rx, cy);
      ctx.lineWidth = s * .06; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.stroke();
    } else if (kd === 'x') {
      ctx.lineWidth = s * .07; ctx.lineCap = 'round'; ctx.strokeStyle = ink; ctx.beginPath();
      ctx.moveTo(cx - rx, cy - rx); ctx.lineTo(cx + rx, cy + rx); ctx.moveTo(cx + rx, cy - rx); ctx.lineTo(cx - rx, cy + rx); ctx.stroke();
    } else if (kd === 'heart') {
      heart(ctx, cx, cy + ry * .1, rx * 1.35, PAL.pink, ink, s * .04);
    } else if (kd === 'determined') {
      const rY = ry * .78;
      ctx.beginPath(); ctx.ellipse(cx, cy + ry * .1, rx, rY, 0, 0, TAU); ctx.fillStyle = ink; ctx.fill();
      ctx.fillStyle = PAL.cream; ctx.beginPath(); ctx.arc(cx + rx * .3, cy - rY * .2, rx * .38, 0, TAU); ctx.fill();
      // lid line
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy + ry * .1, rx * 1.02, rY * 1.02, 0, 0, TAU); ctx.clip(); ctx.beginPath(); ctx.moveTo(cx - rx * 1.4, cy - ry * (k === 1 ? .55 : .15)); ctx.lineTo(cx + rx * 1.4, cy - ry * (k === 1 ? .15 : .55)); ctx.lineTo(cx + rx * 1.4, cy - ry * 2); ctx.lineTo(cx - rx * 1.4, cy - ry * 2); ctx.closePath();
      ctx.fillStyle = o.col || PAL.blue; ctx.fill(); ctx.restore();
    }
  });
  if (o.brow) {
    ctx.lineWidth = s * .06; ctx.lineCap = 'round'; ctx.strokeStyle = ink;
    [-1, 1].forEach(k => {
      const cx = k * ex, cy = ey - ry * 1.45; ctx.beginPath();
      if (o.brow === 'up') { ctx.moveTo(cx - rx * .8, cy + rx * .1); ctx.quadraticCurveTo(cx, cy - rx * .45, cx + rx * .8, cy + rx * .1); }
      else if (o.brow === 'angry') { ctx.moveTo(cx - k * rx * .9, cy - rx * .35); ctx.lineTo(cx + k * rx * .8, cy + rx * .35); }
      else if (o.brow === 'worried') { ctx.moveTo(cx - k * rx * .9, cy + rx * .3); ctx.lineTo(cx + k * rx * .8, cy - rx * .3); }
      ctx.stroke();
    });
  }
}
function autoBlink(t, seed) { // blink every ~3 s, 0.15 s long
  const period = 2.7 + hash(seed) * 1.2, p = frac((t + hash(seed + 1) * 3) / period) * period;
  return p < .15 ? Math.sin(p / .15 * Math.PI) : 0;
}
function heart(ctx, x, y, r, fill, ink, lw) {
  ctx.beginPath(); ctx.moveTo(x, y + r * .9);
  ctx.bezierCurveTo(x - r * 1.5, y - r * .1, x - r * .7, y - r * 1.2, x, y - r * .45);
  ctx.bezierCurveTo(x + r * .7, y - r * 1.2, x + r * 1.5, y - r * .1, x, y + r * .9);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (ink) { ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.lineJoin = 'round'; ctx.stroke(); }
}

// zipper mouth. open 0..1 = gap height; slider 0..1 position (1 = right end = fully zipped).
// Teeth left of the slider are joined; right of it the lips part in a lens (closing = pulling the slider right).
function zipMouth(ctx, s, o, t) {
  const ink = PAL.ink, y0 = s * .38, Wm = s * .92, xl = -Wm / 2, xr = Wm / 2;
  const open = clamp(o.mouth ?? 0), slider = clamp(o.slider ?? 1), smile = o.smile ?? 1;
  const xs = lerp(xl, xr, slider);
  const curve = x => smile * s * .08 * (1 - Math.pow(2 * x / Wm, 2)) - smile * s * .04;
  const gapAt = x => { if (x <= xs || xr - xs < 1) return 0; const k = (x - xs) / (xr - xs); return Math.sin(Math.PI * Math.pow(k, .8)) * open * s * .34; };
  const N = 48, th = s * .085;
  // mouth interior
  if (open > .01 && xs < xr - 2) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const x = lerp(xs, xr, i / N); ctx.lineTo(x, y0 + curve(x) - gapAt(x) * .8); }
    for (let i = N; i >= 0; i--) { const x = lerp(xs, xr, i / N); ctx.lineTo(x, y0 + curve(x) + gapAt(x) * 1.1); }
    ctx.closePath(); ctx.fillStyle = PAL.violet; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = PAL.pink; ctx.beginPath(); ctx.ellipse((xs + xr) / 2 + s * .05, y0 + curve(0) + s * .26 * open, (xr - xs) * .36, s * .13 * open + 1, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  // zipper tape (two bands that follow the lips)
  const band = (sgn) => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const x = lerp(xl, xr, i / N), g = gapAt(x) * (sgn < 0 ? .8 : 1.1); ctx.lineTo(x, y0 + curve(x) + sgn * (g + th * .45)); }
    ctx.lineWidth = th * .7; ctx.lineCap = 'round'; ctx.strokeStyle = PAL.violet; ctx.stroke();
  };
  band(-1); band(1);
  // teeth: interlocking rows
  const n = 12, pitch = Wm / n, tw_ = pitch * .6;
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < n; i++) {
      const x = xl + pitch * (i + .5) + (row ? pitch * .25 : -pitch * .25);
      const g = gapAt(x), joined = g < th * .15, yy = y0 + curve(x) + (row ? g * 1.1 + (joined ? th * .16 : th * .45) : -g * .8 - (joined ? th * .16 : th * .45));
      ctx.save(); ctx.translate(x, yy);
      rr(ctx, -tw_ / 2, -th / 2, tw_, th, th * .28); ctx.fillStyle = PAL.metal; ctx.fill(); ctx.lineWidth = s * .02; ctx.strokeStyle = ink; ctx.stroke();
      ctx.fillStyle = rgba(PAL.cream, .9); ctx.fillRect(-tw_ * .28, -th * .32, tw_ * .18, th * .4);
      ctx.restore();
    }
  }
  // slider + pull tab
  const sw = s * .22, sh = s * .17, sx = xs, sy = y0 + curve(xs);
  ctx.save(); ctx.translate(sx, sy);
  const ang = (o.pull ?? 0) + Math.sin(t * 4.2) * .12;
  ctx.save(); ctx.translate(0, sh * .3); ctx.rotate(ang);
  rr(ctx, -s * .08, 0, s * .16, s * .32, s * .065); ctx.fillStyle = PAL.metal; ctx.fill(); ctx.lineWidth = s * .028; ctx.strokeStyle = ink; ctx.stroke();
  rr(ctx, -s * .032, s * .18, s * .064, s * .085, s * .032); ctx.fillStyle = PAL.ink; ctx.fill();
  ctx.fillStyle = rgba(PAL.cream, .9); ctx.fillRect(-s * .05, s * .045, s * .022, s * .1);
  ctx.restore();
  rr(ctx, -sw / 2, -sh / 2, sw, sh, s * .055); ctx.fillStyle = PAL.metal; ctx.fill(); ctx.lineWidth = s * .03; ctx.strokeStyle = ink; ctx.stroke();
  ctx.fillStyle = PAL.metalDk; ctx.fillRect(-sw * .3, -sh * .1, sw * .6, sh * .2);
  ctx.restore();
}

// idol sparkles around a point (decorative)
function sparkles(ctx, cx, cy, R, t, n = 6, seed = 1, cols = [PAL.yellow, PAL.pink, PAL.cream]) {
  for (let i = 0; i < n; i++) {
    const a = hash(seed + i) * TAU + t * .3, rr_ = R * (.7 + hash(seed + i + 50) * .5), ph = frac(t * 1.3 + hash(seed + i + 9));
    const k = Math.sin(ph * Math.PI), x = cx + Math.cos(a) * rr_, y = cy + Math.sin(a) * rr_ * .8;
    if (k < .05) continue;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    sparkle(ctx, 3, 4, R * .09, 0, rgba(PAL.ink, .25)); sparkle(ctx, 0, 0, R * .09, 0, cols[i % cols.length]);
    ctx.restore();
  }
}
