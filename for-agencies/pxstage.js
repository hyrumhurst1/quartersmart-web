// Pixel stage: a small screen in the hero that changes scenes the way an
// arcade attract loop does. Every lit pixel of one scene travels on a curved
// path into the next scene, so the picture flows into the next one instead
// of cutting or sliding. Used by /for-agencies/, /workflow-usage/ and /404.
//
//   <div class="pxs" data-pxs>
//     <p class="pxs__alt">shown without JS</p>
//     <canvas aria-hidden="true" data-h="104" data-first-hold="4000" data-intro="fly"
//             data-scenes="text:Partner/Bench | mark | img:/assets/px/sprite-radar.png"></canvas>
//     <button class="pxs__pause" type="button" aria-pressed="false" aria-label="Pause animation" hidden></button>
//   </div>
//
// Scenes, separated by "|":
//   text:WORDS     Departure Mono from its own 11px grid, in the wordmark's
//                  five bands. "/" breaks a line, "<" is a left arrow, "@3"
//                  caps the cell size.
//   mark           the QuarterSmart mark
//   img:/path.png  a sprite from /assets/px at its native size
//   check          a check mark
//   cal:JUN 2026:11:1:30   a calendar page (label : day to mark : weekday of the 1st : days)
//   grid, tree, bars, sky  data pictures; numbers come from the table in data-table
// data-align="bottom" stands every scene on the stage floor (default: centred).
//
// Crisp: a low-resolution buffer drawn at an integer device-pixel scale.
// Pauses off screen, in hidden tabs and from its pause button. Reduced
// motion: the first scene, drawn once and left still.
(() => {
  const stages = document.querySelectorAll('[data-pxs]');
  if (!stages.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- colour ----------
  const probe = document.createElement('canvas').getContext('2d');
  const rgb = (s, d) => {
    s = (s || '').trim(); if (!s) return d;
    probe.fillStyle = '#010203'; probe.fillStyle = s;
    const f = probe.fillStyle;
    if (f === '#010203') return d;
    if (f[0] === '#') { const n = parseInt(f.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
    const m = f.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2]] : d;
  };
  const mix = (a, b, t) => [0, 1, 2].map((i) => Math.round(a[i] * t + b[i] * (1 - t)));
  function palette() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n, d) => rgb(cs.getPropertyValue(n), d);
    const fg = v('--fg-0', [236, 228, 204]), f1 = v('--fg-1', [203, 195, 171]), ac = v('--accent', [169, 217, 159]);
    const inf = v('--info', [134, 195, 186]), bg = v('--bg-0', [18, 24, 20]), ln = v('--line-2', [74, 90, 79]);
    return { fg, f1, ac, inf, bg, ln, band: [fg, ac, inf, mix(ac, bg, 0.64), mix(ac, bg, 0.46)], dim: mix(ln, bg, 0.8) };
  }

  // ---------- Departure Mono, read from the font's own pixel grid ----------
  // Drawn 10x larger and sampled at each cell's centre, so anti-aliased
  // edges never thicken a stroke: every dot is exactly the font's dot.
  const SS = 10, gcache = new Map();
  function glyph(ch) {
    if (gcache.has(ch)) return gcache.get(ch);
    const o = document.createElement('canvas'), c = o.getContext('2d');
    o.width = 12 * SS; o.height = 22 * SS;
    c.font = '400 ' + 11 * SS + 'px Departure'; c.textBaseline = 'alphabetic'; c.fillStyle = '#000';
    c.fillText(ch, 0, 15 * SS);
    const d = c.getImageData(0, 0, o.width, o.height).data, dots = [];
    for (let y = 0; y < 22; y++) for (let x = 0; x < 12; x++) {
      if (d[((y * SS + (SS >> 1)) * o.width + x * SS + (SS >> 1)) * 4 + 3] > 127) dots.push([x, y - 7]); // row 0 = cap top
    }
    gcache.set(ch, dots);
    return dots;
  }
  // A few marks the font is not asked for, drawn on the same thin stroke.
  const ART = {
    '<': ['...#....', '..#.....', '.#......', '########', '.#......', '..#.....', '...#....'],
    check: ['.........##', '........##.', '.......##..', '##....##...', '.##..##....', '..####.....', '...##......'],
  };
  const artDots = (rows, dy = 0) => { const out = []; rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '#') out.push([x, y + dy]); })); return out; };
  function lineDots(str) {
    const dots = []; let cur = 0;
    for (const ch of str) {
      if (ART[ch]) { artDots(ART[ch], 1).forEach(([x, y]) => dots.push([cur + 1 + x, y])); cur += ART[ch][0].length + 3; continue; }
      glyph(ch).forEach(([x, y]) => dots.push([cur + x, y])); cur += 7;
    }
    let x0 = 1e9, x1 = -1, y1 = 7;
    dots.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    return { dots, x0, x1, y1 };
  }
  // Wordmark bands by row of the cap height, as on the homepage.
  const bandOf = (y) => (y >= 8 ? 4 : y < 3.2 ? 0 : y < 4.64 ? 1 : y < 5.76 ? 2 : y < 6.72 ? 3 : 4);

  // ---------- scenes: arrays of {x, y, c} in buffer pixels ----------
  function fill(out, x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out.push({ x: x + i, y: y + j, c }); }
  function textScene(spec, W, H, P) {
    let cap = 8; const m = spec.match(/@(\d+)$/); if (m) { cap = +m[1]; spec = spec.slice(0, m.index); }
    const lines = spec.split('/').map((s) => lineDots(s.trim()));
    const GAP = 3, lh = lines.map((l) => l.y1 + 1);
    const inkW = Math.max(...lines.map((l) => l.x1 - l.x0 + 1)), inkH = lh.reduce((a, b) => a + b, 0) + GAP * (lines.length - 1);
    const cell = Math.max(1, Math.min(cap, Math.floor((W * 0.94) / inkW), Math.floor((H * 0.8) / inkH)));
    const ox = Math.round((W - inkW * cell) / 2), oy = Math.round((H - inkH * cell) / 2), out = [];
    let top = 0;
    lines.forEach((l, i) => {
      const lx = Math.round((inkW - (l.x1 - l.x0 + 1)) / 2);
      for (const [x, y] of l.dots) fill(out, ox + (lx + x - l.x0) * cell, oy + (top + y) * cell, cell, cell, P.band[bandOf(y)]);
      top += lh[i] + GAP;
    });
    return out;
  }
  function artScene(rows, W, H, c, cap = 8) {
    const w = rows[0].length, h = rows.length;
    const cell = Math.max(1, Math.min(cap, Math.floor((W * 0.8) / w), Math.floor((H * 0.72) / h)));
    const ox = Math.round((W - w * cell) / 2), oy = Math.round((H - h * cell) / 2), out = [];
    artDots(rows).forEach(([x, y]) => fill(out, ox + x * cell, oy + y * cell, cell, cell, c));
    return out;
  }
  // the mark from _partials/mark.html, as "x,y,width" runs on a 14x14 grid
  const MARK_D = '4,2,2 2,3,4 1,4,5 1,5,5 0,6,6 0,7,6 0,8,12 0,9,12 1,10,10 1,11,10 2,12,8 4,13,4';
  const MARK_L = '8,0,2 8,1,4 8,2,5 8,3,5 8,4,6 8,5,6';
  function markScene(W, H) {
    const cell = Math.max(2, Math.min(6, Math.floor((H * 0.76) / 14), Math.floor((W * 0.8) / 14)));
    const ox = Math.round((W - 14 * cell) / 2), oy = Math.round((H - 14 * cell) / 2), out = [];
    const add = (spec, c) => spec.split(' ').forEach((run) => { const [x, y, w] = run.split(',').map(Number); fill(out, ox + x * cell, oy + y * cell, w * cell, cell, c); });
    add(MARK_D, [29, 122, 88]); add(MARK_L, [169, 217, 159]);
    return out;
  }
  function imgScene(img, W, H) {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h).data, out = [];
    const ox = Math.round((W - w) / 2), oy = Math.round((H - h) / 2);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = (y * w + x) * 4; if (d[k + 3] > 127) out.push({ x: ox + x, y: oy + y, c: [d[k], d[k + 1], d[k + 2]] }); }
    return out;
  }
  function calScene(spec, W, H, P) {
    const [label = '', mark = '0', first = '0', days = '30'] = spec.split(':');
    const pts = [], PW = 62, cw = 6, ch = 4, gap = 2;
    fill(pts, 13, 0, 3, 4, P.f1); fill(pts, 46, 0, 3, 4, P.f1);          // rings
    fill(pts, 0, 2, PW, 13, P.ac);                                         // header
    const t = lineDots(label), tx = Math.round((PW - (t.x1 - t.x0 + 1)) / 2);
    const inHead = new Set(t.dots.map(([x, y]) => (tx + x - t.x0) + ',' + (5 + y)));
    for (let i = pts.length - 1; i >= 0; i--) if (inHead.has(pts[i].x + ',' + pts[i].y)) pts[i].c = P.bg;
    const rows = Math.ceil((+first + +days) / 7), top = 19;
    for (let dd = 1; dd <= +days; dd++) {
      const k = +first + dd - 1, cx = 4 + (k % 7) * (cw + gap), cy = top + Math.floor(k / 7) * (ch + gap);
      fill(pts, cx, cy, cw, ch, dd === +mark ? P.fg : P.band[3]);
    }
    const PH = top + rows * (ch + gap) + 2;
    for (let x = 0; x < PW; x++) { pts.push({ x, y: PH, c: P.ln }); }
    for (let y = 15; y < PH; y++) { pts.push({ x: 0, y, c: P.ln }); pts.push({ x: PW - 1, y, c: P.ln }); }
    const f = Math.max(1, Math.min(3, Math.floor((W * 0.9) / PW), Math.floor((H * 0.88) / (PH + 1))));
    const ox = Math.round((W - PW * f) / 2), oy = Math.round((H - (PH + 1) * f) / 2), out = [];
    pts.forEach((p) => fill(out, ox + p.x * f, oy + p.y * f, f, f, p.c));
    return out;
  }
  // Colour by rank: the most used template, the next three, the next six, the rest.
  const rankC = (i, P) => (i === 0 ? P.ac : i < 4 ? P.inf : i < 10 ? P.f1 : P.band[3]);
  function gridScene(W, H, P) {
    const g = 2, b = Math.max(3, Math.floor((Math.min(W * 0.9, H * 0.84) - 4 * g) / 5)), size = 5 * b + 4 * g;
    const ox = Math.round((W - size) / 2), oy = Math.round((H - size) / 2), out = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) fill(out, ox + c * (b + g), oy + r * (b + g), b, b, P.band[r]);
    return out;
  }
  function squarify(vals, x, y, w, h) {
    const total = vals.reduce((a, b) => a + b, 0), k = (w * h) / total, A = vals.map((v) => v * k), rects = [];
    let i = 0;
    const worst = (row, s) => { const t = row.reduce((a, b) => a + b, 0); return Math.max((s * s * Math.max(...row)) / (t * t), (t * t) / (s * s * Math.min(...row))); };
    while (i < A.length) {
      const s = Math.min(w, h); const row = [A[i]]; let j = i + 1;
      while (j < A.length && worst([...row, A[j]], s) <= worst(row, s)) row.push(A[j++]);
      const t = row.reduce((a, b) => a + b, 0);
      if (w >= h) { const cw = t / h; let cy = y; row.forEach((a) => { rects.push([x, cy, cw, a / cw]); cy += a / cw; }); x += cw; w -= cw; }
      else { const rh = t / w; let cx = x; row.forEach((a) => { rects.push([cx, y, a / rh, rh]); cx += a / rh; }); y += rh; h -= rh; }
      i = j;
    }
    return rects;
  }
  function treeScene(vals, W, H, P) {
    const tw = Math.round(W * 0.8), th = Math.round(H * 0.82), ox = Math.round((W - tw) / 2), oy = Math.round((H - th) / 2), out = [];
    squarify(vals, 0, 0, tw, th).forEach(([x, y, w, h], i) => {
      const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h);
      fill(out, ox + x0, oy + y0, Math.max(1, x1 - x0 - 1), Math.max(1, y1 - y0 - 1), rankC(i, P));
    });
    return out;
  }
  function barsScene(vals, W, H, P) {
    const v = vals.slice(0, 10), bh = 5, g = 3, L = Math.round(W * 0.8), th = v.length * bh + (v.length - 1) * g;
    const ox = Math.round((W - L) / 2), oy = Math.round((H - th) / 2), out = [];
    v.forEach((n, i) => fill(out, ox, oy + i * (bh + g), Math.max(2, Math.round((n / v[0]) * L)), bh, rankC(i, P)));
    return out;
  }
  function skyScene(vals, W, H, P) {
    const n = vals.length, cw = Math.max(2, Math.min(4, Math.floor((W * 0.9 - (n - 1)) / n))), tw = n * cw + (n - 1);
    const ox = Math.round((W - tw) / 2), base = Math.round(H * 0.88), mh = Math.round(H * 0.74), out = [];
    vals.forEach((v, i) => { const h = Math.max(1, Math.round((v / vals[0]) * mh)); fill(out, ox + i * (cw + 1), base - h, cw, h, rankC(i, P)); });
    for (let x = ox - 3; x < ox + tw + 3; x++) out.push({ x, y: base + 1, c: P.ln });
    return out;
  }

  // ---------- the morph ----------
  // The picture travels in 3x3 chunks. Each chunk carries its own pixels, so
  // both ends of a morph are the exact art and the shapes stay legible in
  // flight. Both pictures are ranked along the same path and matched rank to
  // rank, so neighbouring chunks travel together and the art flows across as
  // one sheet. Choreographies take turns: a sweep to the right, a pour over
  // the top, a spiral out of the middle, a sweep to the left.
  const CH = 3;
  function chunks(pts) {
    const m = new Map();
    for (const p of pts) {
      const cx = Math.floor(p.x / CH), cy = Math.floor(p.y / CH), k = (cx + 512) * 4096 + cy + 512;
      let c = m.get(k);
      if (!c) { c = { x: cx * CH, y: cy * CH, px: [], c: null }; m.set(k, c); }
      c.px.push([p.x - c.x, p.y - c.y, p.c]);
    }
    for (const c of m.values()) { const t = [0, 0, 0]; c.px.forEach(([, , q]) => { t[0] += q[0]; t[1] += q[1]; t[2] += q[2]; }); c.c = t.map((v) => Math.round(v / c.px.length)); }
    return [...m.values()];
  }
  const MODES = [
    { k: (p) => p.x + p.y * 0.35, path: 'arc', bend: 0.24, lift: 0.26 },
    { k: (p, W) => p.y * 1.6 + Math.abs(p.x - W / 2) * 0.3, path: 'pour' },
    { k: (p, W, H) => Math.hypot(p.x - W / 2, (p.y - H / 2) * 1.3), path: 'spiral' },
    { k: (p) => -p.x + p.y * 0.35, path: 'arc', bend: -0.24, lift: 0.26 },
  ];
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  function pair(A, B, mode, W, H) {
    const rank = (P) => P.map((p) => [mode.k(p, W, H) + rnd() * 1.6, p]).sort((m, n) => m[0] - n[0]).map((m) => m[1]);
    const a = rank(A), b = rank(B), n = Math.max(a.length, b.length), out = new Array(n);
    const clx = (v) => Math.max(1, Math.min(W - 2, v)), cly = (v) => Math.max(1, Math.min(H - 2, v));
    // Neighbouring chunks share their flight, so the art moves in streams, not dust.
    const hash = (x, y) => { let h = (Math.floor(x / 9) * 374761393 + Math.floor(y / 9) * 668265263) ^ salt; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const salt = Math.floor(rnd() * 1e9);
    for (let i = 0; i < n; i++) {
      const s = a[Math.floor((i * a.length) / n)], t = b[Math.floor((i * b.length) / n)], r = hash(s.x, s.y) * 0.8 + rnd() * 0.2;
      const dx = t.x - s.x, dy = t.y - s.y;
      let cx = (s.x + t.x) / 2, cy = (s.y + t.y) / 2;
      if (mode.path === 'arc') { const bend = mode.bend * (0.75 + r * 0.5); cx -= dy * bend; cy += dx * bend - Math.abs(dx) * mode.lift; }
      // pour: up and over the top, each chunk to its own height, and never out of the stage
      else if (mode.path === 'pour') { cx += (r - 0.5) * 10; const peak = Math.max(2 + r * H * 0.16, Math.min(s.y, t.y) - H * 0.24 * (0.5 + r * 0.5)); cy = 2 * peak - (s.y + t.y) / 2; }
      out[i] = { sx: s.x, sy: s.y, tx: t.x, ty: t.y, sc: s.c, tc: t.c, sp: s.px, tp: t.px, cx: clx(cx), cy: mode.path === 'pour' ? cy : cly(cy), r, at: 0.38 * (i / n) + r * 0.05 };
    }
    return out;
  }

  // ---------- one stage ----------
  async function run(box) {
    const cv = box.querySelector('canvas[data-scenes]');
    if (!cv || !cv.getContext) return;
    const btn = box.querySelector('.pxs__pause');
    const tokens = cv.dataset.scenes.split('|').map((s) => s.trim()).filter(Boolean);
    const needsFont = tokens.some((t) => t.startsWith('text:') || t.startsWith('cal:'));
    if (needsFont && document.fonts) {
      const ok = await Promise.race([
        document.fonts.load('400 11px Departure').then(() => document.fonts.check('400 11px Departure')).catch(() => false),
        new Promise((r) => setTimeout(() => r(false), 3500)),
      ]);
      if (!ok) return; // keep the plain fallback
    }
    const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    const imgs = {};
    await Promise.all(tokens.filter((t) => t.startsWith('img:')).map(async (t) => { imgs[t] = await load(t.slice(4)); }));
    const tbl = cv.dataset.table && document.querySelector(cv.dataset.table);
    const vals = tbl ? [...tbl.querySelectorAll('tbody .num')].map((n) => +n.textContent.replace(/[^\d]/g, '')).filter((n) => n > 0).sort((a, b) => b - a) : [];

    const ctx = cv.getContext('2d');
    const buf = document.createElement('canvas'), bg = buf.getContext('2d');
    let W = 0, H = 0, S = 1, frame = null, px = null, P = palette(), scenes = [], cells = [];
    const pack = (c, a = 255) => ((a << 24) | ((c[2] & 255) << 16) | ((c[1] & 255) << 8) | (c[0] & 255)) >>> 0;

    function build(tok) {
      if (tok.startsWith('text:')) return textScene(tok.slice(5), W, H, P);
      if (tok.startsWith('img:')) return imgs[tok] ? imgScene(imgs[tok], W, H) : null;
      if (tok.startsWith('cal:')) return calScene(tok.slice(4), W, H, P);
      if (tok === 'mark') return markScene(W, H);
      if (tok === 'check') return artScene(ART.check, W, H, P.ac);
      if (vals.length > 2) {
        if (tok === 'grid') return gridScene(W, H, P);
        if (tok === 'tree') return treeScene(vals, W, H, P);
        if (tok === 'bars') return barsScene(vals, W, H, P);
        if (tok === 'sky') return skyScene(vals, W, H, P);
      }
      return null;
    }
    // data-align="bottom" sets every scene on the stage's floor instead of its middle
    function buildAll() {
      scenes = tokens.map(build).filter((sc) => sc && sc.length);
      if (cv.dataset.align === 'bottom') scenes.forEach((sc) => { let m = 0; sc.forEach((p) => { m = Math.max(m, p.y); }); const d = H - 2 - m; sc.forEach((p) => { p.y += d; }); });
      cells = scenes.map(chunks);
    }
    function dims() {
      const bw = box.clientWidth;
      const minW = +cv.dataset.minw || 140, maxW = +cv.dataset.maxw || 180, maxS = +cv.dataset.maxs || 3;
      const s = Math.max(1, Math.min(maxS, Math.floor(bw / minW)));
      const nW = Math.max(60, Math.min(maxW, Math.floor(bw / s))), nH = +cv.dataset.h || 104;
      const dpr = Math.min(3, window.devicePixelRatio || 1), nS = Math.max(1, Math.round(s * dpr));
      const changed = nW !== W || nH !== H || nS !== S;
      W = nW; H = nH; S = nS;
      cv.style.width = (W * S) / dpr + 'px'; cv.style.height = (H * S) / dpr + 'px';
      if (changed) {
        cv.width = W * S; cv.height = H * S; // resizing clears the canvas, so only when the size really changed
        buf.width = W; buf.height = H; frame = bg.createImageData(W, H); px = new Uint32Array(frame.data.buffer);
        buildAll();
      }
      return changed;
    }
    const put = (x, y, c, a) => { const ix = Math.round(x), iy = Math.round(y); if (ix >= 0 && iy >= 0 && ix < W && iy < H) px[iy * W + ix] = pack(c, a); };
    function blit() {
      bg.putImageData(frame, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(buf, 0, 0, W * S, H * S);
    }
    // A still scene; "g" is the position of a soft glint that crosses it once per hold.
    function still(pts, g) {
      px.fill(0);
      for (const p of pts) {
        let c = p.c;
        if (g != null) { const d = p.x + p.y * 0.5 - g; if (d >= 0 && d < 5) c = mix(P.fg, c, 0.5); }
        put(p.x, p.y, c, 255);
      }
      blit();
    }

    dims();
    if (!scenes.length) return;
    box.classList.add('is-live');
    if (reduce || scenes.length < 2) { still(scenes[0]); addEventListener('resize', () => { if (dims() && scenes.length) still(scenes[0]); }); return; }

    const MORPH = +cv.dataset.morphMs || 1800, HOLD = +cv.dataset.hold || 2400, FIRST = +cv.dataset.firstHold || 4000;
    const SPAN = 0.58, FL = 130 / MORPH;
    let idx = 0, next = 1, phase = 'hold', clock = 0, parts = null, turn = 0, last = performance.now();
    let visible = true, paused = false, drawnHold = -1, noise = [], lastNoise = -1e9, raf = 0;

    let path = 'arc';
    function startMorph(from, to) {
      const m = MODES[turn++ % MODES.length];
      next = to; path = m.path; parts = pair(cells[from], cells[to], m, W, H); phase = 'morph'; clock = 0;
    }
    // Entrance: the first scene assembles inside the stage.
    const intro = cv.dataset.intro;
    const r0 = box.getBoundingClientRect();
    const inView = r0.top < innerHeight && r0.bottom > 0;
    if (intro === 'fly' && inView) {
      const A = cells[0].map(() => ({ x: Math.floor(rnd() * W), y: Math.floor(rnd() * H), c: P.dim, px: [[0, 0, P.dim]] }));
      parts = pair(A, cells[0], MODES[2], W, H); path = 'spiral'; next = 0; phase = 'intro'; clock = 0;
    } else if (intro === 'tune' && inView) { phase = 'tune'; clock = 0; scenes[0].forEach((p) => { p.r = rnd(); }); }
    else still(scenes[0]);

    function drawMorph(T) {
      px.fill(0);
      for (const p of parts) {
        let t = (T - p.at) / SPAN; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const e = ease(t), u = 1 - e;
        let x, y;
        if (path === 'spiral') {
          // a vortex: turn about the centre on an ellipse the shape of the stage, drawn in a little mid-flight
          const bx = p.sx + (p.tx - p.sx) * e, by = p.sy + (p.ty - p.sy) * e, q = W / H, s = Math.sin(e * Math.PI);
          const th = s * (0.85 + p.r * 0.45), dx = bx - W / 2, dy = (by - H / 2) * q, sc = 1 - s * 0.2;
          x = W / 2 + (dx * Math.cos(th) - dy * Math.sin(th)) * sc; y = H / 2 + ((dx * Math.sin(th) + dy * Math.cos(th)) / q) * sc;
          x = Math.max(0, Math.min(W - 1, x)); y = Math.max(0, Math.min(H - 1, y));
        } else {
          x = u * u * p.sx + 2 * u * e * p.cx + e * e * p.tx;
          y = u * u * p.sy + 2 * u * e * p.cy + e * e * p.ty;
        }
        // a chunk shows its own pixels, then the pixels it becomes, easing its colours across
        const xi = Math.round(x), yi = Math.round(y), landed = T - p.at - SPAN;
        if (landed >= 0 && landed < FL) for (const [dx, dy, c] of p.tp) put(xi + dx, yi + dy, mix(P.fg, c, 0.6), 255);
        else if (e < 0.5) for (const [dx, dy, c] of p.sp) put(xi + dx, yi + dy, e > 0 ? mix(p.tc, c, e) : c, 255);
        else for (const [dx, dy, c] of p.tp) put(xi + dx, yi + dy, e < 1 ? mix(c, p.sc, e) : c, 255);
      }
      blit();
    }
    function drawTune(t) {
      const D = 1500, q = Math.min(1, t / D);
      if (t - lastNoise > 70) {
        lastNoise = t; noise = [];
        const dens = 0.22 * (1 - q) * (1 - q);
        for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (rnd() < dens) noise.push([x, y, rnd() < 0.25 ? mix(P.fg, P.ac, 0.7) : P.dim]);
      }
      px.fill(0);
      noise.forEach(([x, y, c]) => { put(x, y, c, 255); put(x + 1, y, c, 255); put(x, y + 1, c, 255); put(x + 1, y + 1, c, 255); });
      const lock = Math.max(0, (q - 0.1) / 0.78);
      for (const p of scenes[0]) if (p.r < lock) put(p.x, p.y, lock - p.r < 0.05 ? mix(P.fg, p.c, 0.6) : p.c, 255);
      blit();
      return t < D + 80;
    }

    // The loop only runs while the stage is on screen, the tab is shown and
    // it is not paused; kick() restarts it when any of those change back.
    function tick(now) {
      raf = 0;
      const dt = Math.max(0, Math.min(50, now - last)); last = now;
      if (!visible || document.hidden || paused) return;
      clock += dt;
      if (phase === 'tune') { if (!drawTune(clock)) { phase = 'hold'; clock = 0; drawnHold = -1; } }
      else if (phase === 'intro' || phase === 'morph') {
        const T = clock / (phase === 'intro' ? 1600 : MORPH);
        if (T >= 1 + FL) { idx = next; phase = 'hold'; clock = 0; drawnHold = -1; still(scenes[idx]); }
        else drawMorph(T);
      } else {
        const hold = idx === 0 ? FIRST : HOLD, g0 = hold * 0.4, gd = 900;
        if (clock >= g0 && clock < g0 + gd) { still(scenes[idx], -H + ((clock - g0) / gd) * (W + H * 1.5)); drawnHold = 1; }
        else if (drawnHold !== (clock < g0 ? 0 : 2)) { still(scenes[idx]); drawnHold = clock < g0 ? 0 : 2; }
        if (clock >= hold) startMorph(idx, (idx + 1) % scenes.length);
      }
      raf = requestAnimationFrame(tick);
    }
    const kick = () => { if (!raf && visible && !document.hidden && !paused) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    raf = requestAnimationFrame(tick);

    new IntersectionObserver((es) => { visible = es.some((e) => e.intersectionRatio > 0.1); kick(); }, { threshold: [0, 0.1, 0.5] }).observe(cv);
    document.addEventListener('visibilitychange', kick);
    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => { paused = !paused; btn.setAttribute('aria-pressed', paused ? 'true' : 'false'); kick(); });
    }
    const redo = () => { if (dims()) { if (idx >= scenes.length) idx = 0; phase = 'hold'; clock = 0; drawnHold = -1; still(scenes[idx]); } };
    let rt = 0;
    if ('ResizeObserver' in window) new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(redo, 120); }).observe(box);
    else addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redo, 120); });
    addEventListener('qs:theme', () => { P = palette(); buildAll(); if (idx >= scenes.length) idx = 0; phase = 'hold'; clock = 0; drawnHold = -1; still(scenes[idx]); });
  }
  stages.forEach(run);
})();
