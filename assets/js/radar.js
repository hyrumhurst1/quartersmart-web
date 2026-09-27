// Pixel stage: the hero art on the inner pages (data-pxstage, data-scenes).
// A short run of little pixel scenes about Signals and QuarterSmart: a radar
// station (a dish that rocks back and forth beside a live scope), the scope on
// its own, the wordmark, a satellite, the four verdicts, a broadcast tower, a
// launch pad, the Monday email, a voice wave, an assistant, the keyboard and
// manual, the brand mark, an arcade cabinet and the five power-ups, plus the
// founder's avatar for his page. A page picks its own list with data-scenes
// ("floppies" is kept as another name for the power-ups).
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
  const blend = (a, b, t) => { const x = rgbOf(a), y = rgbOf(b); return hexOf(x.map((v, i) => v + (y[i] - v) * t)); };
  const TOKENS = ['bg-0', 'bg-1', 'bg-2', 'bg-3', 'line', 'line-2', 'fg-0', 'fg-1', 'fg-2', 'accent', 'warn', 'event', 'info', 'bad'];
  let C = {}, RGB = {}, gen = 0, LIGHT = false;
  function readPalette() {
    const cs = getComputedStyle(document.documentElement);
    C = {};
    for (const t of TOKENS) C[t.replace('-', '')] = hexOf(rgbOf(cs.getPropertyValue('--' + t).trim() || '#888'));
    C.deep = '#1d7a58'; C.mid = '#2a9a70'; C.quart = '#a9d99f';
    C.acc2 = blend(C.accent, C.bg0, 0.45); C.acc3 = blend(C.accent, C.bg0, 0.72);
    // the scope's trail: four steps from the sweep line down to the night
    C.sw1 = blend(C.accent, C.bg0, 0.5); C.sw2 = blend(C.accent, C.bg0, 0.7);
    C.sw3 = blend(C.accent, C.bg0, 0.83); C.sw4 = blend(C.accent, C.bg0, 0.91);
    C.info2 = blend(C.info, C.bg0, 0.55);
    for (const k of ['accent', 'warn', 'info', 'event', 'fg1', 'fg2']) C[k + 'D'] = blend(C[k], C.bg0, 0.62);
    RGB = {};
    for (const k in C) RGB[k] = rgbOf(C[k]);
    // light themes (paper) keep the sprites in their own dark-room colours
    LIGHT = (0.2126 * RGB.bg0[0] + 0.7152 * RGB.bg0[1] + 0.0722 * RGB.bg0[2]) / 255 > 0.5;
    // the dish is part of the sprite tower it sits on, so on light themes it
    // keeps the sprite's colours too (a cream bowl with a dark rim, like the
    // still), instead of turning into a solid black bowl
    const N = { fg0: '#ece4cc', fg1: '#cbc3ab', fg2: '#a1a99d', line: '#2c3730', line2: '#4a5a4f' }, s = LIGHT ? N : C;
    DP = { face: s.fg0, shade: s.fg1, boom: s.fg2, back: s.line, edge: s.line2, rim: LIGHT ? N.line : null };
    gen++;
  }
  let DP = {};
  readPalette();

  // ---------- sprites from /assets/px, recoloured to the theme ----------
  // The sprites are drawn in the Evergreen palette; each of those colours maps
  // back to its token so the art follows the theme switcher. A dimmed copy
  // (blended toward the night, still fully opaque) is made on request.
  const SRC = { '#121814': 'bg0', '#1f2822': 'bg2', '#2c3730': 'line', '#4a5a4f': 'line2', '#cbc3ab': 'fg1', '#ece4cc': 'fg0', '#a9d99f': 'accent', '#d99bb8': 'event', '#dfc07f': 'warn' };
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
        // the light key caps (the keyboard types on them)
        const d = s.raw.data;
        s.keys = [];
        for (let cy = 2; cy < s.h - 4; cy++) for (let cx = 0; cx < Math.min(56, s.w); cx++) {
          const o = (cy * s.w + cx) * 4;
          if (d[o + 3] > 127 && hexOf([d[o], d[o + 1], d[o + 2]]) === '#ece4cc') s.keys.push([cx, cy]);
        }
        s.ok = true; res(s);
      };
      img.onerror = () => res(s);
      img.src = '/assets/px/' + name + '.png';
    });
    return s.p;
  }
  function spriteCanvas(name, dim = 0) {
    const s = SPR[name];
    if (!s || !s.ok) return null;
    if (s.gens[dim] !== gen) {
      const cv = s.cv[dim] || (s.cv[dim] = document.createElement('canvas'));
      cv.width = s.w; cv.height = s.h;
      const d = new ImageData(new Uint8ClampedArray(s.raw.data), s.w, s.h), p = d.data, bg = RGB.bg0;
      for (let i = 0; i < p.length; i += 4) {
        if (p[i + 3] < 128) { p[i + 3] = 0; continue; }
        p[i + 3] = 255;
        const k = LIGHT ? null : SRC[hexOf([p[i], p[i + 1], p[i + 2]])];
        if (k) { const v = RGB[k]; p[i] = v[0]; p[i + 1] = v[1]; p[i + 2] = v[2]; }
        if (dim) for (let j = 0; j < 3; j++) p[i + j] += (bg[j] - p[i + j]) * dim;
      }
      cv.getContext('2d').putImageData(d, 0, 0);
      s.gens[dim] = gen;
    }
    return s.cv[dim];
  }

  // ---------- drawing primitives (whole pixels only) ----------
  let G = null;
  const fill = (c) => { if (G.__f !== c) { G.fillStyle = c; G.__f = c; } };
  const rect = (x, y, w, h, c) => { fill(c); G.fillRect(Math.round(x), Math.round(y), w, h); };
  const dot = (x, y, c) => rect(x, y, 1, 1, c);
  // LOG notes where each sprite lands, so the opening can glide the page's still straight onto it
  let LOG = null;
  const spr = (name, x, y, dim) => { const cv = spriteCanvas(name, dim); if (cv) { G.drawImage(cv, Math.round(x), Math.round(y)); if (LOG) LOG.push({ name, x: Math.round(x), y: Math.round(y), w: cv.width, h: cv.height }); } };
  const sprc = (name, sx, sy, sw, sh, x, y) => { const cv = spriteCanvas(name); if (cv) { G.drawImage(cv, sx, sy, sw, sh, x, y, sw, sh); if (LOG) LOG.push({ name, x, y, w: sw, h: sh, sx, sy }); } };
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
  function cellsOf(str, x, y, s) {
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
      g.fillStyle = v > 0.75 ? C.fg0 : v > -0.3 ? C.fg2 : C.line2;
      g.fillRect(s.x, s.y, 1, 1);
      if (s.big && v > 0.55) { g.fillStyle = C.line2; g.fillRect(s.x - 1, s.y, 1, 1); g.fillRect(s.x + 1, s.y, 1, 1); g.fillRect(s.x, s.y - 1, 1, 1); g.fillRect(s.x, s.y + 1, 1, 1); }
    }
    g.globalAlpha = 1;
  }

  // ---------- the scope ----------
  // Its blips are the real Signals on the hub (angle = kind, distance = age).
  const BLIPS = (() => {
    const ANG = { reported: 35, event: 100, available: 170, confirmed: 200, early: 250, quiet: 300, insight: 330 };
    const TOK = { reported: 'warn', event: 'event', available: 'info', confirmed: 'info', early: 'accent', quiet: 'fg1', insight: 'fg2' };
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
  // the static face: bezel, range rings, cross hairs and ticks
  function scopeFace(cx, cy, r, ticks) {
    arc(cx, cy, r, 0, TAU, C.line2);
    for (const f of [0.74, 0.48, 0.22]) arc(cx, cy, Math.round(r * f), 0, TAU, C.line, 4);
    line(cx, cy - r + 1, cx, cy + r - 1, C.line, 4); line(cx - r + 1, cy, cx + r - 1, cy, C.line, 4);
    if (ticks) for (let a = 0; a < 12; a++) { const q = a * TAU / 12; line(cx + Math.cos(q) * (r - 3), cy + Math.sin(q) * (r - 3), cx + Math.cos(q) * r, cy + Math.sin(q) * r, C.line2); }
  }
  // the trail: a wedge behind the sweep that fades in four steps
  function scopeTrail(cx, cy, r, sw) {
    const rr = (r - 1) * (r - 1);
    for (let y = -r + 1; y < r; y++) for (let x = -r + 1; x < r; x++) {
      const d2 = x * x + y * y; if (d2 > rr || d2 < 2) continue;
      const d = wrap(sw - Math.atan2(y, x));
      if (d < 1.5) dot(cx + x, cy + y, d < 0.16 ? C.sw1 : d < 0.42 ? C.sw2 : d < 0.85 ? C.sw3 : C.sw4);
    }
  }
  // the sweep line and the blips: each lights as the line passes, then fades
  function scopeLive(cx, cy, r, sw) {
    line(cx, cy, cx + Math.cos(sw) * (r - 1), cy + Math.sin(sw) * (r - 1), C.accent);
    dot(cx, cy, C.fg0);
    for (const b of BLIPS) {
      const d = wrap(sw - b.a), x = Math.round(cx + Math.cos(b.a) * b.rn * (r - 3)), y = Math.round(cy + Math.sin(b.a) * b.rn * (r - 3));
      if (d < 0.35) { rect(x, y, 2, 2, C.fg0); dot(x - 1, y, C[b.k]); dot(x + 2, y + 1, C[b.k]); dot(x + 1, y - 1, C[b.k]); dot(x, y + 2, C[b.k]); }
      else if (d < 1.7) rect(x, y, 2, 2, C[b.k]);
      else if (d < 3.6) rect(x, y, 2, 2, C[b.k + 'D'] || C.fg2);
      else if (d < 4.8) dot(x, y, C[b.k + 'D'] || C.line2);
    }
  }

  // ---------- the dish ----------
  // Drawn from its shape every frame (not a rotated bitmap), so it stays crisp
  // at any angle: the bowl's face is an ellipse seen at a slant, the back
  // shell shows as a crescent behind it, two ribs hold the feed, and the
  // signal leaves the feed along the dish's axis.
  function dish(px, py, a, t) {
    const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
    const R = 23, E = 9, L = 20, D = 5;
    const fx = px + ux * L, fy = py + uy * L;
    // the yoke from the mount up to the back of the bowl
    const back = L - D - E + 1;
    for (let s = -1; s <= back; s += 0.5) { dot(px + ux * s - vx, py + uy * s - vy, DP.edge); dot(px + ux * s, py + uy * s, DP.edge); dot(px + ux * s + vx, py + uy * s + vy, DP.back); }
    // 1: the bowl's face, 2: the back shell behind it, 0: outside
    const part = (x, y) => {
      const dx = x + 0.5 - fx, dy = y + 0.5 - fy;
      const su = dx * ux + dy * uy, w = (dx * vx + dy * vy) / R;
      if (w * w >= 1) return 0;
      const h = E * Math.sqrt(1 - w * w);
      return su > h || su < -h - D ? 0 : su >= -h ? 1 : 2;
    };
    const n = R + D + 2, x0 = Math.floor(fx - n), x1 = Math.ceil(fx + n), y0 = Math.floor(fy - n), y1 = Math.ceil(fy + n);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = part(x, y);
      if (!k) continue;
      const dx = x + 0.5 - fx, dy = y + 0.5 - fy;
      const su = dx * ux + dy * uy, w = (dx * vx + dy * vy) / R, h = E * Math.sqrt(1 - w * w);
      let c;
      if (k === 1) {
        const e = (su / E) * (su / E) + w * w;
        c = su < 0 && e > 0.42 ? DP.shade : DP.face;
        // on a light page the cream bowl needs its dark rim to read, like the sprite
        if (DP.rim && (!part(x - 1, y) || !part(x + 1, y) || !part(x, y - 1) || !part(x, y + 1))) c = DP.rim;
      } else c = su > -h - 1.3 ? DP.edge : DP.back;
      dot(x, y, c);
    }
    // the feed stands out in front of the bowl on three struts
    const fpx = fx + ux * 17, fpy = fy + uy * 17;
    line(fx + vx * R * 0.8, fy + vy * R * 0.8, fpx, fpy, DP.edge);
    line(fx - vx * R * 0.8, fy - vy * R * 0.8, fpx, fpy, DP.edge);
    line(fx, fy, fpx, fpy, DP.boom);
    rect(fpx - 1, fpy - 1, 3, 3, DP.edge); dot(fpx, fpy, C.accent);
    // three short arcs leave the feed along the axis; they fade out within
    // 13 pixels, so they never run off the top of the picture
    for (let k = 0; k < 3; k++) {
      const r = 3 + ((t / 72 + k * 10 / 3) % 10);
      arc(fpx, fpy, r, a - 0.5, a + 0.5, r < 6 ? C.accent : r < 9.5 ? C.acc2 : C.acc3);
    }
  }

  const E = {
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    o: (t) => 1 - Math.pow(1 - t, 3),
  };

  // ---------- the scenes ----------
  // stat(): drawn once per theme and cached. under(t) and over(t): live
  // layers. sky(x, y): true where the stars stay away from the art.
  const PU = ['radar', 'map', 'setup', 'token', 'robot'];
  const PU_BOX = { radar: [3, 25], map: [2, 28], setup: [3, 25], token: [3, 25], robot: [5, 21] };
  const PU_X = (() => { let x = 4; return PU.map((n) => { const v = x - PU_BOX[n][0]; x += PU_BOX[n][1] + 3; return v; }); })();
  const WORD = { s: 3, x: 10, y: 34 };
  const WORD_CELLS = cellsOf('SIGNALS', WORD.x, WORD.y, WORD.s);
  // the echo extrudes only from the lowest pixel in every column, like the home page's
  const WORD_ECHO = (() => {
    const low = new Map(), out = [];
    for (const c of WORD_CELLS) if (!low.has(c.x) || c.y > low.get(c.x)) low.set(c.x, c.y);
    for (const [x, y] of low) for (let k = 1; k <= 5; k++) out.push({ x, y: y + k, k });
    return out;
  })();
  let echoGen = -1, ECHO_C = null;
  const echoCols = () => {
    if (echoGen !== gen) {
      const L = [C.event, C.warn, C.accent, C.info];
      ECHO_C = L.map((_, ph) => [0, 1, 2, 3, 4].map((j) => blend(L[(j + ph) % 4], C.bg0, 0.08 + j / 5 * 0.5)));
      echoGen = gen;
    }
    return ECHO_C;
  };
  // the dish rocks between 72 and 43 degrees above the horizon: it never
  // turns flat side up (a plate on a pole), and its arcs stay in the picture
  const RADAR = { tx: 4, ty: 10, sx: 106, sy: 47, sr: 27, turn: 3000, rock: 5600, base: -1.0, amp: 0.25 };
  RADAR.px = RADAR.tx + 22; RADAR.py = RADAR.ty + 41;

  const SCENES = {
    // the radar station: a dish that rocks back and forth on its tower, and
    // the scope it feeds, whose sweep never stops
    radar: {
      sprites: ['sprite-radar'],
      sky: (x, y) => box(0, 0, 74, 92)(x, y) || inCircle(RADAR.sx, RADAR.sy, RADAR.sr + 5)(x, y) || box(RADAR.sx - 12, RADAR.sy, RADAR.sx + 12, 92)(x, y),
      stat() {
        const { tx, ty, sx, sy, sr } = RADAR;
        floorLine(91, 2, 142);
        sprc('sprite-radar', 0, 45, 54, 36, tx, ty + 45);
        // the mount on top of the tower
        rect(RADAR.px - 4, RADAR.py + 1, 9, 4, DP.back); rect(RADAR.px - 4, RADAR.py + 1, 9, 1, DP.edge); rect(RADAR.px - 1, RADAR.py - 1, 3, 2, DP.edge);
        scopeFace(sx, sy, sr, false);
        rect(sx - 1, sy + sr + 1, 3, 90 - sy - sr - 1, C.line); rect(sx - 1, sy + sr + 1, 1, 90 - sy - sr - 1, C.line2);
        rect(sx - 9, 89, 19, 2, C.line2); rect(sx - 9, 89, 19, 1, C.fg2);
      },
      under(t) { scopeTrail(RADAR.sx, RADAR.sy, RADAR.sr, sweepAt(t, RADAR.turn)); },
      over(t) {
        dish(RADAR.px, RADAR.py, RADAR.base + RADAR.amp * Math.sin(t / RADAR.rock * TAU), t);
        scopeLive(RADAR.sx, RADAR.sy, RADAR.sr, sweepAt(t, RADAR.turn));
      },
    },
    scope: {
      sky: inCircle(CX, CY, 46),
      stat() { scopeFace(CX, CY, 42, true); },
      under(t) { scopeTrail(CX, CY, 42, sweepAt(t, 3600)); },
      over(t) { scopeLive(CX, CY, 42, sweepAt(t, 3600)); },
    },
    // the wordmark as a sign: stacked copies step straight down in rose,
    // butter, sage and teal, and the colours chase slowly
    word: {
      sky: box(6, 28, 138, 62),
      over(t) {
        const cols = echoCols()[Math.floor(t / 520) % 4];
        for (const e of WORD_ECHO) dot(e.x, e.y, cols[e.k - 1]);
        const g = ((t % 3400) / 3400) * 230 - 50;
        for (const c of WORD_CELLS) {
          const glint = Math.abs(c.x - g + (c.y - WORD.y) * 0.6) < 2;
          dot(c.x, c.y, glint ? C.accent : c.ry >= 18 ? C.accent : C.fg0);
        }
      },
    },
    satellite: {
      sky: (x, y) => Math.hypot(x - 22, y - 152) < 86 || box(74, 14, 124, 46)(x, y),
      stat() {
        const pcx = 22, pcy = 152, r = 82;
        for (let y = 60; y < H; y++) for (let x = 0; x < 120; x++) {
          const depth = r - Math.hypot(x - pcx, y - pcy);
          if (depth < 0) continue;
          let c = depth < 1.2 ? C.info : depth < 3 ? C.info2 : C.bg2;
          if (c === C.bg2 && y % 4 === 1 && ((x * 7 + y * 13) % 23) < 9) c = C.line;
          dot(x, y, c);
        }
      },
      over(t) {
        const sx = 96, sy = 24 + Math.round(Math.sin(t / 800) * 1.4);
        for (const x0 of [sx - 18, sx + 10]) {
          rect(x0, sy + 5, 16, 6, C.info2);
          for (let i = 0; i <= 16; i += 4) rect(x0 + Math.min(i, 15), sy + 5, 1, 6, C.line2);
          rect(x0, sy + 5, 16, 1, C.line2); rect(x0, sy + 10, 16, 1, C.line2);
        }
        rect(sx - 2, sy + 7, 2, 1, C.fg2); rect(sx + 8, sy + 7, 2, 1, C.fg2);
        rect(sx, sy + 2, 8, 12, C.fg1); rect(sx + 6, sy + 2, 2, 12, C.fg2); rect(sx, sy + 2, 8, 1, C.fg0);
        rect(sx + 2, sy + 6, 3, 4, C.line2);
        arc(sx + 4, sy + 1, 3, Math.PI, TAU, C.fg0); rect(sx + 4, sy - 3, 1, 2, C.fg1);
        dot(sx + 4, sy - 4, (t % 1200) < 500 ? C.bad : C.line2);
        const n = 44;
        for (let i = 0; i < n; i++) if ((((i - t / 70) % 6) + 6) % 6 < 2) { const q = i / n; dot(sx + 3 - q * 40, sy + 15 + q * 38, C.accent); }
      },
    },
    verdicts: {
      rows: [['ACT NOW', 'accent'], ['PREPARE', 'warn'], ['WAIT', 'info'], ['IGNORE', 'fg1']],
      sky: box(18, 6, 130, 92),
      stat() { this.rows.forEach(([w, k], i) => text(w, 40, 12 + i * 20, 2, C[k + 'D'])); },
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
          rect(72 - hw, y, hw * 2 + 1, 1, C.fg2);
          if (prev) { line(72 - prev.hw, prev.y, 72 + hw, y, C.line2); line(72 + prev.hw, prev.y, 72 - hw, y, C.line2); }
          prev = { y, hw };
        }
        rect(72, 8, 1, 12, C.fg1); rect(71, 17, 3, 3, C.fg0);
        rect(52, 90, 41, 1, C.fg2);
      },
      over(t) {
        dot(72, 7, (t % 1000) < 450 ? C.bad : C.line2);
        for (let k = 0; k < 3; k++) {
          const r = 6 + ((t / 38 + k * 14) % 42), c = r < 18 ? C.accent : r < 32 ? C.acc2 : C.acc3;
          arc(72, 10, r, -0.7, 0.7, c); arc(72, 10, r, Math.PI - 0.7, Math.PI + 0.7, c);
        }
      },
    },
    rocket: {
      sky: box(46, 8, 98, 92),
      stat() {
        floorLine(91, 16, 128);
        rect(50, 86, 44, 4, C.line2); rect(50, 86, 44, 1, C.fg2);
        rect(88, 26, 1, 60, C.fg2); rect(93, 26, 1, 60, C.fg2);
        for (let y = 26; y < 84; y += 6) { rect(88, y, 6, 1, C.line2); line(88, y, 93, y + 6, C.line2); }
        rect(77, 44, 11, 1, C.fg2); rect(77, 60, 11, 1, C.fg2);
        for (let y = 14; y < 32; y++) {
          const half = Math.max(1, Math.round((y - 13) / 18 * 6));
          rect(70 - half, y, half * 2, 1, y < 19 ? C.accent : C.fg0);
          if (y >= 19) rect(70 + Math.max(0, half - 2), y, Math.min(2, half), 1, C.fg1);
        }
        rect(64, 32, 12, 46, C.fg0); rect(72, 32, 3, 46, C.fg1); rect(75, 32, 1, 46, C.fg2); rect(64, 32, 1, 46, C.fg1);
        rect(64, 52, 12, 3, C.accent);
        disc(69, 41, 2.5, C.info); dot(68, 40, C.fg0);
        for (let i = 0; i < 11; i++) { const w = Math.ceil(i / 2); rect(64 - w, 67 + i, w, 1, C.event); rect(76, 67 + i, w, 1, C.event); }
        rect(66, 78, 8, 3, C.line2); rect(67, 81, 6, 1, C.fg2);
      },
      over(t) {
        // the flame breathes on smooth waves, not random flicker
        for (let x = 67; x < 73; x++) {
          const edge = x === 67 || x === 72 ? 2 : 0;
          const n = Math.max(1, Math.round(4.5 + Math.sin(t / 110 + x * 1.7) * 1.6 + Math.sin(t / 67 + x * 0.9) * 0.9) - edge);
          for (let j = 0; j < n; j++) dot(x, 82 + j, j < 2 ? C.fg0 : j < 4 ? C.warn : C.bad);
        }
        const q = (t % 1400) / 1400, pr = 1 + Math.round(q * 4), pc = q < 0.6 ? C.fg2 : C.line2;
        arc(56, 88, pr, Math.PI, TAU, pc); arc(88, 88, pr, Math.PI, TAU, pc);
      },
    },
    mail: {
      sky: box(34, 16, 112, 88),
      stat() {
        for (let y = 20; y < 40; y++) { const half = Math.round((y - 20) / 20 * 34); rect(72 - half, y, half * 2 + 1, 1, C.line2); dot(72 - half, y, C.fg2); dot(72 + half, y, C.fg2); }
        rect(38, 40, 69, 45, C.line2);
      },
      over(t) {
        const rise = Math.round(15 * E.o(Math.min(1, t / 1500))), top = 42 - rise;
        rect(46, top, 53, 60 - top, C.fg0);
        text('MON', 50, top + 4, 1, C.deep);
        rect(50, top + 14, 40, 1, C.line2); rect(50, top + 18, 30, 1, C.line2); rect(50, top + 22, 36, 1, C.line2);
        rect(38, 58, 69, 27, C.fg1);
        line(38, 58, 72, 74, C.fg2); line(106, 58, 72, 74, C.fg2);
        rect(38, 84, 69, 1, C.fg2); rect(38, 58, 1, 27, C.fg2); rect(106, 58, 1, 27, C.fg2);
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
    assistant: {
      sprites: ['sprite-assistant'],
      sky: box(28, 14, 116, 90),
      stat() { floorLine(87, 24, 120); spr('sprite-assistant', 33, 41); },
      over(t) {
        rect(95, 57, 2, 2, (t % 1400) < 900 ? C.accent : C.bg2);
        for (let k = 0; k < 3; k++) {
          const r = 6 + ((t / 60 + k * 8) % 24);
          arc(84, 48, r, -2.35, -0.8, r < 14 ? C.accent : r < 22 ? C.acc2 : C.acc3);
        }
      },
    },
    keyboard: {
      sprites: ['sprite-keyboard-manual'],
      sky: box(10, 26, 134, 78),
      stat() { floorLine(75, 10, 134); spr('sprite-keyboard-manual', 14, 32); },
      over(t) {
        if ((t % 1000) < 560) rect(14 + 103, 32 + 20, 2, 2, C.accent);
        const s = SPR['sprite-keyboard-manual'];
        if (s && s.keys && s.keys.length) { const k = s.keys[(hash(7, Math.floor(t / 190)) * s.keys.length) | 0]; rect(14 + k[0], 32 + k[1], 2, 2, C.accent); }
      },
    },
    mark: {
      stat() { disc(66, 54, 30, C.deep, (x, y) => !(x > 0 && y < 0)); },
      over(t) {
        const o = 4 + Math.round((1 - Math.cos(t / 700)) * 2), g = ((t % 2600) / 2600) * 100 - 25, rr = 30 * 30 + 30 * 0.35;
        for (let y = -30; y < 0; y++) for (let x = 1; x <= 30; x++) {
          if (x * x + y * y > rr) continue;
          dot(66 + o + x, 54 - o + y, Math.abs(x - y - g) < 3 ? C.fg0 : C.quart);
        }
      },
    },
    arcade: {
      sprites: ['sprite-arcade'],
      sky: box(40, 0, 104, 95),
      stat() { spr('sprite-arcade', 46, 0); },
      over(t) {
        const sx = 62, sw = 22, cy = 30;
        const cx = sx + 1 + Math.round(((t % 2600) / 2600) * (sw - 3));
        for (let x = sx + 3; x < sx + sw - 2; x += 3) if (x > cx + 1) dot(x, cy + 1, C.bg0);
        rect(cx - 1, cy, 3, 3, C.bg0);
        if (Math.floor(t / 120) % 2) dot(cx + 1, cy + 1, C.accent);
      },
    },
    // the five power-ups on a shelf: one at a time lifts and lights up while
    // a small cursor glides along underneath
    powerups: {
      sprites: PU.map((n) => 'pu-' + n),
      sky: box(0, 26, 143, 84),
      stat() { floorLine(70, 4, 140); },
      over(t) {
        const cyc = 820, u = (t + 240) / cyc, i = Math.floor(u) % 5, j = (i + 4) % 5, since = (u - Math.floor(u)) * cyc;
        const on = E.o(clamp(since / 240)), off = 1 - on;
        PU.forEach((n, k) => {
          const f = k === i ? on : k === j && t > 0 ? off : 0;
          spr('pu-' + n, PU_X[k], 36 - Math.round(f * 3), f > 0.66 ? 0 : f > 0.33 ? 0.3 : 0.56);
        });
        const cx = (k) => PU_X[k] + PU_BOX[PU[k]][0] + PU_BOX[PU[k]][1] / 2;
        // the opening item is already lit, so the cursor starts under it
        const from = cx(j), to = cx(i), x = t < cyc - 240 ? Math.round(to) : Math.round(from + (to - from) * E.io(clamp(since / 300)));
        rect(x - 2, 76, 5, 1, C.accent); rect(x - 1, 75, 3, 1, C.accent); dot(x, 74, C.accent);
      },
    },
    // player one: Hyrum's pixel avatar, for the founder page
    avatar: {
      sprites: ['avatar-hyrum'],
      sky: box(28, 2, 116, 92),
      stat() { floorLine(91, 24, 120); spr('avatar-hyrum', 33, 7); },
    },
  };
  // older names, so no page breaks: the floppies became the power-ups
  const ALIAS = { floppies: 'powerups' };
  const named = (n) => ALIAS[n] || n;
  const ORDER = ['radar', 'scope', 'word', 'satellite', 'verdicts', 'tower', 'rocket', 'mail', 'wave', 'assistant', 'keyboard', 'mark', 'arcade', 'powerups'];
  const ready = (sc) => !sc.sprites || sc.sprites.every((n) => SPR[n] && SPR[n].ok);
  function cacheOf(sc) {
    if (sc._still) return sc._c;
    if (!sc._c) sc._c = mk();
    if (sc._gen !== gen) {
      const prev = G; G = sc._c.getContext('2d'); G.__f = null;
      G.clearRect(0, 0, W, H); sc._log = []; LOG = sc._log; sc.stat && sc.stat(); LOG = null;
      G = prev;
      if (ready(sc)) sc._gen = gen;
    }
    return sc._c;
  }
  function paint(sc, t, g) {
    const cache = cacheOf(sc), prev = G;
    G = g; g.__f = null; g.clearRect(0, 0, W, H);
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
    const put = (X, Y, r, g, b, a) => { if (X < 0 || Y < 0 || X >= W || Y >= H) return; const o = (Y * W + X) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = a; };
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
      // the eye already is); only a hair off native is snapped to native
      if (Math.abs(w / nw - 1) < 0.03) { w = nw; h = nh; }
      w = Math.round(w); h = Math.round(h);
      const x = Math.round((ir.left + ir.width / 2 - cr.left) / u - w / 2), y = Math.round((ir.top + ir.height / 2 - cr.top) / u - h / 2);
      const c = mk(), g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(stillImg, x, y, w, h);
      const m = /\/assets\/px\/([\w-]+)\.png/.exec(stillImg.getAttribute('src') || '');
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
          S._zoom = { f: { x: S.rect.x + (on.sx || 0) * kx, y: S.rect.y + (on.sy || 0) * ky, w: on.w * kx, h: on.h * ky }, t: on };
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
