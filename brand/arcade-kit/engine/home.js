// Homepage behaviours: level select (tabs with hover preview and arrow keys)
// and the boot rail that fills as you scroll past How it works.
(() => {
  const list = document.querySelector('.levels__list');
  if (list) {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus) => {
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; panels[k].hidden = k !== i; });
      document.querySelectorAll('.pu-shelf .pu').forEach((pu) => pu.classList.toggle('is-on', +pu.dataset.pu === i));
      if (focus) tabs[i].focus();
    };
    select(Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')), false);
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false));
      t.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) select(i, false); });
      t.addEventListener('keydown', (e) => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
      });
    });
  }
  const boot = document.querySelector('[data-boot]');
  if (boot) {
    const steps = [...boot.querySelectorAll('.boot__steps li')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const set = () => {
      const r = boot.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height * 0.8)));
      boot.style.setProperty('--boot', p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle('is-on', p >= (i + 0.5) / steps.length));
    };
    addEventListener('scroll', set, { passive: true });
    addEventListener('resize', set);
    set();
  }
})();
