// Signals radar. Two instruments driven by one control (the cursor, or
// scroll on touch screens):
//   1. The plate: 120 frames of a radio dish, redrawn as low-resolution
//      pixel art in the active theme's palette. Moving across the page
//      turns the dish.
//   2. The scope: a pixel radar whose sweep follows the dish and whose blips
//      are the real Signals posts (angle = kind of signal, distance = age).
// Everything degrades to a single still frame with reduced motion.
(() => {
  const plate = document.getElementById('radar-plate');
  const scope = document.getElementById('radar-scope');
  if (!plate) return;
  const N = 120;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const frameLabel = document.querySelector('[data-radar-frame]');
  const read = document.getElementById('scope-read');
  const posts = (() => { try { return JSON.parse(document.getElementById('sig-data').textContent); } catch { return []; } })();

  // ---- palette from the theme tokens
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const rgb = (c) => {
    const d = document.createElement('canvas').getContext('2d');
    d.fillStyle = c; const h = d.fillStyle;
    if (h[0] === '#') return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const m = h.match(/\d+/g); return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  };
  let LUT = null, COL = {};
  function buildPalette() {
    // Luminance ramp: shadows sit in the page colour, highlights step up
    // through the lines and ink, and only the brightest cells (stars, the
    // horizon glow, surf) reach the accent. Hard steps, no smoothing: banding
    // is the look.
    const ramp = ['--bg-0', '--bg-1', '--bg-2', '--line', '--line-2', '--fg-2', '--fg-1', '--accent'].map((v) => rgb(css(v)));
    const cuts = [0.06, 0.12, 0.19, 0.27, 0.37, 0.5, 0.66, 1.01];
    LUT = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const l = i / 255;
      let k = 0; while (l > cuts[k]) k++;
      LUT.set(ramp[Math.min(k, ramp.length - 1)], i * 3);
    }
    COL = { bg: css('--bg-1'), line: css('--line-2'), faint: css('--line'), ink: css('--fg-1'), hi: css('--fg-0'), accent: css('--accent'),
      kinds: { reported: css('--warn'), event: css('--event'), available: css('--info'), confirmed: css('--info'), early: css('--accent'), quiet: css('--fg-1'), insight: css('--fg-2') } };
  }
  buildPalette();

  // ---- frames
  const frames = new Array(N);
  let loaded = 0;
  const src = (i) => `/assets/images/radar-frames/frame_${String(i + 1).padStart(4, '0')}.jpg`;
  function load(i) {
    return new Promise((res) => { const im = new Image(); im.decoding = 'async'; im.onload = () => { frames[i] = im; loaded++; res(); }; im.onerror = res; im.src = src(i); });
  }

  // ---- plate rendering (low-res buffer, nearest-neighbour upscale)
  const pctx = plate.getContext('2d');
  const buf = document.createElement('canvas');
  const bctx = buf.getContext('2d', { willReadFrequently: true });
  let cur = 60, target = 60, drawn = -1;
  function sizePlate() {
    const r = plate.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    plate.width = Math.round(r.width * dpr); plate.height = Math.round(r.height * dpr);
    // ~4 CSS px per art pixel on desktop, a little finer on phones
    const px = r.width < 600 ? 3 : 4;
    buf.width = Math.max(80, Math.round(r.width / px));
    buf.height = Math.max(45, Math.round(r.height / px));
    drawn = -1;
  }
  function drawPlate(i) {
    const im = frames[i]; if (!im) return false;
    // Crop 7% off the right and bottom (hides the generator watermark), then cover-fit.
    const sw = im.naturalWidth * 0.93, sh = im.naturalHeight * 0.93;
    const br = buf.width / buf.height, sr = sw / sh;
    let cw = sw, ch = sh, cx = 0, cy = 0;
    if (sr > br) { cw = sh * br; cx = (sw - cw) * 0.35; } else { ch = sw / br; cy = (sh - ch) * 0.5; }
    bctx.drawImage(im, cx, cy, cw, ch, 0, 0, buf.width, buf.height);
    const d = bctx.getImageData(0, 0, buf.width, buf.height);
    const p = d.data;
    for (let k = 0; k < p.length; k += 4) {
      const y = (0.2126 * p[k] + 0.7152 * p[k + 1] + 0.0722 * p[k + 2]) / 255;
      const l = Math.min(255, Math.pow(y, 1.35) * 300) | 0; // night: push the sky down, keep stars and surf bright
      const o = l * 3;
      p[k] = LUT[o]; p[k + 1] = LUT[o + 1]; p[k + 2] = LUT[o + 2];
    }
    bctx.putImageData(d, 0, 0);
    pctx.imageSmoothingEnabled = false;
    pctx.drawImage(buf, 0, 0, plate.width, plate.height);
    if (frameLabel) frameLabel.textContent = `frame ${String(i + 1).padStart(3, '0')}/${N}`;
    drawn = i;
    return true;
  }

  // ---- scope (a small pixel canvas, upscaled)
  const S = 96; // art pixels across
  const sctx = scope ? scope.getContext('2d') : null;
  const sbuf = document.createElement('canvas'); sbuf.width = sbuf.height = S;
  const sb = sbuf.getContext('2d');
  const KIND_ANGLE = { reported: 35, event: 100, available: 170, confirmed: 200, early: 250, quiet: 300, insight: 330 };
  const now = Date.parse('2026-09-27T12:00:00Z');
  const blips = posts.map((p, idx) => {
    const age = Math.max(0, (now - Date.parse(p.date + 'T12:00:00Z')) / 864e5);
    const r = 8 + Math.min(1, Math.sqrt(age / 200)) * 34; // newest near the centre
    const a = ((KIND_ANGLE[p.kind] ?? 330) + ((idx * 23) % 26) - 13) * Math.PI / 180;
    return { p, a, r, x: S / 2 + Math.cos(a) * r, y: S / 2 + Math.sin(a) * r, lit: 0 };
  });
  let sweep = 0, hover = null;
  function px(x, y, c) { sb.fillStyle = c; sb.fillRect(Math.round(x), Math.round(y), 1, 1); }
  function drawScope() {
    if (!sctx) return;
    sb.fillStyle = COL.bg; sb.fillRect(0, 0, S, S);
    const c = S / 2;
    // rings (quarters of the scope, of course)
    for (const r of [11, 22, 33, 44]) {
      for (let t = 0; t < 360; t += 360 / (r * 5)) px(c + Math.cos(t * Math.PI / 180) * r, c + Math.sin(t * Math.PI / 180) * r, r === 44 ? COL.line : COL.faint);
    }
    for (let i = -44; i <= 44; i += 2) { px(c + i, c, COL.faint); px(c, c + i, COL.faint); }
    // stepped sweep: three hard bands trailing the beam
    const bands = [[0, 10, 0.55], [10, 22, 0.28], [22, 40, 0.12]];
    for (const [a0, a1, alpha] of bands) {
      sb.globalAlpha = alpha; sb.fillStyle = COL.accent;
      sb.beginPath(); sb.moveTo(c, c);
      sb.arc(c, c, 44, sweep - a1 * Math.PI / 180, sweep - a0 * Math.PI / 180);
      sb.closePath(); sb.fill();
    }
    sb.globalAlpha = 1;
    for (let r = 0; r <= 44; r++) px(c + Math.cos(sweep) * r, c + Math.sin(sweep) * r, COL.accent);
    // blips light up as the beam passes and fade after
    for (const b of blips) {
      let d = (sweep - b.a) % (Math.PI * 2); if (d < 0) d += Math.PI * 2;
      if (d < 0.12) b.lit = 1;
      b.lit *= 0.985;
      const col = COL.kinds[b.p.kind] || COL.ink;
      const on = b === hover ? 1 : Math.max(0.35, b.lit);
      sb.globalAlpha = on; sb.fillStyle = col;
      sb.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 1, 2, 2);
      if (b === hover) { sb.globalAlpha = 1; sb.strokeStyle = COL.hi; sb.lineWidth = 1; sb.strokeRect(Math.round(b.x) - 2.5, Math.round(b.y) - 2.5, 5, 5); }
    }
    sb.globalAlpha = 1;
    sctx.imageSmoothingEnabled = false;
    sctx.drawImage(sbuf, 0, 0, scope.width, scope.height);
  }
  function sizeScope() {
    if (!scope) return;
    const r = scope.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    scope.width = Math.round(r.width * dpr); scope.height = Math.round(r.height * dpr);
  }
  function setReadout(b) {
    if (!read) return;
    const p = b ? b.p : posts[0];
    if (!p) return;
    read.innerHTML = '';
    const a = document.createElement('a'); a.href = p.url; a.textContent = p.title;
    const m = document.createElement('span'); m.className = 'scope__meta'; m.textContent = `${p.label} · verdict: ${p.verdict}`;
    read.append(m, a);
  }
  if (scope) {
    scope.addEventListener('pointermove', (e) => {
      const r = scope.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * S, y = (e.clientY - r.top) / r.height * S;
      let best = null, bd = 64;
      for (const b of blips) { const d = (b.x - x) ** 2 + (b.y - y) ** 2; if (d < bd) { bd = d; best = b; } }
      if (best !== hover) { hover = best; setReadout(hover); scope.style.cursor = hover ? 'pointer' : 'crosshair'; }
    });
    scope.addEventListener('pointerleave', () => { hover = null; });
    scope.addEventListener('click', () => { if (hover) location.href = hover.p.url; });
    scope.setAttribute('role', 'img');
  }

  // ---- control: cursor on desktop, scroll on touch
  if (!coarse) {
    document.addEventListener('pointermove', (e) => { target = Math.round((1 - e.clientX / innerWidth) * (N - 1)); });
  } else {
    const onScroll = () => {
      const r = plate.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, 1 - (r.bottom / (innerHeight + r.height))));
      target = Math.round(t * (N - 1));
    };
    addEventListener('scroll', onScroll, { passive: true });
  }

  let visible = true;
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(plate.closest('section') || plate);
  function loop() {
    if (visible && !document.hidden) {
      if (cur !== target) cur += Math.sign(target - cur) * Math.min(2, Math.abs(target - cur));
      // Show the nearest frame that has arrived; keep moving toward the target regardless.
      let di = cur;
      for (let o = 1; !frames[di] && o < N; o++) { if (frames[cur - o]) di = cur - o; else if (frames[cur + o]) di = cur + o; }
      if (di !== drawn) drawPlate(di);
      sweep = (cur / (N - 1)) * Math.PI * 2 - Math.PI / 2;
      drawScope();
    }
    requestAnimationFrame(loop);
  }

  function resize() { sizePlate(); sizeScope(); drawPlate(cur); drawScope(); }
  addEventListener('resize', resize);
  addEventListener('qs:theme', () => { buildPalette(); drawn = -1; drawPlate(cur); drawScope(); });

  sizePlate(); sizeScope(); setReadout(null);
  load(59).then(() => {
    drawPlate(59); cur = target = 59; drawScope();
    if (reduce) return;
    const first = [];
    for (let i = 0; i < N; i += 4) first.push(load(i));
    Promise.all(first).then(() => { for (let i = 0; i < N; i++) if (!frames[i]) load(i); });
    requestAnimationFrame(loop);
  });
})();
