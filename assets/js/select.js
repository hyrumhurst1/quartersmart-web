// Select stage: the site menu, plus the coin drop on the Book buttons.
// There is no nav bar. A pixel joystick (top right) or a short dwell on the
// top edge spawns a CRT "select stage" screen; a pixel cursor snaps between five
// stage tiles, the joystick leans the way it moves, and the coin door books
// the call. Opened by hover it closes when the mouse leaves; opened by click
// or keyboard ("m", or Enter on the joystick) it stays until Esc, the close
// button, the joystick again, a click outside, or focus leaving it. Reduced
// motion: no animation, and coin links navigate at once.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const phone = matchMedia('(max-width: 699px)');
  const $ = (s, el = document) => el.querySelector(s);
  const typing = (t) => t && t.closest && t.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
  const modified = (e) => e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

  const credit = $('[data-sel-credit]');
  const addCredit = () => { if (credit) credit.textContent = '01'; };

  // ---- Coin drop on every "Book" arcade button: a coin starts falling into
  // the button at once and the page goes a beat later (WAIT), so the click
  // never feels held; it is fine if the next page lands mid-fall.
  // Ctrl/meta/shift/middle click and reduced motion get the plain link.
  const WAIT = 110;
  // The coin falls through a window that ends at the drop line (the top of
  // the button, or the slit of the little coin door), so it vanishes into it.
  function coinInto(a) {
    const slot = a.querySelector('.hud__slot');
    const r = (slot || a).getBoundingClientRect();
    const line = Math.round(slot ? r.top + 8 : r.top);
    const top = Math.max(0, line - 46);
    const fx = document.createElement('span');
    fx.className = 'coinfx';
    fx.setAttribute('aria-hidden', 'true');
    fx.style.left = Math.round(r.left + r.width / 2 - 16) + 'px';
    fx.style.top = top + 'px';
    fx.style.height = (line - top) + 'px';
    fx.appendChild(document.createElement('i'));
    document.body.appendChild(fx);
    a.classList.add('is-coin');
    setTimeout(() => { fx.remove(); a.classList.remove('is-coin'); delete a.dataset.coin; }, 900);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a.btn--arcade[data-cta="book"], a.hud__coin');
    if (!a || e.defaultPrevented || modified(e) || reduce.matches) return;
    const blank = a.target === '_blank';
    if (a.dataset.coin) { if (!blank) e.preventDefault(); return; }
    a.dataset.coin = '1';
    addCredit();
    coinInto(a);
    if (blank) return; // new tab opens now; the coin still drops here
    e.preventDefault();
    setTimeout(() => { location.href = a.href; }, WAIT);
  });

  // Warm the booking page on intent (hover, focus, touch), so the short coin
  // beat overlaps the fetch. Same site only, once per page, never on load.
  const warmed = new Set();
  const warm = (e) => {
    const a = e.target.closest && e.target.closest('a.btn--arcade[data-cta="book"], a.hud__coin, a.sel__coin');
    if (!a || a.target === '_blank' || a.origin !== location.origin || a.pathname === location.pathname || warmed.has(a.pathname)) return;
    warmed.add(a.pathname);
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = a.pathname;
    document.head.appendChild(l);
  };
  ['pointerover', 'focusin', 'touchstart'].forEach((t) => document.addEventListener(t, warm, { capture: true, passive: true }));

  // The dock coin reads as booking: once the page's first Book button has
  // scrolled off the top, its "book a call" tag stays out (desktop; phones
  // always show the words). On the booking page itself the coins scroll to
  // the booking block instead of reloading the page.
  const dock = $('a.hud__coin');
  const firstBook = $('main a[data-cta="book"]');
  if (dock && firstBook && 'IntersectionObserver' in window) {
    // The root reaches far below the screen, so the one edge that counts is
    // the top: a jump or a fast fling past the button still flips it.
    new IntersectionObserver(([e]) => dock.classList.toggle('is-call', !e.isIntersecting && e.boundingClientRect.bottom < 0), { rootMargin: '0px 0px 100000px 0px' }).observe(firstBook);
  }
  // Phones: the dock tucks up while the page scrolls down, so it never sits
  // on the line being read, and any scroll back up (or reaching the end)
  // brings it straight back. qs.css only applies .hud-tuck under 700px.
  if (dock) {
    let y0 = scrollY, tucked = false;
    addEventListener('scroll', () => {
      const y = scrollY, d = y - y0;
      if (d > -6 && d < 6) return; // ignore jitter, but let small moves add up
      y0 = y;
      const end = y + innerHeight >= root.scrollHeight - 4;
      const t = d > 0 && y > 120 && !end && phone.matches;
      if (t !== tucked) { tucked = t; root.classList.toggle('hud-tuck', t); }
    }, { passive: true });
  }
  if (document.getElementById('book-a-call')) {
    document.querySelectorAll('a.hud__coin, a.sel__coin').forEach((a) => { if (a.pathname === location.pathname) a.setAttribute('href', '#book-a-call'); });
  }

  // ---- The menu
  const start = $('[data-sel-start]');
  const sel = document.getElementById('qs-select');
  if (!start || !sel) return;
  const tiles = [...sel.querySelectorAll('.sel__tile')];
  const lis = tiles.map((t) => t.parentElement);
  const cur = $('[data-sel-cur]', sel);
  const joy = $('[data-sel-joy]', sel);
  const deckBtn = $('[data-sel-btn]', sel);
  const pvArt = $('[data-sel-pv-art]', sel);
  const pvSp = $('[data-sel-pv-sp]', sel);
  const pvName = $('[data-sel-pv-name]', sel);
  const pvDesc = $('[data-sel-pv-desc]', sel);
  const edge = $('[data-sel-edge]');
  const coin = $('[data-sel-coin]', sel);
  tiles.forEach((t, i) => t.style.setProperty('--i', i));

  // Phones: the open menu fills the screen, so the page under it goes inert
  // too, and a screen reader swipe stays inside the menu. The part of the
  // top bar that holds the joystick stays live (it closes the menu); so does
  // anything already inert, which is left exactly as it was.
  let benched = [];
  const bench = (parent) => {
    for (const n of parent.children) {
      if (n === sel || n.inert || n.classList.contains('tty') || /^(SCRIPT|STYLE|LINK|TEMPLATE|NOSCRIPT)$/.test(n.tagName)) continue;
      if (n.contains(start)) { bench(n); continue; }
      n.inert = true;
      benched.push(n);
    }
  };
  const under = (on) => {
    benched.forEach((n) => { n.inert = false; });
    benched = [];
    if (on) bench(document.body);
  };

  let open = false;
  let mode = null; // 'hover' | 'click' | 'key'
  let idx = Math.max(0, tiles.findIndex((t) => t.getAttribute('aria-current') === 'page'));
  let tLeave = 0, tDwell = 0, tClose = 0;
  let tJoy = [];

  // Cursor: offsets ignore transforms, so it lands right even mid-animation.
  function place(instant) {
    const t = tiles[idx], li = lis[idx];
    if (!t || !cur) return;
    if (instant) cur.style.transition = 'none';
    cur.style.transform = `translate(${li.offsetLeft}px, ${li.offsetTop}px)`;
    cur.style.width = t.offsetWidth + 'px';
    cur.style.height = t.offsetHeight + 'px';
    if (instant) { void cur.offsetWidth; cur.style.transition = ''; }
  }

  function tilt(dir) {
    if (!joy || !dir) return;
    tJoy.forEach(clearTimeout);
    joy.dataset.f = dir < 0 ? '0' : '4';
    tJoy = [
      setTimeout(() => { joy.dataset.f = dir < 0 ? '1' : '3'; }, 110),
      setTimeout(() => { delete joy.dataset.f; }, 210),
    ];
  }
  let tBtn = 0;
  function press() {
    if (!deckBtn) return;
    clearTimeout(tBtn);
    deckBtn.classList.add('is-down');
    tBtn = setTimeout(() => deckBtn.classList.remove('is-down'), 180);
  }

  function select(i, o = {}) {
    const n = tiles.length;
    i = ((i % n) + n) % n;
    const prev = idx;
    idx = i;
    const t = tiles[i];
    tiles.forEach((x, k) => x.classList.toggle('is-sel', k === i));
    sel.dataset.cur = t.dataset.key || '';
    if (pvSp) {
      pvSp.style.setProperty('--sp', t.style.getPropertyValue('--sp'));
      pvSp.classList.toggle('is-av', t.classList.contains('sel__tile--av'));
    }
    if (pvName) pvName.textContent = ($('.sel__name', t) || t).textContent;
    if (pvDesc) pvDesc.textContent = t.dataset.desc || '';
    if (pvArt && prev !== i && !o.instant) { pvArt.classList.remove('is-swap'); void pvArt.offsetWidth; pvArt.classList.add('is-swap'); }
    place(o.instant);
    if (prev !== i && !o.instant) tilt(o.dir || Math.sign(i - prev));
    if (o.focus) t.focus({ preventScroll: true });
  }

  function show(how) {
    clearTimeout(tLeave); clearTimeout(tDwell);
    if (open) { if (how !== 'hover') mode = how; return; }
    open = true;
    mode = how;
    clearTimeout(tClose);
    sel.classList.remove('is-closing');
    sel.inert = false;
    sel.classList.add('is-open');
    root.classList.add('sel-open');
    root.classList.toggle('sel-lock', phone.matches);
    under(phone.matches);
    start.setAttribute('aria-expanded', 'true');
    start.setAttribute('aria-label', 'Close menu');
    select(idx, { instant: true });
    if (how !== 'hover') tiles[idx].focus({ preventScroll: true });
  }

  function hide(o = {}) {
    if (!open) return;
    open = false;
    mode = null;
    clearTimeout(tLeave); clearTimeout(tDwell);
    const inside = sel.contains(document.activeElement);
    start.setAttribute('aria-expanded', 'false');
    start.setAttribute('aria-label', 'Open menu');
    root.classList.remove('sel-open', 'sel-lock');
    under(false);
    sel.classList.remove('is-open');
    sel.inert = true;
    if (!reduce.matches) {
      sel.classList.add('is-closing');
      tClose = setTimeout(() => sel.classList.remove('is-closing'), 200);
    }
    if (o.focus || (inside && o.focus !== false)) start.focus({ preventScroll: true });
  }

  const pin = () => { if (open && mode === 'hover') mode = 'click'; };
  const isMouse = (e) => e.pointerType === 'mouse' && fine.matches;

  // The joystick: hovering rocks it (CSS) and spawns the menu after a short
  // beat; a click opens and pins it, a second click closes.
  start.addEventListener('click', (e) => {
    clearTimeout(tDwell);
    start.classList.add('is-snap');
    if (open && mode === 'hover') { pin(); tiles[idx].focus({ preventScroll: true }); return; }
    if (open) hide({ focus: true });
    else show(e.detail === 0 ? 'key' : 'click');
  });
  start.addEventListener('pointerenter', (e) => {
    start.classList.remove('is-snap');
    if (!isMouse(e)) return;
    clearTimeout(tLeave);
    if (!open) { clearTimeout(tDwell); tDwell = setTimeout(() => show('hover'), 260); }
  });
  start.addEventListener('pointerleave', () => { start.classList.remove('is-snap'); if (!open) clearTimeout(tDwell); });

  // Top edge: a short dwell so passing to the tab bar does not open it.
  if (edge) {
    edge.addEventListener('pointerenter', (e) => { if (isMouse(e)) tDwell = setTimeout(() => show('hover'), 180); });
    edge.addEventListener('pointerleave', () => clearTimeout(tDwell));
  }

  // Leaving the panel and START closes a hover-opened menu.
  const leave = (e) => {
    if (!open || mode !== 'hover' || e.pointerType !== 'mouse') return;
    clearTimeout(tLeave);
    tLeave = setTimeout(() => { if (mode === 'hover') hide({ focus: false }); }, 350);
  };
  const enter = () => clearTimeout(tLeave);
  [sel, start].forEach((el) => { el.addEventListener('pointerleave', leave); el.addEventListener('pointerenter', enter); });

  // Using the panel pins it open.
  sel.addEventListener('pointerdown', (e) => { pin(); if (e.target.closest('.sel__tile, [data-sel-coin]')) press(); });
  sel.addEventListener('focusin', (e) => {
    pin();
    const i = tiles.indexOf(e.target);
    if (i >= 0 && i !== idx) select(i);
  });
  tiles.forEach((t, i) => t.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && open && i !== idx) select(i); }));
  sel.addEventListener('click', (e) => { if (e.target.closest('[data-sel-close]')) hide({ focus: true }); });

  // Click outside closes.
  document.addEventListener('pointerdown', (e) => {
    if (open && !sel.contains(e.target) && !start.contains(e.target)) hide({ focus: false });
  }, true);

  // Focus leaving the open menu: phones wrap inside the full-screen menu
  // (Tab past the last item goes to the first, Shift+Tab past the first goes
  // to the last); larger screens just close it. The joystick stays reachable.
  // On phones Tab is caught before focus leaves, so the page under the menu
  // never scrolls to a stray focus; focusin is the fallback for anything else.
  const stops = () => [...sel.querySelectorAll('a[href], button:not([hidden]):not([disabled])')].filter((el) => el.getClientRects().length);
  document.addEventListener('keydown', (e) => {
    if (!open || e.key !== 'Tab' || !phone.matches || e.altKey || e.ctrlKey || e.metaKey) return;
    const f = stops(), a = document.activeElement;
    const to = e.shiftKey ? (a === start ? f[f.length - 1] : null) : (a === f[f.length - 1] ? f[0] : null);
    if (to) { e.preventDefault(); to.focus({ preventScroll: true }); }
  });
  document.addEventListener('focusin', (e) => {
    if (!open || sel.contains(e.target) || e.target === start) return;
    if (!phone.matches) { hide({ focus: false }); return; }
    const f = stops();
    (e.relatedTarget === f[f.length - 1] ? f[0] : f[f.length - 1]).focus({ preventScroll: true });
  });

  // Moving by geometry: left/right along the row (wrapping), up/down to the
  // nearest tile in the next row when there is one (the phone grid).
  function vertical(dir) {
    const me = lis[idx];
    const cx = me.offsetLeft + me.offsetWidth / 2;
    let best = -1, bestD = Infinity;
    lis.forEach((li, k) => {
      const dy = (li.offsetTop - me.offsetTop) * dir;
      if (dy <= 4) return;
      const d = dy * 4 + Math.abs(li.offsetLeft + li.offsetWidth / 2 - cx);
      if (d < bestD) { bestD = d; best = k; }
    });
    return best;
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (open && e.key === 'Enter') press();
    const ttyOpen = !!document.querySelector('.tty.is-open');
    if (e.key === 'Escape') {
      if (open && !ttyOpen) { e.preventDefault(); hide({ focus: true }); }
      return;
    }
    // "m" only on its own: no Shift (the others return above), no key repeat,
    // never while typing in a field or the terminal, and not once the footer
    // "shortcuts" button has turned the one-key shortcuts off (term.js)
    if ((e.key === 'm' || e.key === 'M') && !e.shiftKey && !e.repeat && !e.isComposing && !typing(e.target) && !ttyOpen && !root.classList.contains('keys-off')) {
      e.preventDefault();
      if (open) hide({ focus: sel.contains(document.activeElement) });
      else show('key');
      return;
    }
    if (!open || typing(e.target)) return;
    const k = e.key;
    let to = -1, dir = 0;
    if (k === 'ArrowRight') { to = idx + 1; dir = 1; }
    else if (k === 'ArrowLeft') { to = idx - 1; dir = -1; }
    else if (k === 'Home') { to = 0; dir = -1; }
    else if (k === 'End') { to = tiles.length - 1; dir = 1; }
    else if (k === 'ArrowDown' || k === 'ArrowUp') {
      e.preventDefault();
      const v = vertical(k === 'ArrowDown' ? 1 : -1);
      if (v >= 0) { pin(); select(v, { focus: true, dir: k === 'ArrowDown' ? 1 : -1 }); }
      return;
    } else if (k === 'Enter' && (!document.activeElement || document.activeElement === document.body)) {
      e.preventDefault();
      location.href = tiles[idx].href;
      return;
    }
    if (to === -1 && !dir) return;
    e.preventDefault();
    pin();
    select(to, { focus: true, dir });
  });

  // INSERT COIN: the coin (spinning over the door on hover) turns edge-on,
  // drops into the slot, the slot lights, CREDIT ticks to 01, and we go on
  // the same short beat as the Book buttons. On the booking page the link is
  // a hash: close the menu first so the page can scroll to it.
  if (coin) {
    const go = () => {
      if (coin.pathname === location.pathname) { hide({ focus: false }); coin.classList.remove('is-drop', 'is-fed'); }
      location.href = coin.href;
    };
    coin.addEventListener('click', (e) => {
      if (e.defaultPrevented || modified(e) || reduce.matches) {
        if (!e.defaultPrevented && coin.pathname === location.pathname && !modified(e)) hide({ focus: false });
        return;
      }
      e.preventDefault();
      if (coin.classList.contains('is-drop') || coin.classList.contains('is-coin')) return;
      if (phone.matches) { // no door on phones: the coin drops into the button
        coin.dataset.coin = '1';
        addCredit();
        coinInto(coin);
        setTimeout(go, WAIT);
        return;
      }
      coin.classList.add('is-drop');
      setTimeout(() => { coin.classList.add('is-fed'); addCredit(); }, 70);
      setTimeout(go, WAIT);
    });
  }

  addEventListener('resize', () => { if (open) place(true); });
  phone.addEventListener && phone.addEventListener('change', () => { if (open) { root.classList.toggle('sel-lock', phone.matches); under(phone.matches); } });

  // Back/forward cache: come back to a closed menu and a fresh credit.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    hide({ focus: false });
    sel.classList.remove('is-closing');
    if (credit) credit.textContent = '00';
    if (coin) coin.classList.remove('is-drop', 'is-fed', 'is-coin');
    document.querySelectorAll('.coinfx').forEach((n) => n.remove());
    document.querySelectorAll('[data-coin]').forEach((a) => { delete a.dataset.coin; a.classList.remove('is-coin'); });
  });

  select(idx, { instant: true });
})();
