// Coin arena. A short pixel stage at the top of every footer: the
// QuarterSmart coin (the logo, struck as a coin) hovers and spins in the
// middle while a small cast of retro game characters brawls over it, at
// least three at a time. Drawn on a buffer 40 art pixels tall and scaled up
// by an integer factor with nearest neighbour, so every pixel stays square.
// One loop is 31 seconds. Pauses off screen and in hidden tabs; one still
// frame for reduced motion. Click (or press) the coin for a spin.
(() => {
  const host = document.querySelector('[data-arena]');
  if (!host) return;
  const cv = host.querySelector('canvas');
  const hit = host.querySelector('button');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- stage (art pixels) ----------
  const GH = 40, FY = 36, CY = 15, D = 14, POP = 2;
  let GW = 240, CX = 120, K = 4, DPR = 1;
  const buf = document.createElement('canvas');
  const b = buf.getContext('2d');

  // ---------- palette: theme tokens plus the brand greens (flat: a body, one
  // shadow tone and the sage quarter, like the brand mark) ----------
  const EYE = '#ece4cc', INK = '#121814';
  const G = { body: '#2a9a70', deep: '#1d7a58', quart: '#a9d99f', shine: '#ece4cc' };
  let C = {};
  const tok = (v, f) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || f;
  function palette() {
    C = { line: tok('--line', '#2c3730'), dim: tok('--line-2', '#4a5a4f'), ink: tok('--fg-0', '#ece4cc'), cream: tok('--fg-1', '#cbc3ab'),
      faint: tok('--fg-1', '#cbc3ab'), accent: tok('--accent', '#a9d99f'), butter: tok('--warn', '#dfc07f'), rose: tok('--event', '#d99bb8'), teal: tok('--info', '#86c3ba') };
  }

  // ---------- drawing helpers (grid units) ----------
  const px = (x, y, c) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= GW || y >= GH) return;
    b.fillStyle = c; b.fillRect(x, y, 1, 1);
  };
  const rect = (x, y, w, h, c) => { x = Math.round(x); y = Math.round(y); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
  const spr = (x, y, rows, pal, flip) => {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j], n = r.length;
      for (let i = 0; i < n; i++) { const c = pal[r[i]]; if (c) px(flip ? x + n - 1 - i : x + i, y + j, c); }
    }
  };
  const sprB = (cx, by, rows, pal, flip) => spr(Math.round(cx) - (rows[0].length >> 1), Math.round(by) - rows.length + 1, rows, pal, flip);
  const sprC = (cx, cy, rows, pal, flip) => spr(Math.round(cx) - (rows[0].length >> 1), Math.round(cy) - (rows.length >> 1), rows, pal, flip);
  const line = (x0, y0, x1, y1, c) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c); };
  const star = (x, y, r, c) => { px(x, y, c); for (let k = 1; k <= r; k++) { px(x + k, y, c); px(x - k, y, c); px(x, y + k, c); px(x, y - k, c); } };
  const FONT = { '+': ['...', '.x.', 'xxx', '.x.', '...'], 2: ['xxx', '..x', 'xxx', 'x..', 'xxx'], 5: ['xxx', 'x..', 'xxx', '..x', 'xxx'], '?': ['xx.', '..x', '.x.', '...', '.x.'], '!': ['x', 'x', 'x', '.', 'x'] };
  const text = (s, x, y, c) => { for (const ch of s) { const g = FONT[ch]; spr(x, y, g, { x: c }); x += g[0].length + 1; } };

  const clamp = (v, a = 0, z = 1) => Math.max(a, Math.min(z, v));
  const lerp = (a, z, p) => a + (z - a) * p;
  const seg = (t, a, z) => clamp((t - a) / (z - a));
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  const ei = (p) => p * p * p;
  const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const arc = (p) => Math.sin(Math.PI * clamp(p));
  const bounce = (p) => { const n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75; if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375; return n * (p -= 2.625 / d) * p + 0.984375; };

  // ---------- the coin: the mark, struck as a coin ----------
  // A 14px pixel circle; the top-right quarter is popped 2px up and out, like
  // the logo. Flat fills: the green body and the sage quarter, nothing else.
  let GRID = [];
  function buildCoin() {
    const W = [4, 8, 10, 12, 12, 14, 14, 14, 14, 12, 12, 10, 8, 4];
    const inC = (x, y) => y >= 0 && y < D && x >= (D - W[y]) / 2 && x < (D + W[y]) / 2;
    const isQ = (x, y) => x >= 7 && y <= 6;
    const inB = (x, y) => inC(x, y) && !isQ(x, y);
    const inQ = (x, y) => inC(x, y) && isQ(x, y);
    const S = D + POP;
    GRID = Array.from({ length: S }, () => new Array(S).fill(null));
    for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
      if (inB(x, y)) GRID[y + POP][x] = G.body;
      else if (inQ(x, y)) GRID[y][x + POP] = G.quart;
    }
  }
  // step 0..15 around one turn: the face narrows to a reeded edge and back
  function coin(cx, cy, step, glint) {
    const oy = cy - 7 - POP;
    const w = Math.round(D * Math.abs(Math.cos(step * Math.PI / 8)));
    if (w <= 2) {
      for (let y = 0; y < D; y++) { px(cx - 1, oy + POP + y, G.deep); px(cx, oy + POP + y, G.body); }
      px(cx - 1, oy, G.quart); px(cx, oy, G.quart); px(cx - 1, oy + 1, G.quart); px(cx, oy + 1, G.quart);
      return;
    }
    const f = w / D, S = D + POP, side = Math.sin(step * Math.PI / 8) > 0 ? 1 : -1;
    const x0 = Math.floor(cx - 7 * f), x1 = Math.ceil(cx + (S - 7) * f);
    for (let gy = 0; gy < S; gy++) {
      let lo = 1e9, hi = -1e9;
      for (let dx = x0; dx < x1; dx++) {
        const sx = Math.floor((dx + 0.5 - cx) / f + 7);
        if (sx < 0 || sx >= S) continue;
        let c = GRID[gy][sx];
        if (!c) continue;
        if (glint != null && w === D) { const k = sx + gy - glint; if (k === 0 || k === 1) c = G.shine; }
        px(dx, oy + gy, c);
        if (dx < lo) lo = dx;
        if (dx > hi) hi = dx;
      }
      if (w < D - 1 && gy >= POP + 1 && gy < S - 1 && hi >= lo) px(side > 0 ? hi + 1 : lo - 1, oy + gy, G.deep);
    }
  }

  // the coin's shadow: one solid green row on the floor that shrinks as the coin rises
  function glow(x, y) {
    const h = FY - (y + 7);
    const hw = Math.round(clamp(11 - h * 0.4, 2, 8));
    rect(x - hw, FY, hw * 2, 1, G.body);
  }

  // ---------- the cast ----------
  const FROG = {
    sit: ['.xx...xx.', 'xok.x.okx', 'xxxxxxxxx', 'xmmmmmmmx', '.xxxxxxx.', 'xx.....xx'],
    hop: ['.xx...xx.', 'xok.x.okx', 'xxxxxxxxx', '.xmmmmmx.', '.x.....x.', 'x.......x'],
  };
  const INV = [
    ['..x.....x..', '...x...x...', '..xxxxxxx..', '.xx.xxx.xx.', 'xxxxxxxxxxx', 'x.xxxxxxx.x', 'x.x.....x.x', '...xx.xx...'],
    ['..x.....x..', 'x..x...x..x', 'x.xxxxxxx.x', 'xxx.xxx.xxx', 'xxxxxxxxxxx', '.xxxxxxxxx.', '..x.....x..', '.x.......x.'],
  ];
  const BIRD = [
    ['...yyyy.', '..yyyyok', 'wwwyyyyy', 'wwwyyyrr', '.yyyyyrr', '..yyyy..'],
    ['...yyyy.', '..yyyyok', '.yyyyyyy', 'wwwyyyrr', 'wwwyyyrr', '.wwyyy..'],
  ];
  const CAR = [
    '.......rrrrr........',
    '.....rrtttttrr......',
    '.rrrrrrtttttrrrrrr..',
    'errrrrrrrrrrrrrrrrrl',
    'rsssssssssssssssssrr',
    'rrrkkkrrrrrrrrkkkrr.',
    '...kok........kok...',
    '...kkk........kkk...',
  ];
  const UFO = [
    '....ddddd....',
    '...ddhdddd...',
    '.ccccccccccc.',
    'ccaccbccaccbc',
    '.ccccccccccc.',
    '...eeeeeee...',
  ];
  const RUN = {
    stand: ['..hh..', '..hh..', '.tttt.', 't.tt.t', '..tt..', '..ll..', '.l..l.', '.l..l.'],
    run1: ['...hh.', '...hh.', '..tttt', '.t.tt.', '...tt.', '..l.l.', '.l...l', 'l.....'],
    run2: ['...hh.', '...hh.', '..ttt.', '..ttt.', '...tt.', '...ll.', '...l..', '..ll..'],
    jump: ['...hh.', '...hh.', '.tttt.', 't..tt.', '...ttt', '..l.l.', '.l..l.', '.l....'],
    up: ['t.hh.t', 't.hh.t', '.tttt.', '..tt..', '..tt..', '..ll..', '.l..l.', '.l..l.'],
    shrug: ['..hh..', '..hh..', 'tttttt', '..tt..', '..tt..', '..ll..', '.l..l.', '.l..l.'],
  };
  const ghostRows = (look, f) => {
    const eyes = look < 0 ? ['gwwggwwggg', 'gpwggpwggg'] : ['gggwwggwwg', 'gggwpggwpg'];
    return ['...gggg...', '.gggggggg.', 'gggggggggg', eyes[0], eyes[1], 'gggggggggg', 'gggggggggg', 'gggggggggg', f ? 'g.gg.gg.gg' : 'gg.gg.gg.g'];
  };

  const chomper = (cx, cy, dir, open) => {
    cx = Math.round(cx); cy = Math.round(cy);
    for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) {
      if (x * x + y * y > 18.4) continue;
      if (open > 0 && (x || y)) { let a = Math.atan2(y, x) - dir; a = Math.atan2(Math.sin(a), Math.cos(a)); if (Math.abs(a) < open / 2) continue; }
      px(cx + x, cy + y, x + y > 3 ? G.deep : G.body);
    }
    const s = Math.cos(dir) >= 0 ? 1 : -1, ea = dir - 1.25 * s;
    px(cx + Math.round(Math.cos(ea) * 2.2), cy + Math.round(Math.sin(ea) * 2.2), INK);
  };
  const snake = (hx, t, rear, flash, yo = 0) => {
    const y0 = (i) => FY - 2 + yo + Math.round(Math.sin((hx - i) * 0.6 - t / 110) * 1.1) - Math.round(rear * Math.max(0, 1 - i / 7) * 9);
    const on = flash && Math.floor(t / 60) % 2;
    for (let i = 18; i >= 1; i--) rect(hx - i, y0(i), 1, 2, on ? C.ink : i % 4 === 0 ? G.body : C.accent);
    const hy = y0(0) - 1;
    rect(hx, hy, 3, 3, on ? C.ink : C.accent);
    px(hx + 2, hy, INK);
    if (!flash && t % 700 < 160) { px(hx + 3, hy + 2, C.rose); px(hx + 4, hy + (t % 140 < 70 ? 1 : 3), C.rose); }
  };
  const ship = (x, y, a, thrust, t) => {
    const p = (ang, r) => [x + Math.cos(a + ang) * r, y + Math.sin(a + ang) * r];
    const n = p(0, 4), l = p(2.45, 4), r = p(-2.45, 4), m = p(Math.PI, 1.6);
    line(n[0], n[1], l[0], l[1], C.ink); line(n[0], n[1], r[0], r[1], C.ink);
    line(l[0], l[1], m[0], m[1], C.ink); line(r[0], r[1], m[0], m[1], C.ink);
    if (thrust && Math.floor(t / 60) % 2) { const f = p(Math.PI, 3.6); px(f[0], f[1], C.butter); }
  };
  const block = (x, y, c) => { rect(x, y, 3, 3, c); px(x, y, EYE); };
  const FROGP = () => ({ x: C.teal, o: EYE, k: INK, m: G.deep });
  const RUNP = () => ({ h: C.ink, t: C.butter, l: C.teal });

  // ---------- the brawl: one continuous 31 s scene ----------
  // At least three characters are on stage at every moment, all going for
  // the coin: pile-ups in a dust cloud, steals, zaps, a hit and run, an
  // abduction, a ghost. Every actor is a pure function of loop time t.
  const LOOP = 31000;
  const X = (v) => (v === 'L' ? -16 : v === 'R' ? GW + 16 : CX + v);
  const inW = (t, a, z) => t >= a && t < z;
  const on = (x) => x > -14 && x < GW + 14;
  // keyframes [t, dx | 'L' | 'R', y, ease, hop, hopping]; equal times cut
  const KF = (t, keys) => {
    let a = keys[0];
    if (t < a[0]) return { x: X(a[1]), y: a[2] };
    for (let i = 1; i < keys.length; i++) {
      const z = keys[i];
      if (t < z[0]) {
        const p = (t - a[0]) / (z[0] - a[0]), e = z[3] ? z[3](p) : p;
        let y = lerp(a[2], z[2], e);
        if (z[4]) y -= z[5] ? arc(((t - a[0]) % 320) / 320) * z[4] : arc(p) * z[4];
        return { x: lerp(X(a[1]), X(z[1]), e), y };
      }
      a = z;
    }
    return { x: X(a[1]), y: a[2] };
  };
  const vel = (t, keys) => KF(t + 40, keys).x - KF(t, keys).x;
  const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) px(cx + x, cy + y, c); };
  const dazed = (x, y, t) => { const a = t / 130; for (const o of [0, Math.PI]) px(x + Math.round(Math.cos(a + o) * 3), y + Math.round(Math.sin(a + o)), C.butter); };
  const bang = (x, y) => { spr(x, y, FONT['!'], { x: C.ink }); };
  // the classic cartoon brawl: a churning dust cloud, limbs and stars
  function cloud(x, y, t, cols) {
    const k = Math.floor(t / 90);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + k * 0.45; disc(x + Math.cos(a) * 5, y + Math.sin(a) * 2.2, 3 + ((i + k) % 2), C.dim); }
    for (let i = 0; i < 3; i++) { const a = (((k * 5 + i * 7) % 12) / 12) * Math.PI * 2; line(x + Math.cos(a) * 7, y + Math.sin(a) * 3.5, x + Math.cos(a) * 10, y + Math.sin(a) * 5.5, cols[(k + i) % cols.length]); }
    if (k % 4 < 2) star(x + ((k * 5) % 11) - 5, y - 7 - (k % 2), 1, C.butter);
  }
  const CLOUDS = [
    { a: 1150, z: 2600, x: -4, y: 26, cols: () => [G.body, C.teal] },
    { a: 10400, z: 11600, x: 0, y: 28, cols: () => [G.body, C.accent] },
    { a: 21950, z: 23300, x: -2, y: 28, cols: () => [C.teal, C.butter] },
  ];

  // chomper: the logo's body, forever missing its quarter
  const CK = [
    [0, -24, 31], [900, -14, 31], [1150, -9, 24, eo], [2600, -9, 24], [3200, -34, 31, eo, 8],
    [6400, -34, 31], [6900, -27, 31, eo], [7250, -27, 31, null, 4], [9500, -8, 31], [10100, 2, 31, null, 9],
    [11600, 2, 31], [11600, -2, 28], [12300, -40, 31, eo, 10], [12900, -40, 31], [13400, 'L', 31, ei], [24800, 'L', 31], [24800, 'R', 31], [25800, 26, 31, eo],
    [26900, 26, 31], [27800, -10, 31, eio], [28000, -10, 31], [29500, -24, 31, eio], [31000, -24, 31],
  ];
  function drawC(t) {
    if (inW(t, 1150, 2600) || inW(t, 10400, 11600)) return;
    const k = KF(t, CK);
    if (!on(k.x)) return;
    const v = vel(t, CK);
    let dir = v < -0.02 ? Math.PI : 0, open = 0.25 + Math.abs(Math.sin(t / 85)) * 1.3;
    if (inW(t, 900, 1150) || inW(t, 9500, 10100)) { dir = -0.6; open = 1.4; }
    else if (inW(t, 2600, 3200) || inW(t, 11600, 12300)) { dir = t / 45; open = 1.1; }
    else if (inW(t, 3200, 4200) || inW(t, 12300, 12900)) { open = 0.2; dazed(k.x, k.y - 7, t); }
    else if (inW(t, 6900, 7050)) open = 1.7;
    else if (inW(t, 7050, 7300)) open = 0;
    else if (inW(t, 29700, 30800)) { dir = -Math.PI / 4; open = Math.PI / 2; }
    else if (Math.abs(v) < 0.01) open = 0.25 + Math.abs(Math.sin(t / 200)) * 0.8;
    chomper(k.x, k.y, dir, open);
    return k.x;
  }

  // frog
  const FK = [
    [0, 22, 35], [450, 17, 35, null, 3], [900, 12, 35, null, 3], [1150, 1, 28, eo], [2600, 1, 28], [3200, 32, 35, eo, 8],
    [6450, 32, 35], [6800, 12, 35, null, 9], [7150, -8, 35, null, 9], [7400, -8, 35], [7800, 14, 35, null, 5],
    [9950, 14, 35], [10250, 20, 35, null, 3], [12650, 20, 35], [13350, 18, 35, null, 16],
    [16600, 18, 35], [17000, 2, 35, null, 6], [18600, 2, 27, eio], [18850, 2, 35, ei],
    [19600, 2, 35], [20000, 20, 35, null, 5], [21700, 20, 35], [21950, 2, 29, eo], [23300, 2, 29], [23900, 30, 35, eo, 8],
    [25000, 30, 35], [26000, 'R', 35, null, 3, true], [27000, 'R', 35], [28600, 22, 35, null, 3, true], [31000, 22, 35],
  ];
  const tongueTip = (t) => {
    if (inW(t, 8600, 9000)) { const p = seg(t, 8600, 9000); return [lerp(X(12), X(4), p), lerp(31, 20, p)]; }
    if (inW(t, 9000, 9800)) { const c = coinTrack(t); return [(c.x != null ? c.x : X(0)) + 3, (c.y != null ? c.y : CY) + 5]; }
    if (inW(t, 9800, 9950)) { const p = seg(t, 9800, 9950); return [lerp(X(8), X(12), p), lerp(26, 31, p)]; }
    return null;
  };
  function drawF(t) {
    if (inW(t, 1150, 2600) || inW(t, 21950, 23300)) return;
    const k = KF(t, FK);
    if (!on(k.x)) return;
    const v = vel(t, FK), air = k.y < 34.5 || inW(t, 17000, 18600);
    let x = k.x;
    if (inW(t, 17000, 18600)) x += Math.round(Math.sin(t / 150));
    sprB(x, k.y, air ? FROG.hop : FROG.sit, FROGP(), !(v > 0.02));
    const tip = tongueTip(t);
    if (tip) { line(x - 2, k.y - 3, tip[0], tip[1], C.rose); rect(tip[0], tip[1], 2, 2, C.rose); }
    if (inW(t, 3200, 4200) || inW(t, 18850, 19600) || inW(t, 23900, 24700)) dazed(x, k.y - 8, t);
    if (inW(t, 9800, 10300)) bang(x, k.y - 12);
    return x;
  }

  // space invader: hovers upper left, steps like the original
  const IK = [[0, -30, 6], [900, -18, 6], [1700, -13, 6], [2400, -13, 6], [3000, -18, 6], [6400, -18, 6], [7000, -36, -14, eo], [26000, -30, -14], [27200, -30, 6], [31000, -30, 6]];
  function drawI(t) {
    const k = KF(t, IK);
    if (k.y < -9 || !on(k.x)) return;
    const hit = inW(t, 6400, 7000);
    const moving = Math.abs(vel(t, IK)) > 0.005 || inW(t, 26000, 27200);
    const x = Math.round(k.x / 2) * 2 + (moving || hit ? 0 : [0, 1, 0, -1][Math.floor(t / 420) % 4]);
    const y = inW(t, 26000, 27200) ? Math.floor(k.y / 2) * 2 : Math.round(k.y);
    const fr = Math.floor(t / (hit ? 60 : 420)) % 2;
    spr(x - 5, y, INV[fr], { x: hit && fr ? C.butter : C.ink });
    if (inW(t, 1900, 2100)) { const by = Math.round(lerp(y + 9, 22, seg(t, 1900, 2100))); for (let j = 0; j < 4; j++) px(x + (((by - j) >> 1) & 1), by - j, C.butter); }
    return y > -4 ? x : undefined;
  }

  // bird: dives, snatches the coin, flies straight into the invader
  const BK = [[3600, 'R', 5], [4600, 34, 6, eo], [4900, 34, 6], [5300, 0, 4, eio, -8], [6400, -22, 7], [7800, 'L', 1, ei, -4]];
  function drawB(t) {
    if (!inW(t, 3600, 7800)) return;
    const k = KF(t, BK);
    if (!on(k.x)) return;
    const f = Math.floor(t / (inW(t, 5300, 6400) ? 70 : inW(t, 6400, 7800) ? 50 : 110)) % 2;
    sprC(k.x, k.y + (inW(t, 6400, 7800) ? Math.round(Math.sin(t / 40)) : 0), BIRD[f], { y: C.butter, w: EYE, o: EYE, k: INK, r: C.rose }, true);
    if (inW(t, 6400, 6600)) star(X(-20), 8, 2, C.ink);
    return k.x;
  }

  // snake: sneaks up and bites; later the car bowls it over
  const SK = [[6000, 'L', 0], [7800, -40, 0, eo], [10000, -12, 0], [10250, -12, 0], [10400, -4, 0], [11600, -4, 0], [11600, -12, 0],
    [13220, -12, 0], [13900, -34, 0, eo, 10], [14800, -34, 0], [16200, 'L', 0, ei]];
  function drawS(t) {
    if (!inW(t, 6000, 16200) || inW(t, 10400, 11600)) return;
    const k = KF(t, SK);
    const rear = inW(t, 11600, 13220) ? 0.35 : inW(t, 10000, 10400) ? 0.25 : 0;
    snake(Math.round(k.x), t, rear, inW(t, 13220, 13900), Math.round(k.y));
    if (inW(t, 13220, 13400)) star(X(-13), 31, 2, C.ink);
    if (inW(t, 13900, 14800)) dazed(Math.round(k.x) + 1, FY - 7, t);
    return k.x;
  }

  // race car: a hit and run from the right
  const CAR_V = 0.1;
  function drawR(t) {
    const xf = X(20) + (12900 - t) * CAR_V;
    if (xf > GW + 2 || xf < -24) return;
    spr(xf, FY - 8, CAR, { r: C.rose, t: C.teal, s: C.butter, e: INK, l: C.butter, k: INK, o: C.faint }, true);
    for (let j = 0; j < 3; j++) rect(xf + 22 + j * 3 + (Math.floor(t / 40) % 2), FY - 7 + j * 2, 5 - j, 1, C.dim);
    return xf + 10;
  }

  // saucer: beams the coin (and a frog) up; the ship chases it off
  const UK = [[13600, 'R', -9], [14800, 0, -2, eo], [18600, 0, -2], [19600, 'R', -12, ei]];
  function drawBeam(t) {
    if (!inW(t, 15000, 18600)) return;
    // a flat beam: two solid edges and rungs that run down it, drawn in as it switches on
    const d = seg(t, 15000, 15200), sc = Math.floor(t / 80), bot = 4 + Math.round(d * (FY - 4));
    for (let y = 4; y < bot; y++) {
      const hw = Math.round(3 + (y - 4) * 0.3);
      px(CX - hw, y, C.teal); px(CX + hw - 1, y, C.teal);
      if ((y + sc) % 5 === 0) for (let x = CX - hw + 2; x < CX + hw - 2; x++) px(x, y, C.teal);
    }
  }
  function drawU(t) {
    if (!inW(t, 13600, 19600)) return;
    const k = KF(t, UK);
    if (!on(k.x)) return;
    const x = Math.round(k.x) + (inW(t, 18500, 18800) ? (Math.floor(t / 50) % 2 ? 1 : -1) : 0), y = Math.round(k.y);
    const flash = inW(t, 18500, 18650) && Math.floor(t / 60) % 2, lit = Math.floor(t / (inW(t, 14800, 15200) ? 70 : 200)) % 2;
    const pal = flash ? { d: C.ink, h: C.ink, c: C.ink, a: C.ink, b: C.ink, e: C.ink } : { d: C.teal, h: EYE, c: C.cream, a: lit ? C.butter : C.rose, b: lit ? C.rose : C.butter, e: C.dim };
    spr(x - 6, y, UFO, pal);
    if (inW(t, 18600, 19600)) for (let j = 1; j < 4; j++) px(x - 7 - j * 3, y + 4 + j, C.dim);
    return y >= -4 ? x : undefined;
  }

  // ship: a vector triangle that fires at whoever is winning
  const PK = [[17200, 'L', 20], [17800, -36, 20, eo], [21800, -36, 20], [22200, -30, 22, eio], [23600, -30, 22], [24300, -30, 28, eio], [26100, -30, 28], [27000, 'L', 28, ei]];
  const SNAP = Math.PI / 12, snap = (a) => Math.round(a / SNAP) * SNAP;
  function drawP(t) {
    if (!inW(t, 17200, 27000)) return;
    const k = KF(t, PK);
    if (!on(k.x)) return;
    const aimU = snap(Math.atan2(1 - 20, 36)), aimC = snap(Math.atan2(6, 28));
    let a = 0;
    const thrust = inW(t, 17200, 17800) || inW(t, 26100, 27000);
    if (inW(t, 17800, 18100)) a = aimU * Math.floor(seg(t, 17800, 18100) * 3) / 2;
    else if (inW(t, 18100, 18800)) a = aimU;
    else if (inW(t, 18800, 19200)) a = aimU * (1 - Math.floor(seg(t, 18800, 19200) * 3) / 2);
    else if (inW(t, 22200, 22800)) a = aimC;
    else if (inW(t, 25900, 26100)) a = Math.PI * Math.min(1, Math.floor(seg(t, 25900, 26100) * 4) / 3);
    else if (t >= 26100) a = Math.PI;
    ship(Math.round(k.x), Math.round(k.y), a, thrust, t);
    const shot = (t0, t1, x0, y0, x1, y1) => { if (inW(t, t0, t1)) { const p = seg(t, t0, t1); px(lerp(x0, x1, p), lerp(y0, y1, p), C.butter); } };
    shot(18200, 18500, X(-32), 18, X(-3), 2);
    shot(22400, 22650, X(-26), 23, X(-9), 27);
    shot(24500, 24950, X(-26), 28, X(34), 26);
    if (inW(t, 18500, 18650)) star(X(-3), 2, 1, C.butter);
    if (inW(t, 24950, 25500) && Math.floor(t / 250) % 4 !== 3) text('?', Math.round(k.x) - 1, Math.round(k.y) - 11, C.faint);
    if (inW(t, 25850, 26150)) bang(Math.round(k.x), Math.round(k.y) - 11);
    return k.x;
  }

  // tetromino: drops in, becomes a step, clears itself
  function drawT(t) {
    if (!inW(t, 19200, 24400)) return;
    const x0 = CX - 20;
    if (t >= 24100) { for (let j = 0; j < 4; j++) px(x0 + 1 + j * 2, FY - 2 - (Math.floor(t / 70) % 2) * 2 - (j % 2), C.ink); return; }
    const by = Math.min(FY - 3, -6 + Math.floor((t - 19200) / 60) * 3);
    const col = t > 23600 && Math.floor(t / 80) % 2 ? C.ink : C.teal;
    block(x0, by, col); block(x0 + 3, by, col); block(x0 + 6, by, col); block(x0 + 3, by - 3, col);
    if (inW(t, 20000, 20240)) { const j = t < 20120 ? 1 : 2; px(x0 - j, FY - j, C.dim); px(x0 + 8 + j, FY - j, C.dim); }
  }

  // runner: uses the block as a step and actually gets the coin, briefly
  const NK = [
    [13000, 'R', 35], [13900, 30, 35], [14200, 10, 35, null, 7], [14700, -24, 35], [15300, -24, 35], [15700, -15, 35, null, 8], [16000, -15, 35], [16400, -24, 35, null, 5],
    [20100, -24, 35], [20300, -19, 32, null, 3], [20500, -16, 29, null, 3], [20900, -1, 27, eo], [21250, -3, 35, ei],
    [21400, -3, 35], [21650, -3, 35, null, 3], [21950, -3, 35], [23300, -2, 30], [23900, -26, 35, eo, 8], [24300, -26, 35], [25200, 'L', 35],
  ];
  function drawN(t) {
    if (!inW(t, 13000, 25200) || inW(t, 21950, 23300)) return;
    const k = KF(t, NK);
    if (!on(k.x)) return;
    const v = vel(t, NK), feet = Math.round(k.y), x = Math.round(k.x);
    let pose = 'stand';
    if (inW(t, 20500, 21950)) pose = 'up';
    else if (feet < 35) pose = 'jump';
    else if (Math.abs(v) > 0.01) pose = Math.floor(t / 90) % 2 ? 'run1' : 'run2';
    sprB(x, feet, RUN[pose], RUNP(), v < -0.01);
    if (inW(t, 23900, 24300)) dazed(x, feet - 10, t);
    if (inW(t, 21300, 21900)) { const tw = Math.floor(t / 120), cy = feet - 14; [[-10, -3], [10, -6], [-8, 5], [9, 4]].forEach(([dx, dy], j) => { if ((tw + j) % 3 === 0) star(x + dx, cy + dy, 1, C.butter); }); }
    return x;
  }

  // ghost: floats through the coin, shrugs off a bullet, boos the ship,
  // then the chomper comes back and it's Pac-Man rules
  const GK = [[23300, 'R', 26], [24400, 16, 26, eo], [24800, 16, 26], [25800, -12, 18, eio], [26400, -14, 26, eio], [26900, -14, 26], [28300, 'L', 26, ei]];
  const SCARED = (f) => ['...gggg...', '.gggggggg.', 'gggggggggg', 'ggwwggwwgg', 'gggggggggg', 'gwgwggwgwg', 'gggggggggg', f ? 'g.gg.gg.gg' : 'gg.gg.gg.g'];
  function drawG(t) {
    if (!inW(t, 23300, 28300)) return;
    const k = KF(t, GK);
    if (!on(k.x)) return;
    const f = Math.floor(t / 160) % 2, y = Math.round(k.y + Math.sin(t / 260) * 1.2);
    if (t >= 26900) { if (!(t > 27900 && Math.floor(t / 90) % 2)) sprC(k.x, y, SCARED(f), { g: C.teal, w: EYE }); return k.x; }
    const look = inW(t, 26400, 26900) ? 1 : -1, boo = inW(t, 25800, 26100);
    // passing through the coin it flickers (every other frame) instead of going see-through
    if (!(Math.abs(k.x - CX) < 11 && y < 25 && Math.floor(t / 70) % 2)) sprC(k.x, y, ghostRows(look, f), { g: boo && Math.floor(t / 70) % 2 ? C.ink : C.rose, w: EYE, p: INK });
    return k.x;
  }

  // the coin's own track: carried, dropped, reeled, beamed, held, popped
  function coinTrack(t) {
    const home = { x: X(0), y: CY };
    const blend = (a, b, p) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
    const wob = () => [0, 1, 0, -1][Math.floor(t / 110) % 4];
    if (inW(t, 1150, 2600) || inW(t, 13000, 13300)) return { dx: wob() };
    if (inW(t, 5200, 6400)) {
      const b = KF(t, BK), held = { x: b.x, y: b.y + 11 };
      return t < 5300 ? { ...blend(home, held, seg(t, 5200, 5300)), bob: 1 - seg(t, 5200, 5300) } : { ...held, bob: 0 };
    }
    if (inW(t, 6400, 8200)) {
      const b = KF(6399, BK), from = { x: b.x, y: b.y + 11 }, fl = { x: X(-22), y: FY - 8 };
      if (t < 6750) return { ...blend(from, fl, ei(seg(t, 6400, 6750))), bob: 0 };
      if (t < 6900) return { x: fl.x, y: fl.y - arc(seg(t, 6750, 6900)) * 3, bob: 0 };
      return { ...blend(fl, home, eio(seg(t, 6900, 8200))), bob: 0 };
    }
    if (inW(t, 8200, 8900)) return { bob: seg(t, 8200, 8600) };
    if (inW(t, 8900, 10700)) {
      const pull = { x: X(5), y: 21 };
      if (t < 9300) return { bob: 1 - seg(t, 8900, 9100) };
      if (t < 9800) return { ...blend(home, pull, eio(seg(t, 9300, 9800))), bob: 0 };
      return { ...blend(pull, home, eio(seg(t, 9800, 10700))), bob: 0 };
    }
    if (inW(t, 10700, 11200)) return { bob: seg(t, 10700, 11200) };
    if (inW(t, 14800, 19600)) {
      const bob = t < 18600 ? 1 - seg(t, 14800, 15100) : seg(t, 19200, 19600);
      const dy = t < 18600 ? -2 * eio(seg(t, 15200, 16400)) : -2 * (1 - bounce(seg(t, 18600, 19200)));
      return { dy, bob };
    }
    if (inW(t, 20700, 24000)) {
      const hands = (tt) => { const n = KF(tt, NK); return { x: n.x, y: n.y - 14 }; };
      if (t < 20900) return { ...blend(home, hands(t), seg(t, 20700, 20900)), bob: 1 - seg(t, 20700, 20800) };
      if (t < 22000) return { ...hands(Math.min(t, 21949)), bob: 0 };
      const from = hands(21949), top = { x: X(0), y: 9 };
      if (t < 22350) return { ...blend(from, top, eo(seg(t, 22000, 22350))), bob: 0 };
      if (t < 23500) return { ...blend(top, home, eio(seg(t, 22350, 23500))), bob: 0 };
      return { bob: seg(t, 23500, 24000) };
    }
    return {};
  }
  const EVENTS = [[1150, 'spin'], [2600, 'spin'], [5300, 'spin'], [6400, 'spin'], [6900, 'glint'], [9800, 'spin'], [11600, 'glint'], [13050, 'spin'],
    [15200, 'spin'], [18600, 'spin'], [20900, 'spin'], [22000, 'burst'], [22000, 'pop'], [25200, 'glint'], [28600, 'glint']];

  let cast = 0;
  function drawCast(t) {
    drawT(t);
    const xs = [drawS(t), drawN(t), drawF(t), drawC(t), drawR(t), drawI(t), drawB(t), drawU(t), drawP(t), drawG(t)];
    cast = xs.filter((x) => x != null && x > GW * 0.07 && x < GW * 0.93).length;
    for (const c of CLOUDS) if (inW(t, c.a, c.z)) { cloud(X(c.x), c.y, t, c.cols()); cast += 2; }
    for (const c of CLOUDS) if (inW(t, c.z, c.z + 200)) star(X(c.x), c.y - 2, t < c.z + 100 ? 3 : 2, C.ink);
  }

  // ---------- coin state (real time, independent of the loop) ----------
  let T = 0, clock = 0, hopT0 = -1e9;
  const sp = { t0: -1e9, dur: 1, steps: 0, from: 0, ease: false, next: 2600, glint: -1e9 };
  const cp = { x: 0, y: 0 };
  let parts = [], floats = [];
  const stepNow = () => {
    const p = (clock - sp.t0) / sp.dur;
    if (p < 0 || p >= 1) return 0;
    return (sp.from + Math.floor((sp.ease ? eo(p) : eio(p)) * sp.steps)) % 16;
  };
  function spin(steps, dur, ease) {
    const cur = stepNow();
    sp.from = cur; sp.steps = steps + (8 - (cur % 8)) % 8; sp.t0 = clock; sp.dur = dur; sp.ease = ease;
    sp.next = clock + dur + 4200 + Math.random() * 2400;
    sp.glint = clock + dur + 140;
  }
  function sparkle(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, v = 0.016 + Math.random() * 0.012;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.8, t0: clock, life: 480 + Math.random() * 220, c: i % 3 ? G.quart : C.butter });
    }
  }
  function fire(n) {
    if (n === 'spin') spin(16, 900, false);
    else if (n === 'burst') spin(32, 1300, true);
    else if (n === 'glint') sp.glint = clock;
    else if (n === 'pop') sparkle(cp.x, cp.y, 12);
  }

  // ---------- frame ----------
  // the floor: a solid line whose ends break into dots (no fade), and a dotted row under it
  function floor() {
    for (let x = 0; x < GW; x++) if ((x > 7 && x < GW - 8) || x % 2 === 0) px(x, FY, C.line);
    for (let x = 4; x < GW; x += 9) px(x, FY + 2, C.line);
  }
  function blit() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(buf, 0, 0, GW * K, GH * K);
  }
  function render() {
    b.clearRect(0, 0, GW, GH);
    floor();
    const o = coinTrack(T);
    const bobF = o.bob == null ? 1 : o.bob;
    const hp = (clock - hopT0) / 560, hop = hp >= 0 && hp < 1 ? Math.round(Math.sin(Math.PI * hp) * 5) : 0;
    const x = Math.round(o.x != null ? o.x : CX + (o.dx || 0));
    const y = Math.round((o.y != null ? o.y : CY + (o.dy || 0)) + Math.sin(clock / 520) * 2 * bobF) - hop;
    cp.x = x; cp.y = y;
    glow(x, y);
    drawBeam(T);
    const g = clock - sp.glint;
    coin(x, y, stepNow(), g >= 0 && g < 480 ? Math.floor(g / 14) - 2 : null);
    if (g >= 150 && g < 450) { const k = Math.floor((g - 150) / 75); star(x + 9, y - 9, [0, 1, 2, 1][k] || 0, G.shine); }
    drawCast(T);
    parts = parts.filter((p) => clock - p.t0 < p.life);
    for (const p of parts) { const a = clock - p.t0; if (a / p.life > 0.7 && Math.floor(a / 60) % 2) continue; px(p.x + p.vx * a, p.y + p.vy * a + 0.00003 * a * a, p.c); }
    floats = floats.filter((f) => clock - f.t0 < 1000);
    for (const f of floats) { const k = (clock - f.t0) / 1000; if (k > 0.72 && Math.floor(clock / 70) % 2) continue; text('+25', f.x, f.y - Math.round(eo(k) * 8), C.butter); }
    blit();
  }
  // reduced motion: one composed still, the coin face on
  function still(plus) {
    b.clearRect(0, 0, GW, GH);
    floor(); glow(CX, CY); coin(CX, CY, 0, null);
    chomper(X(-24), FY - 5, -Math.PI / 4, Math.PI / 2);
    sprB(X(22), FY - 1, FROG.sit, FROGP(), true);
    spr(X(-30) - 5, 6, INV[0], { x: C.ink });
    if (plus) text('+25', CX + 10, CY - 7, C.butter);
    blit();
  }

  let running = false, onScreen = false, last = 0, raf = 0;
  const q = new URLSearchParams(location.search);
  const freeze = q.has('arenastill');
  // debug for screenshots: ?arena=ms jumps into the loop; ?arenastill freezes it
  if (q.has('arena')) { T = (+q.get('arena') || 0) % LOOP; window.__arena = (ms, clk) => { T = ms % LOOP; if (clk != null) clock = clk; render(); return cast; }; window.__arenaLoop = LOOP; }
  function frame(now) {
    raf = 0;
    if (!running) return;
    // the first rAF stamp can be older than the performance.now() sync() stored
    const dt = Math.max(0, Math.min(50, now - last)); last = now;
    clock += dt;
    const prev = T; T = (T + dt) % LOOP;
    for (const [tm, n] of EVENTS) if (prev <= T ? tm > prev && tm <= T : tm > prev || tm <= T) fire(n);
    if (clock > sp.next && clock - sp.t0 > sp.dur) spin(16, 1000, false);
    render();
    raf = requestAnimationFrame(frame);
  }
  function drawIdle() { if (reduce) still(false); else render(); }
  function sync() {
    const want = onScreen && !document.hidden && !reduce && !freeze;
    if (want && !running) { running = true; last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); }
    else if (!want) running = false;
  }

  function size() {
    const u = parseFloat(getComputedStyle(host).getPropertyValue('--u')) || 4;
    DPR = Math.min(3, window.devicePixelRatio || 1);
    K = Math.max(1, Math.round(u * DPR));
    GW = Math.max(60, Math.floor(host.clientWidth * DPR / K));
    CX = GW >> 1;
    buf.width = GW; buf.height = GH;
    cv.width = GW * K; cv.height = GH * K;
    cv.style.width = GW * K / DPR + 'px'; cv.style.height = GH * K / DPR + 'px';
    host.style.setProperty('--ua', K / DPR + 'px');
  }

  hit.addEventListener('click', () => {
    if (reduce) { still(true); setTimeout(() => still(false), 1200); return; }
    spin(40, 1400, true); hopT0 = clock; sparkle(cp.x, cp.y, 10);
    floats.push({ t0: clock, x: cp.x + 10, y: cp.y - 4 - floats.length * 2 });
    if (!running) { clock += 16; render(); }
  });
  hit.addEventListener('pointerenter', () => { if (!reduce && clock - sp.glint > 600 && clock - sp.t0 > sp.dur) sp.glint = clock; });

  palette(); buildCoin(); size(); drawIdle();
  addEventListener('qs:theme', () => { palette(); if (!running) drawIdle(); });
  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { size(); if (!running) drawIdle(); }); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { onScreen = es.some((x) => x.isIntersecting); sync(); }, { rootMargin: '80px' }).observe(host);
  else { onScreen = true; sync(); }
})();
