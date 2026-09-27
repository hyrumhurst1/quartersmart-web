// Hidden quarters. Four tiny quarters sit in quiet corners that exist on
// every page: the menu's HUD (or the old status strip), the top bar beside
// the brand, the footer theme picker and the copyright line. Each spot is a
// short list of fallbacks, so all four always exist while the header
// evolves. Collect all four for a small reward.
// Progress lives in localStorage (and fails quietly without it). Also two
// small reactive touches: the nav logo pops its quarter on hover, and arcade
// buttons flash for one frame when pressed. Reduced motion keeps it still.
(() => {
  const KEY = 'qs-quarters', SEEN = 'qs-quarters-toast';
  const ALL = ['strip', 'menu', 'theme', 'copy'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: progress lasts for this page only */ } };
  let found;
  try { found = new Set((JSON.parse(get(KEY) || '[]') || []).filter((id) => ALL.includes(id))); } catch { found = new Set(); }

  // the brand's popped quarter, 6x6 pixels
  const Q = 'M0 0h2v1H0zM0 1h4v1H0zM0 2h5v2H0zM0 4h6v2H0z';
  const glyph = `<svg viewBox="0 0 6 6" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path d="${Q}"/></svg>`;

  const live = document.createElement('p');
  live.className = 'sr'; live.setAttribute('aria-live', 'polite');
  document.body.appendChild(live);

  // The status strip is decorative and aria-hidden as a whole. To put a real,
  // focusable button in it, hide its parts individually instead.
  const sys = document.querySelector('.sys');
  const openStrip = () => {
    if (!sys || sys.getAttribute('aria-hidden') !== 'true') return;
    sys.querySelectorAll('.sys__ws > *, .sys__mid, .sys__r > *').forEach((el) => el.setAttribute('aria-hidden', 'true'));
    sys.removeAttribute('aria-hidden');
  };

  const first = (...sels) => { for (const s of sels) { const el = document.querySelector(s); if (el) return el; } return null; };
  // on phones the menu HUD row is full, so the menu quarter and the counter
  // go on the menu's title row instead
  const hudRow = matchMedia('(max-width: 699px)').matches ? '.sel__top' : '.sel__hud';
  const spots = {
    strip: () => first('.sys .sys__ws', hudRow, '.sel__hud', '.foot__grid > div:nth-child(3) h2'),
    menu: () => first('.nav__in', '.hud', '.foot__grid > div:nth-child(4) h2'),
    theme: () => first('[data-qq-slot="theme"]', '.foot .themes'),
    copy: () => first('[data-qq-slot="copy"]', '.foot__base > span'),
  };
  const labels = { strip: 'the menu', menu: 'the top bar', theme: 'the theme picker', copy: 'the copyright line' };

  // the counter lives in the menu's HUD (beside Credit and theme), or in
  // the old status strip, once at least one quarter is found
  let counter = null;
  function count(bump) {
    if (!found.size) return;
    if (!counter) {
      const r = first('.sys .sys__r', hudRow, '.sel__hud');
      if (!r) return;
      if (r.closest('.sys')) openStrip();
      counter = document.createElement('span');
      counter.className = 'qq-count';
      const title = r.querySelector('.sel__title');
      if (title) title.after(counter); else r.insertBefore(counter, r.firstChild);
    }
    counter.innerHTML = `${glyph}<span class="qq-count__w">quarters </span>${found.size}/4`;
    counter.classList.toggle('is-whole', found.size === ALL.length);
    if (bump && !reduce) { counter.classList.remove('is-bump'); void counter.offsetWidth; counter.classList.add('is-bump'); }
  }

  function collect(btn) {
    const id = btn.dataset.qq;
    if (found.has(id)) return;
    found.add(id);
    set(KEY, JSON.stringify([...found]));
    const n = found.size, whole = n === ALL.length;
    btn.disabled = true;
    btn.setAttribute('aria-label', 'Quarter found');
    const tag = document.createElement('span');
    tag.className = 'qq__n'; tag.setAttribute('aria-hidden', 'true'); tag.textContent = `${n}/4`;
    btn.appendChild(tag);
    btn.classList.add('is-got');
    setTimeout(() => btn.remove(), reduce ? 700 : 900);
    live.textContent = whole ? 'Fourth quarter found. That makes a whole.' : `Quarter found. ${n} of 4.`;
    count(true);
    if (whole) setTimeout(toast, reduce ? 200 : 650);
  }

  ALL.forEach((id) => {
    if (found.has(id)) return;
    const where = spots[id]();
    if (!where) return;
    if (where.closest('.sys')) openStrip();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'qq';
    btn.dataset.qq = id;
    btn.setAttribute('aria-label', `Hidden quarter in ${labels[id]}. Collect it`);
    btn.innerHTML = glyph;
    btn.addEventListener('click', () => collect(btn));
    // in the menu HUD it sits right beside the credit counter, like a loose coin
    const credit = where.classList.contains('sel__hud') && where.querySelector('.sel__credit');
    if (credit) credit.after(btn); else where.appendChild(btn);
  });
  count(false);

  // ---- 4/4: a small neon toast, until dismissed
  function toast() {
    if (document.querySelector('.qq-toast')) return;
    const part = (tf, fill, dx, dy, i) => `<g class="qq-toast__q" style="--dx:${dx}px;--dy:${dy}px;--i:${i}"><path fill="${fill}" transform="${tf}" d="${Q}"/></g>`;
    const el = document.createElement('div');
    el.className = 'qq-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<svg class="qq-toast__coin" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${
      part('translate(6 0) scale(-1 1)', '#2a9a70', -3, -3, 0)}${part('translate(6 12) scale(-1 -1)', '#1d7a58', -3, 3, 1)}${
      part('translate(6 12) scale(1 -1)', '#2a9a70', 3, 3, 2)}${part('translate(6 0)', '#a9d99f', 3, -3, 3)}</svg>
      <p><b class="neon">4/4. That's a whole.</b> <span><a href="/contact/">Book a call</a> and say you found them.</span></p>
      <button type="button" class="qq-toast__x" aria-label="Dismiss"><svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><path d="M0 0h1v1H0zM1 1h1v1H1zM2 2h1v1H2zM3 3h1v1H3zM4 4h1v1H4zM5 5h1v1H5zM6 6h1v1H6zM6 0h1v1H6zM5 1h1v1H5zM4 2h1v1H4zM2 4h1v1H2zM1 5h1v1H1zM0 6h1v1H0z"/></svg></button>`;
    const close = () => { set(SEEN, '1'); el.classList.add('is-out'); setTimeout(() => el.remove(), reduce ? 0 : 200); document.removeEventListener('keydown', esc); };
    const esc = (e) => { if (e.key === 'Escape') close(); };
    el.querySelector('.qq-toast__x').addEventListener('click', close);
    el.querySelector('a').addEventListener('click', () => set(SEEN, '1'));
    document.addEventListener('keydown', esc);
    document.body.appendChild(el);
  }
  if (found.size === ALL.length && get(SEEN) !== '1') setTimeout(toast, 900);

  // ---- the nav logo pops its quarter on hover (or keyboard focus)
  if (!reduce) document.querySelectorAll('.hud .brand, .nav .brand').forEach((brand) => {
    let busy = false;
    const pop = () => {
      if (busy) return;
      busy = true; brand.classList.add('qq-wig');
      setTimeout(() => { brand.classList.remove('qq-wig'); busy = false; }, 620);
    };
    brand.addEventListener('pointerenter', pop);
    brand.addEventListener('focus', pop);
  });

  // ---- arcade buttons: a one-frame pixel flash on press
  const flash = (el) => {
    if (!el) return;
    el.classList.add('qq-flash');
    setTimeout(() => el.classList.remove('qq-flash'), 80);
  };
  document.addEventListener('pointerdown', (e) => { if (e.button === 0) flash(e.target.closest && e.target.closest('.btn--arcade')); });
  document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat && e.target.closest) flash(e.target.closest('.btn--arcade')); });
})();
