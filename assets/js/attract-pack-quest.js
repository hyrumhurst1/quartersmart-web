// attract pack: quest. Six adventure games that play with the wordmark:
// a platformer knight, a fire dragon, a slicing ninja, a flooded level,
// a wizard's transmutation and a stomping mech with a confetti cannon.
(window.QSAttractPacks = window.QSAttractPacks || []).push((A) => {
  window.__qa = A;
  // ---------- small kit on top of A ----------
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  const dot = (x, y, c) => { const yy = Math.round(y); if (yy >= 0 && yy < A.PH) A.px(x, yy, c); };
  const box = (x, y, w, h, c) => { const y0 = Math.max(0, Math.round(y)), y1 = Math.min(A.PH, Math.round(y) + Math.round(h)); if (y1 > y0) A.rect(Math.round(x), y0, Math.round(w), y1 - y0, c); };
  const fade = (c, a) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(c).trim()); if (!m) return c; const n = parseInt(m[1], 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const pal = () => { const C = A.C; return { h: C.hi, c: C.cream, r: C.rose, b: C.butter, t: C.teal, q: C.quart, d: C.deep, o: C.body, v: C.line, m: C.dim }; };
  // draw a multi-colour sprite; rows use the pal() keys, '.' is clear; flip mirrors it
  const spr = (x, y, rows, P, flip) => {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j], n = r.length;
      for (let i = 0; i < n; i++) { const ch = r[flip ? n - 1 - i : i]; if (ch !== '.') dot(x + i, y + j, P[ch]); }
    }
  };
  // walkable letter tops: for every letter whose top row is not covered, the x span of that top row
  const platforms = () => {
    const out = [], W = A.word;
    A.letters.forEach((l, li) => {
      if (!l) return;
      let a = 1e9, b = -1e9;
      for (let x = l.x0; x <= l.x1; x++) { const k = A.at.get(x * 1000 + l.y0); if (k !== undefined && W[k].li === li && A.topOf.get(x) === l.y0) { a = Math.min(a, x); b = Math.max(b, x); } }
      if (a <= b) out.push({ li, ty: l.y0, a, b });
    });
    return out.sort((m, n) => m.a - n.a);
  };

  // ---------- platformer ----------
  const KN = {
    run0: ['..rr....', '..hhhh..', '..hhvv.h', '..hhhh.h', '..tttbbh', '..tttt..', '..c..c..', '.c....c.'],
    run1: ['.rr.....', '..hhhh..', '..hhvv.h', '..hhhh.h', '..tttbbh', '..tttt..', '...cc...', '...cc...'],
    jump: ['..rr...h', '..hhhh.h', '..hhvv.h', '..hhhhbb', '..tttt..', '..tttt..', '..c..c..', '..c...c.'],
    squash: ['..rr....', '..hhhh..', '..hhvv.h', '.ttttbbh', '.tttttt.', '.cc..cc.'],
  };
  const SLIME = {
    up: ['..rr..', '.rhrr.', 'rvrrvr', 'rrrrrr'],
    low: ['.rhrr.', 'rvrrvr', 'rrrrrr'],
    flat: ['.rvrrvr.', 'rrrrrrrr'],
  };
  const G_UP = 0.00045;                                 // jump gravity, art px per ms^2
  const platformer = {
    name: 'platformer', dur: 7600,
    word: { lay: 'wave', F: 2, style: 'bunker', cy: 0.56, mob: { lay: 'stack', F: 2, cy: 0.56 }, alt: { lay: 'line', F: 2 } },
    parade: [['..xx..', '.xxxx.', '.x..xx', '.xxxx.', 'xxxxx.', '.x..x.'], 'cream'],
    init() {
      this.t = 0; this.stomp = undefined; this.grab = undefined; this.onSlime = undefined; window.__qp = this;
      const P = platforms(), n = P.length, V = 0.034;
      const minTop = Math.min(...P.map((p) => p.ty));
      const H = A.clamp(minTop - 10, 2, 5), HB = A.clamp(minTop - 12, 3, 8);
      const seg = []; let t = 0;
      const run = (x0, x1, y, li) => { if (x1 <= x0) return; seg.push({ k: 'run', t0: t, t1: t + (x1 - x0) / V, x0, x1, y0: y, y1: y, li }); t += (x1 - x0) / V; };
      const jump = (x0, y0, x1, y1, h, li, coin) => {
        const top = Math.min(y0, y1) - h, tu = Math.sqrt(2 * (y0 - top) / G_UP), td = Math.sqrt(2 * (y1 - top) / G_UP);
        seg.push({ k: 'jump', t0: t, t1: t + tu + td, x0, x1, y0, y1, top, su: tu / (tu + td), li, coin });
        t += tu + td;
      };
      // the slime patrols a wide stretch late in the level; the knight bounces off it
      let s = -1, wide = -1;
      for (let i = Math.round(n * 0.55); i <= n - 2; i++) if (P[i].b - P[i].a > wide) { wide = P[i].b - P[i].a; s = i; }
      let s1 = s;
      if (s >= 0 && s + 1 < n - 1 && Math.abs(P[s + 1].ty - P[s].ty) <= 1 && P[s + 1].a - P[s].b <= 9) s1 = s + 1;
      this.slime = s >= 0 ? { a: P[s].a, b: P[s1].b, cx: Math.round((P[s].a + P[s1].b) / 2) - 3 } : null;
      const goal = A.X0 + A.WW + 4 < A.GW - 4;
      this.goal = goal ? { x: A.X0 + A.WW + 4, top: Math.max(2, P[n - 1].ty - 8), base: Math.min(A.PH - 3, A.WY1 + 3) } : null;
      this.coins = [];
      let x = P[0].a + 3, i = 0;
      while (i < n - 1) {
        const p = P[i], q = P[i + 1], yp = p.ty - 1;
        if (this.slime && i + 1 === s) {
          run(x, p.b - 2, yp, p.li);
          const sy = this.groundAt(this.slime.cx + 3) - 5;           // standing on the slime's head
          jump(p.b - 2, yp, this.slime.cx + 3, sy, Math.max(2, H - 1), -1);
          this.stomp = t;
          const r = P.find((pp) => pp.a > this.slime.b + 2);
          if (r) {
            jump(this.slime.cx + 3, sy, r.a + 3, r.ty - 1, HB, r.li, 3);
            x = r.a + 3; i = P.indexOf(r); continue;
          }
          x = this.slime.cx + 3; i = n - 1; this.onSlime = sy; break;
        }
        const dy = q.ty - p.ty, gap = q.a - p.b - 1;
        const coin = dy < -2 || (dy <= 0 && gap > 4) ? 1 : 0;
        run(x, p.b - 2, yp, p.li);
        jump(p.b - 2, yp, q.a + 3, q.ty - 1, Math.abs(dy) <= 2 && gap <= 3 ? 2 : dy > 2 ? Math.max(2, H - 2) : H, q.li, coin);
        x = q.a + 3; i++;
      }
      const last = P[n - 1];
      if (this.onSlime === undefined) { run(x, last.b - 2, last.ty - 1, last.li); x = Math.max(x, last.b - 2); }
      const fy = this.onSlime !== undefined ? this.onSlime : last.ty - 1;
      if (this.goal) {
        const g = this.goal, gy = Math.min(g.base - 1, Math.max(g.top + 8, fy - 2));
        jump(x, fy, g.x - 4, gy, 3, -2);
        this.grab = t;
        seg.push({ k: 'slide', t0: t, t1: t + 520, x0: g.x - 4, x1: g.x - 4, y0: gy, y1: g.base - 1 }); t += 520;
        this.land = t;
      } else this.land = t;
      // stretch or squeeze the whole run so it ends near the same beat on every screen
      const k = A.clamp(5400 / t, 0.8, 1.35);
      for (const sg of seg) { sg.t0 *= k; sg.t1 *= k; }
      if (this.stomp !== undefined) this.stomp *= k;
      if (this.grab !== undefined) this.grab *= k;
      this.land *= k;
      this.seg = seg;
      // coins float at the peak of the jumps that deserve one
      for (const sg of seg) {
        if (sg.k !== 'jump' || !sg.coin) continue;
        const us = sg.coin === 3 ? [0.3, 0.5, 0.7] : [sg.su];
        for (const u of us) {
          const tc = lerp(sg.t0, sg.t1, u), pos = this.pos(tc, sg);
          if (pos.y - 9 >= 1) this.coins.push({ x: Math.round(pos.x) - 2, y: Math.round(pos.y) - 9, tc });
        }
      }
    },
    groundAt(x) { let g = 1e9; for (let d = 0; d < 6; d++) { const v = A.topOf.get(Math.round(x) - 3 + d); if (v !== undefined) g = Math.min(g, v); } return g === 1e9 ? A.WY1 : g; },
    pos(t, sg) {
      if (!sg) { sg = this.seg[this.seg.length - 1]; for (const s of this.seg) if (t < s.t1) { sg = s; break; } }
      const u = A.clamp((t - sg.t0) / (sg.t1 - sg.t0 || 1));
      if (sg.k === 'jump') {
        const y = u < sg.su ? sg.top + (sg.y0 - sg.top) * Math.pow((sg.su - u) / sg.su, 2) : sg.top + (sg.y1 - sg.top) * Math.pow((u - sg.su) / (1 - sg.su), 2);
        return { x: lerp(sg.x0, sg.x1, u), y, sg, u };
      }
      if (sg.k === 'slide') return { x: sg.x0, y: lerp(sg.y0, sg.y1, ease(u)), sg, u };
      return { x: lerp(sg.x0, sg.x1, u), y: sg.y0, sg, u };
    },
    slimeX(t) {
      const S = this.slime; if (!S) return 0;
      const amp = Math.max(0, (S.b - S.a - 6) / 2), cx = (S.a + S.b) / 2 - 3;
      const st = this.stomp === undefined ? 1e9 : this.stomp;
      const tt = t < st ? t - st : t < st + 900 ? 0 : t - st - 900;
      return Math.round(cx + amp * Math.sin(tt / 520));
    },
    update(t) { this.t = t; },
    draw() {
      const t = this.t, C = A.C, P = pal();
      const g = this.goal;
      // the goal: a flag pole on a stone block
      if (g) {
        box(g.x - 5, g.base, 7, 3, C.deep); box(g.x - 5, g.base, 7, 1, C.body);
        box(g.x, g.top, 1, g.base - g.top, C.cream); box(g.x, g.top - 2, 2, 2, C.butter);
        const fq = this.grab === undefined ? 0 : ease((t - this.grab) / 520);
        const fy = Math.round(lerp(g.top, g.base - 4, fq));
        spr(g.x + 1, fy, ['rrrr', 'rrr.', 'rr..'], P);
      }
      // a letter dips a pixel when the knight lands on it hard
      let dipLi = -1;
      for (const sg of this.seg) if (sg.k === 'jump' && sg.li >= 0 && t >= sg.t1 && t < sg.t1 + 110 && sg.y1 - sg.top >= 4) dipLi = sg.li;
      A.drawWord({ off: (w) => (w.li === dipLi ? [0, 1] : null) });
      // coins
      for (const c of this.coins) {
        const a = t - c.tc;
        if (a < 0) A.coin(c.x, c.y + (Math.floor((t + c.x * 40) / 400) % 2), t, C.butter);
        else if (a < 220) A.coin(c.x, c.y - a * 0.03, t * 3, C.hi);
        else if (a < 380) A.sparkle(c.x + 2, Math.round(c.y - 7), a < 300 ? 2 : 1, C.butter);
      }
      // the slime
      const S = this.slime;
      if (S) {
        const sx = this.slimeX(t), gy = this.groundAt(sx + 3), st = this.stomp === undefined ? -1e9 : this.stomp;
        if (t >= st && t < st + 360) spr(sx - 1, gy - 2, SLIME.flat, P);
        else { const low = t >= st + 360 && t < st + 700 ? Math.floor((t - st) / 110) % 2 : Math.floor(t / 180) % 2; spr(sx, gy - (low ? 3 : 4), low ? SLIME.low : SLIME.up, P); }
      }
      // the knight
      const p = this.pos(t), sg = p.sg;
      let fr = KN.run0, h = 8;
      const landed = this.seg.find((s) => s.k !== 'run' && t >= s.t1 && t < s.t1 + 90 && (s.k === 'slide' || s.y1 - s.top >= 3));
      const next = this.seg[this.seg.indexOf(sg) + 1];
      if (sg.k === 'jump' && t < sg.t1) fr = KN.jump;
      else if (sg.k === 'slide' && t < sg.t1) fr = KN.jump;
      else if (landed || (sg.k === 'run' && next && next.k === 'jump' && sg.t1 - t < 60)) { fr = KN.squash; h = 6; }
      else if (sg.k === 'run' && t < sg.t1) fr = Math.floor(t / 110) % 2 ? KN.run1 : KN.run0;
      else fr = KN.run1;
      let fy = Math.round(p.y) + (sg.li === dipLi && dipLi >= 0 ? 1 : 0);
      // after the flag: two little victory hops
      if (this.land !== undefined && t > this.land + 200) {
        const hq = (t - this.land - 200) / 420;
        if (hq < 2) { fy -= Math.round(Math.sin((hq % 1) * Math.PI) * 3); fr = hq % 1 > 0.05 && hq % 1 < 0.95 ? KN.jump : KN.squash; h = fr === KN.squash ? 6 : 8; }
        else fr = KN.run1;
        if (g && hq > 0.3 && hq < 2.4) A.sparkle(g.x + 1, g.top - 4, Math.floor(t / 90) % 3, C.butter);
      }
      spr(Math.round(p.x) - 3, fy - h + 1, fr, P);
    },
  };


  // ---------- dragon ----------
  const trap = (u, a = 0.12) => { u = A.clamp(u); const v = 1 / (1 - a); if (u < a) return v * u * u / (2 * a); if (u > 1 - a) return 1 - v * (1 - u) * (1 - u) / (2 * a); return v * (u - a / 2); };
  const DR = {
    up: ['...ddd......', '..dddd...b..', '..ddd...ttt.', 'ttttttttthtt', '.ttbbbbtt...', 't...t..t....'],
    down: ['............', '.........b..', '........ttt.', 'ttttttttthtt', '.ttbdddtt...', 't..ddd.t....', '...dd.......'],
    perch: ['.........b..', '........ttt.', '...ddd.tthtt', '.tttttttt...', 't..bbbbt....', '...t...t....'],
    perch2: ['.........b..', '........ttt.', '...ddd.tthtt', 'ttttttttt...', '...bbbbt....', '...t...t....'],
  };
  const dragon = {
    name: 'dragon', dur: 7400,
    word: { lay: 'line', F: 2, style: 'neon', cy: 0.62 },
    parade: [['..xxx.....', '.xxxx...x.', 'xxxxxxxxxx', '.x.xxxxx..', '...x..x...'], 'quart'],
    init() {
      this.t = 0; this.heat = new Float32Array(A.word.length); this.embers = []; this.puffs = []; this.flame = null; this.nextEmber = 0; this.nextPuff = 350;
      this.depth = A.word.map((w) => w.y - A.letters[w.li].y0);
      const P = platforms(); this.perch = P[0];
      this.xr = Math.min(A.GW - 13, A.X0 + A.WW - 4); this.xl = Math.max(7, A.X0 - 2); this.hy = Math.max(1, A.Y0 - 11);
      A.seed(31);
    },
    pos(t) {
      const { xr, xl, hy } = this, pc = this.perch, px = Math.round((pc.a + pc.b) / 2) - 6, py = pc.ty - 6;
      const flap = Math.floor(t / 190) % 2;
      if (t < 700) return { x: xr, y: hy + flap, face: -1, fr: flap ? DR.up : DR.down };
      if (t < 4600) return { x: lerp(xr, xl, trap((t - 700) / 3900)), y: hy + flap, face: -1, fr: flap ? DR.up : DR.down };
      if (t < 5000) { const u = (t - 4600) / 400; return { x: xl - Math.sin(u * Math.PI / 2) * 6, y: hy - Math.sin(u * Math.PI) * 3 + flap, face: u < 0.5 ? -1 : 1, fr: flap ? DR.up : DR.down }; }
      if (t < 5500) { const u = ease((t - 5000) / 500); return { x: lerp(xl - 6, px, u), y: lerp(hy, py, u), face: 1, fr: DR.down }; }
      return { x: px, y: py, face: 1, fr: Math.floor((t - 5500) / 600) % 3 === 1 ? DR.perch2 : DR.perch, perched: true };
    },
    update(t, dt) {
      this.t = t;
      const d = this.pos(t), H = this.heat;
      this.flame = null;
      if (t > 850 && t < 4450) {
        const mx = Math.round(d.x) - 1, my = Math.round(d.y) + 4, dx = -0.55, dy = 1;
        let hit = null, k = 1;
        for (; k < 44; k++) {
          const x = Math.round(mx + dx * k), y = Math.round(my + dy * k);
          if (y >= A.WY1 || y >= A.PH) break;
          if (A.at.has(x * 1000 + y)) { hit = [x, y]; break; }
        }
        this.flame = { mx, my, dx, dy, len: Math.min(k, hit ? k : 14), hit };
        if (hit && dt > 0) {
          const rate = dt * 0.02, row = A.letters[A.word[A.at.get(hit[0] * 1000 + hit[1])].li].y1;
          for (const w of A.word) {
            const ax = Math.abs(w.x - hit[0]); if (ax > 3 || A.letters[w.li].y1 !== row) continue;
            const dep = this.depth[w.i]; if (dep > 11) continue;
            H[w.i] = Math.min(1.4, H[w.i] + rate * Math.exp(-dep / 4.2) * (1 - ax / 4.5));
          }
          while (this.nextEmber < t) { this.embers.push({ x: hit[0] + (A.rnd() - 0.5) * 5, y: hit[1] - 1, vx: (A.rnd() - 0.5) * 0.02, vy: -0.012 - A.rnd() * 0.014, t0: this.nextEmber }); this.nextEmber += 55; }
        }
      }
      if (dt > 0) for (let i = 0; i < H.length; i++) if (H[i] > 0) H[i] = Math.max(0, H[i] - dt * 0.0003);
      for (const e of this.embers) { e.x += e.vx * dt; e.y += e.vy * dt; }
      this.embers = this.embers.filter((e) => t - e.t0 < 650);
      // smoke from the nostrils: once before the breath, then idly while perched
      while (this.nextPuff < t) {
        const q = this.pos(this.nextPuff);
        if (this.nextPuff < 800 || q.perched) this.puffs.push({ x: q.face < 0 ? q.x - 1 : q.x + 12, y: q.y + (q.perched ? 2 : 3), t0: this.nextPuff, dir: q.face });
        this.nextPuff += this.nextPuff < 800 ? 180 : 700;
        if (this.nextPuff > 800 && this.nextPuff < 5800) this.nextPuff = 5800;
      }
      this.puffs = this.puffs.filter((p) => t - p.t0 < 1000);
    },
    draw() {
      const t = this.t, C = A.C, P = pal(), H = this.heat;
      A.drawWord({ col: (w) => { const h = H[w.i]; return h > 0.85 ? C.hi : h > 0.55 ? C.butter : h > 0.22 ? C.rose : null; } });
      for (const e of this.embers) { const a = (t - e.t0) / 650; dot(e.x, e.y, a < 0.35 ? C.butter : a < 0.7 ? C.rose : C.dim); }
      const f = this.flame;
      if (f) {
        for (let k = 1; k < f.len; k++) {
          const wob = Math.round(Math.sin(k * 0.8 - t / 70) * Math.min(1, k / 6));
          const x = f.mx + f.dx * k + wob, y = f.my + f.dy * k;
          dot(x, y, k < 3 ? C.hi : [C.butter, C.hi, C.butter, C.rose][((Math.floor(k / 2 - t / 60) % 4) + 4) % 4]);
          if (k > 3) dot(x + 1, y, (k + Math.floor(t / 90)) % 3 ? C.rose : C.butter);
        }
        if (f.hit) for (let j = -3; j <= 3; j++) {
          if (!j || (j + Math.floor(t / 110)) % 3 === 0) continue;
          dot(f.hit[0] + j, f.hit[1] - 1 - (Math.abs(j) < 2 ? 1 : 0), Math.abs(j) < 2 ? C.butter : C.rose);
        }
      }
      const d = this.pos(t);
      spr(d.x, d.y, d.fr, P, d.face < 0);
      for (const p of this.puffs) {
        const a = (t - p.t0) / 1000, x = p.x + p.dir * a * 4, y = p.y - a * 6;
        const c = a < 0.3 ? C.cream : a < 0.65 ? C.dim : C.line;
        dot(x, y, c); if (a > 0.25) dot(x + 1, y, c);
      }
    },
  };

  // ---------- ninja ----------
  const NJ = {
    stand0: ['...ooo.', '..oohh.', 'rr.ooo.', '..ooooc', '..ooo..', '..o.o..', '.oo.oo.'],
    stand1: ['...ooo.', '..oohh.', '.rrooo.', 'r.ooooc', '..ooo..', '..o.o..', '.oo.oo.'],
    crouch: ['.......', '.......', '...ooo.', '..oohh.', 'rrr.oo.', '.ooooo.', 'ooo.oo.'],
    dash: ['rr..oooo..', '..ooooohhc', 'rr.ooooo..'],
    draw: ['...ooo.h', '..oohhh.', 'rr.oooh.', '..oooo..', '..ooo...', '..o.o...', '.oo.oo..'],
  };
  const ninja = {
    name: 'ninja', dur: 7200,
    word: { lay: 'line', F: 2, style: 'bright', shadow: 1 },
    parade: [['.xxx.', 'xx..x', '.xxx.', 'xxxxx', '.x.x.', 'xx.xx'], 'body'],
    init() {
      this.t = 0;
      const L = A.letters, rows = new Map();
      L.forEach((l, li) => { if (!l) return; if (!rows.has(l.y1)) rows.set(l.y1, []); rows.get(l.y1).push(li); });
      this.rows = [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([y1, lis]) => {
        lis.sort((a, b) => L[a].x0 - L[b].x0);
        return { y1, lis, x0: Math.min(...lis.map((li) => L[li].x0)), x1: Math.max(...lis.map((li) => L[li].x1)) };
      });
      const P = platforms(); this.pl = P[0]; this.pr = P[P.length - 1];
      const r0 = this.rows[0], r1 = this.rows[this.rows.length - 1], two = this.rows.length > 1;
      const mk = (t0, dir, row, y, slope) => {
        const xs = dir > 0 ? row.x0 - 10 : row.x1 + 4, xe = dir > 0 ? row.x1 + 4 : row.x0 - 10;
        return { t0, t1: t0 + 300, dir, row, y, slope, mid: (row.x0 + row.x1) / 2, xs, xe };
      };
      this.dashes = [mk(1150, 1, r0, r0.y1 - 4.5, 0.035), mk(3550, -1, r1, r1.y1 - (two ? 4.5 : 6.5), -0.045)];
      this.ev = [];
      for (const d of this.dashes) for (const li of d.row.lis) {
        const c = (L[li].x0 + L[li].x1) / 2;
        (this.ev[li] = this.ev[li] || []).push({ te: d.t0 + (c - d.xs) / (d.xe - d.xs) * (d.t1 - d.t0), d });
      }
      // the finale: the sword goes back in its sheath and every letter falls open along a diagonal at once
      L.forEach((l, li) => { if (l) (this.ev[li] = this.ev[li] || []).push({ te: 5800 + li * 12, d: { y: (l.y0 + l.y1) / 2, slope: -1.3, mid: (l.x0 + l.x1) / 2, dir: 1 } }); });
      A.seed(17);
      this.petals = Array.from({ length: 6 }, (_, i) => ({ x0: A.X0 + A.WW * (0.1 + 0.16 * i) + A.rnd() * 10, t0: 4200 + i * 330 + A.rnd() * 200, v: 0.009 + A.rnd() * 0.004, ph: A.rnd() * 6 }));
    },
    cy(d, x) { return d.y + d.slope * (x - d.mid); },
    cut(li, t) { const es = this.ev[li]; if (!es) return null; let e = null; for (const q of es) if (q.te <= t && t < q.te + 1400) e = q; return e; },
    perchPos(p) { return { x: Math.round((p.a + p.b) / 2) - 3, y: p.ty - 7 }; },
    state(t) {
      const [d1, d2] = this.dashes, L = this.perchPos(this.pl), R = this.perchPos(this.pr);
      const breath = Math.floor(t / 260) % 2 ? NJ.stand1 : NJ.stand0;
      if (t < 1100) return { ...L, face: 1, fr: t > 900 ? NJ.crouch : breath };
      if (t < d1.t0) return { gone: true };
      if (t < d1.t1) { const x = lerp(d1.xs, d1.xe, (t - d1.t0) / (d1.t1 - d1.t0)); return { x: x - 5, y: this.cy(d1, x) - 1, face: 1, fr: NJ.dash, dash: d1, cx: x }; }
      if (t < d1.t1 + 250) { const u = (t - d1.t1) / 250, y0 = this.cy(d1, d1.xe) - 4; return { x: lerp(d1.xe - 3, R.x, u), y: lerp(y0, R.y, u) - Math.sin(u * Math.PI) * 6, face: -1, fr: NJ.crouch }; }
      if (t < 3500) return { ...R, face: -1, fr: t > 3300 ? NJ.crouch : breath };
      if (t < d2.t0) return { gone: true };
      if (t < d2.t1) { const x = lerp(d2.xs, d2.xe, (t - d2.t0) / (d2.t1 - d2.t0)); return { x: x - 5, y: this.cy(d2, x) - 1, face: -1, fr: NJ.dash, dash: d2, cx: x }; }
      if (t < d2.t1 + 250) { const u = (t - d2.t1) / 250, y0 = this.cy(d2, d2.xe) - 4; return { x: lerp(d2.xe - 3, L.x, u), y: lerp(y0, L.y, u) - Math.sin(u * Math.PI) * 6, face: 1, fr: NJ.crouch }; }
      return { ...L, face: 1, fr: t > 5150 && t < 5780 ? NJ.draw : breath, glint: t > 5300 && t < 5700 };
    },
    update(t) { this.t = t; },
    draw() {
      const t = this.t, C = A.C, P = pal();
      A.drawWord({
        off: (w) => {
          const e = this.cut(w.li, t); if (!e) return null;
          const a = t - e.te; if (a < 140 || a >= 1150) return null;
          return w.y < this.cy(e.d, w.x) ? [e.d.dir, -1] : null;
        },
        col: (w) => {
          const e = this.cut(w.li, t); if (!e) return null;
          const a = t - e.te;
          if (a >= 1150 && a < 1260 && Math.abs(w.y - this.cy(e.d, w.x)) < 1.6) return C.butter;
          return null;
        },
      });
      // the slash each dash leaves, cooling from white to rose to nothing
      for (const d of this.dashes) {
        if (t < d.t0 || t > d.t1 + 420) continue;
        const span = d.xe - d.xs, n = Math.abs(span);
        for (let k = 0; k <= n; k++) {
          const x = d.xs + Math.sign(span) * k, tp = d.t0 + (k / n) * (d.t1 - d.t0), age = t - tp;
          if (age < 0 || age > 420) continue;
          dot(x, Math.round(this.cy(d, x)), age < 70 ? C.hi : age < 200 ? C.butter : C.rose);
        }
      }
      // puffs where the ninja vanishes
      for (const [tp, p] of [[1100, this.pl], [3500, this.pr]]) {
        const a = (t - tp) / 320; if (a < 0 || a > 1) continue;
        const pp = this.perchPos(p), cx = pp.x + 3, cy = pp.y + 4, r = 1 + a * 4;
        for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; dot(cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.8, a < 0.5 ? C.cream : C.dim); }
      }
      const s = this.state(t);
      if (!s.gone) {
        if (s.dash) for (let k = 1; k <= 2; k++) { const gx = s.cx - s.face * k * 7; spr(gx - 5, this.cy(s.dash, gx) - 1, NJ.dash, { r: C.dim, o: k === 1 ? C.dim : C.line, h: C.dim, c: C.dim }, s.face < 0); }
        spr(s.x, s.y, s.fr, P, s.face < 0);
        if (s.glint) A.sparkle(s.x + 7, s.y, Math.floor((t - 5300) / 100) % 3, C.butter);
      }
      for (const p of this.petals) {
        const a = t - p.t0; if (a < 0) continue;
        const y = -1 + a * p.v, x = p.x0 + Math.sin(a / 420 + p.ph) * 3 - a * 0.003;
        if (y >= A.PH - 1) continue;
        dot(x, y, C.rose); if (Math.floor(a / 300 + p.ph) % 2) dot(x + 1, y, C.rose);
      }
    },
  };

  // ---------- underwater ----------
  const FISH = [['b.bb.', 'bbbhb', 'b.bb.'], ['..bb.', 'bbbhb', '..bb.']];
  const underwater = {
    name: 'underwater', dur: 7600,
    word: { lay: 'line', F: 2, style: 'band', cy: 0.5 },
    parade: [['x.xx.', 'xxx.x', 'x.xx.'], 'butter'],
    init() {
      this.t = 0; this.bub = []; this.nextBub = 1400; A.seed(23);
      const Y0 = A.Y0, WY1 = A.WY1;
      this.hi = Math.max(2, Y0 - 7);
      this.fish = [
        { y: Y0 + 2, v: 0.026, dir: 1, c: 'butter', x0: 20 },
        { y: Y0 + 10, v: 0.019, dir: -1, c: 'rose', x0: A.GW * 0.6 },
        { y: Math.min(A.PH - 4, WY1 + 4), v: 0.03, dir: 1, c: 'teal', x0: A.GW * 0.35 },
        { y: Math.max(this.hi + 3, Y0 - 3), v: 0.022, dir: -1, c: 'quart', x0: A.GW * 0.15 },
      ];
    },
    level(t) { const lo = A.PH + 2, hi = this.hi; if (t < 250) return lo; if (t < 2100) return lerp(lo, hi, ease((t - 250) / 1850)); if (t < 5500) return hi; if (t < 7200) return lerp(hi, lo, ease((t - 5500) / 1700)); return lo; },
    surf(x, t, L) { return Math.round(L + Math.sin(x * 0.21 + t / 280) * 1.1 + Math.sin(x * 0.09 - t / 470) * 0.9); },
    update(t, dt) {
      this.t = t;
      const L = this.level(t);
      if (L < A.WY1 && t < 5600) while (this.nextBub < t) {
        const big = A.rnd() < 0.3;
        this.bub.push({ x: A.X0 + A.rnd() * A.WW, y: Math.min(A.PH - 2, A.WY1 + 1 + A.rnd() * 6), v: 0.011 + A.rnd() * 0.009, ph: A.rnd() * 6, big, t0: this.nextBub });
        this.nextBub += 150;
      } else this.nextBub = Math.max(this.nextBub, t);
      for (const b of this.bub) { if (b.pop) continue; b.y -= b.v * dt; if (b.y <= this.surf(b.x, t, L) + 1) b.pop = t; }
      this.bub = this.bub.filter((b) => !b.pop || t - b.pop < 120);
    },
    draw() {
      const t = this.t, C = A.C, L = this.level(t), GW = A.GW;
      const sub = A.clamp((A.WY1 - L) / (A.WY1 - this.hi));
      const ys = []; for (let x = 0; x < GW; x++) ys.push(this.surf(x, t, L));
      // the water: a bright surface line over a thin wash of the palette teal, so the night still shows through
      const wash = fade(C.teal, 0.17);
      for (let x = 0; x < GW; x++) { const y = ys[x]; if (y < A.PH - 1) box(x, y + 1, 1, A.PH - y - 1, wash); }
      for (let x = 0; x < GW; x++) dot(x, ys[x], C.teal);
      // fish swim behind the letters, so they show through the gaps and the counters
      for (const f of this.fish) {
        const span = GW + 16, x = ((f.x0 + f.dir * f.v * t) % span + span) % span - 8;
        const sy = ys[A.clamp(Math.round(x + 2), 0, GW - 1)];
        const y = Math.max(f.y + Math.round(Math.sin(t / 380 + f.x0)), sy + 2);
        if (y >= A.PH - 2 || sy >= A.PH) continue;
        spr(x, y - 1, FISH[Math.floor(t / 200 + f.x0) % 2], { b: C[f.c], h: C.hi }, f.dir < 0);
      }
      A.drawWord({
        off: (w) => { if (w.y <= ys[w.x]) return null; return [Math.round(Math.sin(t / 560 + w.li * 0.8) * 1.4 * sub * (A.WY1 - w.y) / (A.WY1 - A.Y0)), 0]; },
        col: (w) => (w.y > ys[w.x] && w.c === C.hi ? C.teal : null),
      });
      for (const b of this.bub) {
        const x = b.x + Math.round(Math.sin((t - b.t0) / 240 + b.ph) * 0.8);
        if (b.pop) { dot(x, b.y - 1, C.hi); continue; }
        if (b.big) { dot(x, b.y - 1, C.teal); dot(x - 1, b.y, C.teal); dot(x + 1, b.y, C.teal); dot(x, b.y + 1, C.teal); }
        else dot(x, b.y, C.hi);
      }
    },
  };

  // ---------- wizard ----------
  const WZ = {
    idle: ['...r....', '..rr..b.', '..rrb.c.', '.rrrrrc.', '..cc..c.', '.hhhhcc.', '.rhhr.c.', '.rrrr.c.', 'rrrrrr..'],
    cast: ['...r..h.', '..rr..c.', '..rrb.c.', '.rrrrrc.', '..cc.cc.', '.hhhh.c.', '.rhhr...', '.rrrr...', 'rrrrrr..'],
  };
  const MULTI = (C) => [C.rose, C.butter, C.quart, C.teal];
  const wizard = {
    name: 'wizard', dur: 7400,
    word: { lay: 'arc', F: 2, style: 'band', cy: 0.44, mob: { lay: 'stack', F: 2, cy: 0.4 } },
    parade: [['..x..', '.xx..', 'xxxx.', '.xx.x', 'xxxxx', 'xxxx.'], 'rose'],
    init() {
      this.t = 0;
      const L = A.letters, mid = A.X0 + A.WW / 2;
      let under = A.Y0;
      for (const l of L) if (l && l.x1 >= mid - 8 && l.x0 <= mid + 8) under = Math.max(under, l.y1);
      this.wx = Math.round(mid) - 4; this.wy = Math.min(A.PH - 4, under + 11);
      const order = []; for (let k = 0; k < 6; k++) order.push(5 - k, 6 + k);
      this.casts = order.filter((li) => L[li]).map((li, k) => {
        const l = L[li], tx = (l.x0 + l.x1) / 2, ty = (l.y0 + l.y1) / 2, tc = 700 + k * 340;
        const sx = this.wx + 6, sy = this.wy - 1, dist = Math.hypot(tx - sx, ty - sy);
        return { li, tx, ty, sx, sy, tc, ti: tc + 150 + dist * 2.2, face: tx < this.wx + 3 ? -1 : 1 };
      });
      this.hit = []; for (const c of this.casts) this.hit[c.li] = c;
    },
    update(t) { this.t = t; },
    draw() {
      const t = this.t, C = A.C, P = pal(), M = MULTI(C);
      const X0 = A.X0, Y0 = A.Y0, WW = A.WW;
      const g1 = lerp(-12, WW + 40, (t - 5200) / 1000), g2 = lerp(WW + 40, -12, (t - 6300) / 1000);
      A.drawWord({
        col: (w) => {
          const c = this.hit[w.li]; if (!c) return null;
          const a = t - c.ti - Math.hypot(w.x - c.tx, w.y - c.ty) * 16;
          if (a < 0) return null;
          if (a < 70) return C.hi;
          const dd = (w.x - X0) + (w.y - Y0) * 0.8;
          if ((t > 5200 && t < 6200 && dd - g1 > -3 && dd - g1 < 0) || (t > 6300 && t < 7300 && dd - g2 > 0 && dd - g2 < 3)) return C.hi;
          return M[w.li % 4];
        },
      });
      // bolts in flight: a sparkling head on a curved path with a short trail
      let casting = null;
      for (const c of this.casts) {
        if (t > c.tc - 110 && t < c.tc + 130) casting = c;
        const u = (t - c.tc) / (c.ti - c.tc); if (u < 0 || u > 1) continue;
        const cx = lerp(c.sx, c.tx, 0.5) + (c.tx - c.sx) * 0.15, cy = Math.min(c.sy, c.ty) - 10;
        const at = (v) => { v = A.clamp(v); const a = (1 - v) * (1 - v), b = 2 * v * (1 - v), d = v * v; return [a * c.sx + b * cx + d * c.tx, a * c.sy + b * cy + d * c.ty]; };
        const trail = [C.butter, C.rose, C.teal, C.dim];
        for (let k = 4; k >= 1; k--) { const v = Math.pow(u, 1.3) - k * 0.05; if (v > 0) { const [x, y] = at(v); dot(x, y, trail[k - 1]); } }
        const [hx, hy] = at(Math.pow(u, 1.3));
        A.sparkle(Math.round(hx), Math.round(hy), Math.floor(t / 70) % 2 ? 1 : 0, C.butter);
      }
      // impact sparkles
      for (const c of this.casts) { const a = t - c.ti; if (a > 0 && a < 220) A.sparkle(Math.round(c.tx), Math.round(c.ty), a < 110 ? 2 : 1, M[c.li % 4]); }
      const fin = t > 5100 && t < 5900;
      const bob = Math.round(Math.sin(t / 450));
      const face = casting ? casting.face : 1;
      const x = this.wx, y = this.wy - 8 + bob;
      // a faint rune disc under the wizard, brighter while casting
      const glow = casting || fin;
      for (let k = -4; k <= 4; k++) dot(x + 3 + k, this.wy + 2 + bob, Math.abs(k) === 4 ? C.line : glow ? C.teal : C.dim);
      spr(face < 0 ? x - 1 : x, y, casting || fin ? WZ.cast : WZ.idle, P, face < 0);
      if (casting || fin) { const ox = face < 0 ? x : x + 6; A.sparkle(ox, y, Math.floor(t / 80) % 3, C.butter); }
      if (t > 5200) for (let k = 0; k < 4; k++) {
        const ph = ((t - 5200 + k * 650) % 2600) / 2600; if (ph > 0.5) continue;
        const l = A.letters[[0, 4, 7, 11][k]]; if (!l) continue;
        A.sparkle(l.x1 + 2, l.y0 - 2, ph < 0.12 || ph > 0.38 ? 0 : ph < 0.2 || ph > 0.3 ? 1 : 2, M[k]);
      }
    },
  };

  // ---------- mech ----------
  const MECH = ['..m.........', '.cccccccccc.', 'ccccccvvtttc', 'ccccccvtthtc', 'cccccccccccc', '.rrrrrrrrrr.', '.vv......vv.'];
  const mech = {
    name: 'mech', dur: 7600,
    word: { lay: 'line', F: 2, style: 'bricks', cy: 0.4 },
    parade: [['.xxxxx.', 'xxxx.xx', 'xxxxxxx', '.x...x.', 'xx...xx'], 'cream'],
    init() {
      this.t = 0; this.conf = []; A.seed(41);
      this.fy = Math.min(A.PH - 2, A.WY1 + 16);           // the row the feet stand on
      this.c0 = Math.max(8, A.X0 + 2);                    // body centre before the first step
      this.SD = 480; this.steps = Math.max(4, Math.min(9, Math.round((A.X0 + A.WW / 2 - 10 - this.c0) / 8))); this.w0 = 300;
      this.stomps = [];
      for (let k = 0; k < this.steps; k++) this.stomps.push({ t: this.w0 + (k + 1) * this.SD, x: this.cx(k + 1) + 4 });
      const te = this.w0 + this.steps * this.SD;
      this.tAim = te + 150; this.tFire = [te + 480, te + 830, te + 1180];
      this.fired = 0;
    },
    cx(k) { return this.c0 + 8 * k; },
    pose(t) {
      const tw = t - this.w0, SD = this.SD;
      if (tw < 0) return { bx: this.cx(0), lift: 0, fa: this.cx(0) + 4, fb: this.cx(0) - 4, ya: 0, yb: 0 };
      const k = Math.floor(tw / SD);
      if (k >= this.steps) { const c = this.cx(this.steps), odd = this.steps % 2; return { bx: c, lift: 0, fa: c + (odd ? 4 : -4), fb: c + (odd ? -4 : 4), ya: 0, yb: 0, done: true }; }
      const u = (tw - k * SD) / SD, e = ease(u), c = this.cx(k);
      const mv = c - 4 + 16 * e, up = Math.round(Math.sin(u * Math.PI) * 3), pl = c + 4;
      const bMoves = k % 2 === 0;
      return { bx: c + 8 * e, lift: Math.round(Math.sin(u * Math.PI)), fa: bMoves ? pl : mv, fb: bMoves ? mv : pl, ya: bMoves ? 0 : up, yb: bMoves ? up : 0 };
    },
    aim(t) { return A.clamp((t - this.tAim) / 300); },
    tip(t) { const p = this.pose(t), a = this.aim(t), by = this.fy - 12; return [Math.round(p.bx) + 7 + Math.round(a * 1), by + 3 - Math.round(a * 5)]; },
    update(t, dt) {
      this.t = t;
      while (this.fired < this.tFire.length && t >= this.tFire[this.fired]) {
        const tip = this.tip(this.tFire[this.fired]), rise = Math.max(14, tip[1] - (A.Y0 - 8)), vn = Math.sqrt(2 * 0.00011 * rise);
        const M = [A.C.rose, A.C.butter, A.C.quart, A.C.teal, A.C.hi];
        const spread = [[-0.35, 0.6], [-0.7, 0.2], [-0.1, 0.8]][this.fired];
        for (let i = 0; i < 26; i++) {
          const an = -Math.PI / 2 + (spread[0] + A.rnd() * (spread[1] - spread[0])), v = vn * (0.8 + A.rnd() * 0.3);
          this.conf.push({ x: tip[0], y: tip[1], vx: Math.cos(an) * v * 1.8, vy: Math.sin(an) * v, c: M[i % 5], ph: A.rnd() * 6 });
        }
        this.fired++;
      }
      if (dt > 0) for (const p of this.conf) {
        if (p.rest) continue;
        p.vy = Math.min(0.014, p.vy + 0.00011 * dt); p.vx *= Math.pow(0.998, dt);
        const nx = p.x + p.vx * dt + (p.vy > 0 ? Math.sin(t / 210 + p.ph) * 0.007 * dt : 0), ny = p.y + p.vy * dt;
        if (p.vy > 0) {
          const inside = A.at.has(Math.round(p.x) * 1000 + Math.round(p.y));
          if (!inside && A.at.has(Math.round(nx) * 1000 + Math.round(ny) + 1)) { p.x = nx; p.y = Math.round(ny); p.rest = true; continue; }
          if (ny >= this.fy) { p.x = nx; p.y = this.fy; p.rest = true; continue; }
        }
        p.x = nx; p.y = ny;
      }
    },
    draw() {
      const t = this.t, C = A.C, P = pal(), fy = this.fy;
      if (fy + 1 < A.PH) for (let x = 1; x < A.GW; x += 3) dot(x, fy + 1, C.line);
      A.drawWord({
        off: (w) => {
          const l = A.letters[w.li], lc = (l.x0 + l.x1) / 2;
          for (const s of this.stomps) { const d = Math.abs(lc - s.x); if (d > 18) continue; const a = t - s.t - d * 5; if (a >= 0 && a < 130) return [0, -1]; }
          return null;
        },
      });
      // dust puffs where each foot lands
      for (const s of this.stomps) {
        const a = (t - s.t) / 340; if (a < 0 || a > 1) continue;
        const c = a < 0.4 ? C.cream : a < 0.7 ? C.dim : C.line;
        for (const sd of [-1, 1]) { dot(s.x + sd * (3 + a * 5), fy - Math.round(a * 2), c); dot(s.x + sd * (4 + a * 7), fy - Math.round(a * 1.2), c); dot(s.x + sd * (2 + a * 3), fy - 1 - Math.round(a * 2.5), c); }
      }
      const p = this.pose(t), a = this.aim(t);
      const recoil = this.tFire.some((tf) => t >= tf && t < tf + 110) ? -1 : 0;
      const bx = Math.round(p.bx) + recoil - 6, by = fy - 12 - p.lift + (p.done && a > 0 && a < 1 ? 1 : 0);
      const leg = (hx, hy, fx, fyy, c) => {
        const kx = (hx + fx) / 2 - 2, ky = (hy + fyy) / 2;
        const seg = (x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; dot(x, y, c); dot(x + 1, y, c); } };
        seg(hx, hy, kx, ky); seg(kx, ky, fx - 1, fyy);
        box(fx - 2, fyy, 5, 1, c);
      };
      leg(bx + 1, by + 7, Math.round(p.fb), fy - p.yb, C.dim);
      leg(bx + 9, by + 7, Math.round(p.fa), fy - p.ya, C.cream);
      spr(bx, by, MECH, P);
      // the cannon: level while walking, raised for the finale
      for (let i = 0; i < 4; i++) { const x = bx + 12 + i - Math.round(a * i * 0.5), y = by + 4 - Math.round(a * i * 1.5); dot(x, y, i === 3 ? C.butter : C.dim); dot(x, y + 1, C.dim); }
      for (const tf of this.tFire) { const q = t - tf; if (q >= 0 && q < 160) { const tp = this.tip(tf); A.sparkle(tp[0] + 6, tp[1] - 1, q < 80 ? 2 : 1, C.hi); } }
      for (const c of this.conf) {
        const flip = c.rest ? 0 : Math.floor(t / 150 + c.ph) % 2;
        dot(c.x, c.y, c.c); dot(c.x + (flip ? 0 : 1), c.y + (flip ? 1 : 0), c.c);
      }
    },
  };

  return { questPlatformer: platformer, questDragon: dragon, questNinja: ninja, questDeep: underwater, questWizard: wizard, questMech: mech };
});
