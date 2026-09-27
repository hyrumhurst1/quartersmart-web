// "Why QuarterSmart?" A pinned scroll story drawn on a pixel canvas: the
// QuarterSmart circle sits whole; as you scroll, its three dark quarters
// break into arcade pellets and fade, the light quarter pops up and out, a
// line runs from it to the copy, and 25% counts up. "25%? That's a quarter."
// Without JS, or with reduced motion, the final state shows.
(() => {
  const sec = document.querySelector('[data-quarter]');
  if (!sec) return;
  const cv = sec.querySelector('canvas');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const line = sec.querySelector('.qs-line');
  const copy = sec.querySelector('.qs-copy');
  const why = sec.querySelector('.qs-why');
  const hint = sec.querySelector('.qs-hint');
  const count = sec.querySelector('[data-count]');
  const countTo = count ? +count.dataset.count : 0;

  // 12px circle, like the mark; the top-right quarter is the brand piece
  const N = 12, c = (N - 1) / 2, r2 = (N / 2) ** 2 - 0.25;
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if ((x - c) ** 2 + (y - c) ** 2 > r2) continue;
    const q = x - c > 0 && y - c < 0;
    const far = Math.min(1, Math.hypot(x - 9, y - 2) / 11);
    cells.push({ x, y, q, far, seed: ((x * 73 + y * 131) % 97) / 97 });
  }
  const BODY = ['#2a9a70', '#1d7a58', '#16664a'];
  const QUART = '#a9d99f', QHI = '#d9f2cf';
  let U = 24; // CSS px per art pixel
  let last = -1;
  function size() {
    const box = cv.parentElement.getBoundingClientRect();
    U = Math.max(10, Math.floor(Math.min(box.width, box.height) / (N + 6)));
    const w = (N + 6) * U, h = (N + 6) * U;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    last = -1;
  }
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => v * v * (3 - 2 * v);
  function draw(p) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const ox = 3 * U, oy = 4 * U;
    const dis = clamp((p - 0.14) / 0.36);
    const lift = ease(clamp((p - 0.34) / 0.2));
    for (const k of cells) {
      if (k.q) continue;
      const t = clamp(dis * 1.6 - (1 - k.far) * 0.6 - k.seed * 0.2);
      const x = ox + k.x * U, y = oy + k.y * U;
      if (t <= 0) {
        ctx.fillStyle = BODY[(k.x + k.y) % 3 === 0 ? 0 : (k.x < c ? 1 : 2)];
        ctx.fillRect(x, y, U, U);
      } else {
        const s = Math.max(2, Math.round(U * (1 - t) * 0.9 + U * 0.18 * t));
        ctx.globalAlpha = 1 - t * 0.72;
        ctx.fillStyle = t > 0.6 ? '#4a5a4f' : BODY[1];
        ctx.fillRect(x + (U - s) / 2, y + (U - s) / 2, s, s);
        ctx.globalAlpha = 1;
      }
    }
    const dx = lift * 1.4 * U, dy = -lift * 1.4 * U;
    // the quarter grows as it pops: it is the point of the story
    const g = 1 + 0.38 * lift, Q = U * g;
    const ax = ox + (c + 1.5) * U + dx, ay = oy + (c - 0.5) * U + dy; // anchor: the quarter's inner corner
    for (const k of cells) {
      if (!k.q) continue;
      const hi = lift > 0.5 && (k.x + k.y) % 4 === 0;
      ctx.fillStyle = hi ? QHI : QUART;
      ctx.fillRect(ax + (k.x + 1 - (c + 1.5)) * Q, ay + (k.y - 1 - (c - 0.5)) * Q, Math.ceil(Q), Math.ceil(Q));
    }
    const lp = clamp((p - 0.5) / 0.16);
    const cr = copy.getBoundingClientRect(), vr = cv.getBoundingClientRect(), sr = line.parentElement.getBoundingClientRect();
    const qx = vr.left + ax + (N + 1 - (c + 1.5)) * Q + 10, qy = vr.top + ay + (0 - (c - 0.5)) * Q + Q;
    line.style.left = (qx - sr.left) + 'px';
    line.style.top = (qy - sr.top) + 'px';
    line.style.width = Math.max(30, cr.left - qx - 24) + 'px';
    line.style.setProperty('--p', lp.toFixed(3));
    const cp = clamp((p - 0.6) / 0.18);
    copy.style.opacity = String(cp);
    copy.style.transform = `translateY(${(1 - cp) * 12}px)`;
    if (why) why.style.opacity = String(Math.max(0, 1 - clamp((p - 0.42) / 0.12)) * 0.9);
    if (hint) hint.style.opacity = String(1 - clamp(p / 0.08));
    if (count) count.textContent = Math.round(countTo * ease(clamp((p - 0.6) / 0.16))) + '%';
  }
  function frame() {
    const r = sec.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = reduce ? 1 : clamp(-r.top / (span || 1));
    const q = Math.round(p * 300) / 300;
    if (q !== last) { last = q; draw(q); }
    if (!reduce) requestAnimationFrame(frame);
  }
  addEventListener('resize', size);
  size();
  sec.classList.add('is-live');
  frame();
})();
