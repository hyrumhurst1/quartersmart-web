// attract pack: floor. Six games off the arcade floor, each playing with the wordmark:
// a claw machine, pinball, bowling, a hoop shot, whack-a-mole and air hockey.
(window.QSAttractPacks = window.QSAttractPacks || []).push((A) => {
  const clamp = A.clamp;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, u) => a + (b - a) * u;
  const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eo = (x) => 1 - Math.pow(1 - x, 3);
  const mid = (l) => (l.x0 + l.x1) / 2;
  const line = (x0, y0, x1, y1, c) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let i = 0; i <= n; i++) A.px(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, c); };
  const lob = (x0, y0, x1, y1, h, u) => [lerp(x0, x1, u), lerp(y0, y1, u) - 4 * h * u * (1 - u)];
  // multi-colour sprite: rows of keys, map key -> colour ('.' and unknown keys are clear)
  const paint = (x, y, rows, map, clip) => { x = Math.round(x); y = Math.round(y); rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = map[r[i]]; if (c && !(clip !== undefined && y + j >= clip)) A.px(x + i, y + j, c); } }); };
  const sc = {};

  // ---------- claw machine: the claw grabs a letter, carries it wobbling to the chute, a new one pops in ----------
  sc.floorClaw = {
    name: 'claw', dur: 7400,
    word: { lay: 'stack', F: 2, style: 'multi', cy: 0.62 },
    parade: [['..x..', 'xxxxx', 'x...x', '.x.x.'], 'cream'],
    init() {
      this.t = 0; this.li = 2;
      const L = A.letters[this.li];
      this.L = { x0: L.x0, x1: L.x1, y0: L.y0, y1: L.y1, h: L.y1 - L.y0 + 1 };
      this.rail = Math.max(1, A.Y0 - 24);
      this.cw = 14; this.cx0 = Math.min(A.X0 + A.WW + 5, A.GW - this.cw - 1);
      this.ctop = Math.max(A.Y0 + 8, A.PH - 30);
      this.hx0 = this.cx0 + (this.cw - 1) / 2; this.hy0 = this.rail + 3;
      this.tx = mid(this.L); this.gy = this.L.y0 - 5;
      this.ly = Math.max(this.hy0, A.Y0 - 6 - this.L.h);
      this.pose(0);
    },
    pose(t) {
      let hx = this.hx0, hy = this.hy0, open = 0.35 + Math.sin(t / 260) * 0.15, held = false, wob = 0;
      if (t >= 500 && t < 1500) { hx = lerp(this.hx0, this.tx, io(seg(t, 500, 1500))); open = lerp(0.35, 1, seg(t, 1100, 1500)); }
      else if (t >= 1500 && t < 2400) { hx = this.tx; hy = lerp(this.hy0, this.gy, io(seg(t, 1500, 2400))); open = 1; }
      else if (t >= 2400 && t < 2700) { hx = this.tx; hy = this.gy; open = 1 - seg(t, 2400, 2650); held = t > 2600; }
      else if (t >= 2700 && t < 5000) {
        held = true; open = 0;
        hy = lerp(this.gy, this.ly, io(seg(t, 2700, 3500)));
        hx = lerp(this.tx, this.hx0, io(seg(t, 3500, 4700)));
        const env = t < 4700 ? seg(t, 2750, 3100) : 1 - seg(t, 4700, 5000);
        wob = Math.round(Math.sin((t - 2700) / 115) * 1.45 * env);
        if (t > 4850) open = seg(t, 4850, 5000);
      } else if (t >= 5000 && t < 6000) { hy = lerp(this.ly, this.hy0, io(seg(t, 5300, 6000))); open = 1 - seg(t, 5500, 6000) * 0.65; }
      this.hx = hx; this.hy = hy; this.open = clamp(open); this.held = held; this.wob = wob;
    },
    update(t) { this.t = t; this.pose(t); },
    draw() {
      const C = A.C, t = this.t, li = this.li, L = this.L;
      const x0 = Math.min(A.X0 - 6, this.hx0 - 4), x1 = this.cx0 + this.cw + 1;
      A.rect(x0, this.rail, x1 - x0, 1, C.line);
      for (let x = x0 + 2; x < x1; x += 4) A.px(x, this.rail - 1 < 0 ? this.rail : this.rail - 1, C.line);
      // the letter: in its slot, in the claw, falling into the chute, or popping back in
      let dx = 0, dy = 0, gone = false, col = null;
      if (this.held) { dx = Math.round(this.hx - this.tx) + this.wob; dy = Math.round(this.hy - this.gy); }
      else if (t >= 5000 && t < 5900) { const f = (t - 5000); dx = Math.round(this.hx0 - this.tx); dy = Math.round(this.ly - this.gy + 0.00012 * f * f); if (L.y0 + dy >= A.PH) gone = true; }
      else if (t >= 5900 && t < 6450) {
        const u = seg(t, 5900, 6450);
        dy = u < 0.55 ? -Math.round(6 * (1 - Math.pow(u / 0.55, 2))) : -Math.round(Math.sin((u - 0.55) / 0.45 * Math.PI) * 1.6);
        if (t < 6080) col = C.hi;
      }
      A.drawWord({
        skip: (w) => w.li === li && (gone || (t >= 5000 && t < 5900 && w.y + dy >= A.PH)),
        off: (w) => (w.li === li ? [dx, dy] : null),
        col: (w) => (w.li === li ? col : null),
      });
      // the claw: trolley, cable, head, two jaws
      const hx = Math.round(this.hx), hy = Math.round(this.hy), o = this.open;
      A.rect(hx - 3, this.rail - 1 < 0 ? this.rail : this.rail - 1, 7, 2, C.cream);
      A.rect(hx, this.rail + 1, 1, Math.max(0, hy - this.rail - 1), C.dim);
      A.rect(hx - 3, hy, 7, 2, C.cream); A.px(hx, hy + 1, Math.floor(t / 250) % 2 ? C.rose : C.butter);
      A.rect(hx, hy + 2, 1, 2, C.dim);
      const CL = [3, 4, 4, 3, 2], OP = [4, 5, 6, 6, 6];
      for (let k = 0; k < 5; k++) { const ax = Math.round(lerp(CL[k], OP[k], o)); A.px(hx - ax, hy + 2 + k, C.cream); A.px(hx + ax, hy + 2 + k, C.cream); }
      // the prize chute: its front panel hides the falling letter
      const cx0 = this.cx0, cw = this.cw, ct = this.ctop;
      A.px(cx0 - 1, ct, C.dim); A.px(cx0 + cw, ct, C.dim);
      A.rect(cx0, ct + 1, 1, A.PH - ct - 1, C.dim); A.rect(cx0 + cw - 1, ct + 1, 1, A.PH - ct - 1, C.dim);
      A.rect(cx0 + 1, ct + 3, cw - 2, A.PH - ct - 3, C.line);
      A.rect(cx0 + 3, A.PH - 7, cw - 6, 1, C.dim); A.rect(cx0 + 3, A.PH - 7, 1, 6, C.dim); A.rect(cx0 + cw - 4, A.PH - 7, 1, 6, C.dim);
      const lamp = t > 5150 && t < 5900 ? (Math.floor(t / 120) % 2 ? C.rose : C.butter) : C.dim;
      A.rect(cx0 + cw / 2 - 1, ct + 5, 2, 2, lamp);
      if (t > 5150 && t < 5500) A.sparkle(cx0 + cw / 2, ct - 2, t < 5250 || t > 5400 ? 1 : 2, C.butter);
      if (t > 6000 && t < 6600) for (const [sx, sy, d] of [[L.x0 - 2, L.y0 - 1, 0], [L.x1 + 2, L.y0 + 1, 120], [mid(L), L.y0 - 3, 240]]) {
        const q = (t - 6000 - d) / 300; if (q > 0 && q < 1) A.sparkle(sx, sy, q < 0.25 || q > 0.75 ? 0 : 1, C.butter);
      }
    },
  };

  // ---------- pinball: plunger launch, the letters are bumpers that flash and light their lamps, auto flippers ----------
  sc.floorPin = {
    name: 'pinball', dur: 7200,
    word: { lay: 'line', F: 2, style: 'bricks', cy: 0.4 },
    parade: [['xx....', 'xxxx..', '.xxxxx'], 'teal'],
    TG: [9, 2, 6, 0, 11, 4, 7, 1, 10, 5, 8, 3],
    init() {
      this.t = 0; this.fl = [-1e9, -1e9]; this.k = 0;
      this.xl = Math.max(1, A.X0 - 6); this.xr = Math.min(A.GW - 11, A.X0 + A.WW + 5); this.xo = this.xr + 8;
      this.cx = Math.round((this.xl + this.xr) / 2); this.fy = A.PH - 4;
      const H = this.fy - A.Y0 + 3; this.tr = A.small ? 720 : 560; this.g = 2 * H / (this.tr * this.tr); this.V = this.g * this.tr;
      this.b = { x: this.xr + 3, y: this.fy - 6, vx: 0, vy: 0 }; this.mode = 'lane';
      this.hit = new Map(); this.lit = new Set(); this.sp = []; this.pl = 0;
    },
    guideY(x) {                       // the slanted inlanes that feed the flippers
      const l = this.cx - 15, r = this.cx + 15, top = this.fy - 16;
      if (x <= l) return top + (x - this.xl) / (l - this.xl) * 12;
      if (x >= r - 1) return top + (this.xr - x - 1) / (this.xr - 1 - r) * 12;
      return 1e9;
    },
    flipAng(side, t) { const d = t - this.fl[side]; const up = d < 0 ? 0 : d < 60 ? d / 60 : d < 220 ? 1 : d < 340 ? 1 - (d - 220) / 120 : 0; return lerp(0.38, -0.5, up); },
    update(t, dt) {
      this.t = t; const b = this.b, g = this.g;
      if (this.mode === 'lane') { this.pl = seg(t, 150, 900); b.y = this.fy - 6 + Math.round(this.pl * 3); if (t > 1000) { this.mode = 'up'; b.vy = -Math.sqrt(2 * g * (this.fy - 4)) * 1.02; } return; }
      const bump = (k, ax) => {
        const w = A.word[k], l = A.letters[w.li];
        this.hit.set(w.li, { t, d: ax === 'x' ? [Math.sign(mid(l) - b.x - 1), 0] : [0, Math.sign((l.y0 + l.y1) / 2 - b.y - 1)] });
        this.lit.add(w.li); this.sp.push({ x: b.x + 1, y: b.y + 1, t });
        const s = Math.hypot(b.vx, b.vy), want = this.V * 0.72;
        if (s < want) { b.vx *= want / s; b.vy *= want / s; }
        if (Math.abs(b.vx) < 0.025) b.vx = (b.x < this.cx ? 1 : -1) * 0.03;
      };
      const hitAt = (x, y) => { const X = Math.round(x), Y = Math.round(y); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const k = A.at.get((X + i) * 1000 + Y + j); if (k !== undefined) return k; } return -1; };
      for (let s = 0; s < dt; s += 2) {
        const h = Math.min(2, dt - s);
        b.vy += g * h;
        if (this.mode === 'up') { b.y += b.vy * h; if (b.y <= 4) { this.mode = 'table'; b.y = 4; b.vx = -this.V * 0.55; b.vy = 0.01; } continue; }
        let nx = b.x + b.vx * h, ny = b.y + b.vy * h;
        if (nx < this.xl + 1) { nx = this.xl + 1; b.vx = Math.abs(b.vx) * 0.9; }
        if (nx > this.xr - 2 && ny > 9) { nx = this.xr - 2; b.vx = -Math.abs(b.vx) * 0.9; }
        if (ny < 2) { ny = 2; b.vy = Math.abs(b.vy) * 0.8; }
        if (hitAt(b.x, b.y) >= 0) { b.y -= 1; ny = b.y; }
        const kx = hitAt(nx, b.y); if (kx >= 0) { b.vx = -b.vx; nx = b.x; bump(kx, 'x'); }
        const ky = hitAt(nx, ny); if (ky >= 0) { b.vy = -b.vy; ny = b.y; bump(ky, 'y'); }
        const gy = this.guideY(nx + 1);
        if (ny + 1 >= gy) { ny = gy - 2; const toC = nx + 1 < this.cx ? 1 : -1; if (b.vy > 0.06) b.vy = -b.vy * 0.3; else { b.vx += toC * g * h * 1.4; b.vy = Math.abs(b.vx) * 0.5; } }
        b.x = nx; b.y = ny;
        if (!this.drain && t > 6000 && b.y > this.fy - 8) this.drain = true;
        if (!this.drain && b.vy > 0 && b.y >= this.fy - 8 && Math.abs(b.x + 1 - this.cx) < 17) {
          const side = b.x + 1 < this.cx ? 0 : 1;
          this.fl[side] = t; b.y = this.fy - 8;
          const tl = A.letters[this.TG[this.k++ % 12]];
          b.vy = -this.V; b.vx = clamp((mid(tl) - b.x) / (this.tr * 0.8), -0.15, 0.15);
        }
      }
      if (b.y > A.PH - 3) b.gone = true;
      this.sp = this.sp.filter((q) => t - q.t < 240);
    },
    draw() {
      const C = A.C, t = this.t, b = this.b, cx = this.cx, fy = this.fy;
      // the table: walls, the launch lane and its plunger, the inlanes
      A.rect(this.xl, 1, this.xo - this.xl - 4, 1, C.line); line(this.xo - 4, 1, this.xo, 5, C.line);
      A.rect(this.xl, 1, 1, fy - 16, C.line); A.rect(this.xo, 5, 1, A.PH - 6, C.line); A.rect(this.xr, 10, 1, fy - 26, C.line);
      line(this.xl, fy - 16, cx - 15, fy - 4, C.line); line(this.xr, fy - 16, cx + 14, fy - 4, C.line);
      const pt = fy - 4 + Math.round(this.pl * 3) + (this.mode === 'lane' ? 0 : -Math.round(3 * (1 - seg(t, 1000, 1080))));
      A.rect(this.xr + 2, pt, 5, 1, C.cream);
      for (let y = pt + 1; y < A.PH - 1; y++) A.px(this.xr + 3 + (y % 2) * 2, y, C.dim);
      // lamps, one under each letter, lit once that bumper has been hit
      A.letters.forEach((l, li) => { A.rect(Math.round(mid(l)) - 1, l.y1 + 3, 2, 1, this.lit.has(li) ? C.butter : C.line); });
      const bonus = (li) => { const s = 6250 + li * 60; return t > s && t < s + 160; };
      A.drawWord({
        col: (w) => { const h = this.hit.get(w.li); return (h && t - h.t < 170) || bonus(w.li) ? C.hi : null; },
        off: (w) => { const h = this.hit.get(w.li); return h && t - h.t < 110 ? h.d : null; },
      });
      // flippers
      for (const side of [0, 1]) {
        const s = side ? -1 : 1, pxv = cx - 15 * s, a = this.flipAng(side, t);
        const ex = pxv + Math.cos(a) * 10 * s, ey = fy - 4 + Math.sin(a) * 10;
        line(pxv, fy - 4, ex, ey, C.teal); line(pxv, fy - 3, ex, ey + 1, C.teal); A.px(pxv, fy - 4, C.hi);
      }
      for (const q of this.sp) A.sparkle(q.x, q.y, t - q.t < 80 || t - q.t > 180 ? 0 : 1, C.butter);
      if (!b.gone) { A.rect(b.x, b.y, 2, 2, C.hi); A.px(b.x + 1, b.y + 1, C.cream); }
    },
  };

  // @@more
  return sc;
});
