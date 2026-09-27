// The scrolling quarter. A pinned section: the QuarterSmart gem is drawn in
// block characters; as you scroll, the three dark quarters decrypt into
// glyphs and fall away from the far edge, the light-green quarter lifts up
// and out, a line draws from it, and the copy types in.
// Without JS (or with reduced motion) the section shows its final state.
(() => {
  const sec = document.querySelector('[data-quarter]');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DG = ['#1d7a58', '#135c43', '#2a9a70'];
  const LG = ['#9fe0b8', '#6fc49a', '#d6f7e4'];
  const N = 9, C = 4;
  const GL = '▓▒░#%&@*+=/\\01';
  const S = innerWidth < 700 ? 4 : 6;           // columns per art pixel
  const R = S / 2;                               // rows per art pixel (half-height cells)
  const W = 10 * S, H = 10 * R;

  // cells: [x, y, colour, isQuarter, far]
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = x - C, dy = y - C;
    if (Math.abs(dx) + Math.abs(dy) > C) continue;
    const q = dx >= 1 && dy <= -1;
    let col;
    if (q) {
      const edge = Math.abs(dx) + Math.abs(dy) === C;
      col = (edge && dy <= -2) ? LG[2] : ((x + y) % 2 === 0 || dx - dy > 3 ? LG[0] : LG[1]);
    } else {
      const shade = (dx <= 0 && dy <= 0) ? 0 : (dx <= 0 ? 1 : 2);
      col = (x + y) % 2 === 0 ? [DG[2], DG[0], DG[1]][shade] : [DG[0], DG[1], DG[1]][shade];
    }
    const far = Math.min(1, Math.hypot(x - 6, y - 2) / 8);
    for (let i = 0; i < S; i++) for (let j = 0; j < R; j++) {
      const cx = (q ? x + 1 : x) * S + i, cy = (q ? y : y + 1) * R + j;
      cells.push({ x: cx, y: cy, col, q, far, seed: ((cx * 73 + cy * 131) % 97) / 97 });
    }
  }

  const body = sec.querySelector('.qs-gem__body');
  const quarter = sec.querySelector('.qs-gem__q');
  const line = sec.querySelector('.qs-line');
  const copy = sec.querySelector('.qs-copy');
  const typed = [...sec.querySelectorAll('[data-type]')];
  const finals = typed.map((el) => el.textContent);
  const why = sec.querySelector('.qs-why');
  const hint = sec.querySelector('.qs-hint');
  const count = sec.querySelector('[data-count]');
  const countTo = count ? +count.dataset.count : 0;

  function render(layer, want, p) {
    const out = Array.from({ length: H }, () => Array(W).fill(' '));
    for (const c of cells) {
      if (c.q !== want) continue;
      let ch = '█', col = c.col;
      if (!c.q) {
        const t = Math.min(1.45, Math.max(0, (p - 0.12) / 0.4) * 1.9 - (1 - c.far) * 0.55);
        if (t > 0) {
          if (c.seed < t - 0.35) { if (c.seed < 0.12) { ch = '·'; col = '#4a5a4f'; } else continue; }
          else if (c.seed < t) { ch = GL[(c.x * 7 + c.y * 3 + Math.floor(p * 40)) % GL.length]; col = '#6f8a76'; }
        }
      }
      out[c.y][c.x] = `<span style="color:${col}">${ch}</span>`;
    }
    layer.innerHTML = out.map((r) => r.join('')).join('\n');
  }

  // rightmost drawn glyph of the quarter layer (the pre is as wide as the gem)
  function qRight_(layer) {
    let m = 0;
    layer.querySelectorAll('span').forEach((sp) => { const r = sp.getBoundingClientRect(); if (r.right > m) m = r.right; });
    return m;
  }
  let last = -1;
  function frame() {
    const r = sec.getBoundingClientRect();
    const span = r.height - innerHeight;
    const p = reduce ? 1 : Math.min(1, Math.max(0, -r.top / (span || 1)));
    const qp = Math.round(p * 200) / 200;
    if (qp !== last) {
      last = qp;
      render(body, false, qp);
      // start centred in the stage, glide into the left column as the story appears
      const gemEl = body.parentElement, stage = gemEl.parentElement;
      if (sec.classList.contains('qhero') && innerWidth > 900) {
        gemEl.style.transform = 'none';
        const gr = gemEl.getBoundingClientRect(), sr = stage.getBoundingClientRect();
        const dx = (sr.left + sr.width / 2) - (gr.left + gr.width / 2);
        const m = Math.max(0, Math.min(1, (qp - 0.4) / 0.22));
        const e2 = m * m * (3 - 2 * m);
        gemEl.style.transform = `translateX(${(dx * (1 - e2)).toFixed(1)}px)`;
      }
      if (!quarter.dataset.drawn) { render(quarter, true, qp); quarter.dataset.drawn = '1'; }
      const lift = Math.max(0, Math.min(1, (qp - 0.34) / 0.2));
      const e = 1 - Math.pow(1 - lift, 3);
      quarter.style.transform = `translate(${e * 1.2}em, ${-e * 1.2}em)`;
      quarter.classList.toggle('is-lit', lift > 0.6);
      const lp = Math.max(0, Math.min(1, (qp - 0.52) / 0.18));
      line.style.setProperty('--p', lp.toFixed(3));
      // run the line from the lifted quarter's right edge to the copy
      const g = line.parentElement.getBoundingClientRect(), qr = quarter.getBoundingClientRect(), cr = copy.getBoundingClientRect();
      const qRight = quarter.querySelector('span') ? qRight_(quarter) : qr.right;
      line.style.left = (qRight - g.left + 12) + 'px';
      line.style.top = (qr.top - g.top + qr.height * 0.18) + 'px';
      line.style.width = Math.max(40, cr.left - qRight - 36) + 'px';
      const cp = Math.max(0, Math.min(1, (qp - 0.66) / 0.24));
      copy.style.opacity = cp > 0 ? 1 : 0;
      if (why) why.style.opacity = String(Math.max(0, 1 - Math.max(0, qp - 0.5) / 0.14) * 0.85);
      if (hint) hint.style.opacity = String(Math.max(0, 1 - qp / 0.08));
      if (count) {
        const k = Math.max(0, Math.min(1, (qp - 0.64) / 0.16));
        count.textContent = Math.round(countTo * (1 - Math.pow(1 - k, 2))) + '%';
      }
      let budget = cp * finals.reduce((a, s) => a + s.length, 0);
      typed.forEach((el, i) => {
        const s = finals[i];
        const n = Math.max(0, Math.min(s.length, Math.round(budget)));
        el.textContent = n >= s.length ? s : s.slice(0, n) + (n > 0 ? '█' : '');
        budget -= s.length;
      });
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  sec.classList.add('is-live');
  frame();
})();
