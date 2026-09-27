// attract pack: classics. Six golden-age arcade games replayed on the QuarterSmart wordmark:
// asteroids, missile command, galaga, centipede, lunar lander and a cube hopper.
// Every scene is driven by its own clock and seeded maths, so ?scene=<id>&t=<ms> always lands
// on the same frame. All drawing stays above A.PH (the ground and title text live below it).
(window.QSAttractPacks = window.QSAttractPacks || []).push((A) => {
  const TAU = Math.PI * 2;
  const lerp = (a, b, u) => a + (b - a) * u;
  const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eo = (x) => 1 - Math.pow(1 - x, 3);
  const eo2 = (x) => 1 - (1 - x) * (1 - x);
  const seg = (t, a, b) => A.clamp((t - a) / (b - a));
  const Z = [0, 0];
  // guarded kit: nothing ever lands on or below the play field floor
  const px = (x, y, c) => { const yy = Math.round(y); if (yy >= 0 && yy < A.PH) A.px(x, yy, c); };
  const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); };
  const disc = (cx, cy, r, c) => {
    if (r <= 0) return;
    cx = Math.round(cx); cy = Math.round(cy);
    const R = Math.ceil(r);
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) if (x * x + y * y <= r * r + 0.35) px(cx + x, cy + y, c);
  };
  const line = (x0, y0, x1, y1, c) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (let n = 0; n < 600; n++) {
      px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  };
  // multi-colour sprite: rows of chars, map char -> colour ('.' is empty), optional mirror
  const spr = (x, y, rows, map, flip) => {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j], n = r.length;
      for (let i = 0; i < n; i++) { const ch = r[flip ? n - 1 - i : i]; if (ch !== '.') px(x + i, y + j, map[ch] || map.x); }
    }
  };
  const bez = (p0, p1, p2, p3, u) => {
    const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
  };
  const shortest = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
  // keyframed value: keys are [t0, t1, from, to]; eased in between, held outside
  const keyed = (keys, t, first) => {
    let v = keys.length ? keys[0][2] : first;
    for (const [t0, t1, f, to] of keys) {
      if (t < t0) return v;
      if (t < t1) return lerp(f, to, eio(seg(t, t0, t1)));
      v = to;
    }
    return v;
  };

  return {
    // ---------------------------------------------------------------------------------------
    // ASTEROIDS: a vector ship turns and fires; each letter it hits cracks into three rocks
    // that drift apart, then every rock glides home and the word snaps back together.
    classicsAsteroids: {
      name: 'asteroids', dur: 7200,
      word: { lay: 'line', F: 2, style: 'neon' },
      parade: [['..x..', '.x.x.', '.x.x.', 'x...x', 'xx.xx'], 'cream'],
      init() {
        this.t = 0;
        const L = A.letters, W = A.word;
        this.sy = Math.round(A.WY1 + (A.PH - A.WY1) * 0.5);
        const cen = L.map((l) => [(l.x0 + l.x1) / 2, (l.y0 + l.y1) / 2]);
        const want = A.small ? [8, 0, 10, 6, 7, 11] : [2, 9, 5, 0, 11, 7];
        this.shots = [];
        const seen = new Set();
        let tf = 900;
        for (const li of want) {
          const ox = this.shipX(tf), a = Math.atan2(cen[li][1] - this.sy, cen[li][0] - ox);
          let hit = null;
          for (let d = 6; d < 260; d += 0.5) {
            const x = Math.round(ox + Math.cos(a) * d), y = Math.round(this.sy + Math.sin(a) * d);
            if (y < 0) break;
            const i = A.at.get(x * 1000 + y);
            if (i !== undefined) { hit = { x, y, d, li: W[i].li }; break; }
          }
          if (!hit || seen.has(hit.li)) continue;
          seen.add(hit.li);
          this.shots.push({ tf, a, ox, li: hit.li, hx: hit.x, hy: hit.y, th: tf + (hit.d - 6) / 0.12 });
          tf += 600;
        }
        // each struck letter cracks in two along the bullet's path; the halves drift apart like rocks
        this.ch = new Map();
        for (const s of this.shots) {
          const fx = Math.cos(s.a), fy = Math.sin(s.a), nx = -fy, ny = fx;
          const dirs = [[nx + fx * 0.35, ny + fy * 0.35], [-nx + fx * 0.35, -ny + fy * 0.35]].map(([x, y]) => { const m = Math.hypot(x, y) || 1; return [x / m, y / m]; });
          this.ch.set(s.li, { th: s.th, dirs, nx, ny, cx: cen[s.li][0], cy: cen[s.li][1] });
        }
        this.k = new Int8Array(W.length).fill(-1);
        for (const w of W) {
          const c = this.ch.get(w.li);
          if (c) this.k[w.i] = (w.x - c.cx) * c.nx + (w.y - c.cy) * c.ny >= 0 ? 0 : 1;
        }
        // the ship's heading: turn to each target just before firing, back to north, then a victory spin
        this.keys = [];
        let prev = -Math.PI / 2;
        for (const s of this.shots) { const to = prev + shortest(prev, s.a); this.keys.push([s.tf - 430, s.tf - 40, prev, to]); prev = to; }
        const up = prev + shortest(prev, -Math.PI / 2);
        const last = this.shots.length ? this.shots[this.shots.length - 1].th : 4000;
        this.keys.push([last + 300, last + 800, prev, up], [6200, 6950, up, up + TAU]);
        A.seed(31);
        this.deb = this.shots.map((s) => Array.from({ length: 6 }, () => [s.a + Math.PI + (A.rnd() - 0.5) * 2.6, 0.012 + A.rnd() * 0.02]));
        this.off = new Map();
        this.ang = -Math.PI / 2;
      },
      // the ship glides slowly along the space under the word
      shipX(t) { return Math.round(A.GW / 2 + Math.sin(t / 1900 - 0.7) * A.GW * (A.small ? 0.26 : 0.16)); },
      update(t) {
        this.t = t;
        this.sx = this.shipX(t);
        this.ang = keyed(this.keys, t, -Math.PI / 2);
        const D = A.small ? 2.5 : 3;
        this.off = new Map();
        for (const [li, c] of this.ch) {
          if (t < c.th || t > c.th + 2200) continue;
          let d = D * eo(seg(t, c.th, c.th + 500)) + Math.min(1.5, Math.max(0, t - c.th - 500) * 0.0012);
          d *= 1 - eio(seg(t, c.th + 1450, c.th + 2050));
          this.off.set(li, c.dirs.map(([x, y]) => [Math.round(x * d), Math.round(y * d)]));
        }
      },
      draw() {
        const C = A.C, t = this.t;
        A.drawWord({
          off: (w) => { const o = this.off.get(w.li); return o ? o[this.k[w.i]] : Z; },
          col: (w) => {
            const c = this.ch.get(w.li);
            if (!c || t < c.th) return null;
            if (t - c.th < 110) return C.hi;
            const back = c.th + 2050;
            if (t > back && t < back + 130) return C.hi;
            return t < back && w.edge ? C.cream : null;
          },
        });
        for (const s of this.shots) {
          if (t < s.tf || t >= s.th) continue;
          const d = 6 + (t - s.tf) * 0.12, x = s.ox + Math.cos(s.a) * d, y = this.sy + Math.sin(s.a) * d;
          px(x - Math.cos(s.a) * 1.6, y - Math.sin(s.a) * 1.6, C.dim);
          px(x, y, C.hi);
        }
        this.shots.forEach((s, n) => {
          const age = t - s.th;
          if (age < 0 || age > 520) return;
          for (const [g, v] of this.deb[n]) px(s.hx + Math.cos(g) * v * age, s.hy + Math.sin(g) * v * age, age < 260 ? C.cream : C.dim);
        });
        const a = this.ang, R = A.small ? 4.2 : 5.2, cx = this.sx, cy = this.sy;
        const P = (g, r) => [cx + Math.cos(g) * r, cy + Math.sin(g) * r];
        const n = P(a, R), l = P(a + 2.4, R), r = P(a - 2.4, R), b = P(a + Math.PI, R * 0.25);
        if (t > 6150 && t < 6950 && Math.floor(t / 70) % 2 === 0) { const f = P(a + Math.PI, R * 0.25 + 2.6); line(b[0], b[1], f[0], f[1], C.butter); }
        line(n[0], n[1], l[0], l[1], C.hi); line(n[0], n[1], r[0], r[1], C.hi);
        line(l[0], l[1], b[0], b[1], C.hi); line(r[0], r[1], b[0], b[1], C.hi);
      },
    },

    // ---------------------------------------------------------------------------------------
    // MISSILE COMMAND: the letters are the cities. Missiles streak down, the crosshair glides to
    // meet them and interceptor blooms pop them; one gets through, scorches a letter, and it heals.
    classicsMissile: {
      name: 'missile command', dur: 7200,
      word: { lay: 'line', F: 2, style: 'band', cy: 0.72 },
      parade: [['..x..', '.xxx.', 'xxxxx'], 'teal'],
      rad(b, t) { const u = (t - b.tb) / b.dur; return u <= 0 || u >= 1 ? 0 : b.R * Math.pow(Math.sin(Math.PI * u), 0.6); },
      init() {
        this.t = 0;
        const GW = A.GW, X0 = A.X0, WW = A.WW, TR = 2600;
        const top = (fx) => {
          const x = Math.round(X0 + fx * WW);
          for (let k = 0; k < 10; k++) for (const xx of [x + k, x - k]) if (A.topOf.has(xx)) return [xx, A.topOf.get(xx)];
          return [x, A.Y0];
        };
        this.gy = Math.min(A.PH - 1, A.WY1 + 1);
        const bw = Math.max(4, Math.round(X0 / 2));
        this.bases = [[bw, this.gy - 4], [GW - 1 - bw, this.gy - 4]];
        this.ms = []; this.bl = []; this.sc = null;
        const add = (x0, y0, x1, y1, t0, T) => { const m = { x0, y0, x1, y1, t0, T, end: t0 + T, pop: false }; this.ms.push(m); return m; };
        const at = (m, t) => { const u = (t - m.t0) / m.T; return [lerp(m.x0, m.x1, u), lerp(m.y0, m.y1, u)]; };
        const near = (x) => (Math.abs(x - this.bases[0][0]) < Math.abs(x - this.bases[1][0]) ? this.bases[0] : this.bases[1]);
        const plan = [
          { t0: 100, sx: 0.14, tx: 0.1, f: 0.68 },
          { t0: 420, sx: 0.86, tx: 0.8, f: 0.64 },
          { t0: 850, sx: 0.5, tx: 0.44, f: 0.7 },
          { t0: 1250, sx: 0.66, tx: 0.63, hit: true },
          { t0: 2150, sx: 0.3, kids: [0.16, 0.38], f: 0.3 },
          { t0: 2600, sx: 0.97, tx: 0.93, f: 0.66 },
          { t0: 3150, sx: 0.04, tx: 0.27, f: 0.62 },
          { t0: 3650, sx: 0.76, tx: 0.72, f: 0.66 },
          { t0: 4250, sx: 0.4, tx: 0.55, f: 0.7 },
          { t0: 4500, sx: 0.88, tx: 0.99, f: 0.62 },
        ];
        const R = A.small ? 5 : 6;
        for (const p of plan) {
          const sx = p.sx * GW;
          if (p.kids) {
            const k0 = top(p.kids[0]), k1 = top(p.kids[1]);
            const mid = [(k0[0] + k1[0]) / 2, (k0[1] + k1[1]) / 2];
            const par = add(sx, -1, mid[0], mid[1], p.t0, TR);
            const ts = p.t0 + 0.4 * TR, S = at(par, ts);
            par.end = ts;
            const a = add(S[0], S[1], k0[0], k0[1], ts, TR * 0.6), b = add(S[0], S[1], k1[0], k1[1], ts, TR * 0.6);
            const tt = ts + p.f * TR * 0.6, pa = at(a, tt), pb = at(b, tt);
            const c = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 + 1];
            this.bl.push({ x: c[0], y: c[1], tb: tt - 190, dur: 760, R: R + 1.5, base: near(c[0]), ms: [a, b] });
          } else if (p.hit) {
            const T = top(p.tx), m = add(sx, -1, T[0], T[1], p.t0, TR);
            const li = A.word[A.at.get(T[0] * 1000 + T[1])].li;
            this.sc = { x: T[0], y: T[1] + 1, th: p.t0 + TR, R: A.small ? 4.5 : 5.5, li };
            this.bl.push({ x: T[0], y: T[1], tb: p.t0 + TR - 30, dur: 520, R: 3.5, base: null, ms: [] });
            m.end = p.t0 + TR;
          } else {
            const T = top(p.tx), m = add(sx, -1, T[0], T[1], p.t0, TR), I = at(m, p.t0 + p.f * TR);
            this.bl.push({ x: I[0], y: I[1] + 1, tb: p.t0 + p.f * TR - 170, dur: 700, R, base: near(I[0]), ms: [m] });
          }
        }
        // when does each missile meet its bloom
        for (const b of this.bl) for (const m of b.ms) {
          for (let tt = Math.max(m.t0, b.tb); tt < m.t0 + m.T; tt += 6) {
            const [x, y] = at(m, tt);
            if (Math.hypot(x - b.x, y - b.y) <= this.rad(b, tt) + 0.5) { m.end = tt; m.pop = true; break; }
          }
        }
        // counter missiles and the crosshair that aims them
        const fired = this.bl.filter((b) => b.base).sort((p, q) => p.tb - q.tb);
        const cx = [], cy = [];
        let px0 = GW / 2, py0 = Math.max(4, A.Y0 - 14), free = 0;
        for (const b of fired) {
          b.tl = b.tb - Math.hypot(b.x - b.base[0], b.y - b.base[1]) / 0.2;
          const t0 = Math.max(free, b.tl - 560), t1 = Math.max(t0 + 120, b.tl - 40);
          cx.push([t0, t1, px0, b.x]); cy.push([t0, t1, py0, b.y]);
          px0 = b.x; py0 = b.y; free = b.tl + 60;
        }
        cx.push([free + 500, free + 1500, px0, GW / 2]); cy.push([free + 500, free + 1500, py0, Math.max(4, A.Y0 - 14)]);
        this.cx = cx; this.cy = cy; this.x0 = GW / 2; this.y0 = Math.max(4, A.Y0 - 14);
        this.at = at;
      },
      update(t) { this.t = t; },
      draw() {
        const C = A.C, t = this.t, s = this.sc;
        rect(0, this.gy, A.GW, 1, C.line);
        for (const [bx, by] of this.bases) spr(bx - 2, by + 1, ['..x..', '.xxx.', 'xxxxx'], { x: C.quart });
        for (const b of this.bl) {
          if (!b.base || t < b.tl || t >= b.tb) continue;
          const u = (t - b.tl) / (b.tb - b.tl), hx = lerp(b.base[0], b.x, u), hy = lerp(b.base[1], b.y, u);
          line(b.base[0], b.base[1], hx, hy, C.teal); px(hx, hy, C.hi);
        }
        for (const m of this.ms) {
          if (t < m.t0 || t > m.end + 260) continue;
          const [hx, hy] = this.at(m, Math.min(t, m.end));
          line(m.x0, m.y0, hx, hy, t > m.end ? C.line : C.rose);
          if (t <= m.end) px(hx, hy, C.hi);
        }
        A.drawWord({
          off: (w) => (s && w.li === s.li && t >= s.th && t < s.th + 140 ? [0, 1] : Z),
          col: s ? (w) => {
            if (t < s.th) return null;
            const d = Math.hypot(w.x - s.x, w.y - s.y);
            if (d > s.R) return null;
            const heal = s.th + 700 + (1 - d / s.R) * 1700;
            if (t >= heal) return null;
            if (t - s.th < 900 && d < 3 && (w.x * 3 + w.y + Math.floor((t - s.th) / 160)) % 4 === 0) return C.rose;
            return d < 2.2 ? C.line : C.dim;
          } : null,
        });
        // blooms: layered discs whose colours roll inward, the cabinet's flashing explosion, slowed down
        const bc = [C.rose, C.butter, C.hi];
        for (const b of this.bl) {
          const r = this.rad(b, t);
          if (r <= 0) continue;
          const ph = Math.floor((t - b.tb) / 120);
          disc(b.x, b.y, r, bc[ph % 3]);
          disc(b.x, b.y, r - 1.3, bc[(ph + 1) % 3]);
          disc(b.x, b.y, r - 2.8, bc[(ph + 2) % 3]);
        }
        // the crosshair: a square reticle with a centre dot, so it never reads as a star
        const x = Math.round(keyed(this.cx, t, this.x0)), y = Math.round(keyed(this.cy, t, this.y0));
        spr(x - 3, y - 3, ['xx...xx', 'x.....x', '.......', '...o...', '.......', 'x.....x', 'xx...xx'], { x: C.quart, o: C.hi });
      },
    },

    // ---------------------------------------------------------------------------------------
    // GALAGA: a formation swoops in, the boss dives and tractor-beams one letter up into the
    // formation (held red, like a captured fighter); the fighter shoots the boss and the letter
    // drops back home. Then the formation peels away.
    classicsGalaga: {
      name: 'galaga', dur: 7400,
      word: { lay: 'line', F: 2, style: 'multi', cy: 0.66 },
      parade: [['.x.x.', 'xxxxx', 'x.x.x', '.x.x.'], 'butter'],
      init() {
        this.t = 0;
        const L = A.letters, GW = A.GW;
        this.li = A.small ? 0 : 7;
        const l = L[this.li];
        this.l = l;
        this.lcx = Math.round((l.x0 + l.x1) / 2);
        this.lh = l.y1 - l.y0 + 1;
        this.fy = Math.round(A.clamp(A.Y0 - 12, this.lh + 3, this.lh + 10));
        this.hy = l.y0 - 11;
        this.dS = this.lcx < GW / 2 ? 1 : -1;
        const n = A.small ? 7 : 9, xa = A.X0 + 10, xb = A.X0 + A.WW - 10;
        let slots = Array.from({ length: n }, (_, i) => xa + (xb - xa) * i / (n - 1));
        let bi = 0;
        slots.forEach((x, i) => { if (Math.abs(x - this.lcx) < Math.abs(slots[bi] - this.lcx)) bi = i; });
        slots[bi] = this.lcx;
        const lw2 = (l.x1 - l.x0 + 1) / 2;
        this.en = [];
        let order = 0;
        slots.forEach((x, i) => {
          if (i !== bi && Math.abs(x - this.lcx) < lw2 + 4) return;
          const side = x < GW / 2 ? -1 : 1, te = 80 + order * 120;
          order++;
          const sx = Math.round(x), sy = i === bi ? this.fy : this.fy + 1;
          const dip = Math.min(this.fy + 14, A.Y0 - 4);
          this.en.push({
            boss: i === bi, sx, sy, te, dur: 1050, side,
            p0: [side < 0 ? -10 : GW + 10, -4], p1: [GW / 2 - side * GW * 0.18, dip], p2: [sx + side * 22, dip + 2],
          });
        });
        this.boss = this.en.find((e) => e.boss);
        this.bx = this.lcx;
        // timeline for the capture and the rescue
        this.tDive = 2050; this.tHover = 2850; this.tRise = 3100; this.tHeld = 3800; this.tBack = 3900; this.tHome = 4700; this.tFire = 4950;
        const dist = A.PH - 6 - (this.fy + 4);
        this.bv = Math.max(0.17, dist / 260);
        this.tHit = this.tFire + dist / this.bv;
        A.seed(17);
        this.deb = Array.from({ length: 8 }, (_, k) => [k / 8 * TAU + A.rnd() * 0.4, 0.02 + A.rnd() * 0.02]);
      },
      slot(e, t) {
        const amp = 0.045 * seg(t, 2100, 2600);
        const br = amp ? Math.sin((t - 2100) / 380) * amp : 0;
        return [this.bx + (e.sx - this.bx) * (1 + br), e.sy];
      },
      enemy(e, t) {
        if (t < e.te) return null;
        if (t < e.te + e.dur) return bez(e.p0, e.p1, e.p2, [e.sx, e.sy], eo2((t - e.te) / e.dur));
        if (e.boss) {
          if (t >= this.tHit) return null;
          const dS = this.dS, hov = [this.lcx, this.hy], home = [this.lcx, this.fy];
          if (t >= this.tDive && t < this.tHover) return bez(home, [this.lcx + 26 * dS, this.fy - 6], [Math.max(4, this.lcx - 24 * dS), this.hy - 10], hov, eio(seg(t, this.tDive, this.tHover)));
          if (t >= this.tHover && t < this.tBack) return hov;
          if (t >= this.tBack && t < this.tHome) return bez(hov, [this.lcx + 18 * dS, this.hy - 6], [this.lcx - 14 * dS, this.fy + 8], home, eio(seg(t, this.tBack, this.tHome)));
          return home;
        }
        const tx = this.tHit + 900 + (e.sx % 7) * 60;
        const p = this.slot(e, t);
        if (t > tx) {
          const u = seg(t, tx, tx + 750);
          if (u >= 1) return null;
          return bez(p, [p[0] + e.side * 10, p[1] + 8], [p[0] + e.side * 30, 0], [p[0] + e.side * 40, -14], eio(u));
        }
        return p;
      },
      // letter offset: rising in the beam, riding above the boss, then falling home
      loff(t) {
        const l = this.l, lh = this.lh;
        if (t < this.tRise) return Z;
        if (t < this.tBack) return [0, Math.round(lerp(0, this.hy - 2 - lh - l.y0 + 1, eio(seg(t, this.tRise, this.tHeld))))];
        if (t < this.tHit) { const b = this.enemy(this.boss, t); return [Math.round(b[0] - this.lcx), Math.round(b[1] - 2 - lh + 1 - l.y0)]; }
        const dy0 = this.fy - 2 - lh + 1 - l.y0;
        if (t < this.tHit + 520) return [0, Math.round(dy0 * (1 - Math.pow(seg(t, this.tHit, this.tHit + 520), 2)))];
        return [0, -Math.round(2 * Math.sin(Math.PI * seg(t, this.tHit + 520, this.tHit + 720)))];
      },
      update(t) { this.t = t; this.lo = this.loff(t); },
      draw() {
        const C = A.C, t = this.t, li = this.li, lo = this.lo || Z;
        // tractor beam: a striped cone from the boss that wraps the letter and shortens as it is hauled up
        if (t >= this.tHover && t < this.tHeld + 100) {
          const top = this.hy + 5, full = this.l.y1 + 1 - top, bottom = this.l.y1 + 1 + lo[1];
          const len = Math.min(full * eo(seg(t, this.tHover, this.tRise)), bottom - top);
          const hw = (this.l.x1 - this.l.x0 + 1) / 2 + 2;
          for (let k = 0; k < len; k++) {
            const ph = ((k - Math.floor(t / 55)) % 4 + 4) % 4;
            if (ph === 3) continue;
            const w = Math.round(1 + (hw - 1) * k / Math.max(1, full));
            for (let x = -w; x <= w; x++) if (ph === 0 || (x + k) % 2 === 0) px(this.lcx + x, top + k, ph === 0 ? C.quart : C.teal);
          }
        }
        A.drawWord({
          off: (w) => (w.li === li ? lo : Z),
          col: (w) => {
            if (w.li !== li || t < this.tRise) return null;
            if (t < this.tHeld) return (w.y + Math.floor(t / 70)) % 3 === 0 ? C.teal : C.hi;
            if (t < this.tHit) return C.rose;
            if (t > this.tHit + 500 && t < this.tHit + 600) return C.hi;
            return null;
          },
        });
        const flap = Math.floor(t / 260) % 2;
        const bee = flap ? ['x.x.x', 'xxxxx', '.oxo.', '.x.x.'] : ['.x.x.', 'xxxxx', '.oxo.', 'x...x'];
        const boss = flap ? ['..o.o..', '.xxxxx.', 'xx.x.xx', 'xxxxxxx', 'x.x.x.x'] : ['..o.o..', '.xxxxx.', 'xx.x.xx', 'xxxxxxx', '.x.x.x.'];
        for (const e of this.en) {
          const p = this.enemy(e, t);
          if (!p) continue;
          if (e.boss) spr(p[0] - 3, p[1], boss, { x: C.quart, o: C.rose });
          else spr(p[0] - 2, p[1], bee, { x: C.butter, o: C.teal });
        }
        // boss explosion
        const age = t - this.tHit;
        if (age >= 0 && age < 480) {
          const bx = this.lcx, by = this.fy + 2;
          A.ring(bx, by, 1 + age / 110, age < 160 ? C.hi : age < 320 ? C.butter : C.rose);
          if (age < 380) for (const [g, v] of this.deb) px(bx + Math.cos(g) * v * age, by + Math.sin(g) * v * age, C.butter);
        }
        // fighter and its shot
        const idle = (tt) => A.GW / 2 + Math.sin(tt / 900) * A.GW * 0.12;
        let fx = idle(t);
        if (t > this.tBack) fx = lerp(idle(this.tBack), this.lcx, eio(seg(t, this.tBack, this.tHome + 100)));
        if (t > this.tHit + 200) fx = lerp(this.lcx, idle(t), eio(seg(t, this.tHit + 200, this.tHit + 1300)));
        const fy = A.PH - 5;
        spr(Math.round(fx) - 2, fy, ['..x..', '..x..', 'o.x.o', 'xxxxx', 'x.o.x'], { x: C.hi, o: C.rose });
        if (t >= this.tFire && t < this.tHit) { const y = fy - 1 - (t - this.tFire) * this.bv; px(this.lcx, y, C.hi); px(this.lcx, y + 1, C.butter); }
      },
    },

    // ---------------------------------------------------------------------------------------
    // CENTIPEDE: the letters are the mushrooms. A slim centipede comes down, runs along the band
    // above the small letters, bumps the tall ones and threads down the one-pixel gaps between
    // letters. Below the word the shooter chips its head into fresh mushrooms, and each new head
    // bumps the mushroom it just became and turns, just like the cabinet.
    classicsCentipede: {
      name: 'centipede', dur: 7400,
      word: { lay: 'line', F: 2, style: 'bricks', cy: 0.44 },
      parade: [['.x.x.x.x.x', 'xxxxxxxxxx', 'x.x.x.x.x.'], 'quart'],
      free(x, y) {
        if (x < 0 || x + 1 > A.GW - 1) return false;
        for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) if (this.occ.has((x + i) * 1000 + y + j)) return false;
        return true;
      },
      addM(x, y, t) {
        this.mush.push({ x, y, t });
        for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) this.occ.add((x + i) * 1000 + y + j);
      },
      // one pixel of centipede rules: run sideways; on a bump drop a lane and turn round, or just
      // turn round when there is no room to drop
      step(s) {
        if (s.mode === 1) { s.y += s.vy; if (--s.cnt === 0) s.mode = 0; s.lane = s.mode === 0; return; }
        s.lane = false;
        const nx = s.x + s.dir;
        if (this.free(nx, s.y)) { s.x = nx; s.rev = 0; return; }
        const dd = s.y >= A.WY1 ? 4 : 2;
        if (s.y >= A.WY1) { if (s.vy > 0 && s.y + dd > this.maxY) s.vy = -1; else if (s.vy < 0 && s.y - dd < A.WY1) s.vy = 1; }
        let ok = true;
        for (let k = 1; k <= dd; k++) if (!this.free(s.x, s.y + s.vy * k)) ok = false;
        s.dir = -s.dir;
        if (ok || s.rev >= 2) { s.mode = 1; s.cnt = dd; s.rev = 0; s.y += s.vy; if (--s.cnt === 0) s.mode = 0; }
        else s.rev++;
      },
      sim(from, upto) {
        const P = this.path;
        P.length = from + 1;
        const s = { ...P[from] };
        while (P.length < upto) {
          this.step(s);
          P.push({ ...s });
        }
      },
      init() {
        this.t = 0; this.N = 11; this.P = 3; this.v = 0.055;
        const L = A.letters, Y0 = A.Y0, WY1 = A.WY1;
        this.occ = new Set();
        for (const w of A.word) this.occ.add(w.x * 1000 + w.y);
        this.mush = [];
        this.maxY = A.PH - 9;
        // a loose field of mushrooms under the word: one per lane, jittered, never two in a column
        A.seed(41);
        const cols = [], lanes = [];
        for (let y = WY1; y <= this.maxY; y += 4) lanes.push(y);
        const n = Math.max(3, Math.min(lanes.length * 2, Math.round(A.GW / 26)));
        for (let k = 0; k < n; k++) {
          const y = lanes[(k * 3 + 1) % lanes.length];
          const x = Math.round(6 + ((k + 0.2 + A.rnd() * 0.6) / n) * (A.GW - 16));
          if (cols.some((c) => Math.abs(c - x) < 7)) continue;
          cols.push(x);
          this.addM(x, y, -1);
        }
        const stacked = L[7].y0 > L[6].y1;
        // entry: straight down from the sky into the word
        let xs, ys, d0;
        if (stacked) {
          // phone: a gap that runs clean through both rows (a|r above, m|a below)
          xs = L[2].x1 + 1; ys = WY1 - 2; d0 = 1;
          for (let y = Y0; y < WY1; y++) if (!this.free(xs, y)) { xs = L[1].x1 + 1; break; }
        } else { xs = L[5].x0 + 4; ys = Y0 + 2; d0 = -1; }
        this.path = [];
        const y0 = ys - (this.N * this.P + 24);
        for (let y = y0; y <= ys; y++) this.path.push({ x: xs, y, dir: d0, vy: 1, mode: 0, cnt: 0, rev: 0, lane: false });
        this.i0 = this.path.length - 1 - 14;
        this.len = this.i0 + Math.ceil(this.dur * this.v) + 60;
        this.sim(this.path.length - 1, this.len);
        this.dead = 0; this.shot = null; this.next = 2200; this.shx = A.GW / 2;
      },
      hidx(t) { return this.i0 + Math.floor(t * this.v); },
      update(t, dt) {
        this.t = t;
        const P = this.P, i = this.hidx(t), shY = A.PH - 4;
        if (this.shot && t >= this.shot.tj) {
          const s = this.shot, st = this.path[s.j];
          this.addM(st.x - 1, st.y - 1, t);
          this.dead++;
          this.sim(s.j - P, this.len);
          this.shot = null; this.next = t + 560;
        }
        if (!this.shot && t >= this.next && this.dead < 4) {
          const h = i - this.dead * P, s = this.path[h];
          if (s && s.mode === 0 && s.y >= A.WY1) {
            const j = h + Math.max(12, Math.ceil(((shY - 2 - s.y) / 0.3 + 240) * this.v));
            let ok = j < this.path.length;
            for (let q = h; ok && q <= j; q++) if (this.path[q].mode !== 0 || this.path[q].y !== s.y) ok = false;
            if (ok) {
              const sj = this.path[j], tj = (j + this.dead * P - this.i0) / this.v, fly = (shY - 1 - (sj.y + 1)) / 0.3;
              const x = sj.x + (sj.dir > 0 ? 1 : 0);
              if (tj - fly > t + 140) this.shot = { j, x, tj, fire: tj - fly, t0: t, x0: this.shx };
            }
          }
        }
        if (this.shot) this.shx = lerp(this.shot.x0, this.shot.x, eio(seg(t, this.shot.t0, this.shot.fire - 20)));
        else if (dt) { const h = this.path[i - this.dead * P]; if (h && h.y >= A.WY1) this.shx += (h.x - this.shx) * Math.min(1, dt / 700); }
      },
      draw() {
        const C = A.C, t = this.t, P = this.P, i = this.hidx(t);
        A.drawWord();
        for (const m of this.mush) {
          if (m.t > 0 && t < m.t) continue;
          const pop = m.t > 0 && t - m.t < 160;
          spr(m.x, m.y, ['.xx.', 'xxxx', '.ss.'], { x: pop ? C.hi : C.rose, s: C.cream });
        }
        for (let k = this.N - 1; k >= this.dead; k--) {
          const s = this.path[i - k * P];
          if (!s) continue;
          const head = k === this.dead;
          rect(s.x, s.y, 2, 2, head ? C.butter : (k % 2 ? C.quart : C.teal));
          if (head) px(s.dir > 0 ? s.x + 1 : s.x, s.y, C.hi);
        }
        const sh = this.shot;
        if (sh && t >= sh.fire && t < sh.tj) { const y = A.PH - 5 - (t - sh.fire) * 0.3; px(sh.x, y, C.hi); px(sh.x, y + 1, C.cream); }
        spr(Math.round(this.shx) - 1, A.PH - 4, ['.o.', 'xxx', 'xxx'], { x: C.teal, o: C.hi });
      },
    },

    // ---------------------------------------------------------------------------------------
    // LUNAR LANDER: a lander drifts in, burns, corrects with side puffs and sets down gently on
    // the flat top of a letter. Pad lights chase, dust puffs out, a tiny astronaut plants a flag.
    classicsLander: {
      name: 'lunar lander', dur: 7400,
      word: { lay: 'line', F: 2, style: 'bright', cy: 0.62 },
      parade: [['..x..', '.xxx.', '.x.x.', 'xxxxx', 'x...x'], 'cream'],
      init() {
        this.t = 0;
        const L = A.letters, W = A.word;
        const run = (li) => {
          const l = L[li];
          let x0 = 1e9, x1 = -1e9, n = 0;
          for (const w of W) if (w.li === li && w.y === l.y0) { x0 = Math.min(x0, w.x); x1 = Math.max(x1, w.x); n++; }
          if (n !== x1 - x0 + 1) return null;
          for (const w of W) if (w.x >= x0 - 1 && w.x <= x1 + 1 && w.y < l.y0 && w.y >= l.y0 - 16) return null;
          return { li, x0, x1, y: l.y0, w: n };
        };
        let pad = null;
        for (const li of [8, 0, 5, 2, 9, 7]) { pad = run(li); if (pad && pad.w >= 8) break; pad = null; }
        if (!pad) pad = { li: 0, x0: L[0].x0, x1: L[0].x1, y: L[0].y0, w: L[0].x1 - L[0].x0 + 1 };
        this.pad = pad;
        this.lx = pad.x0 + (pad.w >= 12 ? 0 : Math.max(0, Math.floor((pad.w - 7) / 2) - 1));
        this.ly = pad.y - 6;
        this.sx = A.clamp(this.lx + (this.lx < A.GW / 2 ? 40 : -40), 3, A.GW - 10);
        this.side = Math.sign(this.lx - this.sx) || 1;
        this.tTD = 5000;
        A.seed(23);
        this.dust = Array.from({ length: 12 }, (_, k) => ({ side: k % 2 ? 1 : -1, v: 0.008 + A.rnd() * 0.022, up: 0.6 + A.rnd() * 1.6, d: A.rnd() * 80 }));
      },
      pos(t) {
        const ly = this.ly, td = this.tTD;
        let y;
        if (t < 2800) y = lerp(-9, ly - 14, eio(seg(t, 0, 2800)));
        else if (t < 4000) y = lerp(ly - 14, ly - 5, eo(seg(t, 2800, 4000)));
        else y = lerp(ly - 5, ly, seg(t, 4000, td));
        let x = lerp(this.sx, this.lx + 2 * this.side, eo(seg(t, 0, 3300)));
        if (t > 3300) x = lerp(this.lx + 2 * this.side, this.lx, eio(seg(t, 3300, 4100)));
        return [Math.round(x), Math.round(y)];
      },
      update(t) { this.t = t; this.p = this.pos(t); },
      draw() {
        const C = A.C, t = this.t, pad = this.pad, td = this.tTD, [x, y] = this.p || this.pos(0);
        const down = t >= td, chase = Math.floor(t / 130);
        A.drawWord({
          col: (w) => {
            if (w.li !== pad.li || w.y !== pad.y) return null;
            if (down) return C.quart;
            return ((w.x - pad.x0) >> 1) % 3 === chase % 3 ? C.butter : null;
          },
        });
        // exhaust: main burn while braking, a gentle trim on the final approach
        let burn = 0;
        if (t > 900 && t < 2800) burn = 2 + seg(t, 900, 1800);
        else if (t >= 2800 && t < 4000) burn = 2;
        else if (t >= 4000 && t < td) burn = 1;
        if (burn) {
          const len = Math.round(burn) + (Math.floor(t / 60) % 2);
          for (let k = 0; k < len; k++) px(x + 3, y + 6 + k, k === 0 ? C.butter : C.rose);
          if (len > 2) { px(x + 2, y + 6, C.butter); px(x + 4, y + 6, C.butter); }
        }
        // side thruster puffs while it trims its drift
        if (t > 3300 && t < 3900 && Math.floor(t / 90) % 2 === 0) { const sx = this.side > 0 ? x + 7 : x - 1; px(sx, y + 2, C.cream); px(sx + this.side, y + 2, C.dim); }
        const squash = down && t < td + 160 ? 1 : 0;
        spr(x, y + squash, ['..xxx..', '.xxxxx.', '.xoxox.', 'xxxxxxx'], { x: C.cream, o: C.teal });
        spr(x, y + 4, ['.x...x.', 'x.....x'], { x: C.dim });
        // touchdown dust
        const age = t - td;
        if (age >= 0 && age < 900) {
          for (const d of this.dust) {
            const a = age - d.d;
            if (a < 0 || a > 700) continue;
            const fx = (d.side > 0 ? x + 6 : x) + d.side * d.v * a, fy = pad.y - 1 - d.up * Math.sin(Math.PI * Math.min(1, a / 700));
            px(fx, fy, a < 320 ? C.cream : C.dim);
          }
        }
        // a tiny astronaut hops out and plants a flag
        const room = pad.x1 - (x + 6);
        if (t > td + 700 && room >= 3) {
          const ax = x + 7 + Math.min(room - 3, Math.floor((t - td - 700) / 220));
          const hop = t > td + 2000 && Math.floor((t - td - 2000) / 200) % 3 === 0 ? 1 : 0;
          spr(ax, pad.y - 3 - hop, ['x', 'x', 'x'], { x: C.hi });
          if (t > td + 1300) {
            const fxp = ax + 2, wave = Math.floor(t / 280) % 2;
            rect(fxp, pad.y - 5, 1, 5, C.cream);
            spr(fxp + 1, pad.y - 5, wave ? ['xx', 'x.'] : ['xx', '.x'], { x: C.rose });
          }
        }
      },
    },

    // ---------------------------------------------------------------------------------------
    // HOPPER: a cube hopper bounces letter to letter along the arc; every letter it lands on
    // flips colour. When the word is done it flashes, and a spinning disc carries the hero off.
    classicsHopper: {
      name: 'hopper', dur: 7200,
      word: { lay: 'arc', F: 2, style: 'bunker', mob: { lay: 'stack', F: 2 } },
      parade: [['..xxx..', '.xxxxx.', '.xxxxxx', '..xxx.x', '..x.x..'], 'butter'],
      init() {
        this.t = 0;
        const L = A.letters, W = A.word;
        const stacked = L[7].y0 > L[6].y1;
        this.order = stacked ? [0, 1, 2, 3, 4, 5, 6, 11, 10, 9, 8, 7] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        // where the hopper stands on each letter: over the middle of its top edge
        this.stand = L.map((l, li) => {
          const tops = W.filter((w) => w.li === li && w.y === l.y0).map((w) => w.x);
          const cx = Math.round((Math.min(...tops) + Math.max(...tops)) / 2);
          return [cx - 3, l.y0 - 6];
        });
        this.T0 = 420; this.HOP = 420;
        this.land = new Map();
        this.order.forEach((li, k) => this.land.set(li, this.T0 + k * this.HOP));
        this.tDone = this.T0 + (this.order.length - 1) * this.HOP;
        const last = L[this.order[11]], dir = stacked ? -1 : 1;
        this.dir = dir;
        const ds = this.stand[this.order[11]];
        this.disc = [dir > 0 ? last.x1 + 6 : last.x0 - 13, ds[1] + 5];
        this.tJump = this.tDone + 700; this.tRide = this.tJump + 360;
      },
      // hero position and facing at time t
      hero(t) {
        const o = this.order, H = this.HOP;
        if (t < this.T0) { const s = this.stand[o[0]]; return { x: s[0], y: s[1] - 26 * (1 - Math.pow(seg(t, 0, this.T0), 2)), f: 1, sq: 0 }; }
        if (t < this.tDone) {
          const k = Math.floor((t - this.T0) / H), u = (t - this.T0 - k * H) / H;
          const a = this.stand[o[k]], b = this.stand[o[k + 1]];
          const f = b[0] >= a[0] ? 1 : -1;
          if (u < 0.1) return { x: a[0], y: a[1], f, sq: 1 };
          if (u > 0.88) return { x: b[0], y: b[1], f, sq: u < 0.96 ? 1 : 0 };
          const v = (u - 0.1) / 0.78, hgt = 6 + Math.abs(b[1] - a[1]) * 0.4;
          return { x: lerp(a[0], b[0], v), y: lerp(a[1], b[1], v) - hgt * 4 * v * (1 - v), f, sq: 0 };
        }
        const e = this.stand[o[11]], d = this.discAt(t);
        const tgt = [d[0], d[1] - 6];
        if (t < this.tJump) return { x: e[0], y: e[1], f: this.dir, sq: 0 };
        if (t < this.tRide) { const v = seg(t, this.tJump, this.tRide); return { x: lerp(e[0], tgt[0], v), y: lerp(e[1], tgt[1], v) - 7 * 4 * v * (1 - v), f: this.dir, sq: 0 }; }
        return { x: tgt[0], y: tgt[1], f: this.dir, sq: 0 };
      },
      discAt(t) {
        const [x, y] = this.disc, bob = Math.round(Math.sin(t / 260));
        if (t < this.tRide + 150) return [x, y + bob];
        const u = eio(seg(t, this.tRide + 150, this.dur - 150));
        return [Math.round(lerp(x, A.GW / 2 - 3, u)), Math.round(lerp(y + bob, 6, u))];
      },
      update(t) { this.t = t; this.h = this.hero(t); },
      draw() {
        const C = A.C, t = this.t, h = this.h || this.hero(0);
        const warm = [C.hi, C.butter, C.butter, C.butter, C.butter, C.rose, C.rose, C.rose];
        const wave = t - this.tDone - 120;
        A.drawWord({
          off: (w) => { const tl = this.land.get(w.li); return t >= tl && t < tl + 90 ? [0, 1] : Z; },
          col: (w) => {
            const tl = this.land.get(w.li);
            if (t < tl) return null;
            if (t < tl + 90) return C.hi;
            if (wave > 0 && wave < 900) { const ph = (w.x - A.X0) * 3 - (wave % 450) * 0.9 * (A.WW / 150); if (ph > -14 && ph < 0) return C.hi; }
            return warm[w.gy];
          },
        });
        if (t > 2200) {
          const [dx, dy] = this.discAt(t), cols = [C.rose, C.butter, C.teal, C.quart], sh = Math.floor(t / 90);
          const rows = ['.xxxxx.', 'xxxxxxx'];
          rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === 'x') px(dx + i, dy + j, cols[(i + j + sh) % 4]); });
          if (t < 2500) A.sparkle(dx + 3, dy, t < 2350 ? 2 : 1, C.butter);
        }
        const rows = h.sq ? ['.xxxxx.', '.xxoxx.', '.xxxxss', '..xxx.s', '..x.x..'] : ['..xxx..', '.xxxxx.', '.xxoxx.', '.xxxxss', '..xxx.s', '..x.x..'];
        spr(Math.round(h.x), Math.round(h.y) + (h.sq ? 1 : 0), rows, { x: C.butter, o: C.hi, s: C.rose }, h.f < 0);
      },
    },
  };
});
