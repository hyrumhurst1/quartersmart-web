// Hidden extras, loaded on every page. Nothing here is required to read the
// site. ` or ~ opens the qsh terminal; a minute without input starts the idle
// screen. Both respect reduced motion where it matters.
(() => {
  const typing = (t) => t && t.closest && t.closest('input, textarea, select, [contenteditable]');
  let tty = null;
  const getTty = () => tty || (tty = import('/assets/js/tty.js?v=20260927e'));
  document.addEventListener('keydown', (e) => {
    if ((e.key === '`' || e.key === '~') && !typing(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      getTty().then((m) => m.toggle());
    }
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-tty]')) getTty().then((m) => m.open());
  });

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let idleTimer = 0;
  const arm = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => import('/assets/js/idle.js?v=20260927e').then((m) => m.start()).catch(() => {}), 75000); };
  ['pointermove', 'keydown', 'scroll', 'touchstart'].forEach((ev) => addEventListener(ev, arm, { passive: true }));
  arm();
})();
