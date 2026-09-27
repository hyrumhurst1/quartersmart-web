// QuarterSmart site script. Everything here is progressive: the page reads
// fully without it. Small on purpose: clock, theme, mobile menu, reveals.
(() => {
  const root = document.documentElement;
  root.classList.add('js');

  // ---- Theme (Omarchy-style: a small set of named, fully designed palettes)
  const THEMES = ['evergreen', 'obsidian', 'forest', 'midnight', 'rose', 'paper'];
  const read = () => { try { return localStorage.getItem('qs-theme'); } catch { return null; } };
  const save = (t) => { try { localStorage.setItem('qs-theme', t); } catch { /* private mode */ } };
  function apply(t) {
    if (!THEMES.includes(t)) t = 'evergreen';
    root.dataset.theme = t;
    document.querySelectorAll('[data-theme-name]').forEach((el) => { el.textContent = t; });
    document.querySelectorAll('[data-theme-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themePick === t)));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg-0').trim() || meta.content;
    window.dispatchEvent(new CustomEvent('qs:theme', { detail: t }));
  }
  apply(read() || 'evergreen');
  document.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-theme-pick]');
    if (pick) { apply(pick.dataset.themePick); save(pick.dataset.themePick); return; }
    const cyc = e.target.closest('[data-theme-cycle]');
    if (cyc) { const n = THEMES[(THEMES.indexOf(root.dataset.theme) + 1) % THEMES.length]; apply(n); save(n); }
  });

  // ---- Status-bar clock, Arizona time (no DST), like a waybar module
  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    // "Sun 27 Sep · W39 · Q3 · 1:24 AM" : the week and the quarter, for a firm named after one.
    const parts = (d) => Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).formatToParts(d).map((p) => [p.type, p.value]));
    const isoWeek = (y, m, d) => {
      const t = new Date(Date.UTC(y, m, d));
      const day = t.getUTCDay() || 7;
      t.setUTCDate(t.getUTCDate() + 4 - day);
      return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
    };
    const MON = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const tick = () => {
      const p = parts(new Date());
      const m = MON[p.month];
      const s = `${p.weekday} ${p.day} ${p.month} · W${isoWeek(+p.year, m, +p.day)} · Q${Math.floor(m / 3) + 1} · ${p.hour}:${p.minute} ${p.dayPeriod}`;
      clocks.forEach((c) => { c.textContent = s; });
    };
    tick();
    setInterval(tick, 15000);
  }

  // ---- Mobile menu
  const btn = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('qs-menu');
  if (btn && menu) {
    const set = (open) => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; root.classList.toggle('menu-open', open); };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  }

  // ---- Keyboard: "g" then a number jumps workspaces, like Super+1..5
  const ws = [...document.querySelectorAll('[data-ws]')];
  let armed = 0;
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'g') { armed = Date.now(); return; }
    if (armed && Date.now() - armed < 1200 && /^[1-9]$/.test(e.key)) {
      const a = ws.find((x) => x.dataset.ws === e.key);
      if (a) location.href = a.href;
    }
    armed = 0;
  });

  // ---- Reveal on scroll (content is visible without JS; .js opts into hiding)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // ---- Netlify form: inline confirmation, no page change
  document.querySelectorAll('form[data-netlify="true"][data-inline]').forEach((f) => {
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const out = f.querySelector('[data-form-status]');
      const b = f.querySelector('button[type="submit"]');
      b.disabled = true;
      try {
        const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() });
        if (!r.ok) throw new Error(r.status);
        f.classList.add('is-done');
        if (out) out.textContent = 'You are on the list. First issue lands Monday.';
      } catch {
        b.disabled = false;
        if (out) out.textContent = 'That did not go through. Email hyrum@quartersmart.com and we will add you.';
      }
    });
  });
})();
