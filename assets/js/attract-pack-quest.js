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
      const H = A.clamp(minTop - 10, 2, 5), HB = A.clamp(minTop - 10, 3, 11);
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
      if (s >= 0 && s + 1 < n - 1 && Math.abs(P[s + 1].ty - P[s].ty) <= 1 && P[s + 1].a - P[s].b <= 6) s1 = s + 1;
      this.slime = s >= 0 ? { a: P[s].a, b: P[s1].b, cx: Math.round((P[s].a + P[s1].b) / 2) - 3 } : null;
      const goal = A.X0 + A.WW + 4 < A.GW - 4;
      this.goal = goal ? { x: A.X0 + A.WW + 4, top: Math.max(2, P[n - 1].ty - 12), base: Math.min(A.PH - 3, A.WY1 + 3) } : null;
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

  return { questPlatformer: platformer };
});
