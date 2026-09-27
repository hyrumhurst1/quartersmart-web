// QuarterSmart attract mode. The hero IS a game: the wordmark is drawn as
// pixel letters inside a small world, and twenty little arcade scenes play
// with it (eat it, shoot it, bounce it, melt it, bump coins out of it...).
// Between scenes every lit pixel lifts off and flies into the next scene's
// first frame, so the wordmark reassembles itself each time: a morph, never a
// cut. Crisp: low-res buffer, integer nearest-neighbour upscale, positions
// snapped to the grid. Pauses off screen; one still frame for reduced motion.
// Debug: ?scene=<name>&t=<ms> jumps to a scene.
(() => {
  const cv = document.querySelector('canvas[data-attract]');
  if (!cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = cv.getContext('2d');
  const small = cv.getBoundingClientRect().width < 760;
  const F = small ? 1 : 2;                      // font scale
  const GW = small ? 100 : 150, GH = small ? 44 : 46;
  const buf = document.createElement('canvas'); buf.width = GW; buf.height = GH;
  const b = buf.getContext('2d', { willReadFrequently: true });
  cv.style.aspectRatio = `${GW} / ${GH}`;

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let C = {};
  const palette = () => {
    C = { dim: css('--line-2') || '#4a5a4f', line: css('--line') || '#2c3730', body: '#2a9a70', deep: '#1d7a58', quart: '#a9d99f',
      butter: css('--warn') || '#dfc07f', rose: css('--event') || '#d99bb8', teal: css('--info') || '#86c3ba', cream: css('--fg-1') || '#cbc3ab', hi: css('--fg-0') || '#ece4cc' };
  };
  palette();

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
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // ---------- the wordmark: a 5x7 pixel font, banded like the logo ----------
  const GLYPH = {
    Q: ['.xxx.', 'x...x', 'x...x', 'x...x', 'x.x.x', 'x..x.', '.xx.x'],
    u: ['.....', '.....', 'x...x', 'x...x', 'x...x', 'x..xx', '.xx.x'],
    a: ['.....', '.....', '.xxx.', '....x', '.xxxx', 'x...x', '.xxxx'],
    r: ['.....', '.....', 'x.xx.', 'xx..x', 'x....', 'x....', 'x....'],
    t: ['.x...', '.x...', 'xxxx.', '.x...', '.x...', '.x..x', '..xx.'],
    e: ['.....', '.....', '.xxx.', 'x...x', 'xxxxx', 'x....', '.xxx.'],
    S: ['.xxxx', 'x....', 'x....', '.xxx.', '....x', '....x', 'xxxx.'],
    m: ['.....', '.....', 'xx.x.', 'x.x.x', 'x.x.x', 'x.x.x', 'x.x.x'],
  };
  const TEXT = 'QuarterSmart';
  const WW = TEXT.length * 5 * F + (TEXT.length - 1) * F;
  const X0 = Math.round((GW - WW) / 2), Y0 = small ? 12 : 14;
  const band = (gy) => [C.hi, C.hi, C.hi, C.quart, C.teal, C.body, C.deep][gy];
  const word = [];                                   // {x, y, li, gy, key}
  const letters = [];
  [...TEXT].forEach((ch, li) => {
    const lx = X0 + li * 6 * F;
    letters.push({ x0: lx, x1: lx + 5 * F - 1, ch });
    GLYPH[ch].forEach((row, gy) => [...row].forEach((v, gx) => {
      if (v !== 'x') return;
      for (let i = 0; i < F; i++) for (let j = 0; j < F; j++) word.push({ x: lx + gx * F + i, y: Y0 + gy * F + j, li, gy });
    }));
  });
  const WY1 = Y0 + 7 * F;                            // baseline (first row under the letters)
  const topOf = new Map();                           // column -> top word y
  word.forEach((w, i) => { w.i = i; if (!topOf.has(w.x) || w.y < topOf.get(w.x)) topOf.set(w.x, w.y); });
  const at = new Map(word.map((w) => [w.x * 1000 + w.y, w.i]));
  function drawWord(o = {}) {
    for (const w of word) {
      if (o.skip && o.skip(w)) continue;
      const d = o.off ? o.off(w) : null;
      const c = o.col ? o.col(w) : null;
      px(w.x + (d ? d[0] : 0), w.y + (d ? d[1] : 0), c || band(w.gy));
    }
  }

  // ---------- scenes ----------
  const S = {};
  const T = (s) => s.t / s.dur;

  S.chomp = { dur: 6500, init() { this.t = 0; this.eaten = new Set(); }, update(t) { this.t = t; const p = T(this); const x = X0 - 10 + clamp(p / 0.66) * (WW + 16);
    for (const w of word) if (w.y < Y0 + 2 * F && Math.abs(w.x - x) < 3) this.eaten.add(w.i); }, draw() {
    const p = T(this), y = Y0 - 6, x = X0 - 10 + clamp(p / 0.66) * (WW + 16);
    drawWord({ skip: (w) => this.eaten.has(w.i) });
    for (let k = X0; k < X0 + WW; k += 6) if (k > x + 3) rect(k, y, 1, 1, C.dim);
    if (p < 0.66) chomper(x, y, 4, 0, 0.3 + Math.abs(Math.sin(this.t / 100)) * 1.1, C.body);
    else if (p < 0.78) chomper(x, y, 4, (p - 0.66) / 0.12 * Math.PI * 4, 0.9, C.body);
    else if (p < 0.9) chomper(x, y, 4, -Math.PI / 2, 0.6 + (p - 0.78) / 0.12 * (Math.PI * 2 - 0.6), C.body);
    else { const q = (p - 0.9) / 0.1; disc(x + q * 4, y - q * 4, 4, C.quart, (dx, dy) => !(dx >= 0 && dy <= 0)); }
  } };

  S.invaders = { dur: 6600, init() { this.t = 0; this.holes = new Set(); this.dead = new Set(); seed = 11; this.bombs = []; this.next = 300; }, update(t, dt) {
    this.t = t; const step = Math.floor(t / 380), ox = (step % 8 < 4 ? step % 4 : 3 - (step % 4)) * 3;
    if (t > this.next) { const k = Math.floor(rnd() * 8); if (!this.dead.has(k)) this.bombs.push({ x: X0 + 6 + k * (WW / 8) + ox + 3, y: 8 }); this.next = t + 360; }
    for (const m of this.bombs) { m.y += dt * 0.04; const top = topOf.get(Math.round(m.x)); if (top !== undefined && m.y >= top - 1) { for (const w of word) if (Math.hypot(w.x - m.x, w.y - m.y) < 2.2 && !this.holes.has(w.i)) this.holes.add(w.i); m.gone = true; } if (m.y > GH) m.gone = true; }
    this.bombs = this.bombs.filter((m) => !m.gone);
    const kill = Math.floor(t / 1400); for (let k = 0; k < kill && k < 4; k++) this.dead.add((k * 3 + 1) % 8);
  }, draw() {
    drawWord({ skip: (w) => this.holes.has(w.i) });
    const step = Math.floor(this.t / 380), ox = (step % 8 < 4 ? step % 4 : 3 - (step % 4)) * 3;
    const A = step % 2 ? ['.x...x.', 'x.xxx.x', 'xxx.xxx', '.x...x.'] : ['.x...x.', '..xxx..', 'xxx.xxx', 'x.x.x.x'];
    for (let k = 0; k < 8; k++) if (!this.dead.has(k)) sprite(X0 + 6 + k * (WW / 8) + ox, 3, A, [C.rose, C.teal, C.butter][k % 3]);
    for (const m of this.bombs) rect(m.x, m.y, 1, 2, C.rose);
    const sx = X0 + 6 + ((Math.floor(this.t / 1400) * 3 + 1) % 8) * (WW / 8) + ox;
    sprite(sx, GH - 6, ['..x..', '.xxx.', 'xxxxx'], C.body);
    if ((this.t % 1400) > 900) rect(sx + 2, GH - 8 - ((this.t % 1400) - 900) * 0.09, 1, 2, C.quart);
  } };

  S.breakout = { dur: 7000, init() { this.gone = new Set(); this.x = GW / 2; this.y = GH - 10; this.vx = 0.035; this.vy = -0.04; this.pad = GW / 2; }, update(t, dt) {
    for (let s = 0; s < dt; s += 3) {
      this.x += this.vx * 3; this.y += this.vy * 3;
      if (this.x < 1 || this.x > GW - 2) this.vx *= -1;
      if (this.y < 1) this.vy *= -1;
      if (this.y > GH - 7 && this.vy > 0) { this.vy *= -1; this.vx += (this.x - this.pad) * 0.001; }
      const hit = at.get(Math.round(this.x) * 1000 + Math.round(this.y));
      if (hit !== undefined && !this.gone.has(hit)) { for (const w of word) if (Math.abs(w.x - this.x) < 2 && Math.abs(w.y - this.y) < 2) this.gone.add(w.i); this.vy *= -1; }
    }
    this.pad += (this.x - this.pad) * 0.1;
  }, draw() { drawWord({ skip: (w) => this.gone.has(w.i) }); rect(this.pad - 8, GH - 5, 16, 2, C.teal); rect(this.x, this.y, 2, 2, C.hi); } };

  S.race = { dur: 6000, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this), road = WY1 + 6;
    rect(0, road + 7, GW, 1, C.line);
    const go = p > 0.3, x = go ? -20 + Math.pow((p - 0.3) / 0.7, 1.6) * (GW + 60) : 6;
    for (let i = 0; i < 3; i++) rect(8 + i * 5, road - 6, 3, 3, go ? C.quart : (p > 0.06 + i * 0.07 ? C.rose : C.line));
    drawWord({ off: (w) => { const d = x - w.x; const push = go && d > -4 && d < 40 ? Math.round(Math.max(0, 1 - Math.abs(d - 8) / 30) * (WY1 - w.y) * 0.25) : 0; return [push, 0]; } });
    const y = road - (!go && p > 0.06 ? Math.floor(this.t / 60) % 2 : 0);
    rect(x + 3, y, 9, 1, C.rose); rect(x + 2, y + 1, 11, 2, C.rose); rect(x + 5, y + 1, 3, 1, C.teal);
    rect(x, y + 3, 17, 2, C.rose); rect(x + 14, y + 3, 3, 1, C.hi); rect(x + 2, y + 5, 3, 2, C.dim); rect(x + 12, y + 5, 3, 2, C.dim);
    if (go) for (let k = 1; k < 5; k++) rect(x - 4 - k * 7, road + 2 + (k % 3), 6 - k, 1, C.dim);
  } };

  S.flap = { dur: 6400, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this); drawWord();
    const crash = 0.8, x = X0 - 12 + p / crash * (WW * 0.72);
    let y;
    if (p < crash) y = Y0 - 4 + Math.abs(Math.sin(p * 18)) * (WY1 - Y0 + 8);
    else y = Math.min(GH - 4, Y0 + (p - crash) * 160);
    const wing = p < crash ? Math.floor(this.t / 120) % 2 : 0;
    const bx = p < crash ? x : X0 - 12 + WW * 0.72;
    rect(bx, y, 5, 3, C.butter); px(bx + 5, y + 1, C.rose); px(bx + 3, y, C.hi); rect(bx + 1, y + (wing ? -1 : 2), 2, 1, C.butter);
    rect(0, GH - 1, GW, 1, C.line);
  } };

  S.stack = { dur: 6800, init() { this.t = 0; this.surf = new Map(); for (let x = 0; x < GW; x++) this.surf.set(x, topOf.has(x) ? topOf.get(x) : GH - 1); this.blocks = []; this.spawned = 0; seed = 5; }, update(t, dt) {
    this.t = t;
    if (this.spawned < 12 && t > this.spawned * 450) { const bx = X0 + Math.floor(rnd() * (WW - 4)); this.blocks.push({ x: bx, y: -4, c: [C.quart, C.teal, C.butter, C.rose][this.spawned % 4], land: false }); this.spawned++; }
    for (const k of this.blocks) {
      if (k.land) continue;
      k.y += dt * 0.03;
      let floor = GH - 1; for (let i = 0; i < 4; i++) floor = Math.min(floor, this.surf.get(k.x + i));
      if (k.y + 4 >= floor) { k.y = floor - 4; k.land = true; for (let i = 0; i < 4; i++) this.surf.set(k.x + i, k.y); }
    }
  }, draw() { drawWord(); for (const k of this.blocks) { rect(k.x, k.y, 4, 4, k.c); rect(k.x + 2, k.y, 2, 2, C.hi); } } };

  S.pong = { dur: 6000, init() { this.x = GW / 2; this.y = 6; this.vx = 0.06; this.vy = 0.03; this.l = GH / 2; this.r = GH / 2; this.flash = new Map(); }, update(t, dt) {
    for (let s = 0; s < dt; s += 3) {
      const nx = this.x + this.vx * 3, ny = this.y + this.vy * 3;
      const hx = at.get(Math.round(nx) * 1000 + Math.round(this.y)), hy = at.get(Math.round(this.x) * 1000 + Math.round(ny));
      if (hx !== undefined) { this.vx *= -1; this.flash.set(hx, t); } else this.x = nx;
      if (hy !== undefined) { this.vy *= -1; this.flash.set(hy, t); } else this.y = ny;
      if (this.y < 1 || this.y > GH - 2) this.vy *= -1;
      if (this.x < 6 || this.x > GW - 7) this.vx *= -1;
    }
    this.l += (this.y - this.l) * 0.1; this.r += (this.y - this.r) * 0.08; this.t = t;
  }, draw() {
    drawWord({ col: (w) => { const f = [...this.flash.entries()].find(([i, tt]) => Math.abs(word[i].li - w.li) < 1 && this.t - tt < 250); return f ? C.hi : null; } });
    rect(3, this.l - 5, 2, 10, C.cream); rect(GW - 5, this.r - 5, 2, 10, C.cream); rect(this.x, this.y, 2, 2, C.quart);
  } };

  S.float = { dur: 7000, init() { seed = 3; this.v = letters.map(() => [rnd() - 0.5, rnd() - 0.5]); this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this), e = Math.sin(clamp(p / 0.9) * Math.PI);
    drawWord({ off: (w) => [this.v[w.li][0] * e * 22, this.v[w.li][1] * e * 16] });
    const a = this.t / 700; const cx = GW / 2, cy = GH - 10;
    for (let i = 0; i <= 3; i++) px(cx + Math.cos(a) * i, cy + Math.sin(a) * i, C.quart);
    for (const s of [-1, 1]) for (let i = 0; i <= 2; i++) px(cx + Math.cos(a) * 3 - Math.cos(a + s * 0.5) * i * 1.6, cy + Math.sin(a) * 3 - Math.sin(a + s * 0.5) * i * 1.6, C.quart);
    for (let k = 0; k < 4; k++) { const d = ((this.t / 12 + k * 20) % 60); px(cx + Math.cos(a) * (4 + d), cy + Math.sin(a) * (4 + d), C.butter); }
  } };

  S.sand = { dur: 7200, init() { this.g = new Map(); this.parts = word.map((w) => ({ x: w.x, y: w.y, c: band(w.gy) })); this.parts.forEach((q) => this.g.set(q.x * 1000 + q.y, 1)); this.acc = 0; seed = 9; }, update(t, dt) {
    if (t < 800) return;
    this.acc += dt;
    while (this.acc > 22) {
      this.acc -= 22;
      this.parts.sort((m, n) => n.y - m.y);
      for (const q of this.parts) {
        if (q.y >= GH - 2) continue;
        const k = (x, y) => this.g.has(x * 1000 + y);
        const dirs = rnd() < 0.5 ? [0, -1, 1] : [0, 1, -1];
        for (const d of dirs) { if (!k(q.x + d, q.y + 1) && q.x + d >= 0 && q.x + d < GW) { this.g.delete(q.x * 1000 + q.y); q.x += d; q.y += 1; this.g.set(q.x * 1000 + q.y, 1); break; } }
      }
    }
  }, draw() { for (const q of this.parts) px(q.x, q.y, q.c); rect(0, GH - 1, GW, 1, C.line); } };

  S.frogger = { dur: 6800, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const slide = Math.round(Math.sin(this.t / 900) * 10);
    drawWord({ off: () => [slide, 0] });
    const lanes = [{ y: WY1 + 4, v: 0.03, c: C.rose }, { y: WY1 + 10, v: -0.04, c: C.butter }, { y: Y0 - 7, v: 0.035, c: C.teal }];
    for (const l of lanes) for (let k = 0; k < GW + 40; k += 34) { const x = ((k + this.t * l.v) % (GW + 40) + GW + 40) % (GW + 40) - 20; rect(x, l.y, 9, 3, l.c); }
    const hop = Math.min(5, Math.floor(this.t / 1100)), ys = [GH - 4, WY1 + 12, WY1 + 6, WY1 - 4, Y0 - 3, 1];
    const fx = X0 + WW / 2 + (hop === 3 ? slide : 0);
    sprite(fx, ys[hop] - 2, ['x.x', '.x.', 'xxx'], C.quart);
  } };

  S.runner = { dur: 6400, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const scroll = Math.round(this.t * 0.02) % (WW + 40);
    drawWord({ off: () => [-scroll + 20, 0] });
    drawWord({ off: () => [-scroll + 20 + WW + 40, 0] });
    const rx = Math.round(GW * 0.3), col = rx + scroll - 20;
    let top = WY1; for (let dx = 0; dx < 5; dx++) { const tp = topOf.get(((col + dx - X0) % (WW + 40) + WW + 40) % (WW + 40) + X0); if (tp !== undefined) top = Math.min(top, tp); }
    const y = Math.min(top, WY1) - 7 - Math.abs(Math.sin(this.t / 260)) * 5;
    chomper(rx + 3, y + 3, 3, 0, 0.3 + Math.abs(Math.sin(this.t / 120)) * 0.9, C.quart);
    rect(0, WY1, GW, 1, C.line);
  } };

  S.radar = { dur: 6800, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const cx = GW / 2, cy = (Y0 + WY1) / 2, a = T(this) * Math.PI * 4 - Math.PI / 2;
    [8, 16, 24].forEach((r) => ring(cx, cy, r, C.line));
    drawWord({ col: (w) => { let d = a - Math.atan2(w.y - cy, w.x - cx); d = ((d % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return d < 0.5 ? C.quart : d < 2.2 ? band(w.gy) : d < 3.2 ? C.dim : C.line; } });
    for (let r = 0; r <= 60; r++) px(cx + Math.cos(a) * r, cy + Math.sin(a) * r, C.quart);
  } };

  S.bounce = { dur: 6600, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    drawWord({ off: (w) => { const tt = this.t / 1000 - w.li * 0.12; if (tt < 0) return [0, 0]; const h = Math.abs(Math.sin(tt * 3.2)) * 14 * Math.exp(-tt * 0.55); return [0, -Math.round(h)]; } });
    rect(0, WY1, GW, 1, C.line);
  } };

  S.eq = { dur: 6400, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    drawWord({ off: (w) => [0, -Math.round(Math.max(0, Math.sin(this.t / 180 + w.x * 0.21) + Math.sin(this.t / 260 + w.li)) * 3)] });
    for (let x = X0; x < X0 + WW; x += 3) { const h = Math.round((Math.sin(this.t / 150 + x * 0.3) * 0.5 + 0.5) * 8); rect(x, GH - 2 - h, 2, h, x % 2 ? C.body : C.deep); }
  } };

  S.paint = { dur: 6800, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const x = X0 - 6 + T(this) * (WW + 12);
    drawWord({ col: (w) => (w.x < x ? [C.rose, C.rose, C.butter, C.butter, C.teal, C.quart, C.body][w.gy] : null) });
    rect(x, Y0 - 5, 2, WY1 - Y0 + 8, C.dim); rect(x - 2, Y0 - 7, 6, 3, C.hi); rect(x - 1, WY1 + 3, 4, 4, C.butter);
  } };

  S.dig = { dur: 6800, init() { this.gone = new Set(); this.trail = []; this.t = 0; }, update(t) { this.t = t; const p = T(this);
    const x = X0 - 4 + p * (WW + 8), y = (Y0 + WY1) / 2 + Math.sin(p * 22) * (WY1 - Y0) * 0.45;
    for (const w of word) if (Math.abs(w.x - x) < 2 && Math.abs(w.y - y) < 2) this.gone.add(w.i);
    if (Math.floor(t / 90) !== this.lt) { this.lt = Math.floor(t / 90); this.trail.push([x, y]); } this.px = x; this.py = y; }, draw() {
    drawWord({ skip: (w) => this.gone.has(w.i) });
    for (const [x, y] of this.trail) px(x, y + 3, C.dim);
    sprite(this.px - 2, this.py - 2, ['.xx.', 'xxxx', 'x.xx', '.xx.'], C.butter);
  } };

  S.walkers = { dur: 7000, init() { this.t = 0; this.gone = new Set(); }, update(t) { this.t = t; const p = T(this);
    const dx = X0 + WW * 0.55; if (p > 0.35) for (const w of word) if (Math.abs(w.x - dx) < 2 && w.y < Y0 + (p - 0.35) * 40) this.gone.add(w.i); }, draw() {
    drawWord({ skip: (w) => this.gone.has(w.i) });
    for (let k = 0; k < 5; k++) {
      const x = X0 - 10 - k * 9 + this.t * 0.02; if (x < X0 - 12 || x > X0 + WW + 6) continue;
      const tx = Math.round(x); let top = Y0; for (const [cx, ty] of topOf) if (Math.abs(cx - tx) < 1) top = ty;
      const leg = Math.floor(this.t / 120 + k) % 2;
      rect(x, top - 4, 2, 2, C.rose); rect(x, top - 2, 2, 1, C.teal); px(x + leg, top - 1, C.teal);
    }
    const p = T(this); if (p > 0.35) { const dx = X0 + WW * 0.55; rect(dx - 1, Y0 - 4 + (p - 0.35) * 40, 2, 2, C.butter); }
  } };

  S.bump = { dur: 7200, init() { this.t = 0; }, update(t) { this.t = t; }, draw() {
    const p = T(this), rx = X0 - 8 + p * (WW + 16), li = letters.findIndex((l) => rx + 3 >= l.x0 && rx + 3 <= l.x1);
    const phase = (rx - X0) % (6 * F) / (6 * F);
    drawWord({ off: (w) => (w.li === li && phase > 0.2 && phase < 0.7 ? [0, -Math.round(Math.sin((phase - 0.2) / 0.5 * Math.PI) * 4)] : [0, 0]) });
    letters.forEach((l, i) => { if (i <= li) { const age = (rx - l.x0) / 20; if (age < 1.5) coin(l.x0 + F * 2 - 2, Y0 - 8 - age * 10, this.t, C.butter); } });
    const jy = WY1 + 2 - (phase > 0.2 && phase < 0.7 ? Math.sin((phase - 0.2) / 0.5 * Math.PI) * 2 : 0);
    rect(rx, jy + 1, 4, 3, C.rose); rect(rx + 1, jy - 1, 2, 2, C.hi); rect(0, WY1 + 6, GW, 1, C.line);
  } };

  S.fireworks = { dur: 7000, init() { this.t = 0; seed = 21; this.sparks = letters.map(() => Array.from({ length: 10 }, () => [rnd() * Math.PI * 2, 0.6 + rnd() * 0.8])); }, update(t) { this.t = t; }, draw() {
    const cols = [C.rose, C.butter, C.teal, C.quart];
    drawWord({ skip: (w) => { const t0 = w.li * 380; return this.t > t0; }, off: () => [0, 0] });
    letters.forEach((l, i) => {
      const tt = this.t - i * 380; if (tt < 0) return;
      const cx = (l.x0 + l.x1) / 2;
      if (tt < 500) { rect(cx, WY1 - tt * 0.06, 1, 3, cols[i % 4]); return; }
      const q = (tt - 500) / 900; if (q > 1) return;
      for (const [a, s] of this.sparks[i]) px(cx + Math.cos(a) * q * 14 * s, Y0 - 12 + Math.sin(a) * q * 10 * s + q * q * 6, cols[(i + Math.round(a)) % 4]);
    });
  } };

  S.snake = { dur: 6800, init() { this.t = 0; const path = []; let x = X0 - 8, y = WY1 + 3; const go = (dx, dy, n) => { for (let i = 0; i < n; i++) { x += dx; y += dy; path.push([x, y]); } };
    go(1, 0, 20); go(0, -1, WY1 - Y0 + 7); go(1, 0, 26); go(0, 1, WY1 - Y0 + 7); go(1, 0, 30); go(0, -1, WY1 - Y0 + 7); go(1, 0, 40); go(0, 1, WY1 - Y0 + 7); go(1, 0, 40);
    this.path = path; }, update(t) { this.t = t; }, draw() {
    drawWord();
    const head = Math.min(this.path.length - 1, Math.floor(T(this) * this.path.length));
    const len = 12 + Math.floor(head / 30) * 3;
    for (let i = Math.max(0, head - len); i <= head; i++) rect(this.path[i][0], this.path[i][1], 2, 2, i === head ? C.quart : C.body);
    [60, 120, 180].forEach((k) => { if (k > head && this.path[k]) rect(this.path[k][0], this.path[k][1], 2, 2, C.rose); });
  } };

  const ORDER = ['chomp', 'invaders', 'race', 'breakout', 'flap', 'stack', 'pong', 'float', 'bounce', 'sand', 'frogger', 'runner', 'eq', 'radar', 'paint', 'dig', 'walkers', 'bump', 'snake', 'fireworks'];

  // ---------- morph ----------
  const MORPH = 1600;
  function snapshot() {
    const d = b.getImageData(0, 0, GW, GH).data, pts = [];
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) { const i = (y * GW + x) * 4; if (d[i + 3] > 20) pts.push({ x, y, c: [d[i], d[i + 1], d[i + 2]] }); }
    return pts;
  }
  const render = (s) => { b.clearRect(0, 0, GW, GH); s.draw(); };
  let parts = [];
  function buildMorph(A, B) {
    const key = (p) => p.x + p.y * 0.4;
    A.sort((m, n) => key(m) - key(n)); B.sort((m, n) => key(m) - key(n));
    const n = Math.max(A.length, B.length, 1);
    parts = [];
    for (let i = 0; i < n; i++) {
      const a = A.length ? A[Math.floor(i * A.length / n)] : { x: GW / 2, y: GH / 2, c: [169, 217, 159] };
      const z = B.length ? B[Math.floor(i * B.length / n)] : { x: a.x, y: GH + 4, c: a.c, fade: true };
      parts.push({ a, z, delay: (z.x / GW) * 0.3 + ((i * 7919) % 100) / 1000, arc: (((i * 104729) % 200) / 100 - 1) * 12 });
    }
  }
  const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function drawMorph(t) {
    b.clearRect(0, 0, GW, GH);
    const k = t / MORPH;
    for (const p of parts) {
      const q = eio(clamp((k - p.delay) / 0.58));
      const x = p.a.x + (p.z.x - p.a.x) * q + Math.sin(q * Math.PI) * p.arc * 0.5;
      const y = p.a.y + (p.z.y - p.a.y) * q - Math.sin(q * Math.PI) * Math.abs(p.arc) * 0.6;
      const c = p.a.c.map((v, i) => Math.round(v + (p.z.c[i] - v) * q));
      b.globalAlpha = p.z.fade ? 1 - q : 1;
      b.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      b.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    b.globalAlpha = 1;
  }

  // ---------- the sky: stars, a moon, a passing UFO (its own layer, never morphed) ----------
  const sky = document.createElement('canvas'); sky.width = GW; sky.height = GH;
  const k2 = sky.getContext('2d');
  const stars = []; { let sd = 99; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    for (let i = 0; i < (small ? 34 : 70); i++) stars.push({ x: Math.floor(r() * GW), y: Math.floor(r() * (GH - 8)), ph: r() * 6.28, sp: 0.6 + r() * 1.6, big: r() < 0.08 }); }
  function drawSky(now) {
    k2.clearRect(0, 0, GW, GH);
    const put = (x, y, c) => { k2.fillStyle = c; k2.fillRect(Math.round(x), Math.round(y), 1, 1); };
    for (const st of stars) {
      const tw = Math.sin(now / 900 * st.sp + st.ph);
      const c = tw > 0.75 ? C.hi : tw > -0.2 ? C.dim : C.line;
      put(st.x, st.y, c);
      if (st.big && tw > 0.6) { put(st.x - 1, st.y, C.dim); put(st.x + 1, st.y, C.dim); put(st.x, st.y - 1, C.dim); put(st.x, st.y + 1, C.dim); }
    }
    // moon: cream disc, a crescent of shadow, two craters
    const mx = GW - (small ? 12 : 16), my = small ? 7 : 8, mr = small ? 3 : 5;
    for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) if (x * x + y * y <= mr * mr + mr * 0.5) {
      const sh = (x + 2) * (x + 2) + (y - 1) * (y - 1) <= mr * mr + 1 && x < -1;
      put(mx + x, my + y, sh ? C.cream : C.hi);
    }
    if (!small) { put(mx + 1, my - 1, C.cream); put(mx + 2, my + 2, C.cream); }
    // UFO every 17s: drifts across, lights blink, sometimes beams down
    const cyc = now % 17000;
    if (cyc < 9000) {
      const q = cyc / 9000, ux = -12 + q * (GW + 24), uy = (small ? 4 : 5) + Math.sin(now / 400) * 1.2;
      const blink = Math.floor(now / 200) % 3;
      k2.fillStyle = C.teal; k2.fillRect(Math.round(ux) + 3, Math.round(uy), 4, 2);
      k2.fillStyle = C.cream; k2.fillRect(Math.round(ux), Math.round(uy) + 2, 10, 2);
      [[1, C.rose], [4, C.butter], [7, C.rose]].forEach(([dx, c], i) => put(ux + dx + 1, uy + 3, i === blink ? c : C.dim));
      if (q > 0.42 && q < 0.58) { k2.globalAlpha = 0.28; k2.fillStyle = C.quart; for (let y = 0; y < 16; y++) k2.fillRect(Math.round(ux) + 5 - Math.floor(y / 3), Math.round(uy) + 4 + y, 1 + Math.floor(y / 3) * 2, 1); k2.globalAlpha = 1; }
    }
  }

  // ---------- loop ----------
  function size() { const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  function blit() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const s = Math.max(1, Math.floor(Math.min(cv.width / GW, cv.height / GH)));
    const w = GW * s, h = GH * s;
    const ox = Math.round((cv.width - w) / 2), oy = Math.round((cv.height - h) / 2);
    ctx.drawImage(sky, ox, oy, w, h);
    ctx.drawImage(buf, ox, oy, w, h);
  }
  size();
  let idx = 0, scene = S[ORDER[0]], t0 = performance.now(), last = t0, mode = 'play', visible = true;
  const q = new URLSearchParams(location.search);
  if (q.get('scene') && S[q.get('scene')]) { idx = ORDER.indexOf(q.get('scene')); scene = S[q.get('scene')]; }
  scene.init();
  if (q.get('t')) { const target = +q.get('t'); for (let tt = 0; tt < target; tt += 16) scene.update(tt, 16); t0 -= target; }
  function tick(now) {
    const dt = Math.min(50, now - last); last = now;
    if (visible && !document.hidden) {
      const t = now - t0;
      if (mode === 'play') {
        if (t >= scene.dur) {
          render(scene); const A = snapshot();
          idx = (idx + 1) % ORDER.length; scene = S[ORDER[idx]]; scene.init(); scene.update(0, 0); render(scene); const B = snapshot();
          buildMorph(A, B); mode = 'morph'; t0 = now;
        } else { scene.update(t, dt); render(scene); }
      } else if (t >= MORPH) { mode = 'play'; t0 = now; scene.init(); scene.update(0, 0); render(scene); }
      else drawMorph(t);
      drawSky(now);
      blit();
    } else { t0 += dt; }
    requestAnimationFrame(tick);
  }
  addEventListener('resize', () => { size(); blit(); });
  addEventListener('qs:theme', () => { palette(); });
  if (reduce) { render({ draw: () => drawWord() }); drawSky(4000); blit(); return; }
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(cv);
  // click the world: every letter hops once (a tiny bit of play)
  cv.addEventListener('click', () => { if (mode === 'play' && ORDER[idx] !== 'bounce') { idx = ORDER.indexOf('bounce') - 1; t0 = performance.now() - scene.dur; } });
  requestAnimationFrame(tick);
})();
