// qsh: a small hidden terminal. Press ` (or click qsh in the footer) to drop
// it down. Real commands that navigate the site, read the Signals feed,
// switch themes, and print a neofetch-style card. Closed, it is inert (out
// of the tab order and the accessibility tree); Esc hands focus back to
// whatever opened it.
const PAGES = { home: '/', signals: '/signals/', services: '/services/', approach: '/approach/', about: '/about/', hyrum: '/about/hyrum-hurst/', contact: '/contact/', faq: '/faq/', agencies: '/for-agencies/', policy: '/signals/policy/', log: '/signals/log/' };
const THEMES = ['evergreen', 'obsidian', 'forest', 'midnight', 'rose', 'paper'];
let el, out, input, history = [], hi = 0, opener = null;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function print(html) { out.insertAdjacentHTML('beforeend', html + '\n'); out.scrollTop = out.scrollHeight; }

function mark() {
  // the QuarterSmart mark in half-block characters (12px circle, quarter popped 2px)
  const N = 12, c = (N - 1) / 2, r2 = (N / 2) ** 2 - 0.25, W = 14;
  const g = Array.from({ length: W }, () => Array(W).fill(null));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if ((x - c) ** 2 + (y - c) ** 2 > r2) continue;
    if (x - c > 0 && y - c < 0) g[y][x + 2] = '#a9d99f'; else g[y + 2][x] = '#2a9a70';
  }
  const rows = [];
  for (let y = 0; y < W; y += 2) {
    let r = '';
    for (let x = 0; x < W; x++) {
      const t = g[y][x], b = g[y + 1] ? g[y + 1][x] : null;
      if (t && b) r += `<span style="color:${t};background:${b}">▀</span>`;
      else if (t) r += `<span style="color:${t}">▀</span>`;
      else if (b) r += `<span style="color:${b}">▄</span>`;
      else r += ' ';
    }
    rows.push(r);
  }
  return rows;
}

function stamp() {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  return f.format(new Date()) + ' (Arizona)';
}

const CMDS = {
  help: () => print(`<span class="dim">commands</span>
  <span class="p">ls</span>              list pages
  <span class="p">cd</span> &lt;page&gt;       go to a page (cd signals)
  <span class="p">signals</span>         latest Signals from the feed
  <span class="p">book</span>            book a 20-minute call
  <span class="p">theme</span> [name]     list or switch themes
  <span class="p">whoami</span>          who we are
  <span class="p">neofetch</span>        system info
  <span class="p">date</span>, <span class="p">clear</span>, <span class="p">exit</span>`),
  ls: () => print(Object.keys(PAGES).map((k) => `<a href="${PAGES[k]}">${k}/</a>`).join('  ')),
  cd: (a) => {
    const k = (a[0] || 'home').replace(/[/.~]/g, '') || 'home';
    if (PAGES[k]) { print(`<span class="dim">cd ${esc(k)}</span>`); location.href = PAGES[k]; } else print(`qsh: cd: ${esc(k)}: no such page (try ls)`);
  },
  open: (a) => CMDS.cd(a),
  book: () => { print('opening the booking page...'); location.href = '/contact/'; },
  date: () => print(stamp()),
  whoami: () => print(`you     <span class="dim">probably early. good.</span>
us      QuarterSmart: we track AI launches, tell you which ones matter,
        and set them up for your team from the day they're available.
founder Hyrum Hurst, also CTO of Learning Journey AI`),
  theme: (a) => {
    if (!a[0]) { print(THEMES.map((t) => (document.documentElement.dataset.theme === t ? `<span class="p">* ${t}</span>` : `  ${t}`)).join('\n')); return; }
    if (!THEMES.includes(a[0])) { print(`qsh: theme: ${esc(a[0])}: unknown (try theme)`); return; }
    const btn = document.querySelector(`[data-theme-pick="${a[0]}"]`);
    if (btn) btn.click(); else { document.documentElement.dataset.theme = a[0]; try { localStorage.setItem('qs-theme', a[0]); } catch { /* private mode */ } }
    print(`theme set: ${esc(a[0])}`);
  },
  signals: async () => {
    print('<span class="dim">fetching /feed.xml ...</span>');
    try {
      const x = new DOMParser().parseFromString(await (await fetch('/feed.xml')).text(), 'text/xml');
      const items = [...x.querySelectorAll('item')].slice(0, 6);
      if (!items.length) throw new Error('empty');
      items.forEach((it, i) => print(`${String(i + 1).padStart(2, '0')}  <a href="${new URL(it.querySelector('link').textContent).pathname}">${esc(it.querySelector('title').textContent)}</a>`));
    } catch { print('qsh: signals: feed unavailable here. try cd signals'); }
  },
  neofetch: () => {
    const m = mark();
    const theme = document.documentElement.dataset.theme || 'evergreen';
    const info = [
      '<span class="p">hyrum</span>@<span class="p">quartersmart</span>',
      '<span class="dim">-----------------</span>',
      '<span class="p">os</span>       QuarterSmart',
      '<span class="p">focus</span>    AI early adoption',
      '<span class="p">shell</span>    qsh',
      `<span class="p">theme</span>    ${theme}`,
      '<span class="p">levels</span>   0 signals · 1 head start · 2 day one · 3 first quarter · 4 build',
      '<span class="p">motto</span>    25%? that\'s a quarter.',
    ];
    const n = Math.max(m.length, info.length);
    const rows = [];
    for (let i = 0; i < n; i++) rows.push(`${m[i] || ' '.repeat(14)}   ${info[i] || ''}`);
    print(rows.join('\n'));
  },
  quarter: () => print('25%? that\'s a quarter.'),
  sudo: () => print('nice try.'),
  clear: () => { out.innerHTML = ''; },
  exit: () => close(),
};

function run(line) {
  print(`<span class="p">~ $</span> ${esc(line)}`);
  const [cmd, ...args] = line.trim().split(/\s+/);
  if (!cmd) return;
  const f = CMDS[cmd.toLowerCase()];
  if (f) f(args); else print(`qsh: ${esc(cmd)}: command not found (try help)`);
}

function build() {
  el = document.createElement('div');
  el.className = 'tty';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Terminal');
  el.innerHTML = '<div class="tty__bar"><span>qsh · quartersmart.com</span><span>esc to close</span></div><div class="tty__out" aria-live="polite"></div><div class="tty__row"><label class="p" for="tty-in">~ $</label><input class="tty__in" id="tty-in" autocomplete="off" spellcheck="false"></div>';
  document.body.appendChild(el);
  out = el.querySelector('.tty__out');
  input = el.querySelector('.tty__in');
  print('<span class="dim">qsh 1.0  ·  type help</span>');
  input.addEventListener('keydown', (e) => {
    // preventDefault: "exit" hands focus back to the opener mid-keystroke, and
    // an un-cancelled Enter would then press that button and reopen the terminal
    if (e.key === 'Enter') { e.preventDefault(); const v = input.value; input.value = ''; if (v.trim()) { history.push(v); hi = history.length; } run(v); }
    else if (e.key === 'ArrowUp') { if (hi > 0) { hi--; input.value = history[hi]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { if (hi < history.length) { hi++; input.value = history[hi] || ''; } e.preventDefault(); }
    else if (e.key === 'Escape' || ((e.key === '`' || e.key === '~') && !input.value)) { e.preventDefault(); close(); }
  });
}
export function open() {
  if (!el) build();
  if (!el.classList.contains('is-open')) opener = document.activeElement;
  el.inert = false;
  el.classList.add('is-open');
  setTimeout(() => input.focus(), 50);
}
export function close() {
  if (!el) return;
  el.classList.remove('is-open');
  input.blur();
  el.inert = true;
  if (opener && opener !== document.body && opener.isConnected) opener.focus({ preventScroll: true });
  opener = null;
}
export function toggle() { if (el && el.classList.contains('is-open')) close(); else open(); }
