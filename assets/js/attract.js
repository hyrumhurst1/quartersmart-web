// Attract mode: a faint pixel backdrop for the homepage hero, like an arcade
// cabinet idling between players. Three abstract vignettes loop:
//   1. chomp: the QuarterSmart circle eats a row of pellets, spins, and
//      collapses the classic way, leaving the popped quarter behind
//   2. flap:  the quarter becomes a little bird, threads two pipes, clips the
//      third and falls
//   3. race:  an 80s race car waits on the lights, revs, and drives off
//   4. stack: quarter-shaped blocks drop into a small well and clear a line
// Everything is drawn on a low-resolution buffer and scaled up with nearest-
// neighbour sampling. Pauses off screen; one still frame for reduced motion.
(() => {
  const cv = document.querySelector('canvas[data-attract]');
  if (!cv) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = cv.getContext('2d');
  const buf = document.createElement('canvas');
  const b = buf.getContext('2d');
  let W = 0, H = 0, S = 6;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  let C = {};
  const palette = () => { C = { bg: css('--bg-0'), dot: css('--line-2'), line: css('--line'), body: '#2a9a70', quart: '#a9d99f', bird: css('--warn'), rose: css('--event'), teal: css('--info'), cream: css('--fg-1') }; };
  palette();
  addEventListener('qs:theme', palette);

  function size() {
    const r = cv.getBoundingClientRect();
    S = r.width < 700 ? 5 : 6;
    W = Math.ceil(r.width / S); H = Math.ceil(r.height / S);
    buf.width = W; buf.height = H;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  }
  size();
  addEventListener('resize', size);

  const px = (x, y, c) => { b.fillStyle = c; b.fillRect(x | 0, y | 0, 1, 1); };
  const rect = (x, y, w, h, c) => { b.fillStyle = c; b.fillRect(x | 0, y | 0, w | 0, h | 0); };

  // circle with a wedge (mouth) of `open` radians centred on angle `dir`
  function chomper(cx, cy, r, dir, open, col) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r + r * 0.4) continue;
      let a = Math.atan2(y, x) - dir;
      a = Math.atan2(Math.sin(a), Math.cos(a));
      if (Math.abs(a) < open / 2 && (x || y)) continue;
      px(cx + x, cy + y, col);
    }
  }
  // the quarter wedge on its own (top-right quarter of a circle)
  function quarter(cx, cy, r, col) {
    for (let y = -r; y <= 0; y++) for (let x = 0; x <= r; x++) if (x * x + y * y <= r * r + r * 0.4 && (x > 0 && y < 0)) px(cx + x, cy + y, col);
  }

  const SCENES = [
    { name: 'chomp', dur: 9000 },
    { name: 'race', dur: 7000 },
    { name: 'flap', dur: 8000 },
    { name: 'stack', dur: 8000 },
  ];
  let si = 0, t0 = performance.now(), visible = true, raf = 0;

  function drawChomp(t) {
    const p = t / SCENES[0].dur;
    const y = Math.round(H * 0.76), r = 5;
    const x0 = Math.round(W * 0.64), x1 = Math.round(W * 0.9);
    const travel = Math.min(1, p / 0.62);
    const x = Math.round(x0 + (x1 - x0) * travel);
    for (let k = x0 + 6; k < W - 4; k += 6) if (k > x + 1) rect(k, y, 2, 2, C.dot);
    // power pellet
    if (x < x1 - 2) rect(x1 + 6, y - 1, 3, 3, C.cream);
    if (p < 0.62) {
      const open = 0.25 + Math.abs(Math.sin(t / 110)) * 1.15;
      chomper(x, y, r, 0, open, C.body);
    } else if (p < 0.74) {
      const q = (p - 0.62) / 0.12; // spin
      chomper(x, y, r, q * Math.PI * 4, 0.9, C.body);
    } else if (p < 0.9) {
      const q = (p - 0.74) / 0.16; // collapse: mouth opens to nothing
      chomper(x, y, r, -Math.PI / 2, 0.6 + q * (Math.PI * 2 - 0.6), C.body);
    } else {
      const q = (p - 0.9) / 0.1; // the quarter pops out and floats
      quarter(x + Math.round(q * 3), y - Math.round(q * 4), r, C.quart);
    }
  }

  function drawFlap(t) {
    const p = t / SCENES[2].dur;
    const ground = Math.round(H * 0.86);
    rect(Math.round(W * 0.62), ground, W, 1, C.line);
    const speed = W * 0.00006;
    const pipes = [0, 1, 2].map((i) => ({ x: Math.round(W * 0.86 + i * 30 - t * speed), gap: Math.round(H * (0.42 + ((i * 37) % 3) * 0.1)) }));
    for (const pp of pipes) {
      if (pp.x < W * 0.63 || pp.x > W) continue;
      rect(pp.x, 0, 5, pp.gap - 9, C.line); rect(pp.x - 1, pp.gap - 11, 7, 2, C.line);
      rect(pp.x, pp.gap + 9, 5, ground - pp.gap - 9, C.line); rect(pp.x - 1, pp.gap + 9, 7, 2, C.line);
    }
    const bx = Math.round(W * 0.72);
    const crash = 0.7;
    let by;
    if (p < crash) {
      const target = pipes.find((pp) => pp.x > bx - 3) || pipes[0];
      by = Math.round(target.gap + Math.sin(t / 260) * 5 + (p > 0.55 ? (p - 0.55) * 60 : 0));
    } else {
      const q = (p - crash) / (1 - crash);
      by = Math.round(Math.min(ground - 3, H * 0.5 + q * q * H * 0.9));
    }
    const wing = p < crash ? (Math.floor(t / 140) % 2) : 0;
    rect(bx, by, 5, 3, C.bird); px(bx + 5, by + 1, C.rose); px(bx + 3, by, C.bg);
    rect(bx + 1, by + (wing ? -1 : 2), 2, 1, C.bird);
  }

  function drawStack(t) {
    const p = t / SCENES[3].dur;
    const wx = Math.round(W * 0.8), ww = 16, floor = Math.round(H * 0.86);
    rect(wx - 1, floor - 30, 1, 31, C.line); rect(wx + ww, floor - 30, 1, 31, C.line); rect(wx - 1, floor, ww + 2, 1, C.line);
    const shapes = [[[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [2, 2], [3, 2], [2, 3], [3, 3]], [[2, 0], [3, 0], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2], [0, 3], [1, 3]]];
    const cols = [C.quart, C.teal, C.bird, C.rose];
    const drops = [{ x: 0, at: 0.05 }, { x: 4, at: 0.2 }, { x: 8, at: 0.35 }, { x: 12, at: 0.5 }];
    const cleared = p > 0.72;
    drops.forEach((d, i) => {
      if (p < d.at) return;
      const fall = Math.min(1, (p - d.at) / 0.12);
      const top = Math.round(floor - 30 + fall * 26);
      const shape = shapes[i % 2];
      const flash = p > 0.66 && p < 0.72 && Math.floor(t / 80) % 2;
      for (const [sx, sy] of shape) {
        if (cleared && sy >= 2) continue; // the bottom line clears
        const yy = top + sy + (cleared ? 2 : 0);
        rect(wx + d.x + sx, yy, 1, 1, flash ? C.cream : cols[i]);
      }
    });
  }

  // a low, wide 80s race car idles on the grid, revs, then drives off right
  function car(x, y, col, body2) {
    rect(x + 3, y, 9, 1, col);            // roof line
    rect(x + 2, y + 1, 11, 2, col);       // cabin
    rect(x + 5, y + 1, 3, 1, C.teal);     // windshield
    rect(x, y + 3, 17, 2, col);           // body
    rect(x + 14, y + 3, 3, 1, body2);     // nose stripe
    rect(x - 1, y + 2, 2, 2, body2);      // spoiler
    rect(x + 2, y + 5, 3, 2, C.dot); rect(x + 12, y + 5, 3, 2, C.dot); // wheels
    px(x + 17, y + 4, C.bird);            // headlight
  }
  function drawRace(t) {
    const p = t / SCENES[1].dur;
    const road = Math.round(H * 0.8);
    rect(Math.round(W * 0.62), road + 7, W, 1, C.line);
    for (let k = Math.round(W * 0.64); k < W; k += 10) rect(k - Math.round((p > 0.45 ? (p - 0.45) * 900 : 0)) % 10, road + 10, 4, 1, C.dot);
    // start lights: three pips, then go
    const lx = Math.round(W * 0.8), ly = Math.round(H * 0.62);
    for (let i = 0; i < 3; i++) {
      const on = p > 0.1 + i * 0.1;
      const go = p > 0.42;
      rect(lx + i * 5, ly, 3, 3, go ? C.quart : (on ? C.rose : C.line));
    }
    let x = Math.round(W * 0.7);
    const shake = p < 0.42 && p > 0.1 ? (Math.floor(t / 60) % 2) : 0;
    if (p > 0.42) {
      const q = (p - 0.42) / 0.58;
      x += Math.round(q * q * W * 0.45);
      for (let k = 1; k < 5; k++) rect(x - 4 - k * 7, road + 2 + (k % 3), 5 - k, 1, C.dot); // speed lines
    }
    if (x < W + 2) car(x, road - shake, C.rose, C.cream);
    if (p < 0.42 && p > 0.1) { px(x - 3, road + 4 - (Math.floor(t / 90) % 3), C.dot); px(x - 5, road + 3, C.dot); } // exhaust puffs
  }

  function frame(now) {
    if (visible && !document.hidden) {
      let t = now - t0;
      if (t > SCENES[si].dur) { si = (si + 1) % SCENES.length; t0 = now; t = 0; }
      b.clearRect(0, 0, W, H);
      const name = SCENES[si].name;
      if (name === 'chomp') drawChomp(t); else if (name === 'race') drawRace(t); else if (name === 'flap') drawFlap(t); else drawStack(t);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(buf, 0, 0, cv.width, cv.height);
    }
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  if (reduce) { drawChomp(SCENES[0].dur * 0.3); ctx.imageSmoothingEnabled = false; ctx.drawImage(buf, 0, 0, cv.width, cv.height); return; }
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(cv);
  raf = requestAnimationFrame(frame);
})();
