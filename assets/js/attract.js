// QuarterSmart attract mode. The hero IS a game: the wordmark is drawn as
// pixel letters inside a night-time world that fills the first screen, and a
// run of little arcade scenes play with it. The loop opens on a game whose
// first frame shows the whole word, so it reads as QuarterSmart first; each game re-lays the
// wordmark its own way (one line, stacked, italic for the racer, bricks for
// breakout, a vertical net for pong, an arc on the radar, neon outlines...).
// Between scenes every lit pixel flies into the next scene's first frame: a
// morph, never a cut. Crisp: low-res buffer, integer upscale, grid-snapped.
// Pauses off screen and from the frame's pause button; one still title frame for reduced motion.
// Debug: ?scene=<name>&t=<ms> jumps to a scene.
(() => {
  const cv = document.querySelector('canvas[data-attract]');
  if (!cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = cv.getContext('2d');
  const buf = document.createElement('canvas');
  const b = buf.getContext('2d', { willReadFrequently: true });
  const sky = document.createElement('canvas');
  const k2 = sky.getContext('2d');
  const label = document.querySelector('[data-scene-label]');
  const textBox = document.querySelector('.h4__in');

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let C = {};
  const palette = () => {
    C = { dim: css('--line-2') || '#4a5a4f', line: css('--line') || '#2c3730', body: '#2a9a70', deep: '#1d7a58', quart: '#a9d99f',
      butter: css('--warn') || '#dfc07f', rose: css('--event') || '#d99bb8', teal: css('--info') || '#86c3ba', cream: css('--fg-1') || '#cbc3ab', hi: css('--fg-0') || '#ece4cc' };
  };
  palette();

  // ---------- world size: the buffer covers the whole canvas at an integer scale ----------
  let GW = 160, GH = 90, PH = 60, SC = 1, small = false;
  const GROUND = 9;                                   // art rows between the play field and the title text
  function dims() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
    small = r.width < 760;
    const baseW = small ? 2 * LINE_W(7) : 2 * LINE_W(12);                          // the default word at F=2
    let s = Math.max(1, Math.round(r.width * 0.86 / baseW));
    if (Math.ceil(r.width / s) - 6 < baseW) s = Math.max(1, s - 1);
    SC = Math.max(1, Math.round(s * dpr));
    GW = Math.ceil(cv.width / SC); GH = Math.ceil(cv.height / SC);
    buf.width = sky.width = GW; buf.height = sky.height = GH;
    // the play field ends where the title text begins; below it is the ground
    const tb = textBox ? textBox.getBoundingClientRect() : null;
    const top = tb ? (tb.top - r.top) * dpr / SC : GH * 0.64;
    PH = Math.max(40, Math.min(GH - 4, Math.floor(top) - GROUND));
  }

  // ---------- helpers ----------
  const px = (x, y, c) => { b.fillStyle = c; b.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const rect = (x, y, w, h, c) => { b.fillStyle = c; b.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const disc = (cx, cy, r, c, skip) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.5 && !(skip && skip(x, y))) px(cx + x, cy + y, c); };
  const ring = (cx, cy, r, c) => { for (let a = 0; a < 360; a += 360 / (r * 7)) px(cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r, c); };
  const sprite = (x, y, rows, c, s = 1) => rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') rect(x + i * s, y + j * s, s, s, c); }));
  const clamp = (v, a = 0, z = 1) => Math.max(a, Math.min(z, v));
  const chomper = (cx, cy, r, dir, open, c) => disc(cx, cy, r, c, (x, y) => {
    if (!x && !y) return false;
    let a = Math.atan2(y, x) - dir; a = Math.atan2(Math.sin(a), Math.cos(a));
    return Math.abs(a) < open / 2;
  });
  const coin = (x, y, t, c) => { const w = Math.max(1, Math.round(Math.abs(Math.cos(t / 120)) * 3)); rect(x + 2 - Math.floor(w / 2), y, w, 5, c); };
  const sparkle = (x, y, n, c) => { px(x, y, C.hi); for (let i = 1; i <= n; i++) { px(x + i, y, c); px(x - i, y, c); px(x, y + i, c); px(x, y - i, c); } };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // ---------- the wordmark: a 5x7 pixel font, laid out per scene ----------
  const GLYPH = {
    Q: ['.xxxxx.', 'xx...xx', 'xx...xx', 'xx...xx', 'xx...xx', 'xx.x.xx', 'xx..xx.', '.xxx.xx'],
    u: ['......', '......', '......', 'xx..xx', 'xx..xx', 'xx..xx', 'xx..xx', '.xxxxx'],
    a: ['......', '......', '......', '.xxxx.', '....xx', '.xxxxx', 'xx..xx', '.xxxxx'],
    r: ['.....', '.....', '.....', 'xx.xx', 'xxx..', 'xx...', 'xx...', 'xx...'],
    t: ['.....', '.xx..', '.xx..', 'xxxxx', '.xx..', '.xx..', '.xx..', '..xxx'],
    e: ['......', '......', '......', '.xxxx.', 'xx..xx', 'xxxxxx', 'xx....', '.xxxx.'],
    S: ['.xxxx.', 'xx..xx', 'xx....', '.xxxx.', '....xx', '....xx', 'xx..xx', '.xxxx.'],
    m: ['.......', '.......', '.......', 'xxxxxx.', 'xx.x.xx', 'xx.x.xx', 'xx.x.xx', 'xx.x.xx'],
  };
  const GH_ROWS = 8;
  const GWID = (ch) => GLYPH[ch][0].length;
  const TEXT = 'QuarterSmart';
  const XS = []; { let x = 0; for (const ch of TEXT) { XS.push(x); x += GWID(ch) + 1; } }          // letter x in font px
  const LINE_W = (n) => { let w = 0; for (let i = 0; i < n; i++) w += GWID(TEXT[i]) + 1; return w - 1; };
  const band = (gy) => [C.hi, C.hi, C.hi, C.hi, C.quart, C.teal, C.body, C.deep][gy];
  const STYLE = {
    band: (w) => band(w.gy),
    bricks: (w) => [C.rose, C.rose, C.rose, C.butter, C.butter, C.quart, C.teal, C.teal][w.gy],
    bunker: (w) => [C.quart, C.quart, C.quart, C.quart, C.body, C.body, C.deep, C.deep][w.gy],
    gold: (w) => [C.hi, C.hi, C.butter, C.hi, C.butter, C.butter, C.cream, C.cream][w.gy],
    multi: (w) => [C.rose, C.butter, C.quart, C.teal][w.li % 4],
    neon: (w) => (w.edge ? C.quart : C.line),
    bright: (w) => (w.gy === 7 ? C.quart : C.hi),
  };
  function place(lay, F) {
    const out = [];
    if (lay === 'stack') {                                  // Quarter / Smart
      const w0 = LINE_W(7), w1 = XS[11] - XS[7] + GWID('t'), off = Math.round((w0 - w1) / 2);
      for (let li = 0; li < 12; li++) out.push(li < 7 ? { li, x: XS[li] * F, y: 0 } : { li, x: (XS[li] - XS[7] + off) * F, y: 10 * F });
    } else if (lay === 'vert') {                            // rotated, reading bottom to top
      const tot = LINE_W(12);
      for (let li = 0; li < 12; li++) out.push({ li, x: 0, y: (tot - XS[li] - GWID(TEXT[li])) * F, rot: true });
    } else {
      for (let li = 0; li < 12; li++) {
        let y = 0;
        if (lay === 'arc') { const u = (li - 5.5) / 5.5; y = Math.round(-4 * F * (1 - u * u)); }
        if (lay === 'wave') y = Math.round(Math.sin(li * 0.95) * 2.5 * F);
        out.push({ li, x: XS[li] * F, y });
      }
    }
    return out;
  }
  function makeCells(lay, F, skew) {
    const cells = [];
    for (const g of place(lay, F)) GLYPH[TEXT[g.li]].forEach((row, gy) => [...row].forEach((v, gx) => {
      if (v !== 'x') return;
      const gw = GWID(TEXT[g.li]), lx = g.rot ? gy : gx, ly = g.rot ? gw - 1 - gx : gy;
      for (let i = 0; i < F; i++) for (let j = 0; j < F; j++) cells.push({ x: g.x + lx * F + i, y: g.y + ly * F + j, li: g.li, gy, base: g.y + (g.rot ? gw : GH_ROWS) * F });
    }));
    if (skew) for (const c of cells) c.x += Math.round((c.base - 1 - c.y) * skew);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const c of cells) { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x); y1 = Math.max(y1, c.y); }
    return { cells, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }
  // the current scene's word and the lookups the games use
  let word = [], shadow = [], letters = [], X0 = 0, WW = 0, Y0 = 0, WY1 = 0, WF = 2, topOf = new Map(), at = new Map();
  const cache = new Map();
  function useWord(spec0) {
    const spec = small && spec0.mob ? { ...spec0, ...spec0.mob } : small && (spec0.lay || 'line') === 'line' && !spec0.keepLine ? { ...spec0, lay: 'stack', F: 2 } : spec0;
    const key = JSON.stringify(spec);
    let W = cache.get(key);
    if (!W) {
      const tries = [spec, ...(spec.alt ? [spec.alt] : []), { lay: 'line' }];
      let got = null;
      for (const s of tries) {
        for (let F = s.F || 2; F >= 1 && !got; F--) {
          const m = makeCells(s.lay || 'line', F, s.skew);
          if (m.w <= GW - 6 && m.h <= PH - 14) got = { m, F, s };
        }
        if (got) break;
      }
      if (!got) got = { m: makeCells('line', 1, 0), F: 1, s: { lay: 'line' } };
      const { m, F } = got;
      const ox = Math.round((GW - m.w) / 2) - m.x0;
      const oy = Math.round(PH * (spec.cy || 0.48) - m.h / 2) - m.y0;
      const cells = m.cells.map((c, i) => ({ x: c.x + ox, y: c.y + oy, li: c.li, gy: c.gy, i }));
      const set = new Set(cells.map((c) => c.x * 1000 + c.y));
      for (const c of cells) c.edge = !(set.has((c.x + 1) * 1000 + c.y) && set.has((c.x - 1) * 1000 + c.y) && set.has(c.x * 1000 + c.y + 1) && set.has(c.x * 1000 + c.y - 1));
      const st = STYLE[spec.style || 'band'];
      for (const c of cells) c.c = st(c);
      const sh = [], seen = new Set();
      for (let k = 1; k <= (spec.shadow || 0); k++) for (const c of cells) {
        const kk = (c.x + k) * 1000 + c.y + k;
        if (set.has(kk) || seen.has(kk)) continue;
        seen.add(kk); sh.push({ x: c.x + k, y: c.y + k, i: c.i, c: k === 1 ? C.deep : C.line });
      }
      const L = [];
      for (const c of cells) { const l = L[c.li] || (L[c.li] = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, ch: TEXT[c.li] }); l.x0 = Math.min(l.x0, c.x); l.x1 = Math.max(l.x1, c.x); l.y0 = Math.min(l.y0, c.y); l.y1 = Math.max(l.y1, c.y); }
      W = { cells, sh, L, X0: m.x0 + ox, WW: m.w, Y0: m.y0 + oy, WY1: m.y0 + oy + m.h, F };
      cache.set(key, W);
    }
    word = W.cells; shadow = W.sh; letters = W.L; X0 = W.X0; WW = W.WW; Y0 = W.Y0; WY1 = W.WY1; WF = W.F;
    topOf = new Map(); for (const w of word) if (!topOf.has(w.x) || w.y < topOf.get(w.x)) topOf.set(w.x, w.y);
    at = new Map(word.map((w) => [w.x * 1000 + w.y, w.i]));
  }
  function drawWord(o = {}) {
    for (const s of shadow) {
      const w = word[s.i];
      if (o.skip && o.skip(w)) continue;
      const d = o.off ? o.off(w) : null;
      px(s.x + (d ? d[0] : 0), s.y + (d ? d[1] : 0), s.c);
    }
    for (const w of word) {
      if (o.skip && o.skip(w)) continue;
      const d = o.off ? o.off(w) : null;
      const c = o.col ? o.col(w) : null;
      px(w.x + (d ? d[0] : 0), w.y + (d ? d[1] : 0), c || w.c);
    }
  }

  const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, bb, t) => { const x = hex(a), y = hex(bb); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`; };
  const ECHO = () => [C.rose, C.butter, C.quart, C.teal];
  // The echo only extrudes from each letter's lowest pixel in every column, so counters stay clean:
  // it reads as the word lifting out of the screen on a stack of coloured layers.
  function echo(depth, phase, o = {}) {
    if (depth < 1) return;
    const E = ECHO(), night = css('--bg-0') || '#121814';
    const low = new Map();
    for (const w of word) { const kk = w.li * 10000 + w.x; if (!low.has(kk) || w.y > low.get(kk).y) low.set(kk, w); }
    for (const w of low.values()) {
      if (o.skip && o.skip(w)) continue;
      const d = o.off ? o.off(w) : null, ox = d ? d[0] : 0, oy = d ? d[1] : 0;
      for (let k = 1; k <= depth; k++) {
        if (at.has(w.x * 1000 + w.y + k)) break;
        px(w.x + ox, w.y + k + oy, mix(E[(k - 1 + phase) % E.length], night, 0.08 + (k - 1) / depth * 0.5));
      }
    }
  }

  // ---------- scenes ----------
  const S = {};
  const T = (s) => s.t / s.dur;

  // The title frame: the clean wordmark, block-extruded like an arcade logo, a glint and a few sparkles.
  S.title = { dur: 3000, name: 'title', word: { lay: 'line', F: 2, style: 'bright', mob: { lay: 'stack', F: 2 } }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this), g = -12 + clamp((p - 0.3) / 0.45) * (WW + 40);
    echo(Math.round(clamp((this.t - 300) / 900) * (small ? 3 : 5)), Math.floor(this.t / 180));
    drawWord({ col: (w) => { const d = (w.x - X0) + (w.y - Y0) * 0.8 - g; return d > -3 && d < 0 ? C.hi : null; } });
    for (let k = 0; k < 4; k++) {
      const ph = ((this.t + k * 1300) % 2600) / 2600;
      if (ph > 0.5) continue;
      const l = letters[[0, 5, 7, 11][k]]; if (!l) continue;
      sparkle(l.x1 + 2, l.y0 - 2, ph < 0.12 || ph > 0.38 ? 0 : ph < 0.2 || ph > 0.3 ? 1 : 2, C.butter);
    }
  } };

  S.chomp = { dur: 6500, name: 'chomp', word: { lay: 'line', F: 2 }, init() { this.t = 0; this.eaten = new Set(); }, update(t) { this.t = t; const p = T(this); const x = X0 - 10 + clamp(p / 0.66) * (WW + 16);
    for (const w of word) if (w.y < Y0 + 2 * WF && Math.abs(w.x - x) < 3) this.eaten.add(w.i); }, draw() {
    const p = T(this), y = Y0 - 6, x = X0 - 10 + clamp(p / 0.66) * (WW + 16);
    drawWord({ skip: (w) => this.eaten.has(w.i) });
    for (let k = X0; k < X0 + WW; k += 6) if (k > x + 3) rect(k, y, 1, 1, C.dim);
    if (p < 0.66) chomper(x, y, 4, 0, 0.3 + Math.abs(Math.sin(this.t / 100)) * 1.1, C.body);
    else if (p < 0.78) chomper(x, y, 4, (p - 0.66) / 0.12 * Math.PI * 4, 0.9, C.body);
    else if (p < 0.9) chomper(x, y, 4, -Math.PI / 2, 0.6 + (p - 0.78) / 0.12 * (Math.PI * 2 - 0.6), C.body);
    else { const q = (p - 0.9) / 0.1; disc(x + q * 4, y - q * 4, 4, C.quart, (dx, dy) => !(dx >= 0 && dy <= 0)); }
  } };

  S.invaders = { dur: 6600, name: 'invaders', word: { lay: 'line', F: 2, style: 'bunker' }, init() { this.t = 0; this.holes = new Set(); this.dead = new Set(); seed = 11; this.bombs = []; this.next = 300; }, update(t, dt) {
    this.t = t; const step = Math.floor(t / 380), ox = (step % 8 < 4 ? step % 4 : 3 - (step % 4)) * 3;
    if (t > this.next) { const k = Math.floor(rnd() * 8); if (!this.dead.has(k)) this.bombs.push({ x: X0 + 6 + k * (WW / 8) + ox + 3, y: 8 }); this.next = t + 360; }
    for (const m of this.bombs) { m.y += dt * 0.04; const top = topOf.get(Math.round(m.x)); if (top !== undefined && m.y >= top - 1) { for (const w of word) if (Math.hypot(w.x - m.x, w.y - m.y) < 2.2 && !this.holes.has(w.i)) this.holes.add(w.i); m.gone = true; } if (m.y > PH) m.gone = true; }
    this.bombs = this.bombs.filter((m) => !m.gone);
    const kill = Math.floor(t / 1400); for (let k = 0; k < kill && k < 4; k++) this.dead.add((k * 3 + 1) % 8);
  }, draw() {
    drawWord({ skip: (w) => this.holes.has(w.i) });
    const step = Math.floor(this.t / 380), ox = (step % 8 < 4 ? step % 4 : 3 - (step % 4)) * 3;
    const A = step % 2 ? ['.x...x.', 'x.xxx.x', 'xxx.xxx', '.x...x.'] : ['.x...x.', '..xxx..', 'xxx.xxx', 'x.x.x.x'];
    const iy = Math.max(3, Y0 - 12);
    for (let k = 0; k < 8; k++) if (!this.dead.has(k)) sprite(X0 + 6 + k * (WW / 8) + ox, iy, A, [C.rose, C.teal, C.butter][k % 3]);
    for (const m of this.bombs) if (m.y > iy + 4) rect(m.x, m.y, 1, 2, C.rose);
    const sx = X0 + 6 + ((Math.floor(this.t / 1400) * 3 + 1) % 8) * (WW / 8) + ox;
    sprite(sx, PH - 4, ['..x..', '.xxx.', 'xxxxx'], C.body);
    if ((this.t % 1400) > 900) rect(sx + 2, PH - 6 - ((this.t % 1400) - 900) * 0.09, 1, 2, C.quart);
  } };

  S.race = { dur: 6000, name: 'race', word: { lay: 'line', F: 2, skew: 0.5 }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this), road = Math.min(PH - 8, WY1 + 5);
    rect(0, road + 7, GW, 1, C.line);
    const go = p > 0.3, x = go ? -20 + Math.pow((p - 0.3) / 0.7, 1.6) * (GW + 60) : 6;
    for (let i = 0; i < 3; i++) rect(8 + i * 5, road - 6, 3, 3, go ? C.quart : (p > 0.06 + i * 0.07 ? C.rose : C.line));
    drawWord({ off: (w) => { const d = x - w.x; const push = go && d > -4 && d < 40 ? Math.round(Math.max(0, 1 - Math.abs(d - 8) / 30) * (WY1 - w.y) * 0.25) : 0; return [push, 0]; } });
    const y = road - (!go && p > 0.06 ? Math.floor(this.t / 60) % 2 : 0);
    rect(x + 3, y, 9, 1, C.rose); rect(x + 2, y + 1, 11, 2, C.rose); rect(x + 5, y + 1, 3, 1, C.teal);
    rect(x, y + 3, 17, 2, C.rose); rect(x + 14, y + 3, 3, 1, C.hi); rect(x + 2, y + 5, 3, 2, C.dim); rect(x + 12, y + 5, 3, 2, C.dim);
    if (go) for (let k = 1; k < 5; k++) rect(x - 4 - k * 7, road + 2 + (k % 3), 6 - k, 1, C.dim);
  } };

  S.breakout = { dur: 7000, name: 'breakout', word: { lay: 'stack', F: 3, style: 'bricks', mob: { lay: 'stack', F: 2 } }, init() { this.gone = new Set(); this.x = GW / 2; this.y = PH - 10; this.vx = 0.035; this.vy = -0.04; this.pad = GW / 2; }, update(t, dt) {
    for (let s = 0; s < dt; s += 3) {
      this.x += this.vx * 3; this.y += this.vy * 3;
      if (this.x < 1 || this.x > GW - 2) this.vx *= -1;
      if (this.y < 1) this.vy *= -1;
      if (this.y > PH - 6 && this.vy > 0) { this.vy *= -1; this.vx += (this.x - this.pad) * 0.001; }
      const hit = at.get(Math.round(this.x) * 1000 + Math.round(this.y));
      if (hit !== undefined && !this.gone.has(hit)) { for (const w of word) if (Math.abs(w.x - this.x) < 2 && Math.abs(w.y - this.y) < 2) this.gone.add(w.i); this.vy *= -1; }
    }
    this.pad += (this.x - this.pad) * 0.1;
  }, draw() { drawWord({ skip: (w) => this.gone.has(w.i) }); rect(this.pad - 8, PH - 4, 16, 2, C.teal); rect(this.x, this.y, 2, 2, C.hi); } };

  S.flap = { dur: 6400, name: 'flap', word: { lay: 'wave', F: 2 }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this); drawWord();
    const crash = 0.8, x = X0 - 12 + p / crash * (WW * 0.72);
    let y;
    if (p < crash) y = Y0 - 6 + Math.abs(Math.sin(p * 18)) * (WY1 - Y0 + 10);
    else y = Math.min(PH - 4, Y0 + (p - crash) * 160);
    const wing = p < crash ? Math.floor(this.t / 120) % 2 : 0;
    const bx = p < crash ? x : X0 - 12 + WW * 0.72;
    rect(bx, y, 5, 3, C.butter); px(bx + 5, y + 1, C.rose); px(bx + 3, y, C.hi); rect(bx + 1, y + (wing ? -1 : 2), 2, 1, C.butter);
    rect(0, PH - 1, GW, 1, C.line);
  } };

  S.stack = { dur: 6800, name: 'stack', word: { lay: 'stack', F: 3 }, init() { this.t = 0; this.surf = new Map(); for (let x = 0; x < GW; x++) this.surf.set(x, topOf.has(x) ? topOf.get(x) : PH - 1); this.blocks = []; this.spawned = 0; seed = 5; }, update(t, dt) {
    this.t = t;
    if (this.spawned < 12 && t > this.spawned * 450) { const bx = X0 + Math.floor(rnd() * (WW - 4)); this.blocks.push({ x: bx, y: -4, c: [C.quart, C.teal, C.butter, C.rose][this.spawned % 4], land: false }); this.spawned++; }
    for (const k of this.blocks) {
      if (k.land) continue;
      k.y += dt * 0.03;
      let floor = PH - 1; for (let i = 0; i < 4; i++) floor = Math.min(floor, this.surf.get(k.x + i));
      if (k.y + 4 >= floor) { k.y = floor - 4; k.land = true; for (let i = 0; i < 4; i++) this.surf.set(k.x + i, k.y); }
    }
  }, draw() { drawWord(); for (const k of this.blocks) { rect(k.x, k.y, 4, 4, k.c); rect(k.x + 2, k.y, 2, 2, C.hi); } } };

  S.pong = { dur: 6400, name: 'pong', word: { lay: 'vert', F: 2, alt: { lay: 'stack', F: 2 } }, init() { this.x = GW / 2 - 20; this.y = 6; this.vx = 0.06; this.vy = 0.03; this.l = PH / 2; this.r = PH / 2; this.flash = new Map(); }, update(t, dt) {
    for (let s = 0; s < dt; s += 3) {
      const nx = this.x + this.vx * 3, ny = this.y + this.vy * 3;
      const hx = at.get(Math.round(nx) * 1000 + Math.round(this.y)), hy = at.get(Math.round(this.x) * 1000 + Math.round(ny));
      if (hx !== undefined) { this.vx *= -1; this.flash.set(word[hx].li, t); } else this.x = nx;
      if (hy !== undefined) { this.vy *= -1; this.flash.set(word[hy].li, t); } else this.y = ny;
      if (this.y < 1 || this.y > PH - 2) this.vy *= -1;
      if (this.x < 6 || this.x > GW - 7) this.vx *= -1;
    }
    this.l += (this.y - this.l) * 0.1; this.r += (this.y - this.r) * 0.08; this.t = t;
  }, draw() {
    drawWord({ col: (w) => { const f = this.flash.get(w.li); return f !== undefined && this.t - f < 250 ? C.hi : null; } });
    rect(3, this.l - 5, 2, 10, C.cream); rect(GW - 5, this.r - 5, 2, 10, C.cream); rect(this.x, this.y, 2, 2, C.quart);
  } };

  S.float = { dur: 7000, name: 'zero-g', word: { lay: 'line', F: 2, style: 'neon' }, init() { seed = 3; this.v = TEXT.split('').map(() => [rnd() - 0.5, rnd() - 0.5]); this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this), e = Math.sin(clamp(p / 0.9) * Math.PI);
    drawWord({ off: (w) => [this.v[w.li][0] * e * 22, this.v[w.li][1] * e * 14] });
    const a = this.t / 700; const cx = GW / 2, cy = PH - 8;
    for (let i = 0; i <= 3; i++) px(cx + Math.cos(a) * i, cy + Math.sin(a) * i, C.quart);
    for (const s of [-1, 1]) for (let i = 0; i <= 2; i++) px(cx + Math.cos(a) * 3 - Math.cos(a + s * 0.5) * i * 1.6, cy + Math.sin(a) * 3 - Math.sin(a + s * 0.5) * i * 1.6, C.quart);
    for (let k = 0; k < 4; k++) { const d = ((this.t / 12 + k * 20) % 60); px(cx + Math.cos(a) * (4 + d), cy + Math.sin(a) * (4 + d), C.butter); }
  } };

  S.sand = { dur: 7200, name: 'sand', word: { lay: 'stack', F: 3, mob: { lay: 'stack', F: 2 } }, init() { this.g = new Map(); this.parts = word.map((w) => ({ x: w.x, y: w.y, c: w.c })); this.parts.forEach((q) => this.g.set(q.x * 1000 + q.y, 1)); this.acc = 0; seed = 9; }, update(t, dt) {
    if (t < 800) return;
    this.acc += dt;
    while (this.acc > 22) {
      this.acc -= 22;
      this.parts.sort((m, n) => n.y - m.y);
      for (const q of this.parts) {
        if (q.y >= PH - 2) continue;
        const k = (x, y) => this.g.has(x * 1000 + y);
        const dirs = rnd() < 0.5 ? [0, -1, 1] : [0, 1, -1];
        for (const d of dirs) { if (!k(q.x + d, q.y + 1) && q.x + d >= 0 && q.x + d < GW) { this.g.delete(q.x * 1000 + q.y); q.x += d; q.y += 1; this.g.set(q.x * 1000 + q.y, 1); break; } }
      }
    }
  }, draw() { for (const q of this.parts) px(q.x, q.y, q.c); rect(0, PH - 1, GW, 1, C.line); } };

  S.frogger = { dur: 6800, name: 'frogger', word: { lay: 'line', F: 2, style: 'multi' }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const slide = Math.round(Math.sin(this.t / 900) * 10);
    drawWord({ off: () => [slide, 0] });
    const lanes = [{ y: WY1 + 4, v: 0.03, c: C.rose }, { y: Math.min(PH - 5, WY1 + 10), v: -0.04, c: C.butter }, { y: Y0 - 7, v: 0.035, c: C.teal }];
    for (const l of lanes) for (let k = 0; k < GW + 40; k += 34) { const x = ((k + this.t * l.v) % (GW + 40) + GW + 40) % (GW + 40) - 20; rect(x, l.y, 9, 3, l.c); }
    const hop = Math.min(5, Math.floor(this.t / 1100)), ys = [PH - 3, Math.min(PH - 7, WY1 + 12), WY1 + 6, WY1 - 4, Y0 - 3, Math.max(2, Y0 - 12)];
    const fx = X0 + WW / 2 + (hop === 3 ? slide : 0);
    sprite(fx, ys[hop] - 2, ['x.x', '.x.', 'xxx'], C.quart);
  } };

  S.runner = { dur: 6400, name: 'runner', word: { lay: 'line', F: 2, keepLine: true, mob: { lay: 'line', F: 1 } }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const scroll = Math.round(this.t * 0.02) % (WW + 40);
    drawWord({ off: () => [-scroll + 20, 0] });
    drawWord({ off: () => [-scroll + 20 + WW + 40, 0] });
    const rx = Math.round(GW * 0.3), col = rx + scroll - 20;
    let top = WY1; for (let dx = 0; dx < 5; dx++) { const tp = topOf.get(((col + dx - X0) % (WW + 40) + WW + 40) % (WW + 40) + X0); if (tp !== undefined) top = Math.min(top, tp); }
    const y = Math.min(top, WY1) - 7 - Math.abs(Math.sin(this.t / 260)) * 5;
    chomper(rx + 3, y + 3, 3, 0, 0.3 + Math.abs(Math.sin(this.t / 120)) * 0.9, C.quart);
    rect(0, WY1, GW, 1, C.line);
  } };

  S.radar = { dur: 6800, name: 'radar', word: { lay: 'arc', F: 2 }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const cx = GW / 2, cy = WY1 + 2, a = T(this) * Math.PI * 4 - Math.PI / 2;
    [10, 20, 30].forEach((r) => ring(cx, cy, r, C.line));
    drawWord({ col: (w) => { let d = a - Math.atan2(w.y - cy, w.x - cx); d = ((d % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return d < 0.5 ? C.quart : d < 2.2 ? w.c : d < 3.2 ? C.dim : C.line; } });
    for (let r = 0; r <= 80; r++) { const y = cy + Math.sin(a) * r; if (y < PH) px(cx + Math.cos(a) * r, y, C.quart); }
  } };

  S.bounce = { dur: 6600, name: 'bounce', word: { lay: 'line', F: 2, shadow: 1 }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    // stacked (phones): a second-line letter only hops as high as the gap under the first line, so the lines never touch
    const top = letters[0] ? letters[0].y1 : 0;
    drawWord({ off: (w) => { const tt = this.t / 1000 - w.li * 0.12; if (tt < 0) return [0, 0]; const l = letters[w.li], cap = l && l.y0 > top ? l.y0 - top - 3 : Math.min(14, Y0 - 2); const h = Math.abs(Math.sin(tt * 3.2)) * cap * Math.exp(-tt * 0.55); return [0, -Math.round(h)]; } });
    rect(0, WY1 + 1, GW, 1, C.line);
  } };

  S.eq = { dur: 6400, name: 'eq', word: { lay: 'line', F: 2, style: 'multi' }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    drawWord({ off: (w) => [0, -Math.round(Math.max(0, Math.sin(this.t / 180 + w.x * 0.21) + Math.sin(this.t / 260 + w.li)) * 3)] });
    for (let x = X0; x < X0 + WW; x += 3) { const h = Math.round((Math.sin(this.t / 150 + x * 0.3) * 0.5 + 0.5) * 8); rect(x, PH - 1 - h, 2, h, x % 2 ? C.body : C.deep); }
  } };

  S.paint = { dur: 6800, name: 'paint', word: { lay: 'line', F: 2, style: 'neon' }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const x = X0 - 6 + T(this) * (WW + 12);
    drawWord({ col: (w) => (w.x < x ? [C.rose, C.rose, C.butter, C.butter, C.teal, C.quart, C.body][w.gy] : null) });
    rect(x, Y0 - 5, 2, WY1 - Y0 + 8, C.dim); rect(x - 2, Y0 - 7, 6, 3, C.hi); rect(x - 1, WY1 + 3, 4, 4, C.butter);
  } };

  S.dig = { dur: 6800, name: 'dig', word: { lay: 'stack', F: 3, mob: { lay: 'stack', F: 2 } }, init() { this.gone = new Set(); this.trail = []; this.t = 0; }, update(t) { this.t = t; const p = T(this);
    const x = X0 - 4 + p * (WW + 8), y = (Y0 + WY1) / 2 + Math.sin(p * 22) * (WY1 - Y0) * 0.45;
    for (const w of word) if (Math.abs(w.x - x) < 2 && Math.abs(w.y - y) < 2) this.gone.add(w.i);
    if (Math.floor(t / 90) !== this.lt) { this.lt = Math.floor(t / 90); this.trail.push([x, y]); } this.px = x; this.py = y; }, draw() {
    drawWord({ skip: (w) => this.gone.has(w.i) });
    for (const [x, y] of this.trail) px(x, y + 3, C.dim);
    sprite(this.px - 2, this.py - 2, ['.xx.', 'xxxx', 'x.xx', '.xx.'], C.butter);
  } };

  S.walkers = { dur: 7000, name: 'walkers', word: { lay: 'wave', F: 2 }, init() { this.t = 0; this.gone = new Set(); }, update(t) { this.t = t; const p = T(this);
    const dx = X0 + WW * 0.55; if (p > 0.35) for (const w of word) if (Math.abs(w.x - dx) < 2 && w.y < Y0 + (p - 0.35) * 40) this.gone.add(w.i); }, draw() {
    drawWord({ skip: (w) => this.gone.has(w.i) });
    for (let k = 0; k < 5; k++) {
      const x = X0 - 10 - k * 9 + this.t * 0.02; if (x < X0 - 12 || x > X0 + WW + 6) continue;
      const tx = Math.round(x); const top = topOf.has(tx) ? topOf.get(tx) : topOf.has(tx + 1) ? topOf.get(tx + 1) : WY1;
      const leg = Math.floor(this.t / 120 + k) % 2;
      rect(x, top - 4, 2, 2, C.rose); rect(x, top - 2, 2, 1, C.teal); px(x + leg, top - 1, C.teal);
    }
    const p = T(this); if (p > 0.35) { const dx = X0 + WW * 0.55; rect(dx - 1, Y0 - 4 + (p - 0.35) * 40, 2, 2, C.butter); }
  } };

  S.bump = { dur: 7200, name: 'coin block', word: { lay: 'line', F: 2, style: 'gold', keepLine: true, mob: { lay: 'line', F: 1 } }, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this), rx = X0 - 8 + p * (WW + 16), li = letters.findIndex((l) => l && rx + 3 >= l.x0 && rx + 3 <= l.x1);
    const L0 = li >= 0 ? letters[li] : null, phase = L0 ? (rx + 3 - L0.x0) / (L0.x1 - L0.x0 + 1) : 0;
    drawWord({ off: (w) => (w.li === li && phase > 0.2 && phase < 0.7 ? [0, -Math.round(Math.sin((phase - 0.2) / 0.5 * Math.PI) * 4)] : [0, 0]) });
    letters.forEach((l, i) => { if (i <= li) { const age = (rx - l.x0) / 20; if (age < 1.5) coin(l.x0 + WF * 2 - 2, Y0 - 8 - age * 10, this.t, C.butter); } });
    const jy = WY1 + 2 - (phase > 0.2 && phase < 0.7 ? Math.sin((phase - 0.2) / 0.5 * Math.PI) * 2 : 0);
    rect(rx, jy + 1, 4, 3, C.rose); rect(rx + 1, jy - 1, 2, 2, C.hi); rect(0, WY1 + 6, GW, 1, C.line);
  } };

  S.snake = { dur: 6800, name: 'snake', word: { lay: 'line', F: 2, style: 'bunker', keepLine: true, mob: { lay: 'line', F: 1 } }, init() { this.t = 0; const path = []; let x = X0 - 8, y = WY1 + 3; const h = WY1 - Y0 + 7; const go = (dx, dy, n) => { for (let i = 0; i < n; i++) { x += dx; y += dy; path.push([x, y]); } };
    const seg = Math.max(10, Math.round(WW / 5));
    go(1, 0, seg); go(0, -1, h); go(1, 0, seg); go(0, 1, h); go(1, 0, seg); go(0, -1, h); go(1, 0, seg); go(0, 1, h); go(1, 0, seg + 16);
    this.path = path; }, update(t) { this.t = t; }, draw() {
    drawWord();
    const head = Math.min(this.path.length - 1, Math.floor(T(this) * this.path.length));
    const len = 12 + Math.floor(head / 30) * 3;
    for (let i = Math.max(0, head - len); i <= head; i++) rect(this.path[i][0], this.path[i][1], 2, 2, i === head ? C.quart : C.body);
    [60, 120, 180].forEach((k) => { if (k > head && this.path[k]) rect(this.path[k][0], this.path[k][1], 2, 2, C.rose); });
  } };

  S.fireworks = { dur: 7000, name: 'fireworks', word: { lay: 'arc', F: 2, style: 'multi' }, init() { this.t = 0; seed = 21; this.sparks = TEXT.split('').map(() => Array.from({ length: 10 }, () => [rnd() * Math.PI * 2, 0.6 + rnd() * 0.8])); }, update(t) { this.t = t; }, draw() {
    const cols = [C.rose, C.butter, C.teal, C.quart];
    drawWord({ skip: (w) => this.t > w.li * 380 });
    letters.forEach((l, i) => {
      const tt = this.t - i * 380; if (tt < 0) return;
      const cx = (l.x0 + l.x1) / 2;
      if (tt < 500) { rect(cx, l.y1 - tt * 0.06, 1, 3, cols[i % 4]); return; }
      const q = (tt - 500) / 900; if (q > 1) return;
      for (const [a, s] of this.sparks[i]) px(cx + Math.cos(a) * q * 14 * s, l.y0 - 10 + Math.sin(a) * q * 10 * s + q * q * 6, cols[(i + Math.round(a)) % 4]);
    });
  } };

  // ---------- scene packs: more games plug in from other files ----------
  // A pack is (A) => ({ id: scene, ... }). A exposes the live world (getters) and the drawing kit.
  const A = {
    get word() { return word; }, get letters() { return letters; }, get X0() { return X0; }, get WW() { return WW; }, get Y0() { return Y0; }, get WY1() { return WY1; }, get WF() { return WF; },
    get GW() { return GW; }, get GH() { return GH; }, get PH() { return PH; }, get C() { return C; }, get small() { return small; }, get topOf() { return topOf; }, get at() { return at; },
    px, rect, disc, ring, sprite, clamp, chomper, coin, sparkle, rnd, seed: (n) => { seed = n; }, drawWord, echo, T,
  };
  for (const pack of window.QSAttractPacks || []) {
    try { const add = pack(A); for (const [k, v] of Object.entries(add)) if (v && v.draw && v.init && v.update && !S[k]) S[k] = { name: k, dur: 6800, word: { lay: 'line', F: 2 }, ...v }; }
    catch (e) { console.warn('attract pack failed', e); }
  }
  // characters that join the parade on the ground once their game has played
  const PARADE = {
    chomp: [['.xxx.', 'xxx..', 'xx...', 'xxx..', '.xxx.'], 'body'], invaders: [['.x...x.', '..xxx..', 'xxx.xxx', 'x.x.x.x'], 'rose'], race: [['..xxxx...', '.xxxxxxx.', 'xxxxxxxxx', '.x.....x.'], 'rose'],
    flap: [['.xxx.', 'xxxxx', '.xx..'], 'butter'], frogger: [['x.x', '.x.', 'xxx'], 'quart'], walkers: [['xx', 'xx', 'x.'], 'teal'], dig: [['.xx.', 'xxxx', 'x.xx', '.xx.'], 'butter'],
    snake: [['xxxxxx.', '.....xx'], 'body'], float: [['..x..', '.xxx.', 'xx.xx'], 'quart'], bump: [['.xx.', 'xxxx', 'x..x'], 'rose'],
  };
  const TAIL = Object.keys(S).filter((k) => k !== 'title');
  let level = 1, loop = 0, ORDER = ['title'];
  // Every page load starts somewhere new: a random opener, then a fresh shuffle; the title screen opens
  // every later loop (never twice in a row). Openers come from an allowlist of built-in games, each checked
  // by eye at 0 and 1.2s: the whole word is lit and readable (no outline-only, rotated, eaten, scrolled,
  // warped, overdrawn or half-dark layouts). On phones an opener must also keep the big 2px letters (flap
  // and coin block drop to 1px there). Everything else still plays later in the loop.
  const SEED = (Math.floor(Math.random() * 2147483645) + 1);
  const OPENERS = ['race', 'flap', 'stack', 'frogger', 'bounce', 'bump'];
  const clean = (k) => { if (!OPENERS.includes(k)) return false; useWord(S[k].word); return WF >= 2; };
  function deal() {
    let sd = ((SEED + loop * 7919) % 2147483646) || 1; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    const deck = TAIL.slice(); for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    if (loop === 0) { const opener = deck.find(clean) || 'title'; ORDER = [opener, ...deck.filter((k) => k !== opener).slice(0, 11)]; }
    else { const recent = new Set(ORDER.slice(-4)); ORDER = ['title', ...[...deck.filter((k) => !recent.has(k)), ...deck.filter((k) => recent.has(k))].slice(0, 12)]; }  // no "dig > title > dig"
    loop++;
  }
  dims(); deal();                                     // the opener check needs the real play-field size
  // "lv 07 snake": the name sits in its own span so phones can show just the level number
  const setLabel = () => {
    if (!label) return;
    const nm = document.createElement('span'); nm.className = 'win__nm'; nm.textContent = ` ${scene.name}`;
    label.replaceChildren(`lv ${String(level).padStart(2, '0')}`, nm);
  };
  const crowd = [];
  function joinParade(id) {
    const sc = S[id], pr = sc.parade !== undefined ? sc.parade : PARADE[id];
    if (!pr || crowd.some((m) => m.id === id)) return;
    crowd.push({ id, rows: pr[0], c: pr[1], x: GW + 4 + (crowd.length % 3) * 9, sp: 0.1 + (crowd.length % 3) * 0.03, ph: crowd.length });
    if (crowd.length > 7) crowd.shift();
  }

  // ---------- morph ----------
  const MORPH = 1250;
  const SPEED = 1.25;                                // everything plays a quarter faster than it was drawn
  function snapshot() {
    const d = b.getImageData(0, 0, GW, GH).data, pts = [];
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const i = (y * GW + x) * 4; if (d[i + 3] > 20) pts.push({ x, y, c: [d[i], d[i + 1], d[i + 2]] }); }
    return pts;
  }
  const render = (s) => { b.clearRect(0, 0, GW, GH); s.draw(); };
  let parts = [], mstyle = 0;
  const MSTYLES = ['arc', 'swirl', 'rain', 'burst'];
  function buildMorph(A, B) {
    mstyle = (mstyle + 1) % MSTYLES.length;
    const key = (p) => p.x + p.y * 0.4;
    A.sort((m, n) => key(m) - key(n)); B.sort((m, n) => key(m) - key(n));
    const n = Math.max(A.length, B.length, 1);
    parts = [];
    for (let i = 0; i < n; i++) {
      const a = A.length ? A[Math.floor(i * A.length / n)] : { x: GW / 2, y: PH / 2, c: [169, 217, 159] };
      const z = B.length ? B[Math.floor(i * B.length / n)] : { x: a.x, y: PH + 4, c: a.c, fade: true };
      const jit = ((i * 7919) % 100) / 4000, st = MSTYLES[mstyle];
      const delay = st === 'rain' ? (a.x / GW) * 0.25 + jit : st === 'burst' ? Math.hypot(a.x - GW / 2, a.y - PH / 2) / GW * 0.3 + jit : (z.x / GW) * 0.3 + jit;
      parts.push({ a, z, delay, arc: Math.sin(a.x * 0.05 + a.y * 0.09) * 10 + Math.sin(a.x * 0.013) * 4 });
    }
  }
  const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function drawMorph(t) {
    b.clearRect(0, 0, GW, GH);
    const k = t / MORPH;
    const st = MSTYLES[mstyle], cx = GW / 2, cy = PH / 2;
    for (const p of parts) {
      const q = eio(clamp((k - p.delay) / 0.58));
      let x = p.a.x + (p.z.x - p.a.x) * q, y = p.a.y + (p.z.y - p.a.y) * q;
      if (st === 'arc') { x += Math.sin(q * Math.PI) * p.arc * 0.5; y -= Math.sin(q * Math.PI) * Math.abs(p.arc) * 0.6; }
      else if (st === 'swirl') { const th = Math.sin(q * Math.PI) * (0.9 + p.arc / 40); const dx = x - cx, dy = y - cy; x = cx + dx * Math.cos(th) - dy * Math.sin(th) * 0.5; y = cy + dx * Math.sin(th) * 0.3 + dy * Math.cos(th); }
      else if (st === 'rain') {
        const r = clamp((k - p.delay) / 0.62);
        if (r < 0.45) { const f = r / 0.45; x = p.a.x + p.arc * 0.2 * f; y = p.a.y + (PH - 2 - p.a.y) * f * f; }
        else { const f = eio((r - 0.45) / 0.55); x = p.a.x + p.arc * 0.2 + (p.z.x - p.a.x - p.arc * 0.2) * f; y = PH - 2 + (p.z.y - PH + 2) * f; }
      } else { const dx = p.a.x - cx, dy = p.a.y - cy, L = Math.hypot(dx, dy) || 1; x += dx / L * Math.sin(q * Math.PI) * (10 + Math.abs(p.arc)); y += dy / L * Math.sin(q * Math.PI) * (6 + Math.abs(p.arc) * 0.5); }
      const c = p.a.c.map((v, i) => Math.round(v + (p.z.c[i] - v) * q));
      b.globalAlpha = p.z.fade ? Math.max(0, 1 - q) : 1;
      b.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      b.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    b.globalAlpha = 1;
  }

  // ---------- the sky: pixel stars, a crescent moon, comets, a passing UFO (never morphed) ----------
  const SKY = window.QSSky;
  let stars = [], P = SKY ? SKY.pal() : null, comet = null, nextComet = 3500;
  function makeStars() { if (SKY) stars = SKY.field(GW, Math.max(10, PH - 4), Math.round(GW * PH / (small ? 120 : 170)), 99, { noBig: true, calm: 0.75 }); }
  function drawSky(now) {
    k2.clearRect(0, 0, GW, GH);
    const put = (x, y, c, a = 1) => { if (y >= PH - 1) return; k2.globalAlpha = a; k2.fillStyle = c; k2.fillRect(Math.round(x), Math.round(y), 1, 1); };
    if (SKY) {
      for (const st of stars) { if (st.x > X0 - 4 && st.x < X0 + WW + 4 && st.y > Y0 - 4 && st.y < WY1 + 4) continue; SKY.drawStar(put, st, now, P); }
      SKY.crescent(put, Math.round(GW * (small ? 0.8 : 0.84)), small ? 9 : 10, small ? 4 : 5, P);
      if (!reduce) {
        if (!comet && now > nextComet) { const r = ((now * 9301) % 1000) / 1000; comet = { t0: now, dur: 1000 + r * 400, x0: GW * (0.45 + r * 0.5), y0: 2 + r * 6, len: 10 + Math.round(r * 5) }; comet.x1 = comet.x0 - GW * 0.3; comet.y1 = comet.y0 + PH * 0.35; }
        if (comet) { const q = (now - comet.t0) / comet.dur; if (q >= 1) { comet = null; nextComet = now + 7000 + (now % 5000); } else SKY.drawComet(put, comet, q, P); }
      }
    }
    // UFO every 17s: drifts across, lights blink, sometimes beams down
    const cyc = now % 17000;
    if (cyc < 9000) {
      const q = cyc / 9000, ux = -12 + q * (GW + 24), uy = (small ? 4 : 5) + Math.sin(now / 400) * 1.2;
      const blink = Math.floor(now / 200) % 3;
      k2.globalAlpha = 1;
      k2.fillStyle = C.teal; k2.fillRect(Math.round(ux) + 3, Math.round(uy), 4, 2);
      k2.fillStyle = C.cream; k2.fillRect(Math.round(ux), Math.round(uy) + 2, 10, 2);
      [[1, C.rose], [4, C.butter], [7, C.rose]].forEach(([dx, c], i) => put(ux + dx + 1, uy + 3, i === blink ? c : C.dim));
      if (q > 0.42 && q < 0.58) { k2.globalAlpha = 0.28; k2.fillStyle = C.quart; for (let y = 0; y < 14; y++) k2.fillRect(Math.round(ux) + 5 - Math.floor(y / 3), Math.round(uy) + 4 + y, 1 + Math.floor(y / 3) * 2, 1); }
    }
    // the horizon: the game ends here; below it, everyone who already played walks home
    k2.globalAlpha = 1; k2.fillStyle = C.line; for (let x = 0; x < GW; x += 2) k2.fillRect(x, PH, 1, 1);
    const road = PH + GROUND - 2;
    k2.globalAlpha = 0.4; k2.fillStyle = C.dim; for (let x = -(Math.floor(now / 140) % 6); x < GW; x += 6) k2.fillRect(x, road + 1, 3, 1);
    k2.globalAlpha = 1;
    for (const m of crowd) {
      if (!reduce) { m.x -= m.sp; if (m.x < -12) m.x = GW + 6; }
      const hop = Math.floor(now / 200 + m.ph) % 2;
      k2.fillStyle = C[m.c] || C.quart;
      m.rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.') k2.fillRect(Math.round(m.x) + i, road - m.rows.length + j - hop, 1, 1); }));
    }
  }

  // ---------- loop ----------
  function blit() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const w = GW * SC, h = GH * SC;
    const ox = Math.floor((cv.width - w) / 2), oy = 0;
    ctx.drawImage(sky, ox, oy, w, h);
    ctx.drawImage(buf, ox, oy, w, h);
  }
  makeStars();
  let idx = 0, scene = S[ORDER[0]], t0 = performance.now(), last = t0, mode = 'play', visible = true;
  let paused = false, pausedAt = 0, mt = 0, raf = 0;
  const q = new URLSearchParams(location.search);
  if (q.get('scene') && S[q.get('scene')]) { ORDER.splice(1, 0, q.get('scene')); idx = 1; scene = S[q.get('scene')]; }
  else if (q.has('title')) { ORDER.unshift('title'); scene = S.title; }
  const start = (s) => { useWord(s.word); s.init(); s.update(0, 0); };
  start(scene); setLabel();
  if (q.get('t')) { const target = +q.get('t'); for (let tt = 16; tt < target; tt += 16) scene.update(tt, 16); t0 -= target; }
  const STILL = 2000;                                // the sky's clock for the one still frame (reduced motion)
  // the scene's clock right now (it stands still while paused)
  const clock = () => ((paused ? pausedAt : performance.now()) - t0) * SPEED;
  // redraw what is on screen without advancing anything: after a resize, a theme switch, or while paused
  function paint() {
    if (mode === 'morph') drawMorph(mt); else render(scene);
    drawSky(reduce ? STILL : paused ? pausedAt : performance.now()); blit();
  }
  // re-lay the current scene from its start (the world changed size or colour)
  function restart() {
    cache.clear(); makeStars(); mode = 'play'; t0 = paused ? pausedAt : performance.now(); start(scene);
    if (reduce) scene.update(scene.dur, 0);          // the title's finished frame: extruded, glint gone
  }
  function tick(now) {
    raf = 0;
    if (paused) return;
    const dt = Math.min(50, now - last) * SPEED; last = now;
    if (visible && !document.hidden) {
      const t = (now - t0) * SPEED;
      if (mode === 'play') {
        if (t >= scene.dur) {
          render(scene); const A = snapshot();
          joinParade(ORDER[idx]); level++;
          idx++; if (idx >= ORDER.length) { deal(); idx = 0; }
          scene = S[ORDER[idx]]; start(scene); render(scene); const B = snapshot();
          buildMorph(A, B); mode = 'morph'; t0 = now; setLabel(); mt = 0; drawMorph(0);
        } else { scene.update(t, dt); render(scene); }
      } else if (t >= MORPH * SPEED) { mode = 'play'; t0 = now; start(scene); scene.update(0, 0); render(scene); }
      else { mt = t / SPEED; drawMorph(mt); }
      drawSky(now);
      blit();
    } else { t0 += dt / SPEED; }
    raf = requestAnimationFrame(tick);
  }
  let rs = 0;
  // dims() clears the buffers, so every relayout repaints; under reduced motion that is the only paint
  const relayout = () => { const w = GW, h = GH, p = PH; dims(); if (w !== GW || h !== GH || p !== PH) restart(); paint(); };
  addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(relayout, 120); });
  addEventListener('qs:theme', () => {
    palette(); if (SKY) P = SKY.pal(); cache.clear(); start(scene);
    if (reduce) scene.update(scene.dur, 0);
    else if (paused && mode === 'play') scene.update(clock(), 0);
    if (reduce || paused) paint();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  if (textBox && 'ResizeObserver' in window) new ResizeObserver(() => { clearTimeout(rs); rs = setTimeout(relayout, 120); }).observe(textBox);
  if (reduce) { scene = S.title; start(scene); scene.update(scene.dur, 0); setLabel(); paint(); return; }
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(cv);
  // pause / play on the window's bottom border (hidden until here, so it never shows without the loop)
  const pb = document.querySelector('[data-attract-pause]');
  const setPaused = (v) => {
    if (v === paused) return;
    const now = performance.now();
    if (v) { paused = true; pausedAt = now; cancelAnimationFrame(raf); raf = 0; }
    else { paused = false; t0 += now - pausedAt; last = now; if (!raf) raf = requestAnimationFrame(tick); }
    if (pb) (pb.firstElementChild || pb).textContent = paused ? 'play' : 'pause';
  };
  if (pb) { pb.hidden = false; pb.addEventListener('click', () => setPaused(!paused)); }
  // click the world: every letter hops once (a tiny bit of play)
  cv.addEventListener('click', () => { if (!paused && mode === 'play' && ORDER[idx] !== 'bounce') { ORDER.splice(idx + 1, 0, 'bounce'); t0 = performance.now() - scene.dur; } });
  raf = requestAnimationFrame(tick);
})();
