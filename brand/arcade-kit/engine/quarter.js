// "Why QuarterSmart?" A pinned scroll story, played out inside a little
// terminal window on one crisp pixel grid. Scroll: a UFO drifts in and beams
// up the first dark quarter of the QuarterSmart circle; it sets a tiny alien
// down on the far side of the field, who picks off the other two dark quarters
// with small blaster bolts from across the screen (the pieces tumble to the
// floor and keep hopping, they're alive); the UFO beams the alien back up and
// leaves; the light quarter lifts out and grows; a line runs to the copy and
// 25% counts up. Click the quarter to lose a life; three and it asks you to
// continue. It plays once, at its own calm pace, when the window scrolls into
// view (every frame is a pure function of its clock); afterwards a tiny UFO
// keeps drifting through the far sky. "replay" runs it again.
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
  const scoreEl = sec.querySelector('[data-score]');
  const livesEl = sec.querySelector('[data-lives]');
  const replay = sec.querySelector('[data-replay]');
  const TOTAL = 13000;                                            // ms for the whole story
  const countTo = count ? +count.dataset.count : 0;
  const css = (v, d) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || d;
  let K = {};
  const pal = () => { K = { hi: css('--fg-0', '#ece4cc'), cream: css('--fg-1', '#cbc3ab'), dim: css('--line-2', '#4a5a4f'), line: css('--line', '#2c3730'), bg: css('--bg-0', '#121814'),
    butter: css('--warn', '#dfc07f'), rose: css('--event', '#d99bb8'), teal: css('--info', '#86c3ba'), sage: '#a9d99f', light: '#d9f2cf', b0: '#2a9a70', b1: '#1d7a58', b2: '#16664a' }; };
  pal();

  // ---- the art grid
  let AW = 160, AH = 96, OX = 66, OY = 22, FLOOR = 78, ALX = 14, P = 5, narrow = false;
  const N = 12, CS = 4, c = (N - 1) / 2, r2 = (N / 2) ** 2 - 0.25;
  const FIRE0 = 0.35, GAP = 0.02, TRAVEL = 0.014;

  // ---- the circle: TL / TR (the light quarter) / BL / BR
  let cells = [], TL = [], SHOTS = [], HILLS = [], DUST = [];
  function layout() {
  cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if ((x - c) ** 2 + (y - c) ** 2 > r2) continue;
    const qd = (x > c ? 1 : 0) + (y > c ? 2 : 0);
    const h = ((x * 73 + y * 131) % 97) / 97;
    cells.push({ x, y, qd, h, ax: OX + x * CS, ay: OY + y * CS, shade: (x + y) % 3 === 0 ? 0 : x < c ? 1 : 2 });
  }
  // UFO takes the top-left quarter, top rows first
  TL = cells.filter((k) => k.qd === 0).sort((m, n) => m.y - n.y || n.x - m.x);
  TL.forEach((k, i) => { k.ta = 0.125 + i / TL.length * 0.09; });
  // the alien's shots: bottom-left first (nearest), then bottom-right
  SHOTS = [];
  const aim = (qd, pts) => pts.forEach(([gx, gy]) => SHOTS.push({ qd, tx: OX + gx * CS + 2, ty: OY + gy * CS + 2 }));
  aim(2, [[2, 7], [4, 9], [1, 9], [5, 11], [3, 6]]);
  aim(3, [[7, 11], [7, 8], [10, 8], [9, 10], [11, 7]]);
  SHOTS.forEach((s, i) => { s.t = FIRE0 + i * GAP; s.hit = s.t + TRAVEL; });
  for (const k of cells) {
    if (k.qd !== 2 && k.qd !== 3) continue;
    const cx = k.ax + 2, cy = k.ay + 2;
    let best = null;
    for (const s of SHOTS) if (s.qd === k.qd && Math.hypot(cx - s.tx, cy - s.ty) < 7.5) { best = s; break; }
    k.tc = best ? best.hit : 0.56 + k.h * 0.02;                      // leftovers crumble in the aftershock
    k.dir = best ? Math.sign(cx - (ALX + 9)) || 1 : 1;
  }
  }
  const ALIEN = [['..x..x..', '.xxxxxx.', 'xx.xx.xx', 'xxxxxxxx', 'x.xxxx.x', 'x.x..x.x'], ['..x..x..', '.xxxxxx.', 'xx.xx.xx', 'xxxxxxxx', '.xxxxxx.', '.x....x.']];
  const UFO = ['.....tttt.....', '....tttttt....', '.cccccccccccc.', 'cccccccccccccc', '..l..l..l..l..'];

  // ---- helpers
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (v) => v * v * (3 - 2 * v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const put = (x, y, w, h, col, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, Math.max(1, Math.round(w)) * P, Math.max(1, Math.round(h)) * P); };
  const spr = (x, y, rows, map, a = 1, clipY = -1e9) => rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== '.' && map[ch] && y + j >= clipY) put(x + i, y + j, 1, 1, map[ch], a); }));

  function size() {
    const box = cv.parentElement.getBoundingClientRect();
    narrow = box.width < 700;
    P = Math.max(2, Math.floor(box.height / (narrow ? 150 : 104)));
    AW = Math.floor(box.width / P); AH = Math.floor(box.height / P);
    FLOOR = AH - (narrow ? Math.round(AH * 0.5) : 16);
    OY = FLOOR - 8 - N * CS;
    OX = narrow ? Math.round(AW * 0.56) - 24 : Math.round(AW * 0.36) - 24;
    ALX = Math.max(4, OX - (narrow ? 44 : 60));
    HILLS = []; for (let x = 0; x < AW; x++) HILLS.push(Math.round(FLOOR - 8 - Math.max(0, Math.sin(x * 0.045 + 0.6) * 6 + Math.sin(x * 0.13) * 2.5)));
    DUST = []; for (let i = 0; i < 26; i++) { const e = i % 4, t = ((i * 7919) % 1000) / 1000; DUST.push(e === 0 ? [t * AW, 2 + (i % 3)] : e === 1 ? [2 + (i % 3) * 3, t * (FLOOR - 20)] : e === 2 ? [AW - 3 - (i % 3) * 3, t * (FLOOR - 20)] : [t * AW, 6 + (i % 5)]); }
    layout();
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.style.width = AW * P + 'px'; cv.style.height = AH * P + 'px';
    cv.width = Math.round(AW * P * dpr); cv.height = Math.round(AH * P * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // UFO position over the story
  function ufoAt(p) {
    const hy = Math.max(4, OY - 18), ly = Math.max(6, FLOOR - 40);
    const legs = [[0.02, AW + 18, hy - 12], [0.11, OX + 6, hy], [0.23, OX + 6, hy], [0.29, ALX - 3, ly], [0.35, ALX - 3, ly], [0.38, ALX - 3, ly - 5], [0.53, ALX - 3, ly - 5], [0.56, ALX - 3, ly], [0.63, ALX - 3, ly], [0.73, -26, -10]];
    if (p <= legs[0][0]) return [legs[0][1], legs[0][2]];
    for (let i = 1; i < legs.length; i++) if (p <= legs[i][0]) { const [t0, x0, y0] = legs[i - 1], [t1, x1, y1] = legs[i]; const t = ease((p - t0) / (t1 - t0)); return [lerp(x0, x1, t), lerp(y0, y1, t)]; }
    return null;
  }

  let died = -1e9, deaths = 0, contAt = -1e9;
  function draw(p, now) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    // ---- the world: stars only around the rim, a small moon, far hills with a signal tower, the floor
    DUST.forEach(([x, y], i) => { const tw = reduce ? 1 : (Math.sin(now / 1800 + i * 1.7) + 1) / 2; put(x, y, 1, 1, tw > 0.8 ? K.cream : K.dim, 0.5 + tw * 0.4); });
    const mx = AW - (narrow ? 14 : 22), my = narrow ? 8 : 10;
    for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { if (x * x + y * y > 18) continue; const bx = x + 2, by = y - 1; if (bx * bx + by * by <= 14) continue; put(mx + x, my + y, 1, 1, (x + y) < -2 ? K.hi : K.butter); }
    for (let x = 0; x < AW; x++) put(x, HILLS[x], 1, FLOOR - HILLS[x], K.line, 0.55);
    const tx = Math.min(AW - 4, Math.max(4, ALX + 26)), ty = HILLS[tx] - 9;
    put(tx, ty, 1, 9, K.dim); put(tx - 1, ty + 3, 3, 1, K.dim); put(tx - 2, ty + 6, 5, 1, K.dim);
    if (Math.floor(now / 700) % 2 || reduce) put(tx, ty - 1, 1, 1, K.rose);
    for (let x = 0; x < AW; x += 2) put(x, FLOOR, 1, 1, K.dim);
    for (let x = 3; x < AW; x += 11) put(x, FLOOR + 1, 1, 1, K.line);

    // ---- the circle
    const ufo = ufoAt(p);
    const beamOn = (a, b) => p > a && p < b;
    for (const k of cells) {
      if (k.qd === 1) continue;
      const col = [K.b0, K.b1, K.b2][k.shade];
      if (k.qd === 0) {                                             // abducted, one by one, up the beam
        const q = ease(clamp((p - k.ta) / 0.05));
        if (q >= 1) continue;
        if (q <= 0 || !ufo) { put(k.ax, k.ay, CS, CS, col); continue; }
        const s = Math.max(1, Math.round(CS * (1 - q * 0.8)));
        put(lerp(k.ax, ufo[0] + 7 - s / 2, q) + Math.sin(q * 9 + k.h * 6) * (1 - q) * 1.5, lerp(k.ay, ufo[1] + 4, q), s, s, q > 0.6 ? K.sage : col);
        continue;
      }
      const t = p - k.tc;                                           // shot pieces fall, then live on the floor
      if (t <= 0) { put(k.ax, k.ay, CS, CS, col); continue; }
      const f = clamp(t / 0.07), s = f < 1 ? CS : CS - 1;
      const landY = FLOOR - s - (k.h > 0.72 ? s : 0);
      let y = lerp(k.ay, landY, f * f);
      const x = k.ax + k.dir * (3 + k.h * 7) * Math.sin(f * Math.PI / 2);
      if (f >= 1 && !reduce) y -= Math.pow(Math.max(0, Math.sin(now / 460 + k.h * 20)), 14) * 3;
      put(x, y, s, s, f > 0.5 ? K.b1 : col);
    }

    // ---- the beam (a soft, flickering cone under the UFO)
    if (ufo && (beamOn(0.115, 0.225) || beamOn(0.28, 0.345) || beamOn(0.555, 0.625))) {
      const bx = ufo[0] + 7, by = ufo[1] + 5, bot = beamOn(0.115, 0.225) ? OY + 24 : FLOOR;
      for (let y = by; y < bot; y++) { const w = 2 + Math.floor((y - by) / 3); put(bx - w / 2, y, w, 1, K.sage, (y + Math.floor(now / 90)) % 4 ? 0.13 : 0.24); }
    }

    // ---- the alien: lowered in the beam, fires across the field, hops, beamed back up
    let ay = null;
    if (p > 0.28 && p < 0.625 && ufo) {
      const down = ease(clamp((p - 0.285) / 0.055)), up = ease(clamp((p - 0.565) / 0.05));
      const ground = FLOOR - 6, top = ufo[1] + 5;
      ay = up > 0 ? lerp(ground, top, up) : lerp(top, ground, down);
      if (p > 0.52 && p < 0.555) ay -= Math.abs(Math.sin((p - 0.52) / 0.035 * Math.PI * 2)) * 4;
    }
    const recoil = SHOTS.some((s) => p > s.t && p < s.t + 0.004) ? -1 : 0;
    if (ay !== null) {
      const frame = Math.floor(now / 220) % 2;
      spr(ALX + recoil, ay, ALIEN[frame], { x: K.rose }, 1, ufo ? ufo[1] + 5 : -1e9);
      put(ALX + 8 + recoil, ay + 3, 2, 1, K.butter);               // blaster
    }
    // ---- the bolts: small, fast, from across the field; a spark where they land
    for (const s of SHOTS) {
      const q = (p - s.t) / TRAVEL;
      const sx = ALX + 10, sy = FLOOR - 3;
      if (q > 0 && q < 1) {
        const x = lerp(sx, s.tx, q), y = lerp(sy, s.ty, q), ang = Math.atan2(s.ty - sy, s.tx - sx);
        for (let i = 0; i < 4; i++) put(x - Math.cos(ang) * i, y - Math.sin(ang) * i, 1, 1, i === 0 ? K.hi : i < 3 ? K.butter : K.rose, 1 - i * 0.2);
        if (q < 0.18) put(sx, sy - 1, 1, 3, K.hi, 0.8), put(sx - 1, sy, 3, 1, K.hi, 0.8);
      } else if (q >= 1 && q < 1.5) {
        const r = q < 1.25 ? 1 : 2;
        put(s.tx, s.ty, 1, 1, K.hi); for (let i = 1; i <= r; i++) { put(s.tx + i, s.ty, 1, 1, K.butter); put(s.tx - i, s.ty, 1, 1, K.butter); put(s.tx, s.ty + i, 1, 1, K.butter); put(s.tx, s.ty - i, 1, 1, K.butter); }
      }
    }
    // ---- the UFO
    if (ufo) {
      const blink = Math.floor(now / 200) % 4;
      let li = 0;
      UFO.forEach((row, j) => [...row].forEach((ch, i) => {
        if (ch === '.') return;
        const col = ch === 't' ? K.teal : ch === 'c' ? K.cream : (li++ % 4 === blink ? (li % 2 ? K.rose : K.butter) : K.dim);
        put(ufo[0] + i, ufo[1] + j, 1, 1, col);
      }));
    }

    // ---- afterwards: a tiny UFO drifting through the far sky, lights blinking
    if (p >= 0.74 && !reduce) {
      const q = ((now / 1000) % 16) / 16, x = -8 + q * (AW + 16), y = 4 + Math.round(Math.sin(now / 900) * 1);
      if (q < 0.97) { put(x + 1, y, 2, 1, K.teal); put(x, y + 1, 4, 1, K.cream); put(x + (Math.floor(now / 300) % 2 ? 0 : 3), y + 2, 1, 1, K.rose); }
    }

    // ---- the light quarter: lifts out and grows; click it to lose a life
    const lift = ease(clamp((p - 0.56) / 0.1));
    const G = CS + lift, dx = lift * 7, dy = -lift * 7;
    const qx0 = OX + (c + 0.5) * CS + dx, qy0 = OY + dy;             // top-left of the quarter's box
    const since = now - died;
    const quarter = cells.filter((k) => k.qd === 1);
    if (since < 1400) {
      const d = since / 1400;
      const ccx = qx0 + 3 * G, ccy = qy0 + 3 * G;
      if (d < 0.55) {
        const sp = d / 0.55, ang = sp * Math.PI * 3, sc = 1 - sp * 0.8;
        for (const k of quarter) { const lx = (k.x - 6 + 0.5) * G - 3 * G, ly = (k.y + 0.5) * G - 3 * G; put(ccx + (lx * Math.cos(ang) - ly * Math.sin(ang)) * sc - 1, ccy + (lx * Math.sin(ang) + ly * Math.cos(ang)) * sc - 1, Math.max(1, G * sc), Math.max(1, G * sc), K.sage); }
      } else {
        const bq = (d - 0.55) / 0.45;
        for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; put(ccx + Math.cos(an) * bq * 22, ccy + Math.sin(an) * bq * 22, 1, 1, i % 2 ? K.sage : K.butter, 1 - bq * 0.6); }
      }
    } else {
      const pop = since < 1800 ? ease((since - 1400) / 400) : 1;
      const ccx = qx0 + 3 * G, ccy = qy0 + 3 * G;
      for (const k of quarter) {
        const x = qx0 + (k.x - 6) * G, y = qy0 + k.y * G;
        const hi = lift > 0.5 && (k.x + k.y) % 4 === 0;
        put(lerp(ccx, x, pop), lerp(ccy, y, pop), Math.max(1, G * pop), Math.max(1, G * pop), hi ? K.light : K.sage);
      }
    }

    // ---- HUD + DOM choreography
    if (scoreEl) {
      let n = 0;
      for (const k of cells) if ((k.qd === 0 && p > k.ta + 0.05) || ((k.qd === 2 || k.qd === 3) && p > k.tc)) n++;
      scoreEl.textContent = String(n * 25).padStart(6, '0');
    }
    const lp = clamp((p - 0.63) / 0.08);
    const cr = copy.getBoundingClientRect(), vr = cv.getBoundingClientRect(), sr = line.parentElement.getBoundingClientRect();
    const lx = vr.left + (qx0 + 6 * G + 2) * P, ly = vr.top + (qy0 + 1.5 * G) * P;
    line.style.left = (lx - sr.left) + 'px';
    line.style.top = (ly - sr.top) + 'px';
    line.style.width = Math.max(24, cr.left - lx - 20) + 'px';
    line.style.setProperty('--p', lp.toFixed(3));
    const cp = clamp((p - 0.63) / 0.12);
    copy.style.opacity = String(cp);
    copy.style.transform = `translateY(${(1 - cp) * 12}px)`;
    if (why) why.style.opacity = String((1 - clamp((p - 0.04) / 0.08)) * 0.9);
    if (hint) hint.style.opacity = String(1 - clamp(p / 0.06));
    if (count) count.textContent = Math.round(countTo * ease(clamp((p - 0.63) / 0.14))) + '%';
    if (replay) replay.hidden = p < 1;
    ctx.globalAlpha = 1;
  }

  function lives() {
    if (!livesEl) return;
    const cont = performance.now() - contAt < 2200;
    livesEl.classList.toggle('is-continue', cont);
    [...livesEl.children].forEach((i, n) => i.classList.toggle('is-lost', !cont && n >= 3 - deaths));
  }
  let visible = true, t0 = -1;
  new IntersectionObserver((es) => {
    for (const e of es) { visible = e.isIntersecting; if (e.intersectionRatio >= 0.55 && t0 < 0) t0 = performance.now(); }
  }, { threshold: [0, 0.55] }).observe(sec.querySelector('.qs-win'));
  function frame(now) {
    if (visible) draw(t0 < 0 ? 0 : clamp((now - t0) / TOTAL), now);
    requestAnimationFrame(frame);
  }
  if (replay) replay.addEventListener('click', () => { t0 = performance.now(); replay.hidden = true; });
  cv.addEventListener('click', () => {
    const now = performance.now();
    if (now - died < 1800) return;
    died = now; deaths++;
    if (deaths >= 3) { deaths = 0; contAt = now + 1400; setTimeout(lives, 1400); setTimeout(lives, 3700); }
    lives();
  });
  cv.style.cursor = 'pointer';
  cv.setAttribute('title', 'Click the quarter');
  addEventListener('resize', size);
  addEventListener('qs:theme', pal);
  size();
  draw(0, 0);
  sec.classList.add('is-live');
  if (reduce) draw(1, 0); else requestAnimationFrame(frame);
})();
