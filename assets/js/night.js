// Night sky. One pixel star set shared by the whole site: dots, plus signs,
// four-point and eight-point sparkles, diamonds and dotted twinkles that
// breathe through their sizes, plus the odd comet. window.QSSky exposes the
// drawing kit (the hero world uses it at its own chunkier scale); this file
// also paints a faint fixed sky behind every page on dark themes.
(() => {
  const css = (v, d) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || d;
  const pal = () => ({ hi: css('--fg-0', '#ece4cc'), cream: css('--fg-1', '#cbc3ab'), butter: css('--warn', '#dfc07f'), sage: '#a9d99f',
    teal: css('--info', '#86c3ba'), rose: css('--rose', '#ebbcba'), ember: css('--ember', '#eba66f'), dim: css('--line-2', '#4a5a4f'), line: css('--line', '#2c3730') });

  // shape(level): list of [dx, dy, tone] with tone 0 = core, 1 = arm, 2 = tip
  const SH = {
    dot: () => [[0, 0, 0]],
    plus: (n) => { const o = [[0, 0, 0]]; for (let i = 1; i <= n; i++) for (const [x, y] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) o.push([x * i, y * i, i === n ? 2 : 1]); return o; },
    ex: (n) => { const o = [[0, 0, 0]]; for (let i = 1; i <= n; i++) for (const [x, y] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) o.push([x * i, y * i, i === n ? 2 : 1]); return o; },
    eight: (n) => [...SH.plus(n), ...SH.ex(Math.max(1, n - 2)).slice(1).map(([x, y]) => [x, y, 2])],
    diamond: (r) => { const o = [[0, 0, 2]]; for (let i = 0; i < r; i++) { const j = r - i; o.push([i, -j, 1], [j, i, 1], [-i, j, 1], [-j, -i, 1]); } return o; },
    dotted: (n) => [[0, 0, 0], [n, 0, 2], [-n, 0, 2], [0, n, 2], [0, -n, 2]],
  };
  // a star's life: a ladder of shapes it steps through as it twinkles
  const LADDER = {
    dust: [SH.dot()],
    small: [SH.dot(), SH.plus(1)],
    spark: [SH.dot(), SH.plus(1), SH.plus(2), SH.plus(3)],
    royal: [SH.plus(1), SH.plus(2), SH.eight(3), SH.eight(4)],
    ex: [SH.dot(), SH.ex(1), SH.ex(2)],
    diamond: [SH.dot(), SH.diamond(2), SH.diamond(3)],
    dotted: [SH.dot(), SH.dotted(2), [...SH.plus(1), ...SH.dotted(3).slice(1)]],
  };
  const KINDS = [['dust', 46], ['small', 26], ['spark', 11], ['ex', 5], ['dotted', 5], ['diamond', 4], ['royal', 3]];
  const COLS = [['hi', 36], ['butter', 26], ['sage', 13], ['teal', 11], ['rose', 9], ['ember', 5]];
  const pick = (list, r) => { let t = r * list.reduce((s, x) => s + x[1], 0); for (const [k, w] of list) { t -= w; if (t <= 0) return k; } return list[0][0]; };

  function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function field(w, h, count, seed, opts = {}) {
    const r = rng(seed), out = [];
    for (let i = 0; i < count; i++) {
      let kind = pick(KINDS, r());
      if (opts.noBig && (kind === 'royal' || kind === 'diamond')) kind = 'spark';
      if (opts.kinds && !opts.kinds.includes(kind)) kind = opts.kinds[Math.floor(r() * opts.kinds.length)];
      const calm = r() < (opts.calm ?? 0.7);                       // most stars hold still; a few breathe
      out.push({ x: Math.floor(r() * w), y: Math.floor(r() * h), kind, col: pick(COLS, r()), ph: r() * 6.283, sp: 0.1 + r() * 0.28, calm, base: r() });
    }
    return out;
  }
  function drawStar(put, st, now, P, bright = 1) {
    const lad = LADDER[st.kind];
    const tw = st.calm ? 0.35 + st.base * 0.4 : (Math.sin(now / 1000 * st.sp + st.ph) + 1) / 2;   // 0..1
    const lvl = Math.min(lad.length - 1, Math.floor(tw * lad.length * 0.999));
    const core = st.kind === 'dust' ? (tw > 0.6 ? P.hi : tw > 0.25 ? P.cream : P.dim) : P.hi;
    const arm = P[st.col] || P.butter;
    const tip = tw > 0.5 ? arm : P.dim;
    for (const [dx, dy, tone] of lad[lvl]) put(st.x + dx, st.y + dy, tone === 0 ? core : tone === 1 ? arm : tip, bright);
  }
  // comet: a two-pixel head and a tail that cools from butter to rose to dim
  function drawComet(put, c, q, P) {
    const x = c.x0 + (c.x1 - c.x0) * q, y = c.y0 + (c.y1 - c.y0) * q;
    const dx = (c.x1 - c.x0), dy = (c.y1 - c.y0), L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const fade = q < 0.15 ? q / 0.15 : q > 0.85 ? (1 - q) / 0.15 : 1;
    for (let i = c.len; i >= 1; i--) put(x - ux * i, y - uy * i, i < 3 ? P.hi : i < c.len * 0.5 ? P.butter : i < c.len * 0.8 ? P.rose : P.dim, fade);
    put(x, y, P.hi, fade); put(x + 1, y, P.hi, fade); put(x, y + 1, P.butter, fade);
  }
  function crescent(put, cx, cy, r, P) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r + r * 0.6) continue;
      const bx = x + Math.ceil(r * 0.55), by = y - Math.ceil(r * 0.3);
      if (bx * bx + by * by <= r * r) continue;                                  // the bite
      put(cx + x, cy + y, (x + y) < -r * 0.6 ? P.hi : P.butter);
    }
  }
  window.QSSky = { pal, field, drawStar, drawComet, crescent };

  // ---------- the site-wide sky ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'nightsky'; cv.setAttribute('aria-hidden', 'true');
  const g = cv.getContext('2d');
  const U = 3;                                                                  // css px per sky pixel: chunky on purpose
  let W = 0, H = 0, stars = [], P = pal(), comet = null, nextComet = 9000, last = 0, dark = true, scrolled = -1e9, clock = 0;
  const isDark = () => (document.documentElement.dataset.theme || 'evergreen') !== 'paper';
  function size() {
    const w = Math.ceil(innerWidth / U), h = Math.ceil(innerHeight / U);
    if (w === W && h === H) return;
    W = w; H = h; cv.width = W; cv.height = H;
    stars = field(W, H, Math.round((W * H) / 1500), 4242, { kinds: ['dust', 'dust', 'small', 'spark', 'ex', 'dotted'], calm: 0.6 });
    // patches of sky: some areas faint, some full, some nearly empty
    for (const st of stars) { const z = 0.5 + 0.5 * Math.sin(st.x * 0.021 + 1.3) * Math.cos(st.y * 0.017 + 0.4) + 0.25 * Math.sin((st.x + st.y) * 0.009); st.a = Math.max(0.12, Math.min(1, z)); }
  }
  function frame(now) {
    if (!dark) return;
    g.clearRect(0, 0, W, H);
    const put = (x, y, c, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
    for (const st of stars) drawStar(put, st, now, P, st.a);
    if (!reduce) {
      if (!comet && now > nextComet && now - scrolled > 1500) { const r = Math.random(); comet = { t0: now, dur: 1100 + r * 500, x0: W * (0.3 + r * 0.7), y0: H * 0.05 * r, len: 9 + Math.round(r * 6) }; comet.x1 = comet.x0 - W * 0.35; comet.y1 = comet.y0 + H * 0.3; }
      if (comet) { const q = (now - comet.t0) / comet.dur; if (q >= 1) { comet = null; nextComet = now + 26000 + Math.random() * 24000; } else drawComet(put, comet, q, P); }
    }
    g.globalAlpha = 1;
  }
  function loop(now) {
    // hold the sky perfectly still while the page is moving; resume a beat after
    if (!document.hidden && now - scrolled > 450 && now - last > 140) { last = now; clock += 140; frame(clock); }
    requestAnimationFrame(loop);
  }
  function mount() {
    document.body.prepend(cv);
    size(); dark = isDark(); cv.hidden = !dark;
    addEventListener('resize', () => { size(); frame(clock); });
    addEventListener('scroll', () => { scrolled = performance.now(); }, { passive: true });
    addEventListener('qs:theme', () => { P = pal(); dark = isDark(); cv.hidden = !dark; frame(clock); });
    if (reduce) frame(4000); else requestAnimationFrame(loop);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
