// Pixel stage: the hero art on the inner pages (data-pxstage, data-scenes).
// A short run of little pixel scenes about Signals and QuarterSmart: a radar
// station (a dish on its tower beside a live scope), the scope on its own,
// the wordmark, a satellite, the four verdicts, a broadcast tower, a launch
// pad, the Monday email, a voice wave, an assistant, the keyboard and manual,
// a desk, the brand mark, an arcade cabinet and the five power-ups. No scene
// draws a person. A page picks its own list with data-scenes.
// Everything is flat, in the homepage hero's hand: whole pixels, flat fills,
// a few palette colours per thing and no shading. The sprites come from
// /assets/px/flat and are drawn at a whole-number scale (K), so each of their
// pixels is a clean K x K block of the grid.
// Between scenes every lit pixel travels to a pixel of the next scene, the
// same morph as the home page: both pictures are cut into matching upright
// strips and paired in order, so neighbours stay neighbours; each pixel's path bends by a
// smooth field over its position, with only a trace of jitter; the styles take
// turns (arc, swirl, rain, burst). The stars sit on their own layer and are
// never morphed.
// Drawn on a 144x96 grid and scaled by whole device pixels so it stays crisp.
// Colours come from the active theme. Opens on the page's still image, drawn
// exactly where and how big the page shows it (so the swap is invisible),
// then glides into the first scene: any sprite the two share slides or zooms
// as one solid piece and the rest flows. Pauses off screen and in background
// tabs, has a pause button, and draws one still frame for reduced motion.
// Debug: ?pxscene=<name> opens every stage on that scene.
(() => {
  'use strict';
  const stages = [...document.querySelectorAll('[data-pxstage]')];
  if (!stages.length) return;

  const W = 144, H = 96, CX = 72, CY = 48, TAU = Math.PI * 2;
  // every sprite pixel is K x K grid pixels (the power-up shelf and the mark set their own)
  const K = 3;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEBUG = new URLSearchParams(location.search).get('pxscene');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const clamp = (v, a = 0, z = 1) => (v < a ? a : v > z ? z : v);
  const wrap = (d) => ((d % TAU) + TAU) % TAU;

  // ---------- palette: theme tokens, read live ----------
  const probe = document.createElement('canvas').getContext('2d');
  const rgbOf = (c) => {
    probe.fillStyle = '#000'; probe.fillStyle = c;
    const h = probe.fillStyle;
    if (h[0] === '#') return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const m = h.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  };
  const hexOf = (v) => '#' + v.map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');
  const TOKENS = ['bg-0', 'bg-1', 'bg-2', 'bg-3', 'line', 'line-2', 'fg-0', 'fg-1', 'fg-2', 'accent', 'warn', 'event', 'info', 'bad'];
  let C = {}, RGB = {}, gen = 0, LIGHT = false;
  function readPalette() {
    const cs = getComputedStyle(document.documentElement);
    C = {};
    for (const t of TOKENS) C[t.replace('-', '')] = hexOf(rgbOf(cs.getPropertyValue('--' + t).trim() || '#888'));
    // the hero's two fixed greens: every trail and signal steps down from the
    // accent through them, in whole colours, never a blend
    C.deep = '#1d7a58'; C.mid = '#2a9a70'; C.quart = '#a9d99f';
    RGB = {};
    for (const k in C) RGB[k] = rgbOf(C[k]);
    // light themes (paper) keep the sprites in their own dark-room colours
    LIGHT = (0.2126 * RGB.bg0[0] + 0.7152 * RGB.bg0[1] + 0.0722 * RGB.bg0[2]) / 255 > 0.5;
    gen++;
  }
  readPalette();

  // ---------- sprites from /assets/px/flat, recoloured to the theme ----------
  // The sprites are drawn in the Evergreen palette; each of those colours maps
  // back to its token so the art follows the theme switcher (the two greens
  // stay fixed, as they do in the hero). A silhouette copy in one token's
  // colour is made on request.
  const SRC = { '#121814': 'bg0', '#1f2822': 'bg2', '#2c3730': 'line', '#4a5a4f': 'line2', '#cbc3ab': 'fg1', '#ece4cc': 'fg0', '#a9d99f': 'accent', '#d99bb8': 'event', '#dfc07f': 'warn', '#86c3ba': 'info' };
  // the colour a sprite pixel of this palette colour is drawn in right now
  const spc = (hex) => (!LIGHT && SRC[hex] ? C[SRC[hex]] : hex);
  const SPR = {};
  function load(name) {
    if (SPR[name]) return SPR[name].p;
    const s = SPR[name] = { ok: false, cv: {}, gens: {} };
    s.p = new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        s.w = img.naturalWidth; s.h = img.naturalHeight;
        const c = document.createElement('canvas'); c.width = s.w; c.height = s.h;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
        s.raw = x.getImageData(0, 0, s.w, s.h);
        s.ok = true; res(s);
      };
      img.onerror = () => res(s);
      img.src = '/assets/px/flat/' + name + '.png?v=__PXV__';   // the build stamps the sprite-set hash
    });
    return s.p;
  }
  // a sprite's pixel colour in its own palette (null where it is clear)
  const pixOf = (s, x, y) => { const d = s.raw.data, o = (y * s.w + x) * 4; return d[o + 3] > 127 ? hexOf([d[o], d[o + 1], d[o + 2]]) : null; };
  function cellsOf(name, hex, test) {
    const s = SPR[name], out = [];
    if (s && s.ok) for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (pixOf(s, x, y) === hex && (!test || test(x, y))) out.push([x, y]);
    return out;
  }
  function spriteCanvas(name, tone) {
    const s = SPR[name];
    if (!s || !s.ok) return null;
    const key = tone || '';
    if (s.gens[key] !== gen) {
      const cv = s.cv[key] || (s.cv[key] = document.createElement('canvas'));
      cv.width = s.w; cv.height = s.h;
      const d = new ImageData(new Uint8ClampedArray(s.raw.data), s.w, s.h), p = d.data, sil = tone ? RGB[tone] : null;
      for (let i = 0; i < p.length; i += 4) {
        if (p[i + 3] < 128) { p[i + 3] = 0; continue; }
        p[i + 3] = 255;
        const k = sil ? null : LIGHT ? null : SRC[hexOf([p[i], p[i + 1], p[i + 2]])];
        const v = sil || (k && RGB[k]);
        if (v) { p[i] = v[0]; p[i + 1] = v[1]; p[i + 2] = v[2]; }
      }
      cv.getContext('2d').putImageData(d, 0, 0);
      s.gens[key] = gen;
    }
    return s.cv[key];
  }

  // ---------- drawing primitives (whole pixels only) ----------
  let G = null;
  const fill = (c) => { if (G.__f !== c) { G.fillStyle = c; G.__f = c; } };
  const rect = (x, y, w, h, c) => { fill(c); G.fillRect(Math.round(x), Math.round(y), w, h); };
  const dot = (x, y, c) => rect(x, y, 1, 1, c);
  // LOG notes where each sprite lands (and which piece of it, in its own
  // pixels), so the opening can glide the page's still straight onto it
  let LOG = null;
  // a sprite at k times its size; tone draws it as a one-colour silhouette
  const spr = (name, x, y, k = 1, tone) => {
    const cv = spriteCanvas(name, tone);
    if (!cv) return;
    x = Math.round(x); y = Math.round(y);
    G.drawImage(cv, 0, 0, cv.width, cv.height, x, y, cv.width * k, cv.height * k);
    if (LOG) LOG.push({ name, x, y, w: cv.width * k, h: cv.height * k, sx: 0, sy: 0, sw: cv.width, sh: cv.height });
  };
  // one sprite cell at (u, v) of a sprite drawn at (ox, oy) and scale k
  const cell = (ox, oy, k, u, v, c) => rect(ox + u * k, oy + v * k, k, k, c);
  const clearCell = (ox, oy, k, u, v) => G.clearRect(ox + u * k, oy + v * k, k, k);
  function disc(cx, cy, r, c, keep) {
    const rr = r * r + r * 0.35, n = Math.ceil(r);
    for (let y = -n; y <= n; y++) for (let x = -n; x <= n; x++) if (x * x + y * y <= rr && (!keep || keep(x, y))) dot(cx + x, cy + y, c);
  }
  function arc(cx, cy, r, a0, a1, c, dash) {
    const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * r * 1.6));
    let lx = 1e9, ly = 1e9, k = 0;
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (x === lx && y === ly) continue;
      lx = x; ly = y;
      if (!dash || (k++ % dash) < dash / 2) dot(x, y, c);
    }
  }
  // an arc of whole sprite cells, on the grid of a sprite drawn at (ox, oy) and scale k
  function cellArc(ox, oy, k, cx, cy, r, a0, a1, c) {
    const seen = new Set(), n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * r * 2));
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n, u = Math.round(cx + Math.cos(a) * r), v = Math.round(cy + Math.sin(a) * r);
      if (seen.has(u * 1000 + v)) continue;
      seen.add(u * 1000 + v); cell(ox, oy, k, u, v, c);
    }
  }
  function line(x0, y0, x1, y1, c, dash) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy, k = 0;
    for (;;) {
      if (!dash || (k++ % dash) < dash / 2) dot(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const floorLine = (y, x0, x1) => { for (let x = x0; x < x1; x += 4) rect(x, y, 2, 1, C.line2); };
  const box = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  const inCircle = (cx, cy, r) => (x, y) => (x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r;
  // a sprite of k-pixel cells, centred on the grid's x axis with its bottom row on y
  const standX = (w, k) => Math.round((W - w * k) / 2);

  // 5x7 pixel letters for the few words the scenes spell
  const FONT = {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
    I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  };
  function text(str, x, y, s, col) {
    for (const ch of str) {
      const g = FONT[ch];
      if (g) for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) if (g[r][k] === '#') {
        for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) {
          const px = x + k * s + xx, py = y + r * s + yy;
          const c = typeof col === 'function' ? col(px, py, r * s + yy) : col;
          if (c) dot(px, py, c);
        }
      }
      x += 6 * s;
    }
  }
  // the cells of a word, for scenes that treat its pixels one by one
  function wordCells(str, x, y, s) {
    const out = [];
    for (const ch of str) {
      const g = FONT[ch];
      if (g) for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) if (g[r][k] === '#') {
        for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) out.push({ x: x + k * s + xx, y: y + r * s + yy, ry: r * s + yy });
      }
      x += 6 * s;
    }
    return out;
  }

  // ---------- the night: its own layer, never morphed ----------
  const STARS = (() => {
    let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 46 }, () => ({ x: Math.floor(rnd() * W), y: Math.floor(rnd() * (H - 14)), p: rnd() * TAU, f: 0.6 + rnd() * 1.2, big: rnd() < 0.12 }));
  })();
  // mA, mB: where each scene keeps the sky clear; mix: how far from A to B;
  // fade: the whole sky, which comes up gently when the stage opens
  function drawStars(g, t, mA, mB, mix, fade = 1) {
    g.clearRect(0, 0, W, H);
    for (const s of STARS) {
      const a = mA && mA(s.x, s.y) ? 0 : 1, b = mB ? (mB(s.x, s.y) ? 0 : 1) : a;
      const al = (a + (b - a) * mix) * fade;
      if (al <= 0.02) continue;
      g.globalAlpha = al;
      const v = Math.sin(t / 700 * s.f + s.p);
      g.fillStyle = v > 0.75 ? C.fg0 : v > -0.3 ? C.fg1 : C.line2;
      g.fillRect(s.x, s.y, 1, 1);
      if (s.big && v > 0.55) { g.fillStyle = C.line2; g.fillRect(s.x - 1, s.y, 1, 1); g.fillRect(s.x + 1, s.y, 1, 1); g.fillRect(s.x, s.y - 1, 1, 1); g.fillRect(s.x, s.y + 1, 1, 1); }
    }
    g.globalAlpha = 1;
  }

  // ---------- the scope ----------
  // Its blips are the real Signals on the hub (angle = kind, distance = age).
  const BLIPS = (() => {
    const ANG = { reported: 35, event: 100, available: 170, confirmed: 200, early: 250, quiet: 300, insight: 330 };
    const TOK = { reported: 'warn', event: 'event', available: 'info', confirmed: 'info', early: 'accent', quiet: 'fg1', insight: 'fg0' };
    let posts = null;
    const el = document.getElementById('sig-data');
    try { posts = el ? JSON.parse(el.textContent) : null; } catch (e) { posts = null; }
    if (!Array.isArray(posts) || !posts.length) {
      posts = ['reported', 'available', 'event', 'insight', 'available', 'early', 'quiet', 'insight', 'reported'].map((kind, i) => ({ kind, age: 6 + i * 21 }));
    } else {
      const newest = Math.max(...posts.map((p) => Date.parse(p.date + 'T12:00:00Z') || 0));
      posts = posts.map((p) => ({ kind: p.kind, age: Math.max(0, (newest - (Date.parse(p.date + 'T12:00:00Z') || newest)) / 864e5) }));
    }
    return posts.map((p, i) => ({
      a: ((ANG[p.kind] ?? 330) + ((i * 23) % 26) - 13) * Math.PI / 180,
      rn: 0.18 + Math.min(1, Math.sqrt(p.age / 200)) * 0.74,
      k: TOK[p.kind] || 'fg1',
    }));
  })();
  const sweepAt = (t, turn) => t / turn * TAU - Math.PI / 2;
  // The scope is drawn in whole sprite cells (K x K blocks of the grid), on the
  // same lattice as the tower beside it, so a scene keeps one pixel size. A
  // scope is { ox, oy, cu, cv, R }: the lattice starts at (ox, oy), the centre
  // is cell (cu, cv) and the bezel sits R cells out.
  const scell = (s, u, v, c) => cell(s.ox, s.oy, K, s.cu + u, s.cv + v, c);
  // the static face: the bezel, one range ring and the cross hairs
  function scopeFace(s) {
    for (let v = -s.R; v <= s.R; v++) for (let u = -s.R; u <= s.R; u++) {
      const d = Math.hypot(u, v);
      if (Math.abs(d - s.R) < 0.5) scell(s, u, v, C.line2);
      else if (d < s.R - 0.5 && (u === 0 || v === 0 || Math.abs(d - s.R / 2) < 0.5)) scell(s, u, v, C.line);
    }
  }
  // the trail: a wedge behind the sweep that steps down through four flat
  // colours, the two greens, then the line and the surface
  function scopeTrail(s, sw) {
    for (let v = -s.R + 1; v < s.R; v++) for (let u = -s.R + 1; u < s.R; u++) {
      const dd = Math.hypot(u, v); if (dd > s.R - 0.5 || dd < 1) continue;
      const d = wrap(sw - Math.atan2(v, u));
      if (d < 1.5) scell(s, u, v, d < 0.16 ? C.mid : d < 0.42 ? C.deep : d < 0.85 ? C.line : C.bg2);
    }
  }
  // the sweep line and the blips: each lights as the line passes, then goes dim
  function scopeLive(s, sw) {
    const eu = Math.round(Math.cos(sw) * (s.R - 1)), ev = Math.round(Math.sin(sw) * (s.R - 1)), n = Math.max(Math.abs(eu), Math.abs(ev));
    for (let i = 1; i <= n; i++) scell(s, Math.round(eu * i / n), Math.round(ev * i / n), C.accent);
    scell(s, 0, 0, C.fg0);
    for (const b of BLIPS) {
      const d = wrap(sw - b.a), u = Math.round(Math.cos(b.a) * b.rn * (s.R - 1.5)), v = Math.round(Math.sin(b.a) * b.rn * (s.R - 1.5));
      if (!u && !v) continue;
      if (d < 0.35) scell(s, u, v, C.fg0);
      else if (d < 1.7) scell(s, u, v, C[b.k]);
      else if (d < 3.6) scell(s, u, v, C.line2);
    }
  }

  const E = {
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    o: (t) => 1 - Math.pow(1 - t, 3),
  };

  // ---------- sprite details the scenes animate, read from the art ----------
  // the radar tower's two signal arcs (inner, outer), split by distance from the feed
  function towerArcs() {
    const s = SPR['radar-tower'];
    if (!s || !s.ok) return [[], []];
    if (!s.arcs) {
      const feed = cellsOf('radar-tower', '#dfc07f');
      const fx = feed.reduce((a, p) => a + p[0], 0) / (feed.length || 1) + 0.5, fy = feed.reduce((a, p) => a + p[1], 0) / (feed.length || 1) + 0.5;
      s.arcs = [[], []];
      cellsOf('radar-tower', '#a9d99f', (x, y) => y < fy).forEach(([x, y]) => s.arcs[Math.hypot(x + 0.5 - fx, y + 0.5 - fy) < 4.8 ? 0 : 1].push([x, y]));
    }
    return s.arcs;
  }
  // the snake on the cabinet's screen: its sage cells traced tail to head, and
  // the cream pellet. The screen is the night box inside the bezel.
  const SNAKE = { box: [2, 5, 13, 11], tick: 170, spots: [[4, 10], [12, 5], [3, 8], [10, 11], [6, 5], [12, 9], [8, 7], [2, 11], [11, 6], [5, 9]] };
  function snakeStart() {
    const s = SPR['cabinet-sage'];
    if (!s || !s.ok) return null;
    if (s.snake) return s.snake;
    const [x0, y0, x1, y1] = SNAKE.box, inBox = (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
    const body = cellsOf('cabinet-sage', '#a9d99f', inBox), food = cellsOf('cabinet-sage', '#ece4cc', inBox)[0] || [x1, y0];
    const has = new Set(body.map(([x, y]) => x * 32 + y)), nb = ([x, y]) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => has.has(a * 32 + b));
    const ends = body.filter((p) => nb(p).length === 1).sort((a, b) => (Math.abs(b[0] - food[0]) + Math.abs(b[1] - food[1])) - (Math.abs(a[0] - food[0]) + Math.abs(a[1] - food[1])));
    const path = [];
    if (ends.length) {
      const seen = new Set();
      let p = ends[0];
      while (p) { path.push(p); seen.add(p[0] * 32 + p[1]); p = nb(p).find(([a, b]) => !seen.has(a * 32 + b)); }
    }
    const n = path.length, dir = n > 1 ? [path[n - 1][0] - path[n - 2][0], path[n - 1][1] - path[n - 2][1]] : [1, 0];
    return (s.snake = { body: path, dir, food });
  }
  // where the snake is after t ms: it steers for the pellet, and a boxed-in snake starts a new game
  function snakeAt(t) {
    const st = snakeStart();
    if (!st || !st.body.length) return null;
    const [x0, y0, x1, y1] = SNAKE.box;
    let body = st.body.slice(), dir = st.dir, food = st.food, fi = 0;
    const n = Math.floor(t / SNAKE.tick);
    for (let i = 0; i < n; i++) {
      const head = body[body.length - 1], occ = new Set(body.slice(1).map(([x, y]) => x * 32 + y));
      let best = null, bs = 1e9;
      for (const [dx, dy] of [dir, [dir[1], -dir[0]], [-dir[1], dir[0]]]) {
        const nx = head[0] + dx, ny = head[1] + dy;
        if (nx < x0 || nx > x1 || ny < y0 || ny > y1 || occ.has(nx * 32 + ny)) continue;
        const d = Math.abs(nx - food[0]) + Math.abs(ny - food[1]);
        if (d < bs) { bs = d; best = [dx, dy]; }
      }
      if (!best) { body = st.body.slice(); dir = st.dir; food = st.food; continue; }
      dir = best;
      body.push([head[0] + dir[0], head[1] + dir[1]]);
      body.shift();
      const h = body[body.length - 1];
      if (h[0] === food[0] && h[1] === food[1]) {
        const on = new Set(body.map(([x, y]) => x * 32 + y));
        for (let k = 0; k < SNAKE.spots.length; k++) { const s = SNAKE.spots[(fi + k) % SNAKE.spots.length]; if (!on.has(s[0] * 32 + s[1])) { food = s; fi += k + 1; break; } }
      }
    }
    return { body, food };
  }

  // ---------- the scenes ----------
  // stat(): drawn once per theme and cached. under(t) and over(t): live
  // layers. sky(x, y): true where the stars stay away from the art.
  // Every sprite scene opens (t = 0) on its sprite exactly as the file draws
  // it, so a page's still of that sprite swaps to the canvas unseen.
  const PU = ['radar', 'map', 'setup', 'token', 'robot'];
  // five shelf slots 28 wide; the lit power-up doubles in its slot
  const PU_SLOT = (i) => 16 + i * 28, PU_FLOOR = 70;
  const WORD = { s: 3, x: 10, y: 34 };
  const WORD_CELLS = wordCells('SIGNALS', WORD.x, WORD.y, WORD.s);
  // the echo extrudes only from the lowest pixel in every column, like the home page's
  const WORD_ECHO = (() => {
    const low = new Map(), out = [];
    for (const c of WORD_CELLS) if (!low.has(c.x) || c.y > low.get(c.x)) low.set(c.x, c.y);
    for (const [x, y] of low) for (let k = 1; k <= 5; k++) out.push({ x, y: y + k, k });
    return out;
  })();
  // the brand mark from _partials/mark.html, as "x,y,width" runs on its 14x14 grid
  const MARK_D = '4,2,2 2,3,4 1,4,5 1,5,5 0,6,6 0,7,6 0,8,12 0,9,12 1,10,10 1,11,10 2,12,8 4,13,4';
  const MARK_L = '8,0,2 8,1,4 8,2,5 8,3,5 8,4,6 8,5,6';
  const runs = (spec) => spec.split(' ').map((r) => r.split(',').map(Number));
  const MARK = { k: 5, d: runs(MARK_D), l: runs(MARK_L) };
  MARK.x = standX(14, MARK.k); MARK.y = Math.round((H - 14 * MARK.k) / 2);

  // the radar station: the tower on the left, the scope on its stand on the right,
  // both on the tower's cell lattice (the scope's centre is cell 33, 9 of it)
  const RADAR = { tx: 4, ty: 19, sx: 104, sy: 47, sr: 28, turn: 3000 };
  const RSCOPE = { ox: RADAR.tx, oy: RADAR.ty, cu: 33, cv: 9, R: 9 };
  const SCOPE = { ox: 1, oy: 2, cu: 23, cv: 15, R: 14 };
  const ASSIST = { x: standX(16, K), y: 38 };
  const KEYS = { x: 14, y: 33 };
  const CAB = { x: standX(16, K), y: 7 };
  const DESK = { x: standX(28, K), y: 22 };

  const SCENES = {
    // the radar station: the dish on its tower pulls in a signal, and the
    // scope it feeds sweeps without stopping
    radar: {
      sprites: ['radar-tower'],
      sky: (x, y) => box(0, 12, 70, 92)(x, y) || inCircle(RADAR.sx, RADAR.sy, RADAR.sr + 5)(x, y) || box(RADAR.sx - 12, RADAR.sy, RADAR.sx + 12, 92)(x, y),
      stat() {
        const { tx, ty } = RADAR, S = RSCOPE;
        // the floor: every other cell of the row under the tower
        for (let u = -1; u < 47; u += 2) cell(tx, ty, K, u, 24, C.line2);
        spr('radar-tower', tx, ty, K);
        scopeFace(S);
        // the scope's stand, one flat colour, on the tower's cell grid
        for (let v = S.cv + S.R + 1; v < 23; v++) cell(tx, ty, K, S.cu, v, C.line2);
        for (let u = -3; u <= 3; u++) cell(tx, ty, K, S.cu + u, 23, C.line2);
      },
      under(t) { scopeTrail(RSCOPE, sweepAt(t, RADAR.turn)); },
      over(t) {
        // the arcs come in to the dish: both lit (as drawn), then none, then the outer one
        const ph = t % 1500, [inner, outer] = towerArcs();
        if (ph >= 600) {
          for (const [u, v] of outer) if (ph < 900) clearCell(RADAR.tx, RADAR.ty, K, u, v);
          for (const [u, v] of inner) if (ph < 1200) clearCell(RADAR.tx, RADAR.ty, K, u, v);
        }
        scopeLive(RSCOPE, sweepAt(t, RADAR.turn));
      },
    },
    scope: {
      sky: inCircle(CX, CY, 46),
      stat() { scopeFace(SCOPE); },
      under(t) { scopeTrail(SCOPE, sweepAt(t, 3600)); },
      over(t) { scopeLive(SCOPE, sweepAt(t, 3600)); },
    },
    // the wordmark as a sign: stacked copies step straight down in rose,
    // butter, sage and teal over a deep green base, and the colours chase slowly
    word: {
      sky: box(6, 28, 138, 62),
      over(t) {
        const L = [C.event, C.warn, C.accent, C.info], ph = Math.floor(t / 520) % 4;
        for (const e of WORD_ECHO) dot(e.x, e.y, e.k === 5 ? C.deep : L[(e.k - 1 + ph) % 4]);
        const g = ((t % 3400) / 3400) * 230 - 50;
        for (const c of WORD_CELLS) {
          const glint = Math.abs(c.x - g + (c.y - WORD.y) * 0.6) < 2;
          dot(c.x, c.y, glint ? C.accent : c.ry >= 18 ? C.accent : C.fg0);
        }
      },
    },
    // a satellite over a planet's edge, sending its downlink
    satellite: {
      sky: (x, y) => Math.hypot(x - 22, y - 152) < 86 || box(74, 14, 124, 46)(x, y),
      stat() {
        // the planet: a teal rim and a flat surface crossed by two cloud bands
        const pcx = 22, pcy = 152, r = 82;
        for (let y = 60; y < H; y++) for (let x = 0; x < 120; x++) {
          const depth = r - Math.hypot(x - pcx, y - pcy);
          if (depth < 0) continue;
          dot(x, y, depth < 2 ? C.info : (y >= 77 && y < 80) || (y >= 87 && y < 89) ? C.line : C.bg2);
        }
      },
      over(t) {
        const sx = 96, sy = 24 + Math.round(Math.sin(t / 800) * 1.4);
        // two teal panels split into cells, a cream body with one flat shadow side
        for (const x0 of [sx - 18, sx + 10]) { rect(x0, sy + 5, 16, 6, C.info); for (let i = 4; i < 16; i += 4) rect(x0 + i, sy + 5, 1, 6, C.line2); }
        rect(sx - 2, sy + 7, 2, 2, C.fg1); rect(sx + 8, sy + 7, 2, 2, C.fg1);
        rect(sx, sy + 2, 8, 12, C.fg0); rect(sx + 6, sy + 2, 2, 12, C.fg1);
        rect(sx + 2, sy + 6, 3, 4, C.line2);
        arc(sx + 4, sy + 1, 3, Math.PI, TAU, C.fg0); rect(sx + 4, sy - 3, 1, 2, C.fg1);
        dot(sx + 4, sy - 4, (t % 1200) < 500 ? C.fg0 : C.line2);
        const n = 44;
        for (let i = 0; i < n; i++) if ((((i - t / 70) % 6) + 6) % 6 < 2) { const q = i / n; dot(sx + 3 - q * 40, sy + 15 + q * 38, C.accent); }
      },
    },
    verdicts: {
      rows: [['ACT NOW', 'accent'], ['PREPARE', 'warn'], ['WAIT', 'info'], ['IGNORE', 'fg1']],
      sky: box(18, 6, 130, 92),
      stat() { this.rows.forEach(([w], i) => text(w, 40, 12 + i * 20, 2, C.line2)); },
      over(t) {
        const i = Math.floor(t / 1100) % 4, [w, k] = this.rows[i], y = 12 + i * 20;
        text(w, 40, y, 2, C[k]);
        for (let j = 0; j < 9; j++) rect(26, y + 2 + j, 5 - Math.abs(4 - j), 1, C.fg0);
      },
    },
    tower: {
      sky: box(50, 3, 94, 92),
      stat() {
        floorLine(91, 20, 124);
        line(72, 20, 55, 90, C.fg1); line(72, 20, 89, 90, C.fg1);
        let prev = null;
        for (let y = 30; y <= 88; y += 10) {
          const hw = Math.round((y - 20) / 70 * 17);
          rect(72 - hw, y, hw * 2 + 1, 1, C.fg1);
          if (prev) { line(72 - prev.hw, prev.y, 72 + hw, y, C.line2); line(72 + prev.hw, prev.y, 72 - hw, y, C.line2); }
          prev = { y, hw };
        }
        rect(72, 8, 1, 12, C.fg1); rect(71, 17, 3, 3, C.fg0);
        rect(52, 90, 41, 1, C.fg1);
      },
      over(t) {
        dot(72, 7, (t % 1000) < 450 ? C.event : C.line2);
        for (let k = 0; k < 3; k++) {
          const r = 6 + ((t / 38 + k * 14) % 42), c = r < 18 ? C.accent : r < 32 ? C.mid : C.deep;
          arc(72, 10, r, -0.7, 0.7, c); arc(72, 10, r, Math.PI - 0.7, Math.PI + 0.7, c);
        }
      },
    },
    rocket: {
      sky: box(46, 8, 98, 92),
      stat() {
        floorLine(91, 16, 128);
        rect(50, 86, 44, 4, C.line2);
        // the gantry, all in the dim tone
        rect(88, 26, 1, 60, C.line2); rect(93, 26, 1, 60, C.line2);
        for (let y = 26; y < 84; y += 6) { rect(88, y, 6, 1, C.line2); line(88, y, 93, y + 6, C.line2); }
        rect(77, 44, 11, 1, C.line2); rect(77, 60, 11, 1, C.line2);
        // cream body and nose with one flat shadow side, rose tip, band and fins, a teal window
        for (let y = 14; y < 32; y++) {
          const half = Math.max(1, Math.round((y - 13) / 18 * 6)), x0 = 70 - half, x1 = 70 + half;
          rect(x0, y, x1 - x0, 1, y < 19 ? C.event : C.fg0);
          if (y >= 19 && x1 > 72) rect(72, y, x1 - 72, 1, C.fg1);
        }
        rect(64, 32, 12, 46, C.fg0); rect(72, 32, 4, 46, C.fg1);
        rect(64, 52, 12, 3, C.event);
        disc(69, 41, 2.5, C.info);
        for (let i = 0; i < 11; i++) { const w = Math.ceil(i / 2); rect(64 - w, 67 + i, w, 1, C.event); rect(76, 67 + i, w, 1, C.event); }
        rect(66, 78, 8, 3, C.line2); rect(67, 81, 6, 1, C.line2);
      },
      over(t) {
        // the flame breathes on smooth waves, not random flicker
        for (let x = 67; x < 73; x++) {
          const edge = x === 67 || x === 72 ? 2 : 0;
          const n = Math.max(1, Math.round(4.5 + Math.sin(t / 110 + x * 1.7) * 1.6 + Math.sin(t / 67 + x * 0.9) * 0.9) - edge);
          for (let j = 0; j < n; j++) dot(x, 82 + j, j < 2 ? C.fg0 : j < 4 ? C.warn : C.event);
        }
        const q = (t % 1400) / 1400, pr = 1 + Math.round(q * 4), pc = q < 0.6 ? C.fg1 : C.line2;
        arc(56, 88, pr, Math.PI, TAU, pc); arc(88, 88, pr, Math.PI, TAU, pc);
      },
    },
    mail: {
      sky: box(34, 16, 112, 88),
      stat() {
        for (let y = 20; y < 40; y++) { const half = Math.round((y - 20) / 20 * 34); rect(72 - half, y, half * 2 + 1, 1, C.line2); dot(72 - half, y, C.fg1); dot(72 + half, y, C.fg1); }
        rect(38, 40, 69, 45, C.line2);
      },
      over(t) {
        const rise = Math.round(15 * E.o(Math.min(1, t / 1500))), top = 42 - rise;
        rect(46, top, 53, 60 - top, C.fg0);
        text('MON', 50, top + 4, 1, C.deep);
        rect(50, top + 14, 40, 1, C.line2); rect(50, top + 18, 30, 1, C.line2); rect(50, top + 22, 36, 1, C.line2);
        rect(38, 58, 69, 27, C.fg1);
        line(38, 58, 72, 74, C.line2); line(106, 58, 72, 74, C.line2);
        const ph = t % 1600, b = ph < 400 ? Math.round(Math.sin(ph / 400 * Math.PI) * 3) : 0;
        disc(104, 40 - b, 5, C.accent);
        rect(104, 38 - b, 1, 5, C.bg0); dot(103, 39 - b, C.bg0); rect(103, 42 - b, 3, 1, C.bg0);
      },
    },
    wave: {
      sky: box(18, 10, 126, 86),
      stat() { for (let x = 14; x < 130; x += 3) dot(x, CY, C.line); },
      over(t) {
        for (let i = 0; i < 19; i++) {
          const env = Math.sin(Math.PI * (i + 1) / 20);
          const h = 2 + Math.round(30 * env * (0.35 + 0.65 * Math.abs(Math.sin(t / 240 + i * 0.8) * Math.sin(t / 530 + i * 0.37 + 1.1))));
          const x = 25 + i * 5;
          for (let dy = -h; dy <= h; dy++) { const a = Math.abs(dy) / h; rect(x, CY + dy, 3, 1, a > 0.92 ? C.fg0 : a > 0.6 ? C.info : C.accent); }
        }
      },
    },
    // the assistant: its antenna sends, and now and then it blinks
    assistant: {
      sprites: ['assistant'],
      sky: box(36, 8, 108, 84),
      stat() { floorLine(80, 30, 114); spr('assistant', ASSIST.x, ASSIST.y, K); },
      over(t) {
        const { x, y } = ASSIST;
        if (t < 500) return;
        // signal arcs leave the antenna tip in whole cells
        for (let k = 0; k < 3; k++) {
          const r = 2 + ((t / 110 + k * 2.4) % 7.2);
          cellArc(x, y, K, 7, 0.5, r, -2.25, -0.9, r < 4.4 ? C.accent : r < 6.8 ? C.mid : C.deep);
        }
        if ((t % 1400) >= 900) cell(x, y, K, 7, 0, C.mid);
        // a blink: the top row of each eye goes back to the screen's colour
        if ((t % 3200) > 2400 && (t % 3200) < 2560) for (const [u, v] of cellsOf('assistant', '#121814', (a, b) => b === 5)) cell(x, y, K, u, v, spc('#a9d99f'));
      },
    },
    // the keyboard and the manual: a key lights as someone types
    keyboard: {
      sprites: ['keyboard-manual'],
      sky: box(8, 26, 136, 68),
      stat() { floorLine(63, 10, 134); spr('keyboard-manual', KEYS.x, KEYS.y, K); },
      over(t) {
        if (t < 400) return;
        const s = SPR['keyboard-manual'];
        // the keys: the cream caps on the keyboard (the manual's cream pages start at x 22)
        if (s && s.ok && !s.keys) s.keys = cellsOf('keyboard-manual', '#ece4cc', (x) => x < 22);
        if (s && s.keys && s.keys.length) { const k = s.keys[(hash(7, Math.floor(t / 190)) * s.keys.length) | 0]; cell(KEYS.x, KEYS.y, K, k[0], k[1], C.accent); }
      },
    },
    // the desk: a prompt on the monitor and a cursor that blinks after it
    desk: {
      sprites: ['desk-crt'],
      sky: box(20, 14, 124, 80),
      stat() { floorLine(76, 18, 126); spr('desk-crt', DESK.x, DESK.y, K); },
      over(t) {
        if (t >= 400 && (t % 1000) < 520) cell(DESK.x, DESK.y, K, 10, 7, spc('#a9d99f'));
      },
    },
    // the brand mark on its own 14x14 grid: the light quarter steps out and
    // back, and a glint crosses it in whole cells
    mark: {
      sky: box(MARK.x - 8, MARK.y - 10, MARK.x + 14 * MARK.k + 12, MARK.y + 14 * MARK.k + 4),
      stat() { for (const [x, y, w] of MARK.d) rect(MARK.x + x * MARK.k, MARK.y + y * MARK.k, w * MARK.k, MARK.k, C.deep); },
      over(t) {
        const out = (t % 2600) > 1300 ? 1 : 0, g = Math.floor(((t % 2600) / 2600) * 22) - 4, k = MARK.k;
        for (const [x, y, w] of MARK.l) for (let i = 0; i < w; i++) {
          const u = x + i + out, v = y - out;
          rect(MARK.x + u * k, MARK.y + v * k, k, k, (x + i) - (5 - y) === g || (x + i) - (5 - y) === g + 1 ? C.fg0 : C.quart);
        }
      },
    },
    // the arcade cabinet, and a game of snake on its screen
    arcade: {
      sprites: ['cabinet-sage'],
      sky: box(40, 0, 104, 95),
      stat() { floorLine(91, 30, 114); spr('cabinet-sage', CAB.x, CAB.y, K); },
      over(t) {
        const g = snakeAt(t);
        if (!g) return;
        const [x0, y0, x1, y1] = SNAKE.box;
        rect(CAB.x + x0 * K, CAB.y + y0 * K, (x1 - x0 + 1) * K, (y1 - y0 + 1) * K, spc('#121814'));
        cell(CAB.x, CAB.y, K, g.food[0], g.food[1], spc('#ece4cc'));
        for (const [u, v] of g.body) cell(CAB.x, CAB.y, K, u, v, spc('#a9d99f'));
      },
    },
    // the five power-ups on a shelf: one at a time powers up to double size
    // while a small cursor glides along underneath; the rest wait as silhouettes
    powerups: {
      sprites: PU.map((n) => 'pu-' + n),
      sky: box(0, 22, 143, 80),
      stat() { floorLine(PU_FLOOR + 1, 4, 140); },
      over(t) {
        const cyc = 900, u = t / cyc, i = Math.floor(u) % 5, j = (i + 4) % 5, since = (u - Math.floor(u)) * cyc;
        PU.forEach((n, k) => {
          const s = k === i ? 2 : 1;
          spr('pu-' + n, PU_SLOT(k) - 8 * s, PU_FLOOR + 1 - 16 * s - (s - 1) * 2, s, s === 1 ? 'line2' : null);
        });
        // the opening item is already lit, so the cursor starts under it
        const from = PU_SLOT(j), to = PU_SLOT(i), x = t < cyc ? to : Math.round(from + (to - from) * E.io(clamp(since / 300)));
        rect(x - 2, 77, 5, 1, C.accent); rect(x - 1, 76, 3, 1, C.accent); dot(x, 75, C.accent);
      },
    },
  };
  const named = (n) => n;
  const ORDER = ['radar', 'scope', 'word', 'satellite', 'verdicts', 'tower', 'rocket', 'mail', 'wave', 'assistant', 'keyboard', 'mark', 'arcade', 'powerups'];
  const ready = (scn) => !scn.sprites || scn.sprites.every((n) => SPR[n] && SPR[n].ok);
  function cacheOf(sc) {
    if (sc._still) return sc._c;
    if (!sc._c) sc._c = mk();
    if (sc._gen !== gen) {
      const prev = G; G = sc._c.getContext('2d'); G.__f = null; G.imageSmoothingEnabled = false;
      G.clearRect(0, 0, W, H); sc._log = []; LOG = sc._log; sc.stat && sc.stat(); LOG = null;
      G = prev;
      if (ready(sc)) sc._gen = gen;
    }
    return sc._c;
  }
  function paint(sc, t, g) {
    const cache = cacheOf(sc), prev = G;
    G = g; g.__f = null; g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
    if (sc.under) sc.under(t);
    g.drawImage(cache, 0, 0);
    const lo = []; LOG = lo;
    if (sc.over) sc.over(t);
    LOG = null; sc._drawn = (sc._log || []).concat(lo);
    G = prev;
  }
  function sample(g) {
    const d = g.getImageData(0, 0, W, H).data, pts = [];
    for (let i = 0, n = W * H; i < n; i++) { const o = i * 4; if (d[o + 3] > 127) pts.push({ x: i % W, y: (i / W) | 0, c: [d[o], d[o + 1], d[o + 2]] }); }
    return pts;
  }

  // ---------- the morph (the home page's, on this grid) ----------
  const MORPH = 1200;
  const MSTYLES = ['arc', 'swirl', 'rain', 'burst'];
  // Pair the two pictures so that neighbours stay neighbours in both
  // directions: split each into the same number of upright strips by x, then
  // pair top to bottom inside matching strips. A patch of one picture lands
  // as a patch of the next, so shapes flow instead of breaking into sand.
  function pairUp(A, B) {
    const N = Math.max(A.length, B.length, 1), K = Math.max(6, Math.min(28, Math.round(Math.sqrt(N) / 3)));
    const strips = (P) => {
      P.sort((m, n) => m.x - n.x || m.y - n.y);
      const out = [];
      for (let b = 0; b < K; b++) out.push(P.slice(Math.floor(b * P.length / K), Math.floor((b + 1) * P.length / K)).sort((m, n) => m.y - n.y || m.x - n.x));
      return out;
    };
    const SA = strips(A), SB = strips(B), out = [];
    for (let b = 0; b < K; b++) {
      const a = SA[b], z = SB[b], n = Math.max(a.length, z.length);
      for (let j = 0; j < n; j++) out.push([a.length ? a[Math.floor(j * a.length / n)] : null, z.length ? z[Math.floor(j * z.length / n)] : null]);
    }
    return out;
  }
  // The same sprite (or a piece of it) at another size or place: every pixel
  // of that piece goes straight to its own spot through one transform, all
  // together, so it zooms and slides as one solid picture. What is left of
  // both pictures flows as usual, so a still of the dish on its tower slides
  // the tower across while the old dish pours into the new dish and scope.
  function zoomPairs(A, B, zm) {
    const ga = new Map(A.map((p) => [p.x * 1000 + p.y, p])), gb = new Map(B.map((p) => [p.x * 1000 + p.y, p]));
    const near = (g, x, y) => { x = Math.round(x); y = Math.round(y); for (let r = 0; r <= 1; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const p = g.get((x + dx) * 1000 + y + dy); if (p) return p; } return null; };
    const { f, t } = zm, kx = f.w / t.w, ky = f.h / t.h, used = new Set(), out = [], restA = [], restB = [];
    const inF = (p) => p.x > f.x - 1 && p.y > f.y - 1 && p.x < f.x + f.w && p.y < f.y + f.h;
    for (const b of B) {
      if (b.x < t.x || b.y < t.y || b.x >= t.x + t.w || b.y >= t.y + t.h) { restB.push(b); continue; }
      const ax = f.x + (b.x - t.x + 0.5) * kx - 0.5, ay = f.y + (b.y - t.y + 0.5) * ky - 0.5, a = near(ga, ax, ay);
      if (a) used.add(a);
      out.push([a || { x: ax, y: ay, c: b.c, fadeIn: true }, b, true]);
    }
    for (const a of A) if (!used.has(a)) {
      if (!inF(a)) { restA.push(a); continue; }
      const bx = t.x + (a.x - f.x + 0.5) / kx - 0.5, by = t.y + (a.y - f.y + 0.5) / ky - 0.5;
      out.push([a, near(gb, bx, by) || { x: bx, y: by, c: a.c, fade: true }, true]);
    }
    // enough left on both sides to flow from one to the other; a few stray
    // pixels (a floor line) just fade in or out where they are
    if (restA.length > 40 && restB.length > 40) out.push(...pairUp(restA, restB));
    else {
      for (const b of restB) out.push([{ x: b.x, y: b.y, c: b.c, fadeIn: true }, b, true]);
      for (const a of restA) out.push([a, { x: a.x, y: a.y, c: a.c, fade: true }, true]);
    }
    return out;
  }
  function buildMorph(A, B, st, zm) {
    const P = zm ? zoomPairs(A, B, zm) : pairUp(A, B), n = P.length, parts = new Array(n);
    let end = 0;
    for (let i = 0; i < n; i++) {
      const z = P[i][1], rigid = !!P[i][2];
      const a = P[i][0] || { x: CX, y: CY, c: z ? z.c : [169, 217, 159] };
      const zz = z || { x: a.x, y: H + 4, c: a.c, fade: true };
      // a trace of jitter (under a hundredth of the morph), no more
      const jit = ((i * 7919) % 100) / 12000;
      // one smooth field over position: neighbours bend the same way
      const bend = rigid ? 0 : Math.sin(a.x * 0.05 + a.y * 0.09) * 10 + Math.sin(a.x * 0.013) * 4;
      let delay, win = 0.58;
      if (rigid) { delay = 0.08; win = 0.72; }
      else if (st === 'rain') { delay = (a.x / W) * 0.25 + jit; win = 0.62; }
      else if (st === 'burst') delay = Math.hypot(a.x - CX, a.y - CY) / W * 0.3 + jit;
      else if (st === 'glide') { delay = (zz.x / W) * 0.18 + jit; win = 0.7; }
      else delay = (zz.x / W) * 0.3 + jit;
      end = Math.max(end, delay + win);
      parts[i] = { a, z: zz, delay, win, bend, rigid, far: Math.min(1, Math.hypot(zz.x - a.x, zz.y - a.y) / 24) };
    }
    return { parts, st, end: Math.min(1, end) };
  }
  // where one pixel is at its own progress r (0 to 1)
  function morphAt(p, r, st) {
    const q = E.io(r), cx = CX, cy = CY;
    let x = p.a.x + (p.z.x - p.a.x) * q, y = p.a.y + (p.z.y - p.a.y) * q;
    const s = Math.sin(q * Math.PI);
    if (st === 'arc') { x += s * p.bend * 0.5; y -= s * Math.abs(p.bend) * 0.6; }
    else if (st === 'swirl') { const th = s * (0.9 + p.bend / 40), dx = x - cx, dy = y - cy; x = cx + dx * Math.cos(th) - dy * Math.sin(th) * 0.5; y = cy + dx * Math.sin(th) * 0.3 + dy * Math.cos(th); }
    else if (st === 'rain') {
      if (r < 0.45) { const f = r / 0.45; x = p.a.x + p.bend * 0.2 * f; y = p.a.y + (H - 2 - p.a.y) * f * f; }
      else { const f = E.io((r - 0.45) / 0.55); x = p.a.x + p.bend * 0.2 + (p.z.x - p.a.x - p.bend * 0.2) * f; y = H - 2 + (p.z.y - H + 2) * f; }
    } else if (st === 'burst') { const dx = p.a.x - cx, dy = p.a.y - cy, L = Math.hypot(dx, dy) || 1; x += dx / L * s * (10 + Math.abs(p.bend)); y += dy / L * s * (6 + Math.abs(p.bend) * 0.5); }
    else { x += s * p.bend * 0.25 * p.far; y -= s * Math.abs(p.bend) * 0.3 * p.far; }
    MX = x; MY = y;
    return q;
  }
  let MX = 0, MY = 0;
  function drawMorph(M, k, out) {
    const d = out.data; d.fill(0);
    const st = M.st;
    // a pixel that is still fading in or out never wipes a solid one under it
    const put = (X, Y, r, g, b, a) => { if (X < 0 || Y < 0 || X >= W || Y >= H) return; const o = (Y * W + X) * 4; if (a < d[o + 3]) return; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = a; };
    for (const p of M.parts) {
      const r = clamp((k - p.delay) / p.win);
      const q = morphAt(p, r, st), X = Math.round(MX), Y = Math.round(MY);
      const ca = p.a.c, cz = p.z.c;
      const cr = ca[0] + (cz[0] - ca[0]) * q, cg = ca[1] + (cz[1] - ca[1]) * q, cb = ca[2] + (cz[2] - ca[2]) * q;
      const al = p.z.fade ? 255 * (1 - q) : p.a.fadeIn ? 255 * q : 255;
      // a short streak back along the path while the pixel moves, so the
      // moving mass reads as ribbons instead of loose dust (a solid piece
      // that slides or zooms keeps its edges clean instead)
      if (r > 0 && r < 1 && !p.rigid) {
        morphAt(p, Math.max(0, r - 0.045), st);
        const tx = Math.round(MX), ty = Math.round(MY), n = Math.min(3, Math.max(Math.abs(X - tx), Math.abs(Y - ty)));
        for (let j = n; j > 0; j--) put(Math.round(X + (tx - X) * j / n), Math.round(Y + (ty - Y) * j / n), cr, cg, cb, al);
      }
      put(X, Y, cr, cg, cb, al);
    }
  }

  // ---------- one stage ----------
  function Stage(el) {
    const screen = el.querySelector('.pxstage__screen') || el;
    const cv = screen.querySelector('canvas');
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const stillImg = screen.querySelector('.pxstage__still');
    const seen = new Set();
    let list = (el.dataset.scenes || '').split(/[\s,]+/).map(named).filter((n) => SCENES[n] && !seen.has(n) && seen.add(n));
    if (!list.length) list = ORDER.slice();
    let first = SCENES[named(el.dataset.first)] ? named(el.dataset.first) : list[0];
    if (DEBUG && SCENES[named(DEBUG)]) first = named(DEBUG);
    const order = [first, ...list.filter((n) => n !== first)];
    const art = mk(), ag = art.getContext('2d', { willReadFrequently: true });
    const nxt = mk(), ng = nxt.getContext('2d', { willReadFrequently: true });
    const buf = mk(), bgc = buf.getContext('2d'), img = bgc.createImageData(W, H);
    const sky = mk(), sg = sky.getContext('2d');
    const HOLD = clamp(+(el.dataset.hold || 3800), 3400, 5200);
    let cur = null, pos = 0, target = 0, state = 'boot', t0 = 0, clock = 0, last = 0, M = null, mA = null, mB = null, styleIdx = 0, holdFor = HOLD;
    let paused = false, visible = true, raf = 0, shown = art;

    // pips and a pause button (built here, so there are no dead controls without JS)
    let pips = null, btn = null;
    if (!reduce) {
      const bar = document.createElement('div'); bar.className = 'pxstage__bar';
      pips = document.createElement('span'); pips.className = 'pxstage__pips'; pips.setAttribute('aria-hidden', 'true');
      order.forEach(() => pips.appendChild(document.createElement('i')));
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pxstage__pause';
      btn.setAttribute('aria-label', 'Pause animation'); btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => { paused = !paused; btn.setAttribute('aria-pressed', String(paused)); btn.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation'); if (!paused) kick(); });
      bar.append(pips, btn); el.appendChild(bar);
      cv.addEventListener('click', () => { if (state === 'hold' && !paused) begin(); });
      cv.style.cursor = 'pointer';
    }
    const setPip = (i) => { if (pips) [...pips.children].forEach((p, j) => p.classList.toggle('on', j === i)); };

    function blit(src) {
      shown = src;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(sky, 0, 0, W, H, 0, 0, cv.width, cv.height);
      // while the stage rests on the page's still, draw that image exactly
      // where and how big the page shows it, so the swap to the canvas is
      // invisible; the grid copy takes over when the glide starts
      const ex = src === art && cur && cur._still && cur.exact();
      if (ex) ctx.drawImage(stillImg, ex.x, ex.y, ex.w, ex.h);
      else ctx.drawImage(src, 0, 0, W, H, 0, 0, cv.width, cv.height);
    }
    function fit() {
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const avail = screen.clientWidth || el.clientWidth || W * 3;
      const max = +(el.dataset.max || 5);
      const D = Math.max(1, Math.min(Math.floor(avail * dpr / W), Math.round(max * dpr)));
      if (cv.width !== W * D) { cv.width = W * D; cv.height = H * D; }
      cv.style.width = (W * D / dpr) + 'px'; cv.style.height = (H * D / dpr) + 'px';
      // the screen hugs the canvas, so there is no dead band around the art
      if (screen !== el) { screen.style.aspectRatio = 'auto'; screen.style.height = (H * D / dpr) + 'px'; }
      blit(shown);
    }
    // The page's still image, drawn onto the grid where it sits on screen, so
    // the first frame is the very picture the visitor already sees.
    function stillScene() {
      if (!stillImg || !stillImg.complete || !stillImg.naturalWidth) return null;
      const ir = stillImg.getBoundingClientRect(), cr = cv.getBoundingClientRect();
      if (!ir.width || !cr.width) return null;
      const u = cr.width / W, nw = stillImg.naturalWidth, nh = stillImg.naturalHeight;
      let w = ir.width / u, h = ir.height / u;
      // the grid copy keeps the still's own size (so the glide starts where
      // the eye already is); only a hair off a whole-number scale is snapped to it
      const k = Math.max(1, Math.round(w / nw));
      if (Math.abs(w / (nw * k) - 1) < 0.03) { w = nw * k; h = nh * k; }
      w = Math.round(w); h = Math.round(h);
      const x = Math.round((ir.left + ir.width / 2 - cr.left) / u - w / 2), y = Math.round((ir.top + ir.height / 2 - cr.top) / u - h / 2);
      const c = mk(), g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(stillImg, x, y, w, h);
      // only a flat sprite can be the same picture as a scene's sprite
      const m = /\/assets\/px\/flat\/([\w-]+)\.png/.exec(stillImg.getAttribute('src') || '');
      // where the page draws the still right now, in canvas pixels
      const exact = () => {
        const a = stillImg.getBoundingClientRect(), b = cv.getBoundingClientRect(), k = cv.width / (b.width || 1);
        return a.width ? { x: (a.left - b.left) * k, y: (a.top - b.top) * k, w: a.width * k, h: a.height * k } : null;
      };
      return { _c: c, _still: true, sky: SCENES[first].sky, name: m ? m[1] : '', rect: { x, y, w, h }, nw, nh, exact };
    }
    // the sky comes up gently as the stage opens
    const skyIn = () => (reduce ? 1 : Math.min(1, clock / 900));
    function show(sc, t) {
      paint(sc, t, ag);
      drawStars(sg, clock, sc.sky, null, 0, skyIn());
      blit(art);
    }
    function begin(st) {
      let n = pos;
      for (let k = 0; k < order.length; k++) { n = (n + 1) % order.length; if (ready(SCENES[order[n]])) break; }
      if (cur && !cur._still && n === pos) { t0 = clock; return; }
      const A = sample(ag), nextSc = SCENES[order[n]];
      paint(nextSc, 0, ng);
      const B = sample(ng);
      if (!B.length) { pos = n; cur = nextSc; state = 'hold'; t0 = clock; return; }
      M = buildMorph(A, B, st || (cur._still ? 'glide' : MSTYLES[styleIdx++ % MSTYLES.length]), cur._zoom);
      mA = cur.sky; mB = nextSc.sky; target = n; state = 'morph'; t0 = clock; setPip(n);
      // the morph's first frame goes up in this same frame, so nothing flashes
      morphFrame(0);
    }
    function morphFrame(k) {
      drawMorph(M, k, img);
      bgc.putImageData(img, 0, 0);
      drawStars(sg, clock, mA, mB, E.io(clamp(k / M.end)), skyIn());
      blit(buf);
    }
    function step() {
      if (state === 'hold') {
        const t = clock - t0;
        paint(cur, t, ag);
        if (t >= holdFor) { holdFor = HOLD; begin(); return; }
        drawStars(sg, clock, cur.sky, null, 0, skyIn());
        blit(art);
      } else if (state === 'morph') {
        const k = (clock - t0) / MORPH;
        if (k >= M.end) { pos = target; cur = SCENES[order[pos]]; state = 'hold'; t0 = clock; M = null; show(cur, 0); }
        else morphFrame(k);
      }
    }
    function loop(now) {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (paused || !visible || document.hidden) return;
      clock += dt;
      step();
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && !reduce && !paused && visible && state !== 'boot') { last = 0; raf = requestAnimationFrame(loop); } }
    function still() { cur = SCENES[order[0]]; pos = 0; show(cur, 0); }
    // after a theme change: redraw what is on screen now if nothing is animating
    function repaint() {
      if (state === 'boot') return;
      if (reduce) still();
      else if (paused && state === 'hold') show(cur, clock - t0);
    }

    new ResizeObserver(fit).observe(screen);
    new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible) kick();
    }).observe(el);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

    const needed = SCENES[first].sprites || [];
    const stillReady = stillImg && !reduce && !DEBUG ? (stillImg.decode ? stillImg.decode().catch(() => {}) : Promise.resolve()) : Promise.resolve();
    Promise.all([...needed.map(load), stillReady]).then(() => {
      fit();
      if (reduce) { still(); el.classList.add('is-live'); return; }
      pos = 0; setPip(0);
      const firstSc = SCENES[order[0]];
      // open on the still; if the first scene is a different picture, flow
      // into it once the canvas has faded in
      const S = DEBUG ? null : stillScene();
      let same = true;
      if (S) {
        paint(firstSc, 0, ng);
        const a = sample(ng), set = new Set(a.map((p) => p.x * 1000 + p.y));
        const sp = (paint(S, 0, ag), sample(ag));
        const hit = sp.reduce((n, p) => n + (set.has(p.x * 1000 + p.y) ? 1 : 0), 0);
        same = hit / Math.max(1, sp.length, a.length) > 0.85;
        // the still is the scene's own sprite (or a piece of it, like the
        // tower under the dish) drawn elsewhere or at another size: that
        // piece glides there as one, and the rest flows
        const on = (firstSc._drawn || []).find((d) => d.name === S.name);
        if (on) {
          const kx = S.rect.w / S.nw, ky = S.rect.h / S.nh;
          S._zoom = { f: { x: S.rect.x + on.sx * kx, y: S.rect.y + on.sy * ky, w: on.sw * kx, h: on.sh * ky }, t: { x: on.x, y: on.y, w: on.w, h: on.h } };
        }
      }
      // (when the still already is the first scene's picture, the glide only
      // eases in what the still lacks, like a floor line or the signal arcs)
      if (S) { cur = S; pos = -1; holdFor = same ? 260 : 520; }
      else { cur = firstSc; holdFor = Math.round(HOLD * 0.8); }
      state = 'hold'; t0 = clock; show(cur, 0);
      // the first frame is the still itself, so swap without a cross-fade
      // (fading one copy over another dims the picture for a moment)
      if (S) cv.style.transition = 'none';
      el.classList.add('is-live');
      kick();
      // the rest of the sprites arrive in the background
      for (const n of order) (SCENES[n].sprites || []).forEach(load);
    });
    return { repaint };
  }

  const live = stages.map(Stage).filter(Boolean);
  addEventListener('qs:theme', () => { readPalette(); live.forEach((s) => s.repaint()); });
})();
