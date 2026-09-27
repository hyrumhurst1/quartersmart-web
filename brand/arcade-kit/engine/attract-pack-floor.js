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

  // ---------- claw machine: the word is the prize pile inside a glass cabinet; the claw grabs the e, nearly drops it,
  // carries it to the prize chute, and a fresh e pops back into its slot ----------
  sc.floorClaw = {
    name: 'claw', dur: 7400,
    word: { lay: 'stack', F: 2, style: 'multi', cy: 0.66 },
    parade: [['..x..', 'xxxxx', 'x...x', '.x.x.'], 'cream'],
    G: 0.00012,
    init() {
      this.t = 0; this.li = 5;
      const L = A.letters[this.li];
      this.L = { x0: L.x0, x1: L.x1, y0: L.y0, y1: L.y1, h: L.y1 - L.y0 + 1 };
      this.rail = Math.max(1, A.Y0 - 24);
      this.cw = 14; this.cx0 = Math.max(1, A.X0 - 5 - this.cw);   // the chute sits left, away from the moon
      this.ctop = Math.max(A.WY1 - 14, A.PH - 16);
      this.hx0 = this.cx0 + (this.cw - 1) / 2; this.hy0 = this.rail + 3;
      this.tx = mid(this.L); this.gy = this.L.y0 - 5;
      this.ly = Math.max(this.hy0, A.Y0 - 8 - this.L.h);
      this.slipMax = clamp(A.Y0 - 2 - (this.ly + 4 + this.L.h), 0, 2);   // the slip never lets the prize touch the pile
      const drop = this.ctop + 2 - (this.L.y0 + this.ly - this.gy + this.slipMax);
      this.land = 5000 + Math.sqrt(Math.max(0, drop) / this.G);       // when the prize passes into the chute
      this.pose(0);
    },
    pose(t) {
      let hx = this.hx0, hy = this.hy0, open = 0.35 + Math.sin(t / 260) * 0.15, held = false, wob = 0, slip = 0;
      if (t >= 500 && t < 1500) { hx = lerp(this.hx0, this.tx, io(seg(t, 500, 1500))); open = lerp(0.35, 1, seg(t, 1100, 1500)); }
      else if (t >= 1500 && t < 2400) { hx = this.tx; hy = lerp(this.hy0, this.gy, io(seg(t, 1500, 2400))); open = 1; }
      else if (t >= 2400 && t < 2700) { hx = this.tx; hy = this.gy; open = 1 - seg(t, 2400, 2650); held = t > 2600; }
      else if (t >= 2700 && t < 5000) {
        held = true; open = 0;
        hy = lerp(this.gy, this.ly, io(seg(t, 2700, 3500)));
        hx = lerp(this.tx, this.hx0, io(seg(t, 3500, 4700)));
        // halfway over, the grip gives: the jaws twitch open, the prize slips two pixels and swings harder
        const give = t > 3980 && t < 4160 ? Math.sin(seg(t, 3980, 4160) * Math.PI) : 0;
        open = give * 0.35; slip = Math.round(this.slipMax * eo(seg(t, 4010, 4090)));
        const env = t < 4700 ? seg(t, 2750, 3100) * (1 + give * 0.9) : 1 - seg(t, 4700, 5000);
        wob = Math.round(Math.sin((t - 2700) / 115) * 1.45 * env);
        if (t > 4850) open = seg(t, 4850, 5000);
      } else if (t >= 5000 && t < 6000) { hy = lerp(this.ly, this.hy0, io(seg(t, 5300, 6000))); open = 1 - seg(t, 5500, 6000) * 0.65; }
      this.hx = hx; this.hy = hy; this.open = clamp(open); this.held = held; this.wob = wob; this.slip = slip;
    },
    update(t) { this.t = t; this.pose(t); },
    draw() {
      const C = A.C, t = this.t, li = this.li, L = this.L, PH = A.PH;
      // the cabinet: a gantry rail, two glass edges and a couple of glints (kept clear of the moon)
      const mx = Math.round(A.GW * (A.small ? 0.8 : 0.84)), my = A.small ? 9 : 10, mr = (A.small ? 4 : 5) + 3;
      const e0 = this.cx0 - 3, e1 = Math.min(A.GW - 2, A.X0 + A.WW + 5), x0 = Math.max(0, e0), rt = this.rail - 1 < 0 ? this.rail : this.rail - 1;
      const nearMoon = Math.abs(e1 - mx) < mr + 4 && this.rail < my + mr;
      A.rect(x0, this.rail, e1 - x0 + 1, 1, C.line);
      for (let x = x0 + 2; x < e1; x += 4) A.px(x, rt, C.line);
      if (e0 >= 1) A.rect(e0, this.rail + 1, 1, PH - this.rail - 1, C.line);
      if (!nearMoon) {
        A.rect(e1, this.rail + 1, 1, PH - this.rail - 1, C.line);
        for (let k = 0; k < 4; k++) A.px(e1 - 9 + k, this.rail + 4 + k, C.line);
        for (let k = 0; k < 2; k++) A.px(e1 - 5 + k, this.rail + 4 + k, C.line);
      }
      // the letter: in its slot, in the claw, falling into the chute, or popping back in
      let dx = 0, dy = 0, gone = false, col = null;
      if (this.held) { dx = Math.round(this.hx - this.tx) + this.wob; dy = Math.round(this.hy - this.gy) + this.slip; }
      else if (t >= 5000 && t < 5900) { const f = (t - 5000); dx = Math.round(this.hx0 - this.tx); dy = Math.round(this.ly - this.gy + this.slipMax + this.G * f * f); if (L.y0 + dy >= PH) gone = true; }
      else if (t >= 5900 && t < 6450) {
        const u = seg(t, 5900, 6450);
        dy = u < 0.55 ? -Math.round(6 * (1 - Math.pow(u / 0.55, 2))) : -Math.round(Math.sin((u - 0.55) / 0.45 * Math.PI) * 1.6);
        if (t < 6080) col = C.hi;
      }
      A.drawWord({
        skip: (w) => w.li === li && (gone || (t >= 5000 && t < 5900 && w.y + dy >= PH)),
        off: (w) => (w.li === li ? [dx, dy] : null),
        col: (w) => (w.li === li ? col : null),
      });
      // the claw: trolley, cable, head, two jaws
      const hx = Math.round(this.hx), hy = Math.round(this.hy), o = this.open;
      A.rect(hx - 3, rt, 7, 2, C.cream);
      A.rect(hx, this.rail + 1, 1, Math.max(0, hy - this.rail - 1), C.dim);
      A.rect(hx - 3, hy, 7, 2, C.cream); A.px(hx, hy + 1, Math.floor(t / 250) % 2 ? C.rose : C.butter);
      A.rect(hx, hy + 2, 1, 2, C.dim);
      const CL = [3, 4, 4, 3, 2], OP = [4, 5, 6, 6, 6];
      for (let k = 0; k < 5; k++) { const ax = Math.round(lerp(CL[k], OP[k], o)); A.px(hx - ax, hy + 2 + k, C.cream); A.px(hx + ax, hy + 2 + k, C.cream); }
      // the prize chute: a flared funnel over a glass box whose front hides the prize; its lamps flash on a win
      const cx0 = this.cx0, cw = this.cw, ct = this.ctop, win = t > this.land && t < this.land + 820;
      A.rect(cx0 - 1, ct, 2, 1, C.dim); A.rect(cx0 + cw - 1, ct, 2, 1, C.dim);
      A.rect(cx0, ct + 1, 1, PH - ct - 1, C.dim); A.rect(cx0 + cw - 1, ct + 1, 1, PH - ct - 1, C.dim);
      A.rect(cx0 + 1, ct + 2, cw - 2, PH - ct - 2, C.line);
      for (let k = 0; k < 3; k++) A.px(cx0 + 2 + k, ct + 6 - k, C.dim);
      A.rect(cx0 + 3, PH - 6, cw - 6, 1, C.dim); A.rect(cx0 + 3, PH - 6, 1, 5, C.dim); A.rect(cx0 + cw - 4, PH - 6, 1, 5, C.dim);
      const blink = Math.floor(t / 120) % 2;
      A.px(cx0 - 1, ct - 1, win ? (blink ? C.rose : C.butter) : C.dim); A.px(cx0 + cw, ct - 1, win ? (blink ? C.butter : C.rose) : C.dim);
      A.rect(cx0 + cw / 2 - 1, ct + 4, 2, 2, win ? (blink ? C.rose : C.butter) : C.dim);
      if (t > this.land && t < this.land + 380) { const q = (t - this.land) / 380; A.sparkle(cx0 + cw / 2, ct - 3, q < 0.25 || q > 0.75 ? 1 : 2, C.butter); }
      if (t > 6000 && t < 6600) for (const [sx, sy, d] of [[L.x0 - 2, L.y0 - 1, 0], [L.x1 + 2, L.y0 + 1, 120], [mid(L), L.y0 - 3, 240]]) {
        const q = (t - 6000 - d) / 300; if (q > 0 && q < 1) A.sparkle(sx, sy, q < 0.25 || q > 0.75 ? 0 : 1, C.butter);
      }
    },
  };

  // ---------- pinball: the word is the bumper bank that roofs the table. Plunger launch, auto flippers feed the ball up
  // into the letters, each hit flashes a letter and lights its lamp; the last ball drains and the bonus counts across ----------
  sc.floorPin = {
    name: 'pinball', dur: 7200,
    word: { lay: 'line', F: 2, style: 'bricks', cy: 0.38, mob: { lay: 'stack', F: 2, cy: 0.4 } },
    parade: [['xx....', 'xxxx..', '.xxxxx'], 'teal'],
    TG: [9, 2, 6, 0, 11, 4, 7, 1, 10, 5, 8, 3],
    init() {
      this.t = 0; this.fl = [-1e9, -1e9]; this.k = 0; this.sl = [-1e9, -1e9]; this.tr0 = [];
      const L = A.letters;
      this.roof = L[7].y0 > L[0].y1 ? L[0].y1 + 1 : A.WY1;          // stacked: the table runs up to the Quarter row
      this.lane = A.GW - (A.X0 + A.WW) >= 14;
      this.xl = Math.max(1, A.X0 - 8);
      this.xr = this.lane ? Math.min(A.GW - 10, A.X0 + A.WW + 8) : Math.min(A.GW - 2, A.X0 + A.WW + 8);
      this.xo = this.lane ? this.xr + 8 : this.xr;
      this.cx = Math.round((this.xl + this.xr) / 2); this.fy = A.PH - 3;
      const H = this.fy - 11 - this.roof + 6;                           // a flipper shot peaks a little above the roof
      this.tr = A.small ? 700 : 520; this.g = 2 * H / (this.tr * this.tr); this.V = this.g * this.tr;
      this.b = this.lane ? { x: this.xr + 3, y: this.fy - 6, vx: 0, vy: 0 } : { x: this.xr - 4, y: this.roof + 4, vx: 0, vy: 0 }; this.mode = 'lane';
      this.hit = new Map(); this.lit = new Set(); this.sp = []; this.pl = 0; this.drain = false; this.arch = -1e9; this.low = 1000;
    },
    above(x) {                        // the letter that roofs column x, if any
      let best = -1;
      A.letters.forEach((l, li) => { if (Math.abs(l.y1 + 1 - this.roof) <= 1 && x >= l.x0 - 1 && x <= l.x1 + 1) best = li; });
      return best;
    },
    guideY(x) {                       // the slanted inlanes that feed the flippers
      const l = this.cx - 15, r = this.cx + 15, top = this.fy - 13;
      if (x <= l) return top + (x - this.xl) / (l - this.xl) * 9;
      if (x >= r - 1) return top + (this.xr - x - 1) / (this.xr - 1 - r) * 9;
      return 1e9;
    },
    flipAng(side, t) { const d = t - this.fl[side]; const up = d < 0 ? 0 : d < 60 ? d / 60 : d < 220 ? 1 : d < 340 ? 1 - (d - 220) / 120 : 0; return lerp(0.38, -0.5, up); },
    update(t, dt) {
      this.t = t; const b = this.b, g = this.g;
      if (this.mode === 'lane' && !this.lane) { if (t > 1000) { this.mode = 'table'; b.vx = -this.V * 0.5; b.vy = -this.V * 0.2; } return; }
      if (this.mode === 'lane') { this.pl = seg(t, 150, 900); b.y = this.fy - 6 + Math.round(this.pl * 3); if (t > 1000) { this.mode = 'up'; b.vy = -Math.sqrt(2 * g * (this.fy - this.roof)) * 1.05; } return; }
      const bump = (li, d, soft) => {
        this.hit.set(li, { t, d }); this.lit.add(li); this.sp.push({ x: b.x + 1, y: b.y + 1, t });
        if (soft) return;                                               // landing on top of a letter: no kick, it rolls off
        const s = Math.hypot(b.vx, b.vy), want = this.V * 0.72;
        if (s < want) { b.vx *= want / s; b.vy *= want / s; }
        if (Math.abs(b.vx) < 0.025) b.vx = (b.x < this.cx ? 1 : -1) * 0.03;
      };
      const hitAt = (x, y) => { const X = Math.round(x), Y = Math.round(y); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const k = A.at.get((X + i) * 1000 + Y + j); if (k !== undefined) return k; } return -1; };
      for (let s = 0; s < dt; s += 2) {
        const h = Math.min(2, dt - s);
        if (b.y > this.fy - 16) this.low = t;
        b.vy += g * h * (t - this.low > 1500 ? 3 : 1);                  // never lets it loiter up among the letters
        if (this.mode === 'up') {         // up the launch lane; the top arch turns it along the roof into the table
          b.y += b.vy * h;
          if (b.y <= this.roof + 1) { this.mode = 'table'; b.y = this.roof + 1; b.x = this.xr - 3; b.vx = -this.V * 0.9; b.vy = 0.02; this.arch = t; }
          continue;
        }
        let nx = b.x + b.vx * h, ny = b.y + b.vy * h;
        if (nx < this.xl + 1) { nx = this.xl + 1; b.vx = Math.abs(b.vx) * 0.9; }
        if (nx > this.xr - 2) { nx = this.xr - 2; b.vx = -Math.abs(b.vx) * 0.9; }
        if (ny < this.roof) {             // the word roofs the table: the letter overhead flashes and kicks it back down
          ny = this.roof; b.vy = Math.abs(b.vy) * 0.9;
          const li = this.above(Math.round(nx + 1)); if (li >= 0) bump(li, [0, -1]);
        }
        const kx = hitAt(nx, b.y); if (kx >= 0) { const l = A.letters[A.word[kx].li]; b.vx = -b.vx; nx = b.x; bump(A.word[kx].li, [Math.sign(mid(l) - b.x - 1), 0]); }
        const ky = hitAt(nx, ny); if (ky >= 0) { const l = A.letters[A.word[ky].li], down = b.vy > 0; b.vy = down ? -b.vy * 0.35 : -b.vy; ny = b.y; bump(A.word[ky].li, [0, Math.sign((l.y0 + l.y1) / 2 - b.y - 1)], down); }
        const gy = this.guideY(nx + 1);
        if (ny + 1 >= gy) { ny = gy - 2; const side = nx + 1 < this.cx ? 0 : 1, T = 380; this.sl[side] = t; b.vx = (this.cx + (side ? 9 : -11) - nx) / T; b.vy = -g * T * 0.5; }
        b.x = nx; b.y = ny;
        if (!this.drain && t > 6000 && b.y > this.fy - 8) this.drain = true;
        if (!this.drain && b.vy > 0 && b.y >= this.fy - 11 && Math.abs(b.x + 1 - this.cx) < 17) {
          const side = b.x + 1 < this.cx ? 0 : 1;
          this.fl[side] = t;
          const tl = A.letters[this.TG[this.k++ % 12]];
          b.vy = -this.V; b.vx = clamp((mid(tl) - b.x) / (this.tr * 0.55), -0.16, 0.16);
        }
      }
      if (b.y > A.PH - 3) b.gone = true;
      this.sp = this.sp.filter((q) => t - q.t < 240);
      this.tr0.unshift([b.x, b.y]); if (this.tr0.length > 3) this.tr0.pop();
    },
    draw() {
      const C = A.C, t = this.t, b = this.b, cx = this.cx, fy = this.fy, rf = this.roof;
      // the table: shoulders either side of the word, side walls, the launch lane with its arch and plunger, the inlanes
      const w0 = A.X0 - 2, w1 = A.X0 + A.WW + 1;
      A.rect(this.xl + 1, rf - 1, Math.max(0, w0 - this.xl - 1), 1, C.dim); A.px(this.xl, rf, C.dim);
      A.rect(this.xl, rf + 1, 1, fy - 14 - rf, C.dim);
      if (this.lane) {
        const lit = t - this.arch < 140;
        A.rect(w1, rf - 1, this.xo - 3 - w1, 1, C.dim); line(this.xo - 3, rf - 1, this.xo, rf + 2, lit ? C.hi : C.dim);
        A.rect(this.xo, rf + 3, 1, A.PH - 4 - rf, C.dim); A.rect(this.xr, rf + 7, 1, fy - 20 - rf, C.dim);
        const pt = fy - 4 + Math.round(this.pl * 3) + (this.mode === 'lane' ? 0 : -Math.round(3 * (1 - seg(t, 1000, 1080))));
        A.rect(this.xr + 2, pt, 5, 1, C.cream);
        for (let y = pt + 1; y < A.PH - 1; y++) A.px(this.xr + 3 + (y % 2) * 2, y, C.dim);
      } else {
        A.rect(w1, rf - 1, Math.max(0, this.xr - w1), 1, C.dim); A.px(this.xr, rf, C.dim); A.rect(this.xr, rf + 1, 1, fy - 14 - rf, C.dim);
        A.ring(this.xr - 3, rf + 4, 2, t < 1000 || t - 1000 > 200 ? C.dim : C.hi);
      }
      line(this.xl, fy - 13, cx - 15, fy - 4, t - this.sl[0] < 140 ? C.butter : C.dim); line(this.xr, fy - 13, cx + 14, fy - 4, t - this.sl[1] < 140 ? C.butter : C.dim);
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
      if (!b.gone && this.mode !== 'lane') for (let i = this.tr0.length - 1; i > 0; i--) A.rect(this.tr0[i][0], this.tr0[i][1], 2, 2, i > 1 ? C.line : C.dim);
      if (!b.gone) { A.rect(b.x, b.y, 2, 2, C.hi); A.px(b.x + 1, b.y + 1, C.cream); }
    },
  };

  // ---------- bowling: the letters stand as pins, a hooking ball hits the pocket and they topple outward in a wave;
  // the last pin teeters before it goes, then the pinsetter rakes the deadwood into the pit and sets a fresh rack ----------
  sc.floorBowl = {
    name: 'bowling', dur: 7400,
    word: { lay: 'line', F: 2, style: 'bright', cy: 0.52, mob: { lay: 'stack', F: 2, cy: 0.42 } },
    parade: [['.x.', 'xxx', '.x.', 'xxx', 'xxx'], 'cream'],
    TI: 1600, TEE: 820, DECK: 4480,
    init() {
      this.t = 0;
      const L = A.letters, cx = A.X0 + A.WW / 2;
      this.cx = cx; this.cur = Math.max(2, A.Y0 - 7);            // the masking curtain; the pit is behind it
      this.ix = Math.round(cx + 2); this.iy = A.WY1 - 2;           // the pocket
      this.P = L.map((l) => {
        const h = l.y1 - l.y0 + 1, mx = (l.x0 + l.x1) / 2, side = mx < this.ix ? -1 : 1;
        const d = Math.abs(mx - this.ix) + Math.abs(l.y1 - this.iy) * 0.6;
        const slide = clamp(side * Math.round(1 + d * 0.05), 3 - l.x0, A.GW - 5 - l.x1);   // knocked outward, never off the lane
        return { side, d, h, t0: this.TI + 40 + d * 5.5, hop: Math.max(1, Math.round(4 - d * 0.05)), slide, px: side > 0 ? l.x1 + 1 : l.x0, py: l.y1 + 1 };
      });
      let far = 0; this.P.forEach((p, i) => { if (p.d > this.P[far].d) far = i; });
      this.tee = far; this.P[far].t0 = Math.max(this.P[far].t0, this.TI + 520);
      this.fall = this.P[far].t0 + this.TEE + 120;                 // the moment the last pin lands: strike
      this.S = this.P.map(() => null); this.O = [];
      this.update(0);
    },
    update(t) {
      this.t = t;
      const rake = t < 3900 ? null : t < 4420 ? this.barY(t) : this.cur;    // once raked, the deadwood stays in the pit
      this.P.forEach((p, li) => {
        let tau = t - p.t0;
        if (t >= this.DECK || tau < 0) { this.S[li] = null; return; }
        if (li === this.tee) {
          if (tau < this.TEE) { this.S[li] = { s: p.side * 0.2 * Math.sin(tau / this.TEE * Math.PI * 2.5), k: 1, dx: 0, dy: 0 }; return; }
          tau -= this.TEE;
        }
        const dy = tau < 320 ? -Math.round(Math.sin(tau / 320 * Math.PI) * p.hop) : tau < 440 ? -Math.round(Math.sin((tau - 320) / 120 * Math.PI)) : 0;
        const dx = Math.round(p.slide * eo(seg(tau, 60, 440)));
        const st = tau < 70 ? { s: 0.35, k: 1 } : tau < 150 ? { s: 0.6, k: 0.6 } : { s: 0.5, k: 0.34 };
        this.S[li] = { s: p.side * st.s, k: st.k, dx, dy: dy + (rake !== null ? Math.min(0, rake - p.py) : 0) };
      });
    },
    barY(t) {                           // the sweep bar: drops in front of the deadwood, then rakes it back into the pit
      if (t < 3600 || t >= 4440) return null;
      const fr = A.WY1 + 2;
      if (t < 3900) return Math.round(lerp(this.cur, fr, eo(seg(t, 3600, 3860))));
      return Math.round(lerp(fr, this.cur, io(seg(t, 3900, 4420))));
    },
    deck(t) { return t < this.DECK ? null : -Math.round((1 - eo(seg(t, this.DECK, this.DECK + 620))) * (A.WY1 - this.cur)); },
    ball(t) {                           // [x, y, r]: hooks out toward the gutter and back into the pocket, then on into the pit
      if (t < 350) return null;
      if (t < this.TI) { const u = seg(t, 350, this.TI); return [lerp(this.ix + 8, this.ix, u) + Math.sin(u * Math.PI) * 10, lerp(A.PH - 4, this.iy, u), u < 0.45 ? 3 : 2]; }
      const v = seg(t, this.TI, this.TI + 520), y = lerp(this.iy, this.cur - 3, eo(v));
      return y > this.cur + 3 ? [this.ix - Math.round(v * 3), y, v < 0.35 ? 2 : 1] : null;
    },
    cell(w) {                           // where word cell w sits this frame: [dx, dy], or null when behind the curtain
      const p = this.P[w.li], s = this.S[w.li], dk = this.deck(this.t);
      let d;
      if (dk !== null) d = [0, dk];
      else if (!s) d = [0, 0];
      else {                            // leaning, then knocked flat onto its base: rows fold down, so it stays a crisp pixel letter
        const hs = Math.max(2, Math.round(p.h * s.k)), ny = p.py - hs + Math.floor((w.y - p.py + p.h) * hs / p.h);
        d = [Math.round((p.py - 1 - ny) * s.s) + s.dx, ny - w.y + s.dy];
      }
      return w.y + d[1] <= this.cur + 1 ? null : d;
    },
    draw() {
      const C = A.C, t = this.t, cx = this.cx, cur = this.cur, PH = A.PH;
      // the lane in perspective, running up to the curtain; aiming arrows that chase when it is a strike
      const wt = Math.min(A.WW / 2 + 6, cx - 2), wb = Math.min(A.WW / 2 + 16, cx - 1);
      line(cx - wt, cur + 2, cx - wb, PH - 1, C.line); line(cx + wt, cur + 2, cx + wb, PH - 1, C.line);
      const ay = Math.round(lerp(A.WY1, PH, 0.62)), chase = t > this.fall && t < this.fall + 760 ? Math.floor((t - this.fall) / 76) % 5 : -1;
      for (let k = -2; k <= 2; k++) { const x = Math.round(cx + k * 7), c = k + 2 === chase ? C.butter : C.dim; A.px(x, ay, c); A.px(x - 1, ay + 1, c); A.px(x + 1, ay + 1, c); }
      const b = this.ball(t);
      const drawBall = () => { if (!b) return; const [bx, by, r] = b; A.disc(bx, by, r, C.teal); if (r > 1) { A.px(bx - 1, by - 1, C.hi); A.px(bx + [1, 0, -1, 0][Math.floor(t / 90) % 4], by + [0, 1, 0, -1][Math.floor(t / 90) % 4], C.deep); } };
      if (t >= this.TI) drawBall();                                  // past the pins it rolls on behind them
      // the pins: cream letters with a rose neck stripe; a glint runs across the fresh rack at the end
      const g = -12 + seg(t, 5900, 6900) * (A.WW + 60);
      this.O.length = 0;
      A.drawWord({
        skip: (w) => { const d = this.cell(w); this.O[w.i] = d; return !d; },
        off: (w) => this.O[w.i],
        col: (w) => { const q = (w.x - A.X0) + (w.y - A.Y0) * 0.8 - g; return q > -3 && q < 0 ? C.butter : w.gy === 3 ? C.rose : null; },
      });
      if (t < this.TI) drawBall();
      // pin action at the pocket, then the strike burst when the last one lands
      const burst = (t0, pts) => pts.forEach(([sx, sy, dd]) => { const v = (t - t0 - dd) / 380; if (v > 0 && v < 1) A.sparkle(sx, sy, v < 0.2 || v > 0.8 ? 0 : v < 0.35 || v > 0.65 ? 1 : 2, C.butter); });
      burst(this.TI, [[this.ix - 6, this.iy - 3, 0], [this.ix + 7, this.iy - 5, 70], [this.ix, this.iy - 10, 140]]);
      const top = Math.max(cur + 4, A.Y0 - 3);
      burst(this.fall, [[A.X0 + A.WW * 0.14, top + 2, 0], [A.X0 + A.WW * 0.42, top, 90], [A.X0 + A.WW * 0.66, top + 3, 180], [A.X0 + A.WW * 0.9, top + 1, 270]]);
      // the pinsetter: the sweep bar, then the deck that lowers the fresh rack and lifts away
      const x0 = Math.round(cx - wt), x1 = Math.round(cx + wt);
      const by = this.barY(t);
      if (by !== null && by > cur + 1) { A.rect(x0, by, x1 - x0 + 1, 2, C.teal); A.rect(x0, cur + 2, 1, by - cur - 2, C.dim); A.rect(x1, cur + 2, 1, by - cur - 2, C.dim); }
      const dk = this.deck(t);
      if (dk !== null) {
        const hold = t < this.DECK + 700, dy = Math.round(A.Y0 - 3 + dk - (hold ? 0 : io(seg(t, this.DECK + 760, this.DECK + 1200)) * (A.Y0 - 3 - cur)));
        if (dy > cur + 1) {
          A.rect(x0, dy, x1 - x0 + 1, 2, C.teal); A.rect(x0, cur + 2, 1, dy - cur - 2, C.dim); A.rect(x1, cur + 2, 1, dy - cur - 2, C.dim);
          if (hold) A.letters.forEach((l) => { const y0 = Math.max(dy + 2, cur + 2), y1 = l.y0 + dk - 1; if (y1 >= y0) A.rect(Math.round((l.x0 + l.x1) / 2), y0, 1, y1 - y0 + 1, C.dim); });
        }
      }
      if (t > this.DECK + 600 && t < this.DECK + 1000) A.letters.forEach((l, li) => { const q = (t - this.DECK - 600 - li * 25) / 260; if (q > 0 && q < 1 && li % 3 === 0) A.sparkle(l.x1 + 1, l.y0 - 1, q < 0.3 || q > 0.7 ? 0 : 1, C.butter); });
      // the curtain the pit hides behind
      const mx = Math.round(A.GW * (A.small ? 0.8 : 0.84)), my = A.small ? 9 : 10, mr = (A.small ? 4 : 5) + 2;   // never across the moon
      const cp = (x, y, c) => { if ((x - mx) * (x - mx) + (y - my) * (y - my) > mr * mr) A.px(x, y, c); };
      for (let x = x0 - 1; x <= x1 + 1; x++) { cp(x, cur, C.dim); if (x >= x0 && x <= x1) cp(x, cur + 1, C.line); if ((x - x0) % 3 === 1 && x < x1) cp(x, cur + 2, C.line); }
    },
  };

  // ---------- hoops: a player on the wordmark shoots, rims out, chases it down, swishes; the letters bounce like a crowd ----------
  sc.floorHoops = {
    name: 'hoops', dur: 7400,
    word: { lay: 'line', F: 2, style: 'band', cy: 0.66 },
    parade: [['.x.', 'xxx', '.x.', 'x.x'], 'rose'],
    init() {
      this.t = 0; const L = A.letters;
      const moon = Math.round(A.GW * (A.small ? 0.8 : 0.84)) - (A.small ? 4 : 5);   // keep the hoop's strap clear of the moon
      this.bx = Math.min(Math.round(A.X0 + A.WW - (A.small ? 12 : 10)), moon - 8);
      this.hy = Math.max(8, A.Y0 - 14);
      this.rl = this.bx - 8;
      this.p0 = Math.round(mid(L[0])) - 2;
      this.land = this.rl - 18; this.rest = this.land - 6; this.p1 = this.rest - 5;
      const under = (x) => { x = Math.round(x); for (const c of [x, x + 1, x - 1]) { const y = A.topOf.get(c); if (y !== undefined) return A.word[A.at.get(c * 1000 + y)].li; } return -1; };
      this.dips = [[3050, under(this.land + 1)], [3350, under(this.rest + 1)], [5550, under(this.rl + 2)], [5900, under(this.rl - 2)]];
      this.feet = this.surf(this.p0) - 1;
    },
    cheer(li, t, env) { return Math.round(Math.max(0, Math.sin((t - 5000) / 150 - li * 0.55)) * 3 * env); },
    surf(x) { let m = 1e9; for (let c = Math.round(x); c < Math.round(x) + 5; c++) { const y = A.topOf.get(c); if (y !== undefined) m = Math.min(m, y); } return m < 1e9 ? m : A.WY1; },
    px(t) { return Math.round(t < 2500 ? this.p0 : lerp(this.p0, this.p1, io(seg(t, 2500, 3700)))); },
    jump(t) {
      const hop = (a, b, h) => (t > a && t < b ? Math.sin(seg(t, a, b) * Math.PI) * h : 0);
      const cheer = t > 5100 && t < 6600 ? Math.abs(Math.sin((t - 5100) / 210)) * 3 * (1 - seg(t, 6200, 6600)) : 0;
      return Math.round(hop(1050, 1450, 3) + hop(4050, 4450, 3) + cheer);
    },
    update(t, dt) {
      this.t = t;
      const target = this.surf(this.px(t)) - 1;
      this.feet += (target - this.feet) * Math.min(1, (dt || 0) / (target < this.feet ? 40 : 70));
      if (!dt) this.feet = target;
    },
    ball(t, top, px) {
      const hy = this.hy, rl = this.rl, S = (x) => this.surf(x - 1) - 4;
      if (t < 900) return [px + 5, lerp(top + 3, S(px + 5), Math.abs(Math.sin(t / 150)))];
      if (t < 1250) return [px + 1, top - 4];
      const R1 = [this.p0 + 1, this.surf(this.p0) - 12 - this.jump(1250)];
      if (t < 2150) return lob(R1[0], R1[1], rl + 4, hy - 4, (R1[1] + hy - 4) / 2 - Math.max(1, hy - 13), seg(t, 1250, 2150));
      if (t < 2400) return lob(rl + 4, hy - 4, rl - 2, hy - 4, 3, seg(t, 2150, 2400));
      if (t < 3050) return lob(rl - 2, hy - 4, this.land, S(this.land), 6, seg(t, 2400, 3050));
      if (t < 3350) return lob(this.land, S(this.land), this.rest, S(this.rest), 3, seg(t, 3050, 3350));
      if (t < 3800) return [this.rest, S(this.rest)];
      if (t < 4250) return [px + 1, top - 4];
      const R2 = [this.p1 + 1, this.surf(this.p1) - 12 - this.jump(4250)];
      if (t < 4950) return lob(R2[0], R2[1], rl + 2, hy - 4, (R2[1] + hy - 4) / 2 - (hy - 10), seg(t, 4250, 4950));
      if (t < 5200) return [rl + 2, lerp(hy - 4, hy + 5, seg(t, 4950, 5200))];
      if (t < 5550) { const u = seg(t, 5200, 5550); return [lerp(rl + 2, rl + 1, u), lerp(hy + 5, S(rl + 1), u * u)]; }
      if (t < 5900) return lob(rl + 1, S(rl + 1), rl - 3, S(rl - 3), 3, seg(t, 5550, 5900));
      if (t < 6150) return lob(rl - 3, S(rl - 3), rl - 5, S(rl - 5), 1, seg(t, 5900, 6150));
      return [rl - 5, S(rl - 5)];
    },
    draw() {
      const C = A.C, t = this.t, hy = this.hy, rl = this.rl, bx = this.bx;
      // letters: a dip where the ball lands, then the crowd bounce after the swish
      const env = seg(t, 5000, 5300) * (1 - seg(t, 6400, 7000));
      A.drawWord({ off: (w) => {
        let dy = 0;
        for (const [at, li] of this.dips) if (li === w.li && t > at && t < at + 140) dy = 1;
        if (env > 0) dy -= this.cheer(w.li, t, env);
        return dy ? [0, dy] : null;
      }, col: (w) => (env > 0.5 && this.cheer(w.li, t, env) >= 3 ? C.hi : null) });
      // the hoop hangs from above: strap, backboard, rim, net
      const rimHit = (t > 2150 && t < 2260) || (t > 2400 && t < 2510);
      A.rect(bx + 1, 0, 1, Math.max(0, hy - 7), C.dim);
      A.rect(bx, hy - 7, 2, 10, C.cream); A.rect(bx - 1, hy - 3, 1, 2, C.dim);
      A.rect(rl, hy + (rimHit && t % 120 < 60 ? 1 : 0), bx - rl, 1, rimHit ? C.hi : C.rose);
      const swish = t > 4950 && t < 5500, sway = t > 5200 && t < 5700 ? Math.round(Math.sin((t - 5200) / 70)) : 0;
      for (let r = 0; r < 5; r++) {
        const inset = r > 1 ? (r > 3 ? 2 : 1) : 0, dy = swish && r > 0 ? 1 : 0;
        for (let x = rl + inset + (r % 2); x <= bx - 1 - inset; x += 2) A.px(x + (r > 1 ? sway : 0), hy + 1 + r + dy, C.cream);
      }
      // the player
      const px = this.px(t), feet = Math.round(this.feet) - this.jump(t), top = feet - 7;
      const up = (t > 900 && t < 1300) || (t > 3800 && t < 4300) || (t > 5050 && t < 6400);
      const running = t > 2500 && t < 3700;
      const legs = running ? (Math.floor(t / 90) % 2 ? ['l...l', 'l...l'] : ['.l.l.', '..l..']) : this.jump(t) ? ['l...l', '.....'] : ['.l.l.', '.l.l.'];
      paint(px, top, ['.hhh.', '.hhh.', 'jjjjj', '.jjj.', '.jjj.', '.sss.', ...legs], { h: C.cream, j: C.rose, s: C.teal, l: C.cream });
      if (up) { A.px(px, top - 1, C.cream); A.px(px + 4, top - 1, C.cream); A.px(px, top, C.cream); A.px(px + 4, top, C.cream); }
      else if (t < 900) A.px(px + 5, top + 3, C.cream);
      // the ball
      const fly = (tt) => (tt > 1250 && tt < 3350) || (tt > 4250 && tt < 5550);
      for (let k = 3; k >= 1; k--) if (fly(t) && fly(t - k * 45)) { const [x, y] = this.ball(t - k * 45, top, px); A.px(Math.round(x) + 1, Math.round(y) + 1 + (k > 1 ? 1 : 0), k > 1 ? C.line : C.dim); }
      const [bxp, byp] = this.ball(t, top, px);
      paint(bxp, byp, ['.bb.', 'bbsb', 'bsbb', '.bb.'], { b: C.butter, s: C.rose });
      // net shimmer after the swish
      if (t > 4950 && t < 5600) for (const [sx, sy, d] of [[rl - 3, hy - 3, 0], [bx + 3, hy - 1, 90], [rl + 3, hy - 6, 180]]) {
        const q = (t - 4950 - d) / 380; if (q > 0 && q < 1) A.sparkle(sx, sy, q < 0.25 || q > 0.75 ? 0 : 1, C.butter);
      }
    },
  };

  // ---------- whack-a-mole: moles pop up from behind the letters, the mallet bonks them, the letters jolt ----------
  sc.floorMole = {
    name: 'whack-a-mole', dur: 7200,
    word: { lay: 'line', F: 2, style: 'bunker', cy: 0.58 },
    parade: [['.xxx.', 'xx.xx', 'xxxxx', 'xxxxx'], 'butter'],
    MOLE: ['..bbb..', '.bbbbb.', '.bebeb.', 'bbmnmbb', 'bbbbbbb', 'bbbbbbb'],
    BONK: ['.......', '..bbb..', '.bbbbb.', 'beebeeb', 'bbmnmbb', 'bbbbbbb'],
    init() {
      this.t = 0; A.seed(47);
      const L = A.letters, same = (i) => L[i] && L[i + 1] && Math.abs(L[i].y1 - L[i + 1].y1) < 2;
      const mx = Math.round(A.GW * (A.small ? 0.8 : 0.84)), mr = A.small ? 4 : 5, my = (A.small ? 9 : 10) + mr;   // the moon: keep the mallet off it
      this.holes = [1, 2, 3, 4, 5, 8, 9, 10].filter(same).map((i) => ({ i, x: Math.round((L[i].x1 + L[i + 1].x0) / 2) - 3, clip: Math.max(L[i].y0, L[i + 1].y0) + 1 }))
        .filter((o) => L[o.i].y0 < A.Y0 + 10 && !(Math.abs(o.x + 3 - mx) < mr + 10 && o.clip - 24 < my));   // top row only, clear of the moon
      const times = [650, 1250, 1800, 2300, 2750, 3150, 3550, 3920, 4280, 4620, 4950];
      let last = -1, prev = -1;
      this.S = times.map((at, n) => {
        let h; do { h = Math.floor(A.rnd() * this.holes.length); } while (h === last || h === prev);
        prev = last; last = h;
        return { at, h, miss: n === 3 || n === 8 };
      });
      this.fin = [0, Math.floor(this.holes.length / 2), this.holes.length - 1];
    },
    update(t) { this.t = t; },
    mole(k, t) {                          // how far mole k is up (0..1) and its face
      const s = this.S[k], a = s.at;
      if (t < a - 420 || t > a + 720) return null;
      if (!s.miss) {
        if (t < a) return { r: eo(seg(t, a - 420, a - 300)), f: 'MOLE' };
        return { r: 1 - seg(t, a + 90, a + 210), f: 'BONK' };
      }
      if (t < a - 90) return { r: eo(seg(t, a - 420, a - 300)), f: 'MOLE' };
      if (t < a + 200) return { r: 1 - seg(t, a - 90, a - 20), f: 'MOLE' };
      return { r: eo(seg(t, a + 200, a + 300)) * (1 - seg(t, a + 600, a + 700)), f: 'MOLE' };
    },
    mallet(t) {                           // head centre x, head top y, windup
      const S = this.S, H = this.holes, top = (k) => H[S[k].h].clip - 6 - (S[k].miss ? -2 : 3);
      let k = S.findIndex((s) => s.at + 150 > t);
      if (k < 0) { const e = S[S.length - 1], x0 = H[e.h].x + 3; const u = io(seg(t, e.at + 200, e.at + 900)); return { x: lerp(x0, Math.max(6, A.X0 - 6), u), y: lerp(top(S.length - 1) - 8, Math.max(3, A.Y0 - 16), u), w: 0 }; }
      const s = S[k], x = H[s.h].x + 3, hover = top(k) - 8;
      const px0 = k ? H[S[k - 1].h].x + 3 : A.GW + 6, t0 = k ? S[k - 1].at + 150 : 100;
      if (t < s.at - 200) return { x: lerp(px0, x, io(seg(t, t0, s.at - 200))), y: hover, w: 0 };
      if (t < s.at - 45) return { x, y: hover - 3 * eo(seg(t, s.at - 200, s.at - 60)), w: 1 };
      if (t < s.at) return { x, y: lerp(hover - 3, top(k), seg(t, s.at - 45, s.at) ** 2), w: 0 };
      if (t < s.at + 80) return { x, y: top(k), w: 0 };
      return { x, y: lerp(top(k), hover, eo(seg(t, s.at + 80, s.at + 150))), w: 0 };
    },
    draw() {
      const C = A.C, t = this.t, H = this.holes, map = { b: C.butter, e: C.line, n: C.rose, m: C.cream };
      // moles first, so the letters in front hide their lower half
      const up = new Map();
      this.S.forEach((s, k) => { const m = this.mole(k, t); if (m && m.r > 0) up.set(s.h, m); });
      const fz = seg(t, 5500, 5650) * (1 - seg(t, 6650, 6900));
      if (fz > 0) this.fin.forEach((h, j) => up.set(h, { r: fz, f: 'MOLE', bob: Math.round(Math.sin(t / 130 + j * 2) * 0.8) }));
      for (const [h, m] of up) { const o = H[h]; paint(o.x, o.clip - Math.round(6 * m.r) + (m.bob || 0) * (m.r > 0.9 ? 1 : 0), this[m.f], map, o.clip); }
      // jolts: a bonk nudges the two letters around the hole; a miss slams them
      const jolt = new Map();
      for (const s of this.S) { const d = t - s.at; if (d >= 0 && d < 160) { const o = H[s.h], v = s.miss ? (d < 70 ? 2 : 1) : d < 90 ? 1 : 0; for (const li of [o.i, o.i + 1]) if (v) jolt.set(li, v); } }
      const flash = new Set(); for (const s of this.S) if (s.miss && t - s.at >= 0 && t - s.at < 90) { flash.add(H[s.h].i); flash.add(H[s.h].i + 1); }
      A.drawWord({ off: (w) => (jolt.has(w.li) ? [0, jolt.get(w.li)] : null), col: (w) => (flash.has(w.li) ? C.hi : null) });
      // the mallet
      const m = this.mallet(t), hx = Math.round(m.x), hy = Math.round(m.y);
      line(hx + 1, hy - 1, hx + 5 + m.w, hy - 6 - m.w, C.cream);
      A.rect(hx - 3, hy, 7, 4, C.rose); A.rect(hx - 3, hy, 7, 1, C.hi); A.rect(hx - 3, hy, 1, 4, C.butter); A.rect(hx + 3, hy, 1, 4, C.butter);
      for (const s of this.S) {
        const d = t - s.at; if (d < 0 || d > 300) continue;
        const o = H[s.h], n = d < 70 || d > 230 ? 0 : d < 110 || d > 190 ? 1 : 2;
        A.sparkle(o.x + (s.miss ? -3 : 0), o.clip - 11, n, C.butter); if (!s.miss) A.sparkle(o.x + 8, o.clip - 9, Math.max(0, n - 1), C.hi);
      }
    },
  };

  // ---------- air hockey: the neon word is the far rail of the rink. The puck rallies between two mallets and every bank
  // off the top lights the letter it hits; the last shot banks off the word, beats the rose mallet and scores ----------
  sc.floorHockey = {
    name: 'air hockey', dur: 7000,
    word: { lay: 'line', F: 2, style: 'neon', cy: 0.41, mob: { lay: 'stack', F: 2, cy: 0.4 } },
    parade: [['.xxx.', 'xxxxx', 'xx.xx', 'xxxxx', '.xxx.'], 'teal'],
    ANG: [0.24, -0.3, 0.12, -0.22, 0.32, -0.14, 0.28, -0.26],
    init() {
      this.t = 0; this.k = 0;
      this.L0 = 3; this.L1 = A.GW - 4;           // puck centre limits along the rink
      this.top = A.WY1 + 1; this.bot = A.PH - 4;   // and across it: the top is the baseline of the word
      this.mid = Math.round((this.top + this.bot) / 2); this.g = Math.max(4, Math.round((this.bot - this.top) * 0.2));
      this.s = 0.15; this.TW = 5400 - 2.5 * (this.L1 - this.L0) / 0.17;   // the first teal strike after TW is the winner, so the goal lands near 5s
      this.m = [{ hx: this.L0 + 6, y: this.mid, hit: -1e9, lu: 0 }, { hx: this.L1 - 6, y: this.mid, hit: -1e9, lu: 0 }];
      this.p = { x: this.L0 + 13, y: this.mid + 2, vx: 0, vy: 0 };
      this.bump = new Map(); this.trail = []; this.served = false; this.win = -1; this.goal = -1; this.out = -1;
    },
    mxy(i) { const m = this.m[i]; return { x: m.hx + (i ? -m.lu : m.lu), y: m.y }; },
    letterAt(x) {
      let best = -1, bd = 1e9;
      A.letters.forEach((l, li) => { const d = x < l.x0 ? l.x0 - x : x > l.x1 ? x - l.x1 : 0; if (d < bd) { bd = d; best = li; } });
      return bd <= 2 ? best : -1;
    },
    strike(i, t) {
      const p = this.p, dir = i ? -1 : 1;
      this.s = Math.min(0.19, this.s * 1.05); this.m[i].hit = t;
      if (i === 1 && t > this.TW && this.win < 0) {                   // the winner: aimed at the mirror of the goal mouth
        this.win = t;
        const tx = this.L0 - 1, ty = 2 * this.top - this.mid, dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
        p.vx = dx / d * 0.19; p.vy = dy / d * 0.19; return;
      }
      let a = this.ANG[this.k++ % this.ANG.length];
      if (p.y < this.top + 4) a = Math.abs(a); else if (p.y > this.bot - 4) a = -Math.abs(a);   // never straight back into a rail
      p.vx = Math.cos(a) * this.s * dir; p.vy = Math.sin(a) * this.s;
    },
    update(t, dt) {
      this.t = t; if (!dt) return;
      const p = this.p;
      if (!this.served && t > 380) { this.served = true; this.strike(0, t); }
      const live = this.goal < 0;
      this.m.forEach((m, i) => {
        const coming = this.served && live && (i ? p.vx > 0 : p.vx < 0);
        let want = coming ? p.y : this.mid;
        if (i === 0 && this.win >= 0 && live) want = p.x < m.hx - 2 ? this.mid : this.top + 2;   // fooled by the bank: guards high, dives once it is past
        if (i === 1 && this.goal >= 0) want = this.mid + Math.sin((t - this.goal) / 90) * 4;                              // a little victory shimmy
        m.y += clamp(want - m.y, -0.11 * dt, 0.11 * dt);
        m.y = clamp(m.y, this.top + 2, this.bot - 2);
        const near = coming && Math.abs(p.x - m.hx) < 16 ? 1 : 0;
        const lunge = t - m.hit < 160 ? 3 * (1 - (t - m.hit) / 160) : near * 2;
        m.lu += (lunge - m.lu) * Math.min(1, dt / 40);
      });
      if (this.out >= 0) { const f = Math.exp(-dt / 260); p.vx *= f; p.vy *= f; }
      if (live || this.out >= 0) for (let s = 0; s < dt; s += 2) {
        const h = Math.min(2, dt - s);
        let nx = p.x + p.vx * h, ny = p.y + p.vy * h;
        if (ny < this.top) {                                             // the word is the rail: the letter it touches lights up
          ny = this.top; p.vy = Math.abs(p.vy);
          const li = this.letterAt(Math.round(nx));
          if (li >= 0 && (!this.bump.has(li) || t - this.bump.get(li) > 200)) this.bump.set(li, t);
        }
        if (ny > this.bot) { ny = this.bot; p.vy = -Math.abs(p.vy); }
        const mouth = Math.abs(ny - this.mid) <= this.g;
        if (nx < this.L0) { if (live && this.win >= 0 && mouth) { this.goal = t; break; } nx = this.L0; p.vx = Math.abs(p.vx); }
        if (nx > this.L1) { nx = this.L1; p.vx = -Math.abs(p.vx); }
        p.x = nx; p.y = ny;
        if (live) for (let i = 0; i < 2; i++) {
          if (i === 0 && this.win >= 0) continue;                       // the rose mallet whiffs the winner
          const c = this.mxy(i), dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy);
          if (d < 4.6 && dx * p.vx + dy * p.vy < 0) { p.x = c.x + dx / (d || 1) * 4.6; p.y = c.y + dy / (d || 1) * 4.6; this.strike(i, t); }
        }
      }
      if (this.goal >= 0 && this.out < 0 && t > this.goal + 1000) {   // the rose side gets the puck back and pushes it out; the air is off, so it coasts to the face-off spot
        const c = this.mxy(0); this.out = t; this.m[0].hit = t; p.x = c.x + 5; p.y = this.mid; p.vx = (Math.round(A.GW / 2) - p.x) / 260; p.vy = 0;
      }
      if (this.win < 0 && t > 6300 && this.out < 0) this.out = t;        // never scored: the air cuts out and it slides to rest
      this.trail.unshift([p.x, p.y]); if (this.trail.length > 4) this.trail.pop();
    },
    draw() {
      const C = A.C, t = this.t, W = A.GW, P = A.PH, top = this.top, g = this.g, mid = this.mid;
      const gt = this.goal >= 0 ? t - this.goal : -1, flash = gt >= 0 && gt < 900 && Math.floor(gt / 110) % 2 === 0;
      // the rink: the word is its far rail, then side rails with the goal mouths, a centre line and circle, air holes
      const ry = A.WY1 - 1;
      A.rect(1, ry, Math.max(0, A.X0 - 3), 1, C.line); A.rect(A.X0 + A.WW + 2, ry, Math.max(0, W - 3 - (A.X0 + A.WW + 2)), 1, C.line);
      A.rect(1, P - 2, W - 2, 1, C.line);
      for (const [x, col] of [[1, flash ? C.hi : C.rose], [W - 2, C.teal]]) {
        A.rect(x, ry, 1, mid - g - ry, C.line); A.rect(x, mid + g + 1, 1, P - 2 - (mid + g + 1), C.line);
        A.rect(x, mid - g - 1, 1, 1, col); A.rect(x, mid + g + 1, 1, 1, col);
        for (let y = mid - g; y <= mid + g; y += 2) A.px(x, y, col);
      }
      const lamp = (x, c, on) => { A.rect(x, ry - 3, 3, 2, on ? (flash ? C.hi : c) : C.line); A.px(x + 1, ry - 1, C.line); };
      lamp(3, C.rose, gt >= 0 && gt < 1600); lamp(W - 6, C.teal, false);
      const cxm = Math.round(W / 2);
      for (let y = top + 1; y < P - 3; y += 3) A.px(cxm, y, C.line);
      A.ring(cxm, mid, Math.min(7, Math.round((this.bot - top) / 3)), C.line);
      const air = this.out < 0 ? 1 : 1 - seg(t, this.out, this.out + 600);
      for (let x = 8; x < W - 6; x += 12) for (let y = top + 5; y < P - 4; y += 9) if (((x * 7 + y * 3) % 10) / 10 < air) A.px(x, y, C.line);
      // the letters: a bank lights the letter and knocks it up a pixel; a goal runs a teal wave back along the word
      A.drawWord({
        off: (w) => { const b = this.bump.get(w.li); return b !== undefined && t - b < 200 ? [0, -1] : null; },
        col: (w) => {
          const b = this.bump.get(w.li);
          if (b !== undefined && t - b < 130) return C.hi;
          if (gt >= 0 && gt < 1400) { const f = (A.X0 + A.WW - w.x) - gt * 0.22; if (f > -14 && f < 0) return w.edge ? C.teal : C.deep; }
          return null;
        },
      });
      // puck with a short streak, then the two mallets
      const p = this.p, show = this.goal < 0 || this.out >= 0;
      if (show) {
        for (let i = this.trail.length - 1; i > 0; i--) { const [x, y] = this.trail[i]; if (this.out < 0 || i < 2) A.rect(x - 1, y - 1, 3, 3, i > 2 ? C.line : C.dim); }
        A.rect(p.x - 1, p.y - 1, 3, 3, C.hi); A.px(p.x, p.y, C.cream);
      }
      [C.rose, C.teal].forEach((col, i) => { const c = this.mxy(i); A.disc(c.x, c.y, 3, col); A.disc(c.x, c.y, 1, t - this.m[i].hit < 120 ? C.butter : C.hi); });
      if (gt >= 0 && gt < 700) for (const [sx, sy, d] of [[this.L0 + 3, mid - g - 3, 0], [this.L0 + 6, mid + g + 2, 110], [this.L0 + 9, mid - 1, 220]]) {
        const q = (gt - d) / 380; if (q > 0 && q < 1) A.sparkle(sx, sy, q < 0.25 || q > 0.75 ? 0 : 1, C.butter);
      }
    },
  };

  return sc;
});
