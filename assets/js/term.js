// Terminal effects. The page is complete without this file: every effect
// starts from real, readable content and only animates it in.
//   [data-tte="decrypt"]  heading scrambles through glyphs, then resolves left to right
//   [data-ansi]           terminal art prints in row by row, the frontier flickering
//   [data-blink]          a small element blinks like an LED
// Honours prefers-reduced-motion (does nothing).
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const GLYPHS = '█▓▒░▄▀#%&@$*+=<>/\\|01';
  const rnd = (s) => s[(Math.random() * s.length) | 0];

  // ---- decrypt text (like a terminal text effect)
  function decrypt(el) {
    if (el.dataset.tteDone) return;
    el.dataset.tteDone = '1';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    const orig = nodes.map((n) => n.nodeValue);
    const total = orig.reduce((a, s) => a + s.length, 0);
    const start = performance.now();
    const dur = Math.min(1400, 380 + total * 18);
    el.setAttribute('aria-label', el.textContent.trim());
    function frame(t) {
      const p = Math.min(1, (t - start) / dur);
      let seen = 0;
      nodes.forEach((n, i) => {
        const s = orig[i];
        let out = '';
        for (let k = 0; k < s.length; k++) {
          const at = (seen + k) / total;
          const ch = s[k];
          if (ch === ' ' || at < p - 0.08) out += ch;
          else if (at < p + 0.12) out += rnd(GLYPHS);
          else out += ch === '\n' ? ch : ' ';
        }
        n.nodeValue = out;
        seen += s.length;
      });
      if (p < 1) requestAnimationFrame(frame);
      else { nodes.forEach((n, i) => { n.nodeValue = orig[i]; }); el.removeAttribute('aria-label'); }
    }
    requestAnimationFrame(frame);
  }

  // ---- print terminal art in, row by row
  function printIn(pre) {
    if (pre.dataset.printed) return;
    pre.dataset.printed = '1';
    const html = pre.innerHTML.split('\n');
    const rows = html.length;
    pre.style.minHeight = pre.offsetHeight + 'px';
    pre.innerHTML = '';
    let r = 0;
    const tick = () => {
      const chunk = Math.max(1, Math.round(rows / 22));
      for (let k = 0; k < chunk && r < rows; k++, r++) {
        pre.insertAdjacentHTML('beforeend', (r ? '\n' : '') + html[r]);
      }
      if (r < rows) setTimeout(tick, 34);
      else pre.style.minHeight = '';
    };
    tick();
  }

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (el.matches('[data-tte]')) decrypt(el);
    if (el.matches('[data-ansi]')) printIn(el);
    io.unobserve(el);
  }), { threshold: 0.25 });
  document.querySelectorAll('[data-tte], [data-ansi]').forEach((el) => io.observe(el));

  // ---- idle screen: after a minute without input, a terminal screensaver
  let idleTimer = 0;
  const arm = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => import('/assets/js/idle.js?v=20260927d').then((m) => m.start()).catch(() => {}), 60000); };
  ['pointermove', 'keydown', 'scroll', 'touchstart'].forEach((ev) => addEventListener(ev, arm, { passive: true }));
  arm();
})();
