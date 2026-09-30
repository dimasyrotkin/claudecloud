// main.js: scene registry, transitions, frame rendering, contact sheets.
'use strict';
const SCENES = [];            // { id, t0, t1, draw(ctx, t, lt) }
const PAGES = {};             // standalone pages (character sheet, style sheet)
let CUES = null;
const T = id => { const v = CUES.words[id]; if (v === undefined) throw new Error('no cue ' + id); return v; };
function scene(id, t0, t1, draw) { SCENES.push({ id, t0, t1, draw }); }
const BUF = {};
function buf(name) { return BUF[name] || (BUF[name] = mkCanvas()); }
// render a registered scene at time t into a buffer and return it
function sceneTo(id, t, name = id) {
  const sc = SCENES.find(s => s.id === id), c = buf(name), x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  sc.draw(x, t, t - sc.t0); return c;
}
let NOW = 0;
function drawFrame(ctx, t) {
  NOW = t;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
  const sc = SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1];
  ctx.save(); sc.draw(ctx, t, t - sc.t0); ctx.restore();
  finish(ctx, t);
}
window.renderAt = (t, type = 'image/jpeg', q = .93) => {
  const c = document.getElementById('out'), x = c.getContext('2d');
  if (window.PAGE) { x.setTransform(1, 0, 0, 1, 0, 0); PAGES[window.PAGE](x, t); } else drawFrame(x, t);
  return c.toDataURL(type, q);
};
window.renderSheet = (times, cols = 3, w = 640) => {
  const h = Math.round(w * H / W), rows = Math.ceil(times.length / cols), sheet = mkCanvas(cols * w, rows * (h + 26)), sx = sheet.getContext('2d');
  sx.fillStyle = '#222'; sx.fillRect(0, 0, sheet.width, sheet.height);
  const c = document.getElementById('out'), x = c.getContext('2d'), ms = [];
  times.forEach((t, i) => {
    const t0 = performance.now(); drawFrame(x, t); ms.push(Math.round(performance.now() - t0));
    const cx = (i % cols) * w, cy = Math.floor(i / cols) * (h + 26);
    sx.drawImage(c, cx, cy + 26, w, h); sx.fillStyle = '#fff'; sx.font = '600 18px mono'; sx.fillText(t.toFixed(2) + 's', cx + 8, cy + 19);
  });
  return { url: sheet.toDataURL('image/jpeg', .88), ms };
};
async function boot() {
  CUES = await (await fetch('cues.json')).json();
  await loadFonts();
  buildTextures();
  window.ready = true;
  // interactive preview scrubber
  const scrub = document.getElementById('scrub');
  if (scrub && !location.search.includes('render')) {
    const go = () => { window.renderAt(+scrub.value); document.getElementById('tt').textContent = (+scrub.value).toFixed(2) + ' s'; };
    scrub.oninput = go; go();
  }
}
