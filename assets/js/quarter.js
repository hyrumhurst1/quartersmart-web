// "Why QuarterSmart?" A pinned scroll story on a pixel canvas.
// Scroll: a little alien walks in and blasts the QuarterSmart circle; the
// three dark quarters crumble into pellets that tumble to the floor (and keep
// hopping, they're alive); the light quarter pops up, out and grows; a line
// runs to the copy; 25% counts up. Click the quarter: it dies the classic
// arcade way and respawns. Reduced motion: final state, no idle animation.
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

  const N = 12, c = (N - 1) / 2, r2 = (N / 2) ** 2 - 0.25;
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if ((x - c) ** 2 + (y - c) ** 2 > r2) continue;
    const q = x - c > 0 && y - c < 0;
    const near = Math.min(1, Math.hypot(x - 0, y - 6) / 12);   // distance from the impact side (left)
    const h = ((x * 73 + y * 131) % 97) / 97;
    cells.push({ x, y, q, near, seed: h, land: (h * 9) % 1, hop: h * 20 });
  }
  const BODY = ['#2a9a70', '#1d7a58', '#16664a'];
  const QUART = '#a9d99f', QHI = '#d9f2cf';
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const ALIEN = ['..x....x..', '...x..x...', '..xxxxxx..', '.xx.xx.xx.', 'xxxxxxxxxx', 'x.xxxxxx.x', 'x.x....x.x', '...xx.xx..'];
  const W_UNITS = N + 12, H_UNITS = N + 7, OX = 8, OY = 4;
  let U = 22;
  let died = -1e9;

  function size() {
    const box = cv.parentElement.getBoundingClientRect();
    U = Math.max(8, Math.floor(Math.min(box.width / W_UNITS, box.height / H_UNITS)));
    const w = W_UNITS * U, h = H_UNITS * U;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => v * v * (3 - 2 * v);
  const rect = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.ceil(w), Math.ceil(h)); };

  function draw(p, now) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const ox = OX * U, oy = OY * U, floor = oy + (N + 2) * U;
    const hitAt = 0.24;
    // ---- the alien: walks in, fires, hops, walks off
    const a = U * 0.62;
    const walkIn = ease(clamp((p - 0.06) / 0.16)), walkOut = ease(clamp((p - 0.5) / 0.14));
    const ax = -12 * a + walkIn * (ox - 13 * a - (-12 * a)) - walkOut * (ox + 2 * U);
    const hop = p > 0.36 && p < 0.48 ? Math.abs(Math.sin((p - 0.36) * 40)) * a * 3 : 0;
    const ay = floor - ALIEN.length * a - hop;
    const legs = Math.floor(now / 160) % 2;
    if (ax > -12 * a && ax < cv.width) {
      ALIEN.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch !== 'x') return;
        if (j === 7 && legs && (i === 3 || i === 7)) return;
        rect(ax + i * a, ay + j * a, a, a, (j === 3 && (i === 3 || i === 6)) ? css('--bg-0') : css('--event'));
      }));
      rect(ax + 10 * a, ay + 4 * a, 3 * a, a * 1.2, css('--warn'));               // blaster
      rect(ax + 12 * a, ay + 3.4 * a, a, a * 0.6, css('--warn'));
    }
    // ---- the blast
    if (p > hitAt - 0.05 && p < hitAt + 0.06) {
      const bx = ax + 13 * a, by = ay + 4.4 * a, tx = ox + U * 0.5, ty = oy + 6 * U;
      const flick = Math.floor(now / 50) % 2;
      const steps = 24;
      for (let s = 0; s <= steps; s++) { const k = s / steps; rect(bx + (tx - bx) * k, by + (ty - by) * k, a * 0.8, a * 0.8, flick ? css('--warn') : css('--fg-0')); }
      rect(tx - U, ty - U, U * 2, U * 2, 'rgba(255,240,200,.18)');
    }
    // ---- the body crumbles from the impact side, pellets tumble and keep hopping
    const crumble = clamp((p - hitAt) / 0.3);
    for (const k of cells) {
      if (k.q) continue;
      const t = clamp(crumble * 1.7 - k.near * 0.7 - k.seed * 0.15);
      const x0 = ox + k.x * U, y0 = oy + k.y * U;
      if (t <= 0) { rect(x0, y0, U, U, BODY[(k.x + k.y) % 3 === 0 ? 0 : (k.x < c ? 1 : 2)]); continue; }
      const s = Math.max(3, U * (1 - t * 0.72));
      const landY = floor - s - (k.land > 0.7 ? s : 0);
      const fall = t * t;
      let y = y0 + (landY - y0) * fall;
      const x = x0 + (k.seed - 0.5) * U * 3 * t;
      if (t >= 1 && !reduce) y -= Math.pow(Math.max(0, Math.sin(now / 420 + k.hop)), 12) * U * 0.9;
      rect(x + (U - s) / 2, y, s, s, t > 0.6 ? BODY[1] : BODY[0]);
    }
    // ---- the quarter: pops, grows; click to kill it
    const lift = ease(clamp((p - 0.34) / 0.2));
    const dx = lift * 1.6 * U, dy = -lift * 1.6 * U;
    const g = 1 + 0.4 * lift, Q = U * g;
    const ax2 = ox + (c + 1.5) * U + dx, ay2 = oy + (c - 0.5) * U + dy;
    const since = now - died;
    if (since < 1400) {
      const d = since / 1400;
      if (d < 0.55) {
        const spin = d / 0.55;
        ctx.save(); ctx.translate(ax2 + Q * 3, ay2 - Q * 3); ctx.rotate(spin * Math.PI * 3); ctx.scale(1 - spin * 0.8, 1 - spin * 0.8);
        for (const k of cells) if (k.q) rect((k.x + 1 - (c + 1.5)) * Q - Q * 3, (k.y - 1 - (c - 0.5)) * Q + Q * 3, Q, Q, QUART);
        ctx.restore();
      } else {
        const b = (d - 0.55) / 0.45;
        for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; rect(ax2 + Q * 3 + Math.cos(an) * b * U * 5, ay2 - Q * 3 + Math.sin(an) * b * U * 5, a, a, i % 2 ? QUART : css('--warn')); }
      }
    } else {
      const pop = since < 1800 ? ease((since - 1400) / 400) : 1;
      for (const k of cells) {
        if (!k.q) continue;
        const hi = lift > 0.5 && (k.x + k.y) % 4 === 0;
        const qx = ax2 + (k.x + 1 - (c + 1.5)) * Q, qy = ay2 + (k.y - 1 - (c - 0.5)) * Q;
        const cxq = ax2 + Q * 3, cyq = ay2 - Q * 3;
        rect(cxq + (qx - cxq) * pop, cyq + (qy - cyq) * pop, Q * pop, Q * pop, hi ? QHI : QUART);
      }
    }
    // ---- line and copy
    const lp = clamp((p - 0.5) / 0.16);
    const cr = copy.getBoundingClientRect(), vr = cv.getBoundingClientRect(), sr = line.parentElement.getBoundingClientRect();
    const qx = vr.left + ax2 + (N + 1 - (c + 1.5)) * Q + 10, qy = vr.top + ay2 - (c - 0.5) * Q + Q;
    line.style.left = (qx - sr.left) + 'px';
    line.style.top = (qy - sr.top) + 'px';
    line.style.width = Math.max(30, cr.left - qx - 24) + 'px';
    line.style.setProperty('--p', lp.toFixed(3));
    const cp = clamp((p - 0.6) / 0.18);
    copy.style.opacity = String(cp);
    copy.style.transform = `translateY(${(1 - cp) * 12}px)`;
    if (why) why.style.opacity = String(Math.max(0, 1 - clamp((p - 0.3) / 0.12)) * 0.9);
    if (hint) hint.style.opacity = String(1 - clamp(p / 0.08));
    if (count) count.textContent = Math.round(countTo * ease(clamp((p - 0.6) / 0.16))) + '%';
  }

  let visible = true;
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(sec);
  function frame(now) {
    if (visible) {
      const r = sec.getBoundingClientRect();
      const span = r.height - innerHeight;
      const p = reduce ? 1 : clamp(-r.top / (span || 1));
      draw(p, reduce ? 0 : now);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  cv.addEventListener('click', () => { if (performance.now() - died > 1800) died = performance.now(); });
  cv.style.cursor = 'pointer';
  cv.setAttribute('title', 'Click the quarter');
  addEventListener('resize', size);
  size();
  sec.classList.add('is-live');
  if (reduce) draw(1, 0); else requestAnimationFrame(frame);
})();
