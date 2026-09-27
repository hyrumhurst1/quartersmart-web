// Idle screen. After a minute without input the page dims into a terminal
// screensaver: the QuarterSmart gem drawn in block characters, cycling
// through text effects (decrypt, beam sweep, rain). Any input dismisses it.
const DG = ['#1d7a58', '#135c43', '#2a9a70'];
const LG = ['#9fe0b8', '#6fc49a', '#d6f7e4'];
const N = 9, C = 4, S = 4; // 9x9 gem, each art pixel = S columns x S/2 rows of half blocks
const GL = '█▓▒░▄▀#%&@*+=/\\01';

function gemCells() {
  const out = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x - C, dy = y - C;
    if (Math.abs(dx) + Math.abs(dy) > C) continue;
    if (dx >= 1 && dy <= -1) {
      const edge = Math.abs(dx) + Math.abs(dy) === C;
      const col = (edge && dy <= -2) ? LG[2] : ((x + y) % 2 === 0 || dx - dy > 3 ? LG[0] : LG[1]);
      out.push([x + 1, y - 1, col]);
    } else {
      const shade = (dx <= 0 && dy <= 0) ? 0 : (dx <= 0 ? 1 : 2);
      out.push([x, y, (x + y) % 2 === 0 ? [DG[2], DG[0], DG[1]][shade] : [DG[0], DG[1], DG[1]][shade]]);
    }
  }
  return out;
}

// Build a character grid: W cols x H rows; each cell {ch, color}
function gemGrid() {
  const W = 10 * S, H = 10 * S / 2;
  const grid = Array.from({ length: H }, () => Array.from({ length: W }, () => null));
  for (const [x, y, col] of gemCells()) {
    for (let i = 0; i < S; i++) for (let j = 0; j < S / 2; j++) grid[(y + 1) * S / 2 + j][x * S + i] = col;
  }
  return { grid, W, H };
}

let active = false;
export function start() {
  if (active || document.hidden) return;
  active = true;
  const { grid, W, H } = gemGrid();
  const root = document.createElement('div');
  root.className = 'idle';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<pre class="idle__art"></pre><p class="idle__word">QuarterSmart</p><p class="idle__line">the quarter that moves first</p><p class="idle__hint">press any key</p>';
  document.body.appendChild(root);
  const pre = root.querySelector('.idle__art');
  requestAnimationFrame(() => root.classList.add('is-on'));

  let mode = 0, t0 = performance.now(), raf = 0;
  const MODES = ['decrypt', 'hold', 'beam', 'hold', 'rain'];
  const DUR = { decrypt: 2200, hold: 2600, beam: 2400, rain: 2600 };
  const cells = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (grid[y][x]) cells.push({ x, y, col: grid[y][x], seed: Math.random() });

  function draw(t) {
    const m = MODES[mode];
    const p = Math.min(1, (t - t0) / DUR[m]);
    const out = Array.from({ length: H }, () => Array(W).fill(' '));
    for (const c of cells) {
      let ch = '█', col = c.col, x = c.x, y = c.y;
      if (m === 'decrypt') {
        const reveal = (c.x / W) * 0.7 + c.seed * 0.3;
        if (p < reveal - 0.1) continue;
        if (p < reveal + 0.1) { ch = GL[(Math.random() * GL.length) | 0]; col = '#a9d99f'; }
      } else if (m === 'beam') {
        const band = Math.abs(c.y / H - p * 1.4 + 0.2);
        if (band < 0.06) { col = '#ece4cc'; ch = '▓'; }
      } else if (m === 'rain') {
        const fall = Math.max(0, p * 1.6 - c.seed) * H;
        y = Math.round(c.y + fall);
        if (y >= H) continue;
        if (fall > 0) ch = GL[(c.x + y) % GL.length];
      }
      out[y][x] = `<span style="color:${col}">${ch}</span>`;
    }
    pre.innerHTML = out.map((r) => r.join('')).join('\n');
    if (p >= 1) { mode = (mode + 1) % MODES.length; t0 = t; }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);

  const stop = () => {
    cancelAnimationFrame(raf);
    root.classList.remove('is-on');
    setTimeout(() => root.remove(), 300);
    active = false;
    ['pointermove', 'keydown', 'pointerdown', 'touchstart', 'wheel'].forEach((ev) => removeEventListener(ev, stop));
  };
  setTimeout(() => ['pointermove', 'keydown', 'pointerdown', 'touchstart', 'wheel'].forEach((ev) => addEventListener(ev, stop, { passive: true })), 400);
}
