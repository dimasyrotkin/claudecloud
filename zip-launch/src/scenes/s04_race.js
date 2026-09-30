// s04_race.js (24–36 s): split-screen race. Codex on a Terminal-Bench task, without Zip vs with Zip.
// Zip's side takes fewer turns, finishes first, costs 20 % less. Stamps land on 32, 33, 34.
'use strict';
(() => {
  const CARD = { y: 190, h: 650, w: 850 };
  const LX = 90, RX = W - 90 - CARD.w;
  const RUN0 = () => T('r.run');
  // deterministic transcript per side
  const TOOLS = ['read_file src/parser.py', '$ pytest -q tests/test_parser.py', 'grep -rn "tokenize(" src/', 'edit src/parser.py  +14 −6', '$ python -m bench.check', 'read_file tests/fixtures/big.log', 'list_dir src/', '$ git diff --stat', 'edit src/lexer.py  +3 −3', '$ pytest -q'];
  const OUTS = ['3 failed, 12 passed', 'AssertionError: expected 42 tokens', '14 matches in 5 files', 'ok', '2 failed, 13 passed', '…48,213 lines…', 'src/ tests/ bench/', '2 files changed', 'ok', '1 failed, 14 passed'];
  function transcript(side) {
    const d = DATA.race[side], lines = [], rnd = rng(side === 'zip' ? 77 : 33);
    for (let i = 1; i <= d.turns; i++) {
      lines.push({ k: 'turn', s: `› turn ${String(i).padStart(2, '0')}` });
      const j = Math.floor(rnd() * TOOLS.length); lines.push({ k: 'tool', s: '  ' + TOOLS[j] });
      if (side === 'zip') { const a = 14 + rnd() * 16, b = a * (.74 + rnd() * .08); lines.push({ k: 'zip', s: `  zip  ${a.toFixed(1)}k → ${b.toFixed(1)}k tok` }); }
      else if (rnd() < .5) lines.push({ k: 'bloat', s: `  ctx +${(8 + rnd() * 14).toFixed(1)}k tok` });
      lines.push({ k: 'out', s: '  ' + (i === d.turns ? '15 passed ✓' : OUTS[Math.floor(rnd() * OUTS.length)]) });
    }
    return lines;
  }
  let TR = null;
  const endOf = side => side === 'zip' ? T('r.zipdone') : T('r.basedone');
  function card(ctx, t, side, x) {
    TR = TR || { base: transcript('base'), zip: transcript('zip') };
    const d = DATA.race[side], isZ = side === 'zip', t0 = isZ ? T('r.labels') : T('r.title');
    const k = E.back(seg(t, t0 - .08, t0 + .22), 1.4); if (k <= 0) return;
    const col = isZ ? PAL.blue : PAL.pink;
    ctx.save(); ctx.translate(x + CARD.w / 2, CARD.y + CARD.h / 2 + (1 - k) * 700); ctx.rotate((1 - k) * (isZ ? .2 : -.2) + (isZ ? .008 : -.008)); ctx.translate(-CARD.w / 2, -CARD.h / 2);
    // tab label
    const lab = isZ ? 'WITH ZIP' : 'WITHOUT ZIP';
    piece(ctx, [[0, -86], [isZ ? 330 : 400, -86], [isZ ? 350 : 420, 0], [0, 0]], { fill: col, ink: PAL.ink, lw: 4, sh: [8, 10] });
    txt(ctx, lab, 26, -26, { f: 'any', w: 900, wd: 88, s: 54 }, { fill: PAL.cream });
    if (isZ) zipChar(ctx, 300, -12, 26, { t, eyes: t > endOf('zip') ? 'happy' : 'open', sticker: false, shadow: false, noFeet: true, clip: false });
    // window
    rr(ctx, 0, 0, CARD.w, CARD.h, 18); ctx.save(); ctx.translate(12, 16); ctx.fillStyle = rgba(PAL.ink, .3); ctx.fill(); ctx.restore();
    rr(ctx, 0, 0, CARD.w, CARD.h, 18); ctx.fillStyle = PAL.night; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = PAL.ink; ctx.stroke();
    ctx.fillStyle = PAL.metal; rr(ctx, 0, 0, CARD.w, 52, 18); ctx.fill(); ctx.fillRect(0, 30, CARD.w, 22);
    [PAL.pink, PAL.yellow, PAL.blue].forEach((c, i) => { ctx.beginPath(); ctx.arc(30 + i * 30, 26, 9, 0, TAU); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = PAL.ink; ctx.stroke(); });
    txt(ctx, 'codex — ' + DATA.race.task, CARD.w / 2 + 40, 35, { f: 'mono', s: 20, w: 600 }, { align: 'center', fill: PAL.ink });
    // progress of the run
    const e = endOf(side), p = clamp((t - RUN0()) / (e - RUN0())), lines = TR[side];
    const shown = Math.floor(p * lines.length + (t >= RUN0() ? 1 : 0));
    const LH = 33, maxL = 13, first = Math.max(0, shown - maxL);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 56, CARD.w, 470); ctx.clip();
    for (let i = first; i < Math.min(shown, lines.length); i++) {
      const L = lines[i], y = 100 + (i - first) * LH;
      const c = L.k === 'turn' ? PAL.yellow : L.k === 'zip' ? PAL.blueLt : L.k === 'bloat' ? PAL.pink : L.k === 'out' ? rgba(PAL.cream, .7) : PAL.cream;
      if (L.k === 'zip') { rr(ctx, 26, y - 25, tw(ctx, L.s, { f: 'mono', s: 24 }) + 10, 33, 6); ctx.fillStyle = rgba(PAL.blue, .55); ctx.fill(); }
      txt(ctx, L.s, 30, y, { f: 'mono', s: 24, w: L.k === 'turn' ? 800 : 500 }, { fill: c });
    }
    // cursor
    if (t < e && t >= RUN0() && frac(t * 2.5) < .5) { const y = 100 + (Math.min(shown, lines.length) - first) * LH; ctx.fillStyle = PAL.cream; ctx.fillRect(30, y - 24, 14, 28); }
    ctx.restore();
    // context meter
    const my = 548; txt(ctx, 'CONTEXT', 30, my, { f: 'mono', s: 20, w: 700 }, { fill: rgba(PAL.cream, .8) });
    const cw = CARD.w - 170, fillK = lerp(.08, d.ctx, E.outQ(p)) + (isZ ? Math.sin(t * 9) * .01 : 0);
    rr(ctx, 140, my - 20, cw, 26, 13); ctx.fillStyle = rgba(PAL.cream, .15); ctx.fill();
    rr(ctx, 140, my - 20, cw * fillK, 26, 13); ctx.fillStyle = isZ ? PAL.blue : PAL.pink; ctx.fill();
    if (!isZ) { ctx.save(); rr(ctx, 140, my - 20, cw * fillK, 26, 13); ctx.clip(); ctx.strokeStyle = rgba(PAL.ink, .35); ctx.lineWidth = 6; for (let xx = 140 - 40; xx < 140 + cw; xx += 18) { ctx.beginPath(); ctx.moveTo(xx + t * 40 % 18, my + 10); ctx.lineTo(xx + 26 + t * 40 % 18, my - 24); ctx.stroke(); } ctx.restore(); }
    txt(ctx, Math.round(fillK * 100) + '%', CARD.w - 20, my, { f: 'mono', s: 20, w: 700 }, { align: 'right', fill: PAL.cream });
    // stats
    const secs = Math.round(d.secs * p), turns = Math.max(0, Math.min(d.turns, Math.ceil(p * d.turns))), cost = d.cost * p;
    const stat = (i, label, val, hi) => {
      const sx = 30 + i * 272, sy = 600;
      rr(ctx, sx - 10, sy - 14, 256, 76, 12); ctx.fillStyle = hi ? col : rgba(PAL.cream, .08); ctx.fill();
      txt(ctx, label, sx + 4, sy + 10, { f: 'mono', s: 18, w: 700 }, { fill: hi ? PAL.cream : rgba(PAL.cream, .6) });
      txt(ctx, val, sx + 4, sy + 54, { f: 'mono', s: 46, w: 800 }, { fill: PAL.cream });
    };
    const hi = isZ && t > T('r.s1');
    stat(0, 'TURNS', String(turns), isZ && t > T('r.s1'));
    stat(1, 'TIME', `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`, isZ && t > T('r.s2'));
    stat(2, 'COST', '$' + cost.toFixed(2), isZ && t > T('r.s3'));
    // done stamp
    if (t >= e) stamp(ctx, '✓ PASSED', CARD.w / 2, 300, { f: 'any', w: 900, wd: 80, s: 92 }, { k: seg(t, e, e + .18), color: isZ ? PAL.yellow : PAL.grey, rot: isZ ? -.1 : .06, multiply: false, paper: PAL.night, seed: isZ ? 4 : 6 });
    ctx.restore();
  }
  function raceFrame(ctx, t) {
    ctx.fillStyle = PAL.paper; ctx.fillRect(-200, -200, W + 400, H + 400);
    ctx.strokeStyle = rgba(PAL.blue, .07); ctx.lineWidth = 2; ctx.beginPath();
    for (let x = 0; x <= W; x += 60) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += 60) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
    // header
    const h0 = T('r.title'), hk = popIn(t, h0);
    ctx.save(); ctx.translate(W / 2, 80); ctx.scale(hk, hk);
    txt(ctx, 'CODEX  ×  TERMINAL-BENCH', 0, 0, { f: 'any', w: 900, wd: 110, s: 58 }, { align: 'center', fill: PAL.ink, mis: [4, 3, PAL.pink] });
    ctx.restore();
    txt(ctx, 'same task · same model · ▶▶ 50×' + (DATA.placeholder ? '  · sample run' : ''), W / 2, 128, { f: 'mono', s: 22, w: 600 }, { align: 'center', fill: rgba(PAL.ink, .7), alpha: seg(t, h0 + .3, h0 + .5) });
    // camera: slight push, then push toward Zip's card for the stamps
    const push = E.ioC(seg(t, T('r.s3') + .6, 36));
    ctx.save(); camApply(ctx, { x: lerp(W / 2, RX + CARD.w / 2, push * .5), y: H / 2 + 20 * push, z: 1 + push * .12 + pulse(t, 9) * .006 * (t > RUN0() ? 1 : 0) });
    card(ctx, t, 'base', LX);
    if (t > T('r.s1')) { ctx.save(); ctx.globalAlpha = .35 * seg(t, T('r.s1'), T('r.s1') + .3); rr(ctx, LX - 10, CARD.y - 96, CARD.w + 30, CARD.h + 116, 20); ctx.fillStyle = PAL.paper; ctx.fill(); ctx.restore(); }
    card(ctx, t, 'zip', RX);
    // the race lanes: readable at phone size
    const L0 = 118, L1 = W - 150;
    [['base', 895, PAL.pink], ['zip', 985, PAL.blue]].forEach(([side, y, col]) => {
      const e = endOf(side), p = clamp((t - RUN0()) / (e - RUN0())), k = seg(t, T('r.labels'), T('r.labels') + .3);
      if (k <= 0) return;
      ctx.save(); ctx.globalAlpha = k;
      rr(ctx, L0, y - 30, L1 - L0, 60, 30); ctx.fillStyle = rgba(col, .18); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(PAL.ink, .5); ctx.stroke();
      rr(ctx, L0, y - 30, (L1 - L0) * p, 60, 30); ctx.fillStyle = rgba(col, .55); ctx.fill();
      for (let c = 0; c < 4; c++) for (let r = 0; r < 2; r++) { ctx.fillStyle = (c + r) % 2 ? PAL.ink : PAL.cream; ctx.fillRect(L1 + 6 + r * 15, y - 30 + c * 15, 15, 15); }
      const rx = L0 + 40 + (L1 - L0 - 80) * p, bob = t < e ? -Math.abs(Math.sin(t * 16)) * 10 : 0;
      if (side === 'zip') zipChar(ctx, rx, y + 26 + bob, 30, { t, eyes: t > e ? 'happy' : 'determined', rot: t < e ? .15 : 0, aL: t > e ? 2.6 : 2.1, aR: t > e ? 2.6 : .9, shadow: false, seed: 60 });
      else bloat(ctx, rx, y - 4 + bob, 30, { t, sweat: false });
      txt(ctx, side === 'zip' ? 'WITH ZIP' : 'WITHOUT', L0 + 24, y + 11, { f: 'mono', s: 26, w: 800 }, { fill: PAL.ink });
      if (t >= e) txt(ctx, side === 'zip' ? '1st ✓' : '2nd', L1 - 30, y + 11, { f: 'mono', s: 28, w: 800 }, { align: 'right', fill: PAL.ink });
      ctx.restore();
    });
    // Zip peeks up from behind its card when it wins
    const zd = T('r.zipdone');
    if (t > zd) { const k = E.back(seg(t, zd + .05, zd + .35), 1.8); zipChar(ctx, RX + CARD.w - 140, CARD.y + 14 + (1 - k) * 160, 70, { t, eyes: 'happy', mouth: .6, slider: .2, aL: 2.6, aR: 2.6, dy: -pulse(t, 8) * .15, shadow: false }); }
    ctx.restore();
    // big result stamps
    const S = [['r.s1', 'FEWER TURNS', RX + CARD.w / 2 - 30, 340, -.07, PAL.blue], ['r.s2', 'FINISHES FASTER', RX + CARD.w / 2 + 10, 500, .05, PAL.blue], ['r.s3', '20% CHEAPER', W / 2, 960, -.04, PAL.pink]];
    S.forEach(([id, str, x, y, rot, col], i) => {
      const t0 = T(id); if (t < t0 - .02) return;
      const big = i === 2, st = { f: 'any', w: 900, wd: big ? 90 : 80, s: big ? 170 : 104 };
      stamp(ctx, str, x, y, st, { k: seg(t, t0 - .02, t0 + .16), color: col, rot, multiply: false, fillBox: true, fg: PAL.cream, seed: 11 + i });
    });
  }
  scene('race', 24, 36, (ctx, t) => raceFrame(ctx, t));
})();
