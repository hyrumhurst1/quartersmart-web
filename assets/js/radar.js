// Signals pixel stage.
// Pixel art that flows from one scene into the next: every pixel of the
// current picture flies, pours, falls, slides or swirls into place to build
// the next one, with a different choreography each time. Fourteen scenes
// about Signals: a radar dish, a live scope of the real posts, the wordmark,
// a satellite, the four verdicts, a broadcast tower, a launch pad, the Monday
// email, a voice wave, an assistant, the keyboard and manual, the brand mark,
// an arcade cabinet and the five floppies.
// Drawn on a 144x96 grid and scaled by whole device pixels so it stays crisp.
// Colours come from the active theme. Pauses off screen and in background
// tabs, has a pause button, and draws one still frame for reduced motion.
(() => {
  'use strict';
  const stages = [...document.querySelectorAll('[data-pxstage]')];
  if (!stages.length) return;

  const W = 144, H = 96, CX = 72, CY = 48, TAU = Math.PI * 2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

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
    C.sw1 = blend(C.accent, C.bg0, 0.55); C.sw2 = blend(C.accent, C.bg0, 0.78); C.sw3 = blend(C.accent, C.bg0, 0.9);
    C.info2 = blend(C.info, C.bg0, 0.55);
    for (const k of ['accent', 'warn', 'info', 'event', 'fg1', 'fg2']) C[k + 'D'] = blend(C[k], C.bg0, 0.62);
    RGB = {};
    for (const k in C) RGB[k] = rgbOf(C[k]);
    // light themes (paper) keep the sprites in their own dark-room colours
    LIGHT = (0.2126 * RGB.bg0[0] + 0.7152 * RGB.bg0[1] + 0.0722 * RGB.bg0[2]) / 255 > 0.5;
    gen++;
  }
  readPalette();

  // ---------- sprites from /assets/px, recoloured to the theme ----------
  // The sprites are drawn in the Evergreen palette; each of those colours maps
  // back to its token so the art follows the theme switcher.
  const SRC = { '#121814': 'bg0', '#1f2822': 'bg2', '#2c3730': 'line', '#4a5a4f': 'line2', '#cbc3ab': 'fg1', '#ece4cc': 'fg0', '#a9d99f': 'accent', '#d99bb8': 'event', '#dfc07f': 'warn' };
  const SPR = {};
  function load(name) {
    if (SPR[name]) return SPR[name].p;
    const s = SPR[name] = { ok: false, gen: -1, cv: document.createElement('canvas') };
    s.p = new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        s.w = img.naturalWidth; s.h = img.naturalHeight;
        const c = document.createElement('canvas'); c.width = s.w; c.height = s.h;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
        s.raw = x.getImageData(0, 0, s.w, s.h);
        s.cv.width = s.w; s.cv.height = s.h;
        // column runs (the five floppies) and light key caps (the keyboard)
        const d = s.raw.data, runs = []; let st = -1;
        for (let cx = 0; cx <= s.w; cx++) {
          let on = false;
          if (cx < s.w) for (let cy = 0; cy < s.h; cy++) if (d[(cy * s.w + cx) * 4 + 3] > 127) { on = true; break; }
          if (on && st < 0) st = cx;
          if (!on && st >= 0) { runs.push([st, cx - 1]); st = -1; }
        }
        s.runs = runs;
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
  function spriteCanvas(name) {
    const s = SPR[name];
    if (!s || !s.ok) return null;
    if (s.gen !== gen) {
      const d = new ImageData(new Uint8ClampedArray(s.raw.data), s.w, s.h), p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        if (p[i + 3] < 128) { p[i + 3] = 0; continue; }
        p[i + 3] = 255;
        const k = LIGHT ? null : SRC[hexOf([p[i], p[i + 1], p[i + 2]])];
        if (k) { const v = RGB[k]; p[i] = v[0]; p[i + 1] = v[1]; p[i + 2] = v[2]; }
      }
      s.cv.getContext('2d').putImageData(d, 0, 0);
      s.gen = gen;
    }
    return s.cv;
  }

  // ---------- drawing primitives (whole pixels only) ----------
  let G = null;
  const fill = (c) => { if (G.__f !== c) { G.fillStyle = c; G.__f = c; } };
  const rect = (x, y, w, h, c) => { fill(c); G.fillRect(Math.round(x), Math.round(y), w, h); };
  const dot = (x, y, c) => rect(x, y, 1, 1, c);
  const spr = (name, x, y) => { const cv = spriteCanvas(name); if (cv) G.drawImage(cv, x, y); };
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

  // a fixed, twinkling star field shared by the night scenes
  const STARS = (() => {
    let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 46 }, () => ({ x: Math.floor(rnd() * W), y: Math.floor(rnd() * (H - 14)), p: rnd() * TAU, f: 0.6 + rnd() * 1.2, big: rnd() < 0.12 }));
  })();
  function stars(t, skip) {
    for (const s of STARS) {
      if (skip && skip(s.x, s.y)) continue;
      const v = Math.sin(t / 700 * s.f + s.p);
      dot(s.x, s.y, v > 0.75 ? C.fg0 : v > -0.3 ? C.fg2 : C.line2);
      if (s.big && v > 0.55) { dot(s.x - 1, s.y, C.line2); dot(s.x + 1, s.y, C.line2); dot(s.x, s.y - 1, C.line2); dot(s.x, s.y + 1, C.line2); }
    }
  }

  // the scope's blips are the real Signals on the hub (angle = kind, distance = age)
  const BLIPS = (() => {
    const ANG = { reported: 35, event: 100, available: 170, confirmed: 200, early: 250, quiet: 300, insight: 330 };
    const TOK = { reported: 'warn', event: 'event', available: 'info', confirmed: 'info', early: 'accent', quiet: 'fg1', insight: 'fg2' };
    let posts = null;
    try { posts = JSON.parse(document.getElementById('sig-data').textContent); } catch (e) { posts = null; }
    if (!Array.isArray(posts) || !posts.length) {
      posts = ['reported', 'available', 'event', 'insight', 'available', 'early', 'quiet', 'insight', 'reported'].map((kind, i) => ({ kind, age: 6 + i * 21 }));
    } else {
      const newest = Math.max(...posts.map((p) => Date.parse(p.date + 'T12:00:00Z') || 0));
      posts = posts.map((p) => ({ kind: p.kind, age: Math.max(0, (newest - (Date.parse(p.date + 'T12:00:00Z') || newest)) / 864e5) }));
    }
    return posts.map((p, i) => {
      const r = 7 + Math.min(1, Math.sqrt(p.age / 200)) * 32;
      const a = ((ANG[p.kind] ?? 330) + ((i * 23) % 26) - 13) * Math.PI / 180;
      return { a, x: Math.round(CX + Math.cos(a) * r), y: Math.round(CY + Math.sin(a) * r), k: TOK[p.kind] || 'fg1' };
    });
  })();

  const E = {
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    o: (t) => 1 - Math.pow(1 - t, 3),
    i: (t) => t * t * t,
    back: (t) => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };

  // ---------- the scenes ----------
  // stat(): drawn once per theme and cached. under(t) and over(t): live layers.
  const SCENES = {
    radar: {
      sprites: ['sprite-radar'],
      stat() { floorLine(91, 20, 124); spr('sprite-radar', 45, 10); },
      under(t) { stars(t, box(40, 6, 104, 92)); },
      over(t) {
        for (let k = 0; k < 3; k++) {
          const r = 8 + ((t / 55 + k * 11) % 33);
          arc(80, 13, r, -1.45, 0.15, r < 18 ? C.accent : r < 30 ? C.acc2 : C.acc3);
        }
      },
    },
    scope: {
      stat() {
        arc(CX, CY, 42, 0, TAU, C.line2);
        for (const r of [31, 20, 9]) arc(CX, CY, r, 0, TAU, C.line, 4);
        line(CX, CY - 41, CX, CY + 41, C.line, 4); line(CX - 41, CY, CX + 41, CY, C.line, 4);
        for (let a = 0; a < 12; a++) { const q = a * TAU / 12; line(CX + Math.cos(q) * 39, CY + Math.sin(q) * 39, CX + Math.cos(q) * 42, CY + Math.sin(q) * 42, C.line2); }
      },
      under(t) {
        const sw = t * 0.0016 - Math.PI / 2;
        for (let y = -41; y <= 41; y++) for (let x = -41; x <= 41; x++) {
          const d2 = x * x + y * y; if (d2 > 1681 || d2 < 2) continue;
          let d = sw - Math.atan2(y, x); d = ((d % TAU) + TAU) % TAU;
          if (d < 1.3) dot(CX + x, CY + y, d < 0.25 ? C.sw1 : d < 0.7 ? C.sw2 : C.sw3);
        }
        stars(t, (x, y) => (x - CX) ** 2 + (y - CY) ** 2 < 46 * 46);
      },
      over(t) {
        const sw = t * 0.0016 - Math.PI / 2;
        for (let r = 1; r <= 42; r++) dot(CX + Math.cos(sw) * r, CY + Math.sin(sw) * r, C.accent);
        for (const b of BLIPS) {
          let d = sw - b.a; d = ((d % TAU) + TAU) % TAU;
          rect(b.x - 1, b.y - 1, 2, 2, d < 0.45 ? C.fg0 : d < 2.8 ? C[b.k] : C[b.k + 'D'] || C.fg2);
        }
      },
    },
    word: {
      band: (x, y, ry) => (ry < 9 ? C.fg0 : ry < 13 ? C.accent : ry < 16 ? C.info : ry < 18 ? C.mid : C.deep),
      stat() {
        text('SIGNALS', 10, 30, 3, this.band);
        for (let i = 0; i < 4; i++) rect(10 + i * 31, 61, 30, 2, i ? C.line2 : C.accent);
      },
      under(t) { stars(t, box(6, 24, 138, 68)); },
      over(t) {
        const g = ((t % 3000) / 3000) * 210 - 40;
        text('SIGNALS', 10, 30, 3, (x, y, ry) => (Math.abs(x - g + (y - 30) * 0.6) < 2.5 ? (ry < 9 ? C.accent : C.fg0) : null));
      },
    },
    satellite: {
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
      under(t) { stars(t, (x, y) => Math.hypot(x - 22, y - 152) < 86 || box(74, 14, 124, 46)(x, y)); },
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
      stat() { this.rows.forEach(([w, k], i) => text(w, 40, 12 + i * 20, 2, C[k + 'D'])); },
      under(t) { stars(t, box(18, 6, 130, 92)); },
      over(t) {
        const i = Math.floor(t / 1100) % 4, [w, k] = this.rows[i], y = 12 + i * 20;
        text(w, 40, y, 2, C[k]);
        for (let j = 0; j < 9; j++) rect(26, y + 2 + j, 5 - Math.abs(4 - j), 1, C.fg0);
      },
    },
    tower: {
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
      under(t) { stars(t, box(50, 3, 94, 92)); },
      over(t) {
        dot(72, 7, (t % 1000) < 450 ? C.bad : C.line2);
        for (let k = 0; k < 3; k++) {
          const r = 6 + ((t / 38 + k * 14) % 42), c = r < 18 ? C.accent : r < 32 ? C.acc2 : C.acc3;
          arc(72, 10, r, -0.7, 0.7, c); arc(72, 10, r, Math.PI - 0.7, Math.PI + 0.7, c);
        }
      },
    },
    rocket: {
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
      under(t) { stars(t, box(46, 8, 98, 92)); },
      over(t) {
        const f = Math.floor(t / 70);
        for (let x = 67; x < 73; x++) {
          const n = 3 + ((hash(x, f) * 5) | 0) - (x === 67 || x === 72 ? 2 : 0);
          for (let j = 0; j < n; j++) dot(x, 82 + j, j < 2 ? C.fg0 : j < 4 ? C.warn : C.bad);
        }
        const q = (t % 1400) / 1400, pr = 1 + Math.round(q * 4), pc = q < 0.6 ? C.fg2 : C.line2;
        arc(56, 88, pr, Math.PI, TAU, pc); arc(88, 88, pr, Math.PI, TAU, pc);
      },
    },
    mail: {
      stat() {
        for (let y = 20; y < 40; y++) { const half = Math.round((y - 20) / 20 * 34); rect(72 - half, y, half * 2 + 1, 1, C.line2); dot(72 - half, y, C.fg2); dot(72 + half, y, C.fg2); }
        rect(38, 40, 69, 45, C.line2);
      },
      under(t) { stars(t, box(34, 16, 112, 88)); },
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
      stat() { for (let x = 14; x < 130; x += 3) dot(x, CY, C.line); },
      under(t) { stars(t, box(18, 10, 126, 86)); },
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
      stat() { floorLine(87, 24, 120); spr('sprite-assistant', 33, 41); },
      under(t) { stars(t, box(28, 14, 116, 90)); },
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
      stat() { floorLine(75, 10, 134); spr('sprite-keyboard-manual', 14, 32); },
      under(t) { stars(t, box(10, 26, 134, 78)); },
      over(t) {
        if ((t % 1000) < 560) rect(14 + 103, 32 + 20, 2, 2, C.accent);
        const s = SPR['sprite-keyboard-manual'];
        if (s && s.keys && s.keys.length) { const k = s.keys[(hash(7, Math.floor(t / 170)) * s.keys.length) | 0]; rect(14 + k[0], 32 + k[1], 2, 2, C.accent); }
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
      stat() { spr('sprite-arcade', 46, 0); },
      under(t) { stars(t, box(40, 0, 104, 95)); },
      over(t) {
        const sx = 62, sw = 22, cy = 30;
        const cx = sx + 1 + Math.round(((t % 2600) / 2600) * (sw - 3));
        for (let x = sx + 3; x < sx + sw - 2; x += 3) if (x > cx + 1) dot(x, cy + 1, C.bg0);
        rect(cx - 1, cy, 3, 3, C.bg0);
        if (Math.floor(t / 120) % 2) dot(cx + 1, cy + 1, C.accent);
      },
    },
    floppies: {
      sprites: ['sprite-floppies'],
      stat() { floorLine(70, 4, 140); spr('sprite-floppies', 5, 37); },
      under(t) { stars(t, box(0, 28, 143, 72)); },
      over(t) {
        const s = SPR['sprite-floppies'], cv = spriteCanvas('sprite-floppies');
        if (!cv || !s.runs || !s.runs.length) return;
        const i = Math.floor(t / 520) % s.runs.length, lift = Math.round(Math.sin(((t % 520) / 520) * Math.PI) * 4);
        if (!lift) return;
        const [x0, x1] = s.runs[i], w = x1 - x0 + 1;
        G.clearRect(5 + x0, 33, w, 35);
        G.drawImage(cv, x0, 0, w, s.h, 5 + x0, 37 - lift, w, s.h);
      },
    },
  };
  const ORDER = ['radar', 'scope', 'word', 'satellite', 'verdicts', 'tower', 'rocket', 'mail', 'wave', 'assistant', 'keyboard', 'mark', 'arcade', 'floppies'];
  const ready = (sc) => !sc.sprites || sc.sprites.every((n) => SPR[n] && SPR[n].ok);
  function cacheOf(sc) {
    if (!sc._c) sc._c = mk();
    if (sc._gen !== gen) {
      const prev = G; G = sc._c.getContext('2d'); G.__f = null;
      G.clearRect(0, 0, W, H); sc.stat && sc.stat();
      G = prev;
      if (ready(sc)) sc._gen = gen;
    }
    return sc._c;
  }
  function paint(sc, t, g) {
    const cache = cacheOf(sc), prev = G;
    G = g; g.clearRect(0, 0, W, H);
    if (sc.under) sc.under(t);
    g.drawImage(cache, 0, 0);
    if (sc.over) sc.over(t);
    G = prev;
  }
  function sample(g) {
    const d = g.getImageData(0, 0, W, H).data, pts = [];
    for (let i = 0, n = W * H; i < n; i++) { const o = i * 4; if (d[o + 3] > 127) pts.push({ x: i % W, y: (i / W) | 0, r: d[o], g: d[o + 1], b: d[o + 2] }); }
    return pts;
  }

  // ---------- transitions: how the pixels travel ----------
  let OX = 0, OY = 0, OC = 0, OS = 0, OV = true;
  const put = (x, y, c, s, v = true) => { OX = x; OY = y; OC = c; OS = s; OV = v; };
  const polar = (p) => { p.aa = Math.atan2(p.ay - CY, p.ax - CX); p.ra = Math.hypot(p.ax - CX, p.ay - CY); p.ba = Math.atan2(p.by - CY, p.bx - CX); p.rb = Math.hypot(p.bx - CX, p.by - CY); };
  // position along a Hilbert curve over the grid: sorting both pictures by it
  // and pairing by rank sends each patch of one picture to the matching patch
  // of the next, so filled shapes travel together instead of breaking into grit
  const hil = (x, y) => {
    let d = 0;
    for (let s = 128; s > 0; s >>= 1) {
      const rx = (x & s) ? 1 : 0, ry = (y & s) ? 1 : 0;
      d += s * s * ((3 * rx) ^ ry);
      if (!ry) { if (rx) { x = 255 - x; y = 255 - y; } const t = x; x = y; y = t; }
    }
    return d;
  };
  const KEYS = {
    rand: null,
    hil: (p) => hil(p.x | 0, p.y | 0),
    x: (p) => p.x * 256 + p.y,
    y: (p) => p.y * 256 + p.x,
    yd: (p) => -p.y * 256 + p.x,
    ang: (p) => Math.atan2(p.y - CY, p.x - CX),
    dist: (p) => Math.hypot(p.x - CX, p.y - CY),
  };
  // Each choreography: how the two pictures are ordered before their pixels
  // are paired, how long it runs, how staggered it is, and the path one pixel
  // takes (u is that pixel's own progress, 0 to 1).
  const STYLES = [
    // a true morph: neighbours stay neighbours, and the new picture builds in
    // one diagonal wave from the top left, so one shape bends into the next
    { name: 'morph', order: 'hil', spread: 0.45, dur: 2400, delay: (p) => (p.bx + p.by * 1.5) / (W + H * 1.5) + p.r1 * 0.04,
      pos(p, u) { const e = E.io(u); put(p.ax + (p.bx - p.ax) * e, p.ay + (p.by - p.ay) * e - Math.sin(Math.PI * e) * 3, e, Math.sin(Math.PI * e)); } },
    // a loose flock: each patch of pixels takes its own gentle curve and settles in
    { name: 'swarm', order: 'hil', spread: 0.4, dur: 2400, delay: (p) => p.r1,
      prep: (p) => { p.mx = (p.ax + p.bx) / 2 + (p.r2 - 0.5) * 30; p.my = (p.ay + p.by) / 2 + (p.r1 - 0.5) * 24 - 8; },
      pos(p, u) { const e = E.io(u), k = 1 - e; put(k * k * p.ax + 2 * k * e * p.mx + e * e * p.bx, k * k * p.ay + 2 * k * e * p.my + e * e * p.by, e, Math.sin(Math.PI * e)); } },
    // one slow turn around the centre, drawing in and opening out again
    { name: 'vortex', order: 'ang', spread: 0.35, dur: 2500, delay: (p) => p.r1,
      prep: (p) => { polar(p); let d = p.ba - p.aa; d = ((d % TAU) + TAU) % TAU; p.da = d + TAU; },
      pos(p, u) { const e = E.io(u), a = p.aa + p.da * e, r = (p.ra + (p.rb - p.ra) * e) * (1 - 0.55 * Math.sin(Math.PI * e)); put(CX + Math.cos(a) * r, CY + Math.sin(a) * r, e, Math.sin(Math.PI * e) * 0.5); } },
    // four ribbons: pixels leave in single file along shared curves
    { name: 'stream', order: 'ang', spread: 0.62, dur: 2700, delay: (p) => p.rank * 0.94 + p.r1 * 0.06,
      prep: (p, k, N) => {
        const f = (k / N) * 4, j = Math.floor(f), q = -Math.PI / 2 + j * (TAU / 4) + 0.7;
        p.rank = f - j; p.mx = CX + Math.cos(q) * 66 + (p.r2 - 0.5) * 5; p.my = CY + Math.sin(q) * 46 + (p.r1 - 0.5) * 5;
      },
      pos(p, u) { const e = E.io(u), k = 1 - e; put(k * k * p.ax + 2 * k * e * p.mx + e * e * p.bx, k * k * p.ay + 2 * k * e * p.my + e * e * p.by, e, Math.sin(Math.PI * e) * 0.6); } },
    // a sweep from left to right, each pixel hopping in a low arc
    { name: 'wipe', order: 'x', spread: 0.6, dur: 2200, delay: (p) => p.bx / W * 0.88 + p.r1 * 0.12,
      pos(p, u) { const e = E.io(u); put(p.ax + (p.bx - p.ax) * e, p.ay + (p.by - p.ay) * e - Math.sin(Math.PI * e) * (6 + p.r2 * 12), e, Math.sin(Math.PI * e) * 0.5); } },
    // gather to a point, then open outward in rings
    { name: 'rings', order: 'dist', spread: 0.55, dur: 2400, delay: (p) => Math.hypot(p.bx - CX, p.by - CY) / 80 * 0.9 + p.r1 * 0.1, prep: polar,
      pos(p, u) {
        const tx = CX + Math.cos(p.ba) * 3, ty = CY + Math.sin(p.ba) * 3;
        if (u < 0.4) { const v = E.io(u / 0.4); put(p.ax + (tx - p.ax) * v, p.ay + (ty - p.ay) * v, v * 0.2, v * 0.5); }
        else { const w = (u - 0.4) / 0.6, v = E.back(w); put(tx + (p.bx - tx) * v, ty + (p.by - ty) * v, 1, (1 - w) * 0.6); }
      } },
    // an outward loop around the centre, like a slow orbit, then landing
    { name: 'orbit', order: 'ang', spread: 0.4, dur: 2600, delay: (p) => p.r1,
      prep: (p) => { polar(p); let d = p.ba - p.aa; d = ((d % TAU) + TAU) % TAU; if (d > Math.PI) d -= TAU; p.da = d; },
      pos(p, u) { const e = E.io(u), s = Math.sin(Math.PI * e), a = p.aa + p.da * e + s * 1.1, r = p.ra + (p.rb - p.ra) * e + s * 24; put(CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.8, e, s * 0.45); } },
    // everything falls into the centre, then bursts back out as the new picture
    { name: 'blackhole', order: 'dist', spread: 0.3, dur: 2400, delay: (p) => p.r1, prep: polar,
      pos(p, u) {
        if (u < 0.5) { const v = E.i(u / 0.5), a = p.aa + v * 3.2, r = p.ra * (1 - v); put(CX + Math.cos(a) * r, CY + Math.sin(a) * r * 0.9, 0, v); }
        else { const w = (u - 0.5) / 0.5, v = E.back(w); put(CX + (p.bx - CX) * v, CY + (p.by - CY) * v, 1, 1 - w); }
      } },
    // drain to a fountain below the picture, then spray up into place
    { name: 'spray', order: 'hil', spread: 0.5, dur: 2400, delay: (p) => p.r1,
      prep: (p) => { p.h = 16 + p.r2 * 40; },
      pos(p, u) {
        const ex = CX, ey = H + 2;
        if (u < 0.35) { const v = E.i(u / 0.35); put(p.ax + (ex - p.ax) * v, p.ay + (ey - p.ay) * v, 0, v * 0.5); }
        else { const v = E.o((u - 0.35) / 0.65); put(ex + (p.bx - ex) * v, ey + (p.by - ey) * v - Math.sin(Math.PI * v) * p.h, v, Math.sin(Math.PI * v) * 0.7); }
      } },
    // fold to the horizon line, then unfold up and down from the middle out
    { name: 'middleout', order: 'x', spread: 0.5, dur: 2300, delay: (p) => Math.abs(p.bx - CX) / CX * 0.8 + p.r1 * 0.2,
      pos(p, u) {
        if (u < 0.5) { const v = E.io(u / 0.5); put(p.ax + (p.bx - p.ax) * v, p.ay + (CY - p.ay) * v, v * 0.3, v * 0.6); }
        else { const v = E.io((u - 0.5) / 0.5); put(p.bx, CY + (p.by - CY) * v, 0.3 + 0.7 * v, (1 - v) * 0.6); }
      } },
    // a soft burst outward, a pause in the air, then everything drifts home
    { name: 'scatter', order: 'hil', spread: 0.4, dur: 2400, delay: (p) => p.r1,
      prep: (p) => { const a = Math.atan2(p.ay - CY, p.ax - CX) + (p.r2 - 0.5) * 0.9, r = 6 + p.r1 * 12; p.mx = p.ax + Math.cos(a) * r; p.my = p.ay + Math.sin(a) * r; },
      pos(p, u) {
        if (u < 0.45) { const v = E.o(u / 0.45); put(p.ax + (p.mx - p.ax) * v, p.ay + (p.my - p.ay) * v, v * 0.25, v * 0.5); }
        else { const v = E.io((u - 0.45) / 0.55); put(p.mx + (p.bx - p.mx) * v, p.my + (p.by - p.my) * v, 0.25 + 0.75 * v, (1 - v) * 0.5); }
      } },
  ];
  function arrange(arr, key) {
    const f = KEYS[key];
    if (f) { for (const p of arr) p.k = f(p); arr.sort((m, n) => m.k - n.k); return; }
    for (let i = arr.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  }
  function build(A, B, st) {
    arrange(A, st.order); arrange(B, st.order);
    const N = Math.max(A.length, B.length), out = new Array(N);
    for (let k = 0; k < N; k++) {
      const b = B[Math.floor(k * B.length / N)];
      let a = A.length ? A[Math.floor(k * A.length / N)] : null;
      if (!a) { const q = Math.random() * TAU, r = 95 + Math.random() * 40; a = { x: CX + Math.cos(q) * r, y: CY + Math.sin(q) * r * 0.75, r: b.r, g: b.g, b: b.b }; }
      const p = { ax: a.x, ay: a.y, ar: a.r, ag: a.g, ab: a.b, bx: b.x, by: b.y, br: b.r, bg: b.g, bb: b.b, r1: Math.random(), r2: Math.random(), d: 0 };
      if (st.prep) st.prep(p, k, N);
      p.d = Math.max(0, Math.min(1, st.delay(p)));
      out[k] = p;
    }
    return out;
  }

  // ---------- one stage ----------
  function Stage(el) {
    const screen = el.querySelector('.pxstage__screen') || el;
    const cv = screen.querySelector('canvas');
    if (!cv) return null;
    const ctx = cv.getContext('2d');
    const list = (el.dataset.scenes || '').split(/[\s,]+/).filter((n) => SCENES[n]);
    const first = SCENES[el.dataset.first] ? el.dataset.first : (list[0] || ORDER[0]);
    const base = list.length ? list : ORDER;
    const order = [first, ...base.filter((n) => n !== first)];
    const off = mk(), og = off.getContext('2d', { willReadFrequently: true });
    const nxt = mk(), ng = nxt.getContext('2d', { willReadFrequently: true });
    const buf = mk(), bgc = buf.getContext('2d'), img = bgc.createImageData(W, H);
    const HOLD = +(el.dataset.hold || 3200);
    let idx = 0, target = 0, state = 'boot', t0 = 0, clock = 0, last = 0, parts = null, style = null, styleIdx = 0, holdFor = HOLD;
    let paused = false, visible = true, raf = 0, shown = off;

    // pips and a pause button (built here, so there are no dead controls without JS)
    let pips = null, btn = null;
    if (!reduce) {
      const bar = document.createElement('div'); bar.className = 'pxstage__bar';
      pips = document.createElement('span'); pips.className = 'pxstage__pips'; pips.setAttribute('aria-hidden', 'true');
      order.forEach(() => pips.appendChild(document.createElement('i')));
      btn = document.createElement('button'); btn.type = 'button'; btn.className = 'pxstage__pause';
      btn.setAttribute('aria-label', 'Pause animation'); btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => { paused = !paused; btn.setAttribute('aria-pressed', String(paused)); if (!paused) kick(); });
      bar.append(pips, btn); el.appendChild(bar);
      cv.addEventListener('click', () => { if (state === 'hold' && !paused) begin(); });
      cv.style.cursor = 'pointer';
    }
    const setPip = (i) => { if (pips) [...pips.children].forEach((p, j) => p.classList.toggle('on', j === i)); };

    function blit(src) {
      shown = src;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(src, 0, 0, W, H, 0, 0, cv.width, cv.height);
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
    function particles(P) {
      // pixels in flight keep their own colours, warmed a little toward the
      // accent so the move reads; short trails show the path without smearing
      const d = img.data, sp = RGB.accent, S = style.spread;
      for (let i = 3; i < d.length; i += 4) d[i] = d[i] * 0.45;
      for (const p of parts) {
        let u = (P - p.d * S) / (1 - S); u = u < 0 ? 0 : u > 1 ? 1 : u;
        style.pos(p, u);
        if (!OV) continue;
        const x = Math.round(OX), y = Math.round(OY);
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const o = (y * W + x) * 4;
        let r = p.ar + (p.br - p.ar) * OC, g = p.ag + (p.bg - p.ag) * OC, b = p.ab + (p.bb - p.ab) * OC;
        const k = Math.min(0.22, OS * 0.35);
        if (k > 0) { r += (sp[0] - r) * k; g += (sp[1] - g) * k; b += (sp[2] - b) * k; }
        d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
      }
      bgc.putImageData(img, 0, 0);
      blit(buf);
    }
    function begin() {
      let n = idx;
      for (let k = 0; k < order.length; k++) { n = (n + 1) % order.length; if (ready(SCENES[order[n]])) break; }
      if (n === idx) { t0 = clock; return; }
      const A = sample(og);
      paint(SCENES[order[n]], 0, ng);
      const B = sample(ng);
      if (!B.length) { idx = n; state = 'hold'; t0 = clock; return; }
      style = STYLES[styleIdx++ % STYLES.length];
      parts = build(A, B, style);
      img.data.set(og.getImageData(0, 0, W, H).data);
      target = n; state = 'trans'; t0 = clock; setPip(n);
    }
    function step() {
      if (state === 'hold') {
        const t = clock - t0;
        paint(SCENES[order[idx]], t, og); blit(off);
        if (t >= holdFor) { holdFor = HOLD; begin(); }
      } else if (state === 'trans') {
        const P = (clock - t0) / style.dur;
        particles(Math.min(1, P));
        if (P >= 1.12) { idx = target; state = 'hold'; t0 = clock; parts = null; paint(SCENES[order[idx]], 0, og); blit(off); }
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
    function still() { paint(SCENES[order[0]], 0, og); blit(off); }
    // after a theme change: redraw what is on screen now if nothing is animating
    function repaint() {
      if (state === 'boot') return;
      if (reduce) still();
      else if (paused && state === 'hold') { paint(SCENES[order[idx]], clock - t0, og); blit(off); }
    }

    new ResizeObserver(fit).observe(screen);
    new IntersectionObserver((es) => {
      const was = visible;
      visible = es.some((e) => e.isIntersecting);
      if (visible && !was && !reduce && !paused && state !== 'boot') step();
      if (visible) kick();
    }).observe(el);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

    const needed = SCENES[first].sprites || [];
    Promise.all(needed.map(load)).then(() => {
      fit();
      el.classList.add('is-live');
      if (reduce) { still(); return; }
      // open on the same picture as the still, then start the first morph
      // soon, so the motion is seen early without opening on noise
      idx = 0; paint(SCENES[order[0]], 0, og); blit(off); setPip(0);
      state = 'hold'; t0 = clock; holdFor = Math.min(HOLD, 1400); kick();
      // the rest of the sprites arrive in the background
      for (const n of order) (SCENES[n].sprites || []).forEach(load);
    });
    return { repaint };
  }

  const live = stages.map(Stage).filter(Boolean);
  addEventListener('qs:theme', () => { readPalette(); live.forEach((s) => s.repaint()); });
})();
