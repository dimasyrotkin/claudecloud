// s07_y2k.js (58–68 s): the switch-up. A 2000-era desktop printed on the same paper.
// WordArt "WE ARE ZIP LABS:", a readme typed in Notepad, a compression dialog + dial-up, "2000" with fireworks,
// then the year rolls to 2026 and the CRT switches off.
'use strict';
(() => {
  const Y = { desk: '#2A8C8C', win: '#CFC8BB', hi: '#F7F1E6', lo: '#6E675D', title0: '#1B1A6E', title1: '#2748E8' };
  function bevel(ctx, x, y, w, h, inset = false) {
    ctx.fillStyle = Y.win; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = inset ? Y.lo : Y.hi; ctx.fillRect(x, y, w, 4); ctx.fillRect(x, y, 4, h);
    ctx.fillStyle = inset ? Y.hi : Y.lo; ctx.fillRect(x, y + h - 4, w, 4); ctx.fillRect(x + w - 4, y, 4, h);
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3);
  }
  function win(ctx, x, y, w, h, title, k = 1) {
    if (k <= 0) return null;
    // window-open zoom outlines (the 2000 "exploding rectangle")
    if (k < 1) { ctx.save(); ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); for (let i = 0; i < 3; i++) { const kk = clamp(k * 1.4 - i * .15); const cx = x + w / 2, cy = y + h / 2; ctx.strokeRect(cx - w * kk / 2, cy - h * kk / 2, w * kk, h * kk); } ctx.restore(); if (k < .6) return null; }
    ctx.save(); ctx.fillStyle = rgba(PAL.ink, .3); ctx.fillRect(x + 14, y + 16, w, h); ctx.restore();
    bevel(ctx, x, y, w, h);
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, Y.title0); g.addColorStop(1, Y.title1);
    ctx.fillStyle = g; ctx.fillRect(x + 8, y + 8, w - 16, 46);
    txt(ctx, title, x + 22, y + 42, { f: 'mono', s: 26, w: 800 }, { fill: PAL.cream });
    ['_', '□', '×'].forEach((c, i) => { const bx = x + w - 150 + i * 46; bevel(ctx, bx, y + 14, 38, 34); txt(ctx, c, bx + 19, y + 42, { f: 'mono', s: 26, w: 800 }, { align: 'center', fill: PAL.ink }); });
    return { x: x + 12, y: y + 62, w: w - 24, h: h - 74 };
  }
  function wordArt(ctx, str, x, y, s, t, o = {}) {
    setFont(ctx, { f: 'any', w: 900, wd: o.wd ?? 110, s });
    ctx.textAlign = 'center';
    const chars = [...str], widths = chars.map(c => ctx.measureText(c).width), total = widths.reduce((a, b) => a + b, 0);
    let cx = x - total / 2;
    chars.forEach((c, i) => {
      const wv = Math.sin(i * .55 + t * 3) * s * .09, xx = cx + widths[i] / 2;
      ctx.save(); ctx.translate(xx, y + wv); ctx.transform(1, 0, -.18, 1, 0, 0);
      for (let d = 10; d >= 1; d--) { ctx.fillStyle = d > 1 ? PAL.violet : PAL.ink; ctx.fillText(c, d * 1.3, d * 1.3); }
      const g = ctx.createLinearGradient(0, -s * .75, 0, 0); (o.grad || [PAL.yellow, PAL.pink, PAL.blue]).forEach((col, j, a) => g.addColorStop(j / (a.length - 1), col));
      ctx.fillStyle = g; ctx.fillText(c, 0, 0); ctx.lineWidth = s * .03; ctx.strokeStyle = PAL.ink; ctx.strokeText(c, 0, 0);
      ctx.restore(); cx += widths[i];
    });
  }
  function icon(ctx, x, y, kind, label) {
    ctx.save(); ctx.translate(x, y);
    if (kind === 'db') { for (let i = 2; i >= 0; i--) { ctx.beginPath(); ctx.ellipse(0, i * 18, 34, 12, 0, 0, TAU); ctx.fillStyle = i ? '#9FB0F5' : PAL.cream; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.stroke(); } ctx.fillStyle = '#9FB0F5'; ctx.fillRect(-34, 0, 68, 36); ctx.strokeRect(-34, 0, 68, 36); ctx.beginPath(); ctx.ellipse(0, 0, 34, 12, 0, 0, TAU); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.stroke(); }
    else if (kind === 'zip') { piece(ctx, [[-36, -30], [-6, -30], [2, -22], [36, -22], [36, 34], [-36, 34]], { fill: PAL.yellow, ink: PAL.ink, lw: 3, sh: [4, 4] }); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? PAL.ink : PAL.metal; ctx.fillRect(-4, -18 + i * 8, 8, 8); } }
    else if (kind === 'file') { piece(ctx, [[-26, -34], [12, -34], [26, -20], [26, 34], [-26, 34]], { fill: PAL.cream, ink: PAL.ink, lw: 3, sh: [4, 4] }); for (let i = 0; i < 4; i++) { ctx.fillStyle = rgba(PAL.ink, .5); ctx.fillRect(-16, -14 + i * 11, 30, 4); } }
    else if (kind === 'trash') { piece(ctx, [[-26, -24], [26, -24], [20, 34], [-20, 34]], { fill: PAL.metal, ink: PAL.ink, lw: 3, sh: [4, 4] }); ctx.fillStyle = PAL.ink; ctx.fillRect(-32, -32, 64, 8); }
    if (label) { const w_ = tw(ctx, label, { f: 'mono', s: 20, w: 600 }); ctx.fillStyle = Y.title0; ctx.fillRect(-w_ / 2 - 4, 44, w_ + 8, 26); txt(ctx, label, 0, 63, { f: 'mono', s: 20, w: 600 }, { align: 'center', fill: PAL.cream }); }
    ctx.restore();
  }
  function cursor(ctx, x, y) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.lineTo(11, 33); ctx.lineTo(19, 50); ctx.lineTo(26, 46); ctx.lineTo(18, 30); ctx.lineTo(32, 30); ctx.closePath(); ctx.fillStyle = PAL.cream; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.stroke(); ctx.restore(); }
  function desktop(ctx, t, year) {
    ctx.fillStyle = Y.desk; ctx.fillRect(-100, -100, W + 200, H + 200);
    halftone(ctx, 0, 0, W, H - 70, (x, y) => clamp(Math.hypot(x - W / 2, y - H / 2) / 1100) * .5, { pitch: 18, color: rgba(PAL.ink, .35) });
    icon(ctx, 110, 150, 'file', 'files'); icon(ctx, 110, 320, 'db', 'database.db'); icon(ctx, 110, 490, 'trash', 'trash');
    // taskbar
    bevel(ctx, -10, H - 70, W + 20, 80);
    bevel(ctx, 10, H - 60, 170, 50); txt(ctx, '⌘ Start', 95, H - 25, { f: 'mono', s: 28, w: 800 }, { align: 'center', fill: PAL.ink });
    bevel(ctx, W - 330, H - 60, 320, 50, true); txt(ctx, `12:00 AM  1/1/${year}`, W - 170, H - 25, { f: 'mono', s: 26, w: 700 }, { align: 'center', fill: PAL.ink });
  }
  function y2kFrame(ctx, t) {
    const a = T('y.ziplabs'), b = T('y.research'), c = T('y.filedb'), d = T('y.back'), e = T('y.2000'), f = T('y.warp');
    const yr = t < f ? 2000 : Math.round(lerp(2000, 2026, E.ioC(seg(t, f + .1, f + 1.3))));
    desktop(ctx, t, yr);
    // window 1: WordArt
    const cl = 1 - seg(t, d - .12, d + .02);
    const k1 = seg(t, a - .15, a + .1) * cl, w1 = win(ctx, 230, 110, 1460, 430, 'ZipLabs.exe', k1);
    if (w1) { ctx.fillStyle = PAL.cream; ctx.fillRect(w1.x, w1.y, w1.w, w1.h); wordArt(ctx, 'WE ARE ZIP LABS:', w1.x + w1.w / 2, w1.y + 240, 140, t, { wd: 92 }); }
    // window 2: notepad readme
    const k2 = seg(t, b - .15, b + .1) * cl, w2 = win(ctx, 560, 470, 1080, 300, 'readme.txt - Notepad', k2);
    if (w2) {
      ctx.fillStyle = PAL.cream; ctx.fillRect(w2.x, w2.y, w2.w, w2.h);
      const L1 = 'a research team that started', L2 = 'working on...';
      const n = Math.floor(clamp((t - b) / 1.5) * (L1.length + L2.length));
      txt(ctx, L1.slice(0, n), w2.x + 24, w2.y + 80, { f: 'mono', s: 62, w: 700 }, { fill: PAL.ink });
      txt(ctx, L2.slice(0, Math.max(0, n - L1.length)), w2.x + 24, w2.y + 160, { f: 'mono', s: 62, w: 700 }, { fill: PAL.ink });
      if (frac(t * 2.5) < .6) { const ln = n > L1.length ? 1 : 0, str = ln ? L2.slice(0, n - L1.length) : L1.slice(0, n); ctx.fillStyle = PAL.ink; ctx.fillRect(w2.x + 28 + tw(ctx, str, { f: 'mono', s: 62, w: 700 }), w2.y + 32 + ln * 80, 6, 62); }
    }
    // window 3: compression dialog
    const k3 = seg(t, c - .15, c + .1) * cl, w3 = win(ctx, 250, 300, 1420, 520, 'Compressing...', k3);
    if (w3) {
      ctx.fillStyle = Y.win; ctx.fillRect(w3.x, w3.y, w3.w, w3.h);
      const st = { f: 'any', w: 900, wd: 88 }, sz = fitSize(ctx, 'FILE AND DATABASE COMPRESSION', st, w3.w - 80);
      txt(ctx, 'FILE AND DATABASE COMPRESSION', w3.x + w3.w / 2, w3.y + 110, { ...st, s: sz }, { align: 'center', fill: PAL.ink, mis: [4, 3, PAL.pink] });
      // flying files into the zip folder
      icon(ctx, w3.x + 180, w3.y + 250, 'db'); icon(ctx, w3.x + w3.w - 180, w3.y + 250, 'zip');
      for (let i = 0; i < 4; i++) { const p = frac((t - c) * 1.6 + i * .25); const fx = lerp(w3.x + 260, w3.x + w3.w - 260, p), fy = w3.y + 240 - Math.sin(p * Math.PI) * 120; ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI); icon(ctx, fx, fy, 'file'); ctx.restore(); }
      // block progress bar
      const pb = { x: w3.x + 60, y: w3.y + 360, w: w3.w - 120, h: 56 }; bevel(ctx, pb.x, pb.y, pb.w, pb.h, true);
      const nb = Math.floor(clamp((t - c) / 1.8) * 30); for (let i = 0; i < nb; i++) { ctx.fillStyle = Y.title1; ctx.fillRect(pb.x + 10 + i * (pb.w - 20) / 30, pb.y + 10, (pb.w - 20) / 30 - 6, pb.h - 20); }
      txt(ctx, `database.db  ${Math.round(clamp((t - c) / 1.8) * 100)}%   · 56k modem connected`, pb.x, pb.y + 100, { f: 'mono', s: 26, w: 600 }, { fill: PAL.ink });
    }
    // BACK IN THE YEAR 2000
    if (t > d - .06) {
      flash(ctx, .0, PAL.cream);
      const k = popIn(t, d); ctx.save(); ctx.translate(W / 2, 260); ctx.scale(k, k); txt(ctx, 'BACK IN THE YEAR', 0, 0, { f: 'any', w: 900, wd: 110, s: 120 }, { align: 'center', fill: PAL.cream, stroke: [12, PAL.ink], shadow: [8, 10, PAL.ink, .5] }); ctx.restore();
    }
    if (t > e - .06) {
      // fireworks
      for (let fw = 0; fw < 5; fw++) {
        const ft = e + fw * .28 - .1, dt = t - ft; if (dt < 0 || dt > 1.4) continue;
        const cx = 300 + hash(fw + 3) * (W - 600), cy = 180 + hash(fw + 8) * 300, col = [PAL.yellow, PAL.pink, PAL.cream, PAL.blueLt][fw % 4];
        for (let i = 0; i < 18; i++) { const a2 = i / 18 * TAU, r = E.outC(clamp(dt / .6)) * 170, x = cx + Math.cos(a2) * r, y = cy + Math.sin(a2) * r + dt * dt * 120; ctx.save(); ctx.globalAlpha = clamp(1.4 - dt); sparkle(ctx, x, y, 16 * (1 - dt * .5), a2, col); ctx.restore(); }
      }
      const k = E.back(seg(t, e - .06, e + .25), 2.2);
      ctx.save(); ctx.translate(W / 2, 700); ctx.scale(k, k); ctx.rotate(Math.sin(t * 2) * .02);
      wordArt(ctx, String(yr), 0, 0, 400, t, { wd: 120, grad: [PAL.cream, PAL.yellow, PAL.pink] });
      ctx.restore();
      if (t > f + 1.3) { const kk = popIn(t, f + 1.3); ctx.save(); ctx.translate(W / 2 + 420, 820); ctx.rotate(-.1); ctx.scale(kk, kk); rr(ctx, -130, -44, 260, 76, 38); ctx.fillStyle = PAL.pink; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = PAL.ink; ctx.stroke(); txt(ctx, 'TODAY →', 0, 12, { f: 'mono', s: 38, w: 800 }, { align: 'center', fill: PAL.cream }); ctx.restore(); }
    }
    // mouse cursor wanders
    cursor(ctx, 1500 + Math.sin(t * 1.3) * 200, 640 + Math.cos(t * 1.7) * 120);
  }
  scene('y2k', 58, 68, (ctx, t) => {
    const off = seg(t, 67.45, 67.95); // CRT switch-off
    if (off <= 0) return y2kFrame(ctx, t);
    const c = buf('crt'), x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); y2kFrame(x, t);
    ctx.fillStyle = PAL.night; ctx.fillRect(0, 0, W, H);
    const sy = Math.max(.004, 1 - E.inC(clamp(off / .5)) * 1.1), sx = off < .55 ? 1 : 1 - E.inQ(seg(off, .55, 1));
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(Math.max(.002, sx), sy); ctx.translate(-W / 2, -H / 2); ctx.drawImage(c, 0, 0);
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rgba(PAL.cream, clamp(off * 1.5)); ctx.fillRect(0, 0, W, H); ctx.restore();
  });
})();
