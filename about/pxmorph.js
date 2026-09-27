// Pixel morph: every pixel of one piece of pixel art flies across and
// settles into the next piece, like an arcade attract screen changing scenes.
//   <figure class="morph"><img class="px" ...fallback>
//     <canvas data-morph="mark /assets/px/sprite-radar.png ..." data-w="144" data-h="104"
//             data-loop="1" data-hold="2600" data-still="0"></canvas></figure>
// "mark" is the QuarterSmart logo drawn in chunky cells. The canvas is a
// low-resolution buffer scaled up by CSS with pixelated sampling, so every
// frame stays on the pixel grid. It pauses off screen and in hidden tabs.
// Reduced motion: one still scene, no movement.
(() => {
  const els = document.querySelectorAll('canvas[data-morph]');
  if (!els.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the 14x14 mark from _partials/mark.html: "x,y,width" runs
  const MARK_D = '4,2,2 2,3,4 1,4,5 1,5,5 0,6,6 0,7,6 0,8,12 0,9,12 1,10,10 1,11,10 2,12,8 4,13,4';
  const MARK_L = '8,0,2 8,1,4 8,2,5 8,3,5 8,4,6 8,5,6';

  function markPts(W, H, cell) {
    const out = [];
    const ox = Math.round((W - 14 * cell) / 2), oy = Math.round((H - 14 * cell) / 2);
    const add = (spec, cols) => spec.split(' ').forEach((run) => {
      const [x0, y, w] = run.split(',').map(Number);
      for (let cx = x0; cx < x0 + w; cx++) {
        const c = cols[(cx + y) % cols.length];
        for (let j = 0; j < cell; j++) for (let i = 0; i < cell; i++) out.push({ x: ox + cx * cell + i, y: oy + y * cell + j, c });
      }
    });
    add(MARK_D, [[29, 122, 88], [42, 154, 112]]);
    add(MARK_L, [[169, 217, 159]]);
    return out;
  }

  function imgPts(img, W, H) {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, w, h).data;
    const ox = Math.round((W - w) / 2), oy = Math.round((H - h) / 2);
    const out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      if (d[k + 3] > 127) out.push({ x: ox + x, y: oy + y, c: [d[k], d[k + 1], d[k + 2]] });
    }
    return out;
  }

  const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // Pair two point sets along a diagonal sweep, so the art flows across
  // in a wave instead of swapping in place. Each pixel arcs on its own curve.
  function pair(A, B, W, H) {
    const k = (p) => p.x * 0.72 + p.y * 0.38 + Math.random() * 9;
    const a = A.map((p) => [k(p), p]).sort((m, n) => m[0] - n[0]).map((m) => m[1]);
    const b = B.map((p) => [k(p), p]).sort((m, n) => m[0] - n[0]).map((m) => m[1]);
    const n = Math.max(a.length, b.length), out = new Array(n);
    for (let i = 0; i < n; i++) {
      const s = a[Math.floor((i * a.length) / n)], t = b[Math.floor((i * b.length) / n)];
      const dx = t.x - s.x, dy = t.y - s.y, bend = (Math.random() - 0.5) * 0.9;
      out[i] = {
        sx: s.x, sy: s.y, tx: t.x, ty: t.y, sc: s.c, tc: t.c,
        cx: (s.x + t.x) / 2 - dy * bend, cy: (s.y + t.y) / 2 + dx * bend - Math.abs(dx) * 0.12,
        at: 0.34 * ((t.x / W) * 0.75 + (t.y / H) * 0.25) + Math.random() * 0.08,
      };
    }
    return out;
  }

  function scatter(B, W, H) {
    return B.map((p) => ({ x: Math.random() * W, y: H * (0.2 + Math.random() * 0.8), c: [p.c[0] * 0.4, p.c[1] * 0.4, p.c[2] * 0.4] }));
  }

  els.forEach(async (cv) => {
    const W = +cv.dataset.w || 144, H = +cv.dataset.h || 104;
    const loop = cv.dataset.loop !== '0';
    const HOLD = +cv.dataset.hold || 2600, MORPH = +cv.dataset.morphMs || 1800, SPAN = 0.58;
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const frame = g.createImageData(W, H);
    const buf = new Uint32Array(frame.data.buffer);
    const pack = (c) => ((255 << 24) | ((c[2] & 255) << 16) | ((c[1] & 255) << 8) | (c[0] & 255)) >>> 0;

    const srcs = cv.dataset.morph.trim().split(/\s+/);
    const scenes = (await Promise.all(srcs.map((s) => (s === 'mark' ? Promise.resolve('mark') : load(s)))))
      .map((im) => (im === 'mark' ? markPts(W, H, +cv.dataset.cell || 4) : im ? imgPts(im, W, H) : null))
      .filter(Boolean);
    if (!scenes.length) return;

    const put = (x, y, c) => {
      const ix = Math.round(x), iy = Math.round(y);
      if (ix >= 0 && iy >= 0 && ix < W && iy < H) buf[iy * W + ix] = pack(c);
    };
    const drawStill = (pts) => { buf.fill(0); for (const p of pts) put(p.x, p.y, p.c); g.putImageData(frame, 0, 0); };
    const fig = cv.closest('.morph');
    const live = () => fig && fig.classList.add('is-live');

    if (reduce) {
      const still = cv.dataset.still != null ? +cv.dataset.still : (loop ? 0 : scenes.length - 1);
      drawStill(scenes[Math.min(still, scenes.length - 1)]);
      live();
      return;
    }

    let idx = 0, parts = pair(scatter(scenes[0], W, H), scenes[0], W, H);
    let phase = 'morph', clock = 0, last = performance.now(), visible = true;
    const first = +cv.dataset.first || 0;
    clock = -first;
    new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(cv);
    live();

    const col = [0, 0, 0];
    function tick(now) {
      const dt = Math.min(now - last, 50); last = now;
      if (visible && !document.hidden) clock += dt;
      if (phase === 'morph') {
        const T = Math.max(0, clock) / MORPH;
        buf.fill(0);
        for (const p of parts) {
          let t = (T - p.at) / SPAN; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const e = ease(t), u = 1 - e;
          const x = u * u * p.sx + 2 * u * e * p.cx + e * e * p.tx;
          const y = u * u * p.sy + 2 * u * e * p.cy + e * e * p.ty;
          col[0] = p.sc[0] + (p.tc[0] - p.sc[0]) * e;
          col[1] = p.sc[1] + (p.tc[1] - p.sc[1]) * e;
          col[2] = p.sc[2] + (p.tc[2] - p.sc[2]) * e;
          put(x, y, col);
        }
        g.putImageData(frame, 0, 0);
        if (T >= 1) {
          drawStill(scenes[idx]);
          phase = 'hold'; clock = 0;
          if (!loop && idx === scenes.length - 1) return; // settled for good
        }
      } else if (clock >= HOLD) {
        const next = (idx + 1) % scenes.length;
        parts = pair(scenes[idx], scenes[next], W, H);
        idx = next; phase = 'morph'; clock = 0;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();
