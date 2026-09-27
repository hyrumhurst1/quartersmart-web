// Hidden extras, loaded on every page. Nothing here is required to read the
// site. ` opens the qsh terminal (it respects reduced motion). The key only
// counts on its own: not with a modifier held and not while typing in a field.
// The footer's "shortcuts" button turns the one-key shortcuts (` here, M in
// select.js) off or on for this browser; html.keys-off is the switch.
(() => {
  const root = document.documentElement;
  const typing = (t) => t && t.closest && t.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
  let tty = null;
  const getTty = () => tty || (tty = import('/assets/js/tty.js?v=20260927g'));

  let saved = null;
  try { saved = localStorage.getItem('qs-keys'); } catch { /* private mode */ }
  const paint = (off) => {
    root.classList.toggle('keys-off', off);
    document.querySelectorAll('[data-keys-toggle]').forEach((b) => { b.textContent = off ? 'shortcuts off' : 'shortcuts on'; });
    // announce the keys only while they work
    document.querySelectorAll('[aria-keyshortcuts], [data-ks]').forEach((b) => {
      if (!b.dataset.ks) b.dataset.ks = b.getAttribute('aria-keyshortcuts');
      if (off) b.removeAttribute('aria-keyshortcuts'); else b.setAttribute('aria-keyshortcuts', b.dataset.ks);
    });
  };
  paint(saved === 'off');

  document.addEventListener('keydown', (e) => {
    if (e.key !== '`' || e.repeat || e.isComposing || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || typing(e.target) || root.classList.contains('keys-off')) return;
    e.preventDefault();
    getTty().then((m) => m.toggle());
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-keys-toggle]')) {
      const off = !root.classList.contains('keys-off');
      try { localStorage.setItem('qs-keys', off ? 'off' : 'on'); } catch { /* this page only */ }
      paint(off);
      return;
    }
    if (e.target.closest('[data-tty]')) getTty().then((m) => m.open());
  });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // The idle screen is retired (the homepage hero is the attract mode now), so no idle timer runs.
})();
