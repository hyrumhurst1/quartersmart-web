// Book a call (/insert-coin): "Insert coin to start".
// One click (or Enter/Space) on the coin slot drops a coin (under 600 ms),
// CREDIT 00 becomes 01, PLAYER 1 READY flashes, and the picker opens in the
// same window: weekday keys laid out by week, that day's times in the
// visitor's own time zone, then name, email and an optional line. Everything
// goes through our own endpoints on this domain (/insert-coin/api/*). If the
// API cannot answer, the window offers the calendar page on our own booking
// domain and email (Outlook works even when the calendar server is down).
// Reduced motion: no coin drop or flash, the picker is open from the start.
(() => {
  const win = document.querySelector('[data-ic]');
  if (!win) return;
  const root = document.documentElement;
  const API = '/insert-coin/api/';
  const MAIL = 'hyrum@quartersmart.com';
  const MAILTO = `mailto:${MAIL}?subject=${encodeURIComponent('Book a call')}`;
  const NAP = "The calendar's taking a nap.";
  const CAL_PAGE = 'https://book.quartersmart.com/hyrum/ai-game-plan';
  const LEN = 20;
  const RANGE = 21;
  const ORDER = [1, 2, 3, 4, 5, 6, 0]; // weekday columns, Monday first
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@(?=.{3,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
  const LINK_RE = /(?:https?|ftp):\/\/|www\.|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,24}\/\S/i;

  const q = (s) => win.querySelector(s);
  const coin = q('[data-ic-coin]');
  const creditLine = q('.ic__credit');
  const pick = q('[data-ic-pick]');
  const load = q('[data-ic-load]');
  const slow = q('[data-ic-slow]');
  const oops = q('[data-ic-oops]');
  const oopsH = q('[data-ic-oops-h]');
  const grid = q('[data-ic-grid]');
  const daysEl = q('[data-ic-days]');
  const timesEl = q('[data-ic-times]');
  const tzEl = q('[data-ic-tz]');
  const note = q('[data-ic-note]');
  const form = q('[data-ic-form]');
  const sum = q('[data-ic-sum]');
  const go = q('[data-ic-go]');
  const slowBook = q('[data-ic-slowbook]');
  const formErr = q('[data-ic-formerr]');
  const done = q('[data-ic-done]');
  const whenEl = q('[data-ic-when]');
  const inbox = q('[data-ic-inbox]');
  const dryEl = q('[data-ic-dry]');
  const status = q('[data-ic-status]');
  const fields = { name: q('#ic-name'), email: q('#ic-email'), notes: q('#ic-notes') };
  const hp = q('#ic-website');
  if (!coin || !pick || !form) return;

  // ---- time zone and formatting
  const tz = (() => {
    try {
      const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (z) { new Intl.DateTimeFormat('en-US', { timeZone: z }); return z; }
    } catch { /* fall through */ }
    return 'America/Phoenix';
  })();
  const DAY = 864e5;
  const f = (o) => new Intl.DateTimeFormat('en-US', o);
  const fYmd = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const ymd = (ms) => { const p = fYmd.formatToParts(new Date(ms)); const g = (t) => p.find((x) => x.type === t).value; return `${g('year')}-${g('month')}-${g('day')}`; };
  const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);
  const noon = (d) => new Date(d + 'T12:00:00Z');
  const fW = f({ timeZone: 'UTC', weekday: 'short' });
  const fM = f({ timeZone: 'UTC', month: 'short' });
  const fD = f({ timeZone: 'UTC', day: 'numeric' });
  const fDayLong = f({ timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' });
  const fWhen = f({ timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' });
  let fTime;
  try { fTime = new Intl.DateTimeFormat(undefined, { timeZone: tz, hour: 'numeric', minute: '2-digit' }); } catch { fTime = f({ timeZone: tz, hour: 'numeric', minute: '2-digit' }); }
  const zoneName = (style, at) => {
    for (const s of [style, 'long']) {
      try { return f({ timeZone: tz, timeZoneName: s }).formatToParts(at || new Date()).find((p) => p.type === 'timeZoneName').value; } catch { /* next */ }
    }
    return tz.replace(/_/g, ' ');
  };
  const whenText = (iso) => { const at = new Date(iso); return `${fWhen.format(at)} at ${fTime.format(at)} ${zoneName('short', at)}`; };

  // ---- small DOM helpers
  const el = (tag, cls, text, hidden) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    if (hidden) n.setAttribute('aria-hidden', 'true');
    return n;
  };
  const mailLink = () => { const a = el('a', '', MAIL); a.href = MAILTO; return a; };
  const calLink = (t) => { const a = el('a', '', t); a.href = CAL_PAGE; return a; };
  let sayT = 0;
  const say = (msg) => { clearTimeout(sayT); status.textContent = ''; sayT = setTimeout(() => { status.textContent = msg; }, 40); };
  const credit = (blink) => {
    win.querySelectorAll('[data-ic-credit]').forEach((b) => { b.textContent = '01'; });
    if (blink && creditLine) creditLine.classList.add('is-up');
  };

  // ---- the API (same origin only)
  async function getJSON(url, ms, init) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, { credentials: 'same-origin', ...init, signal: ctl.signal, headers: { accept: 'application/json', ...((init && init.headers) || {}) } });
      try { return await r.json(); } catch { return null; }
    } finally { clearTimeout(t); }
  }
  let slotsP = null;
  function loadSlots(fresh) {
    if (slotsP && !fresh) return slotsP;
    const from = ymd(Date.now());
    const to = addDays(from, RANGE - 1);
    const p = getJSON(`${API}slots?from=${from}&to=${to}&tz=${encodeURIComponent(tz)}`, 10000, { cache: fresh ? 'no-store' : 'default' }).then((j) => {
      if (!j || j.ok !== true || !j.slots || typeof j.slots !== 'object') throw new Error('slots');
      return j.slots;
    });
    slotsP = p;
    p.catch(() => { if (slotsP === p) slotsP = null; });
    return p;
  }

  // ---- state
  let slots = {};
  let day = null;
  let time = null;
  let busy = false;
  let started = false;
  let unsure = null; // the start of an attempt that got no clear answer
  const timers = [];

  tzEl.textContent = '';
  tzEl.append('Times shown in your time zone, ', el('b', '', zoneName('longGeneric')), '.');

  // ---- insert coin
  function start(how) {
    if (started) return;
    started = true;
    loadSlots();
    if (how === 'auto' || reduce.matches) { credit(false); open(how !== 'auto'); return; }
    coin.classList.add('is-drop');
    timers.push(setTimeout(() => coin.classList.add('is-fed'), 150));
    timers.push(setTimeout(() => credit(true), 240));
    // the window holds its height through the flash, so nothing jumps under it
    timers.push(setTimeout(() => { win.style.minHeight = win.offsetHeight + 'px'; win.dataset.state = 'ready'; }, 700));
    timers.push(setTimeout(() => open(true), 1300));
  }
  function open(focusIt) {
    timers.forEach(clearTimeout);
    timers.length = 0;
    win.style.minHeight = '';
    win.dataset.state = 'pick';
    pick.hidden = false;
    fill(false, false);
    if (focusIt) pick.focus({ preventScroll: true });
    const r = win.getBoundingClientRect();
    if (r.top < 0) win.scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  // a click during the READY flash skips the rest of it
  win.addEventListener('click', () => { if (win.dataset.state === 'ready') open(true); });

  coin.setAttribute('role', 'button');
  coin.addEventListener('click', (e) => {
    // modifier clicks open this page in a new tab, where #book-a-call starts it
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    start(e.detail === 0 ? 'key' : 'click');
  });
  coin.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (!e.repeat) start('key'); }
  });
  ['pointerenter', 'focus', 'touchstart'].forEach((t) => coin.addEventListener(t, () => { loadSlots().catch(() => {}); }, { passive: true, once: true }));
  // the site's insert-coin dock points here as #book-a-call (select.js rewrites it on this page)
  addEventListener('hashchange', () => { if (location.hash === '#book-a-call' && win.dataset.state === 'attract') start('click'); });

  // ---- the picker
  let slowT = 0;
  function fill(fresh, focusAfter) {
    load.hidden = false;
    oops.hidden = true;
    grid.hidden = true;
    slow.hidden = true;
    clearTimeout(slowT);
    slowT = setTimeout(() => {
      if (load.hidden) return;
      slow.hidden = false;
      say(`Still loading. You can also email ${MAIL} with two times.`);
    }, 5000);
    say('Loading open times.');
    return loadSlots(fresh).then((s) => {
      clearTimeout(slowT);
      slots = s || {};
      if (!renderDays(day)) return;
      load.hidden = true;
      grid.hidden = false;
      const n = (slots[day] || []).length;
      say(`Open times loaded. ${fDayLong.format(noon(day))} has ${n} ${n === 1 ? 'time' : 'times'}.`);
      if (focusAfter) { const c = daysEl.querySelector('input:checked'); if (c) c.focus(); }
    }).catch(() => {
      clearTimeout(slowT);
      fail(NAP, true);
      if (focusAfter) oops.focus();
    });
  }

  // re-read the times in place (after a time was taken), keeping the day
  function refresh() {
    return loadSlots(true).then((s) => { slots = s || {}; return renderDays(day); })
      .catch(() => { fail(NAP, true); return false; });
  }

  function fail(head, canRetry) {
    load.hidden = true;
    grid.hidden = true;
    oops.hidden = false;
    oopsH.textContent = head;
    q('[data-ic-retry]').hidden = !canRetry;
    say(`${head} Open the full calendar, or email ${MAIL} with two times that work.`);
  }

  function renderDays(keep) {
    const now = Date.now();
    for (const d of Object.keys(slots)) {
      const left = Array.isArray(slots[d]) ? slots[d].filter((t) => typeof t === 'string' && Date.parse(t) > now + 60e3) : [];
      if (left.length) slots[d] = left; else delete slots[d];
    }
    const from = ymd(now);
    const all = [];
    for (let i = 0; i < RANGE; i++) {
      const d = addDays(from, i);
      all.push({ d, i, n: (slots[d] || []).length, wd: noon(d).getUTCDay() });
    }
    const open = all.filter((x) => x.n);
    if (!open.length) {
      fail('No open times in the next three weeks.', false);
      return false;
    }
    // Columns are the run of weekdays that hold open times in the visitor's zone
    // (Monday to Friday in the Americas, later in the week further east), so every
    // row is one week and the keys line up by weekday.
    const at = open.map((x) => ORDER.indexOf(x.wd));
    const cols = ORDER.slice(Math.min(...at), Math.max(...at) + 1);
    const last = open[open.length - 1].i;
    const list = all.filter((x) => cols.includes(x.wd) && x.i <= last && (x.n || x.i > 0));
    daysEl.textContent = '';
    daysEl.style.setProperty('--cols', cols.length);
    list.forEach(({ d, n, wd }, k) => {
      const lab = el('label', 'ic__day');
      if (k === 0) lab.style.gridColumnStart = String(cols.indexOf(wd) + 1);
      const inp = el('input');
      inp.type = 'radio';
      inp.name = 'ic-day';
      inp.value = d;
      inp.disabled = !n;
      const face = el('span', 'ic__face');
      face.append(
        el('span', 'ic__dw', fW.format(noon(d)), true),
        el('span', 'ic__dn', fD.format(noon(d)), true),
        n ? el('span', 'ic__dm', fM.format(noon(d)), true) : el('span', 'ic__full', 'no times', true),
        el('span', 'sr', fDayLong.format(noon(d)) + (n ? '' : ', no open times')),
      );
      lab.append(inp, face);
      daysEl.append(lab);
    });
    selectDay(keep && slots[keep] ? keep : open[0].d);
    return true;
  }

  function selectDay(d) {
    day = d;
    const inp = daysEl.querySelector(`input[value="${d}"]`);
    if (inp) inp.checked = true;
    renderTimes();
  }

  function renderTimes() {
    timesEl.textContent = '';
    const list = slots[day] || [];
    for (const iso of list) {
      const lab = el('label', 'ic__time');
      const inp = el('input');
      inp.type = 'radio';
      inp.name = 'ic-time';
      inp.value = iso;
      inp.checked = iso === time;
      const face = el('span', 'ic__face', fTime.format(new Date(iso)));
      lab.append(inp, face);
      timesEl.append(lab);
    }
    if (time && !list.includes(time)) setTime(null);
  }

  function setTime(iso, fromPointer) {
    time = iso;
    sum.classList.remove('is-err');
    sum.textContent = '';
    if (!iso) { sum.classList.remove('is-set'); sum.textContent = 'Pick a time.'; return; }
    const at = new Date(iso);
    sum.classList.add('is-set');
    sum.append(el('b', '', fWhen.format(at)), ' at ', el('b', '', `${fTime.format(at)} ${zoneName('short', at)}`), `, ${LEN} minutes.`);
    if (fromPointer && matchMedia('(max-width: 1023px)').matches) {
      const r = form.getBoundingClientRect();
      if (r.top > innerHeight - 140) form.scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' });
    }
  }

  let lastPointer = 0;
  timesEl.addEventListener('pointerdown', () => { lastPointer = Date.now(); });
  daysEl.addEventListener('change', (e) => {
    if (e.target.name !== 'ic-day') return;
    note.hidden = true;
    selectDay(e.target.value);
    const n = (slots[day] || []).length;
    say(`${n} ${n === 1 ? 'time' : 'times'} on ${fDayLong.format(noon(day))}.`);
  });
  timesEl.addEventListener('change', (e) => {
    if (e.target.name !== 'ic-time') return;
    note.hidden = true;
    setTime(e.target.value, Date.now() - lastPointer < 1000);
  });
  q('[data-ic-retry]').addEventListener('click', () => fill(true, true));

  // ---- the form
  function fieldErr(name, msg) {
    const input = fields[name];
    const p = q(`#ic-${name}-err`);
    if (!input || !p) return;
    if (msg) {
      p.textContent = msg;
      p.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', p.id);
    } else {
      p.textContent = '';
      p.hidden = true;
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }
  function clearErrs() {
    Object.keys(fields).forEach((k) => fieldErr(k, ''));
    formErr.hidden = true;
    formErr.textContent = '';
    sum.classList.remove('is-err');
  }
  Object.entries(fields).forEach(([k, input]) => input.addEventListener('input', () => { if (input.getAttribute('aria-invalid')) fieldErr(k, ''); }));

  function showNote(msg) {
    note.textContent = msg;
    note.hidden = false;
    note.focus();
  }

  function setBusy(on) {
    busy = on;
    form.setAttribute('aria-busy', on ? 'true' : 'false');
    go.setAttribute('aria-disabled', on ? 'true' : 'false');
    go.textContent = '';
    if (on) go.append(el('i', 'ic__spin', undefined, true), 'Booking');
    else go.textContent = 'Book the call';
    Object.values(fields).forEach((i) => { i.readOnly = on; });
    const when = q('.ic__when');
    if (when) when.inert = on; // days and times hold still while booking, without changing their look
  }

  // a problem box under the button: a bold head, then short lines (text and nodes)
  function formProblem(head, lines, spoken) {
    formErr.textContent = '';
    lines.forEach((parts, i) => {
      const p = el('p');
      if (i === 0) p.append(el('b', '', head + ' '));
      p.append(...parts);
      formErr.append(p);
    });
    formErr.hidden = false;
    formErr.focus();
    say(spoken);
  }
  const orEmail = () => ['Or email ', mailLink(), ' with two times that work.'];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    clearErrs();
    const name = fields.name.value.replace(/\s+/g, ' ').trim();
    const email = fields.email.value.trim();
    const notes = fields.notes.value.trim();
    const bad = [];
    if (!name) bad.push(['name', 'Add your name.']);
    else if ([...name].length < 2) bad.push(['name', 'Add your full name.']);
    else if ([...name].length > 80) bad.push(['name', 'Keep it under 80 characters.']);
    else if (/[<>]/.test(name) || LINK_RE.test(name)) bad.push(['name', 'Just your name, please.']);
    if (!email) bad.push(['email', 'Add your email so the invite can reach you.']);
    else if (email.length > 254 || !EMAIL_RE.test(email) || email.includes('..')) bad.push(['email', 'That email doesn\'t look right.']);
    if ([...notes].length > 1000) bad.push(['notes', 'Keep it under 1,000 characters.']);
    else if (LINK_RE.test(notes)) bad.push(['notes', 'Leave out links, please. A few words is plenty.']);
    bad.forEach(([k, m]) => fieldErr(k, m));
    if (!time) {
      sum.classList.add('is-err');
      sum.textContent = 'No time picked yet.';
      showNote('Pick a time first.');
      say('Pick a time first.');
      return;
    }
    if (bad.length) { fields[bad[0][0]].focus(); say(bad.map((b) => b[1]).join(' ')); return; }

    const sent = time;
    setBusy(true);
    say('Booking your call.');
    slowBook.hidden = true;
    const slowB = setTimeout(() => { slowBook.hidden = false; say('Still booking. Keep this page open.'); }, 5000);
    let j = null;
    let lost = false;
    try {
      j = await getJSON(API + 'book', 20000, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ start: sent, name, email, notes: notes || undefined, tz, website: hp ? hp.value : '' }),
      });
    } catch { lost = true; }
    clearTimeout(slowB);
    slowBook.hidden = true;
    setBusy(false);

    if (j && j.ok === true && j.start) return booked(j, email);
    if (j && (j.error === 'slot_taken' || (j.error === 'invalid' && j.field === 'start'))) {
      // the time is gone right after an attempt with no clear answer: that attempt most likely booked it
      if (j.error === 'slot_taken' && unsure === sent) return probablyBooked(sent);
      setTime(null);
      refresh().then((ok) => {
        if (!ok) { oops.focus(); return; }
        showNote('That time just got taken. Pick another one.');
        say('That time just got taken. Pick another one.');
      });
      return;
    }
    if (j && j.error === 'invalid' && fields[j.field]) {
      const m = {
        name: 'Check your name.',
        email: 'That email didn\'t go through. Check it, or use a different address.',
        notes: 'Keep it under 1,000 characters, with no links.',
      }[j.field];
      fieldErr(j.field, m);
      fields[j.field].focus();
      say(m);
      return;
    }
    if (j && j.error === 'limit') {
      return formProblem('This email has booked a few calls today.', [['Check your inbox for the invites.'], ['To change a time, email ', mailLink(), '.']],
        `This email has booked a few calls today. Check your inbox for the invites. To change a time, email ${MAIL}.`);
    }
    if (lost || !j || j.unconfirmed) {
      unsure = sent;
      return formProblem('We couldn\'t confirm your booking.', [['Check your inbox for an invite before you try again.'], ['Nothing there in a few minutes? Email ', mailLink(), ' with two times that work.']],
        `We couldn't confirm your booking. Check your inbox for an invite before you try again, or email ${MAIL}.`);
    }
    formProblem('We couldn\'t book that just now.', [['Try again in a minute, or book on ', calLink('the full calendar'), '.'], orEmail()],
      `We couldn't book that just now. Try again in a minute, book on the full calendar, or email ${MAIL} with two times that work.`);
  });

  function probablyBooked(iso) {
    const w = whenText(iso);
    formProblem('It looks like your booking went through.', [['That time is no longer open, so your first try most likely booked it. Check your inbox for the invite for ', el('b', '', w), '.'], ['Nothing there in a few minutes? Email ', mailLink(), '.']],
      `It looks like your booking went through. Check your inbox for the invite for ${w}. Nothing there in a few minutes? Email ${MAIL}.`);
  }

  function booked(j, email) {
    const st = new Date(j.start);
    const en = new Date(j.end && Date.parse(j.end) ? j.end : st.getTime() + LEN * 60e3);
    whenEl.textContent = `${fWhen.format(st)}, ${fTime.format(st)} to ${fTime.format(en)} ${zoneName('short', st)}`;
    inbox.textContent = `The invite is on its way to ${email}.`;
    inbox.parentElement.hidden = !!j.dryRun;
    dryEl.hidden = !j.dryRun;
    unsure = null;
    win.dataset.state = 'done';
    pick.hidden = true;
    done.hidden = false;
    const r = win.getBoundingClientRect();
    if (r.top < 0) win.scrollIntoView({ block: 'start', behavior: 'auto' });
    done.focus({ preventScroll: true });
    say(j.dryRun ? `Dry run. Nothing was booked: ${whenEl.textContent}.` : `Booked. See you on the call: ${whenEl.textContent}.`);
  }

  root.classList.add('ic-ready');
  if (reduce.matches) start('auto');
  else if (location.hash === '#book-a-call') start('click'); // tapped before this script ran, or came from the dock
})();
