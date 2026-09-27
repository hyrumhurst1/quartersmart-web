// /insert-coin booking backend (Netlify Functions v2).
//
// The booking page talks only to this function, on our own domain. The function
// talks to the booking server (self-hosted Cal.com) server-side. Its origin lives
// only in the CAL_ORIGIN environment variable: it is never written in this repo,
// never sent to the browser (not in bodies, headers, redirects or error text), and
// never logged with request data. Upstream error messages are mapped to our own codes.
//
// Routes
//   GET  /insert-coin/api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD&tz=IANA
//        -> { ok: true, tz, from, to, slots: { "YYYY-MM-DD": ["<UTC ISO>", ...] } }
//   POST /insert-coin/api/book  { start, name, email, notes?, tz, website }
//        -> { ok: true, start, end }
//         | { ok: false, error: "slot_taken" | "invalid" | "unavailable" | "limit" }
//           ("invalid" may carry field: "name" | "email" | "notes" | "start" | "tz";
//            "unavailable" carries unconfirmed: true when the booking may have gone
//            through but no clear answer came back, so the page says to check the
//            inbox first; "limit" means this email already booked several calls today)
//   GET  /insert-coin/calendar -> 302 to the public calendar page on our own domain
//        (PUBLIC_CALENDAR below, never CAL_ORIGIN), the fallback when this API can't answer
//
// Environment (Netlify UI only)
//   CAL_ORIGIN           required (https only; http only for localhost tests)
//   CAL_EVENT_TYPE_ID    set it (3). Without it a cold instance looks the id up first,
//                        which eats into the booking time budget
//   CAL_USERNAME         default "hyrum"
//   CAL_EVENT_SLUG       default "ai-game-plan"
//   CAL_EVENT_LENGTH     optional minutes, default 20 (only used if the answer omits endTime)
//   CAL_PROXY_KEY        optional; sent as x-qs-key on every upstream call, for a gate
//                        in front of the booking server
//   BOOKING_DRY_RUN_KEY  optional, 24+ characters. Only a request that carries the header
//                        x-qs-dry-run with exactly this value is sent as a dry run (full
//                        checks, nothing booked). Visitors never send it. A request with
//                        the header and a wrong or missing key is refused, never booked.
//   BOOKING_HOURLY_CAP   default 20, BOOKING_DAILY_CAP default 60: bookings sent upstream
//                        per warm instance
//
// Gates here: a same-origin check for browsers (Origin allowlist and Sec-Fetch-Site;
// scripts that send no Origin pass it, so the gates below carry the load), JSON only,
// an 8 KB body cap, a honeypot, no links in the name or notes, per-IP limits, a
// per-email limit, hourly and daily caps on bookings sent upstream, and the start must
// be a slot the calendar offers right now. The counters live in each warm instance's
// memory, so they are best effort.

const MAX_BODY = 8192;
const MAX_RANGE_DAYS = 21;
const SLOTS_TIMEOUT_MS = 8000;
const LOOKUP_TIMEOUT_MS = 3000;
const CHECK_TIMEOUT_MS = 3500;
const BOOK_BUDGET_MS = 9500; // the whole booking answer, under the 10 s sync limit
const MIN_POST_MS = 5500; // never send a booking whose answer cannot arrive in time
const MAX_POST_MS = 8000;
const UPSTREAM_TZ = 'America/Phoenix'; // slots are instants; we regroup them per visitor
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@(?=.{3,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
const LINK_RE = /(?:https?|ftp):\/\/|www\.|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,24}\/\S/i;
const SAFE_SEG = /^[A-Za-z0-9._-]{1,64}$/;
const DAY = 864e5;

// Per-instance state (best effort; each warm function instance keeps its own).
const hits = new Map();
const slotCache = new Map();
let eventCache = null;
let warnedLegacyDryRun = false;

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const s = settings();
    const ip = clientIp(req, context);
    if (path === '/insert-coin/api/slots') return await slots(req, url, s, ip);
    if (path === '/insert-coin/api/book') return await book(req, url, s, ip, context);
    if (path === '/insert-coin/calendar') return calendar(req, s);
    return json(404, { ok: false, error: 'invalid' });
  } catch (err) {
    console.error('[insert-coin] unhandled', err && err.name, err && String(err.message).slice(0, 160));
    return json(500, { ok: false, error: 'unavailable' });
  }
};

export const config = {
  path: ['/insert-coin/api/slots', '/insert-coin/api/book', '/insert-coin/calendar', '/insert-coin/calendar/'],
};

// ---------- settings ----------

function env(name) {
  let v;
  try { v = globalThis.Netlify && globalThis.Netlify.env && globalThis.Netlify.env.get(name); } catch { v = undefined; }
  if (v === undefined || v === null || v === '') v = globalThis.process && globalThis.process.env ? globalThis.process.env[name] : undefined;
  return v === undefined || v === null || String(v).trim() === '' ? undefined : String(v).trim();
}

function settings() {
  let origin = null;
  const raw = env('CAL_ORIGIN');
  if (raw) {
    try {
      const u = new URL(raw);
      const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]';
      if (u.protocol === 'https:' || (u.protocol === 'http:' && local)) origin = u.origin;
    } catch { origin = null; }
  }
  const seg = (v, d) => (v && SAFE_SEG.test(v) ? v : d);
  const int = (v) => (v && /^\d{1,9}$/.test(v) ? Number(v) : null);
  return {
    origin,
    user: seg(env('CAL_USERNAME'), 'hyrum'),
    slug: seg(env('CAL_EVENT_SLUG'), 'ai-game-plan'),
    eventTypeId: int(env('CAL_EVENT_TYPE_ID')),
    length: int(env('CAL_EVENT_LENGTH')) || 20,
    proxyKey: env('CAL_PROXY_KEY'),
    hourlyCap: int(env('BOOKING_HOURLY_CAP')) || 20,
    dailyCap: int(env('BOOKING_DAILY_CAP')) || 60,
  };
}

// ---------- routes ----------

async function slots(req, url, s, ip) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(405, { ok: false, error: 'invalid' }, { allow: 'GET, HEAD' });
  if (!allow('slots:' + ip, 60, 5 * 60e3)) return json(429, { ok: false, error: 'unavailable' }, { 'retry-after': '60' });
  const tz = url.searchParams.get('tz') || 'America/Phoenix';
  if (!validTz(tz)) return json(400, { ok: false, error: 'invalid', field: 'tz' });
  const today = dateIn(Date.now(), tz);
  let from = url.searchParams.get('from') || today;
  if (!validDate(from)) return json(400, { ok: false, error: 'invalid', field: 'range' });
  if (from < today) from = today;
  if (from > addDays(today, 60)) return json(400, { ok: false, error: 'invalid', field: 'range' });
  let to = url.searchParams.get('to') || addDays(from, 13);
  if (!validDate(to)) return json(400, { ok: false, error: 'invalid', field: 'range' });
  if (to < from) return json(400, { ok: false, error: 'invalid', field: 'range' });
  if (to > addDays(from, MAX_RANGE_DAYS - 1)) to = addDays(from, MAX_RANGE_DAYS - 1);
  if (!s.origin) return unavailable('slots', 'CAL_ORIGIN missing or invalid');

  // One upstream window per date range, whatever the visitor's zone: every zone's day
  // fits inside [from 00:00 UTC - 14 h, to 24:00 UTC + 14 h], and we regroup here.
  const startMs = Date.parse(from + 'T00:00:00Z') - 14 * 3600e3;
  const endMs = Date.parse(to + 'T23:59:59.999Z') + 14 * 3600e3;
  const key = [s.origin, s.user, s.slug, s.eventTypeId, startMs, endMs].join('|');
  const hit = slotCache.get(key);
  let times;
  if (hit && Date.now() - hit.at < 30e3) times = hit.times;
  else if (!allow('upstream:slots', 120, 60e3)) {
    // a flood of distinct ranges: serve a recent answer if there is one, never flood upstream
    if (hit && Date.now() - hit.at < 10 * 60e3) times = hit.times;
    else return unavailable('slots', 'upstream slots budget spent');
  } else {
    const r = await fetchSlots(s, startMs, endMs, SLOTS_TIMEOUT_MS);
    if (!r.ok) return unavailable('slots', r.why);
    times = r.times;
    slotCache.set(key, { at: Date.now(), times });
    if (slotCache.size > 200) slotCache.delete(slotCache.keys().next().value);
  }
  const now = Date.now();
  const day = dayFormatter(tz);
  const out = {};
  for (const t of times) {
    if (t <= now) continue;
    const d = day(t);
    if (d < from || d > to) continue;
    (out[d] ||= []).push(new Date(t).toISOString());
  }
  return json(200, { ok: true, tz, from, to, slots: out }, { 'cache-control': 'private, max-age=30' });
}

async function book(req, url, s, ip, context) {
  const t0 = Date.now();
  const left = () => BOOK_BUDGET_MS - (Date.now() - t0);
  if (req.method !== 'POST') return json(405, { ok: false, error: 'invalid' }, { allow: 'POST' });
  if (!sameOrigin(req, url, context)) return json(403, { ok: false, error: 'invalid' });
  if (!/^application\/json\b/i.test(req.headers.get('content-type') || '')) return json(415, { ok: false, error: 'invalid' });
  if (!allow('book:' + ip, 6, 10 * 60e3)) return json(429, { ok: false, error: 'unavailable' }, { 'retry-after': '600' });
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_BODY) return json(413, { ok: false, error: 'invalid', field: 'notes' });
  const text = await readLimited(req, MAX_BODY);
  if (text === null) return json(413, { ok: false, error: 'invalid', field: 'notes' });
  let body;
  try { body = JSON.parse(text); } catch { return json(400, { ok: false, error: 'invalid' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { ok: false, error: 'invalid' });

  // Honeypot: a hidden "website" field people never see or fill.
  if (body.website !== undefined && body.website !== null && String(body.website).trim() !== '') {
    console.warn('[insert-coin] honeypot tripped');
    return json(400, { ok: false, error: 'invalid' });
  }

  const dry = dryRun(req);
  if (dry === 'refused') return json(403, { ok: false, error: 'invalid' });

  const v = validate(body);
  if (v.error) return json(400, { ok: false, error: 'invalid', field: v.error });
  if (!s.origin) return unavailable('book', 'CAL_ORIGIN missing or invalid');

  const ev = await eventInfo(s);
  if (!ev) return unavailable('book', 'event type lookup failed');

  // The start must be a slot the calendar offers right now (fresh, never cached).
  const check = await fetchSlots(s, v.startMs - 36 * 3600e3, v.startMs + 36 * 3600e3, Math.min(CHECK_TIMEOUT_MS, Math.max(500, left() - MIN_POST_MS)));
  if (!check.ok) return unavailable('book', 'slot check: ' + check.why);
  if (!check.times.includes(v.startMs)) return json(409, { ok: false, error: 'slot_taken' });

  // Everything below is spent only on requests that would really book.
  const budget = Math.min(MAX_POST_MS, left());
  if (budget < MIN_POST_MS) return unavailable('book', `only ${budget} ms left after the checks; not sending`);
  if (!dry) {
    if (!allow('book:email:' + v.email.toLowerCase(), 3, DAY)) {
      console.warn('[insert-coin] per-email booking limit reached');
      return json(429, { ok: false, error: 'limit' });
    }
    if (!allowAll([['book:hour', s.hourlyCap, 3600e3], ['book:day', s.dailyCap, DAY]])) return unavailable('book', 'booking cap reached');
  }

  const start = new Date(v.startMs).toISOString();
  const payload = {
    eventTypeId: ev.id,
    eventTypeSlug: s.slug,
    user: s.user,
    start,
    timeZone: v.tz,
    language: 'en',
    metadata: { source: 'quartersmart-insert-coin' },
    hasHashedBookingLink: false,
    responses: v.notes ? { name: v.name, email: v.email, notes: v.notes } : { name: v.name, email: v.email },
  };
  if (dry) payload._isDryRun = true;

  // Never retry this POST: if a first attempt went through, a retry would see
  // its own booking as a conflict.
  let res;
  try {
    res = await fetch(s.origin + '/api/book/event', {
      method: 'POST',
      headers: upstreamHeaders(s, { 'content-type': 'application/json' }),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(budget),
      redirect: 'manual',
    });
  } catch (err) {
    const code = err && err.cause && err.cause.code;
    const neverSent = ['ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'UND_ERR_CONNECT_TIMEOUT'].includes(code);
    console.error('[insert-coin] book fetch failed', err && err.name, code || '');
    if (neverSent) return json(502, { ok: false, error: 'unavailable' });
    return json(504, { ok: false, error: 'unavailable', unconfirmed: true });
  }

  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (res.status >= 200 && res.status < 300) {
    if (!data || typeof data !== 'object' || (!data.uid && data.id === undefined)) {
      console.error('[insert-coin] book: 2xx without a booking body', res.status);
      return json(502, { ok: false, error: 'unavailable', unconfirmed: true });
    }
    if (data.isShortCircuitedBooking) console.warn('[insert-coin] book: short-circuited by the spam check; nothing was booked');
    const st = Date.parse(data.startTime) || v.startMs;
    const en = Date.parse(data.endTime) || st + s.length * 60e3;
    slotCache.clear();
    // The uid is what cancels a booking; function logs are private to the team.
    console.log(`[insert-coin] ${data.isDryRun === true ? 'dry run ok' : 'booked'} uid=${String(data.uid || '').slice(0, 64)} id=${Number.isFinite(data.id) ? data.id : ''} start=${new Date(st).toISOString()}`);
    const out = { ok: true, start: new Date(st).toISOString(), end: new Date(en).toISOString() };
    if (data.isDryRun === true) out.dryRun = true;
    return json(200, out);
  }

  const msg = data && typeof data.message === 'string' ? data.message : '';
  console.error('[insert-coin] book upstream', res.status, msg.slice(0, 160));
  if (res.status === 409 || /no_available_users_found_error|booking_conflict_error|booking_time_out_of_bounds_error|in the past/i.test(msg)) {
    slotCache.clear();
    return json(409, { ok: false, error: 'slot_taken' });
  }
  const field = msg.match(/'responses'[^{]*\{(\w+)\}/);
  if (res.status === 400 && field) {
    const f = ['name', 'email', 'notes'].includes(field[1]) ? field[1] : 'email';
    return json(400, { ok: false, error: 'invalid', field: f });
  }
  // A blocked email, or one that needs a verification code: a retry with it never works.
  if (res.status === 403 && /email|verification/i.test(msg)) return json(400, { ok: false, error: 'invalid', field: 'email' });
  if (res.status >= 500) {
    // A 5xx (including a proxy's 502 or 504) may still have booked. Ask again: a slot
    // that is gone was most likely ours; one still offered is safe to try again.
    slotCache.clear();
    const rest = left() - 300;
    if (rest >= 1000) {
      const again = await fetchSlots(s, v.startMs - 36 * 3600e3, v.startMs + 36 * 3600e3, Math.min(CHECK_TIMEOUT_MS, rest));
      if (again.ok && again.times.includes(v.startMs)) return json(502, { ok: false, error: 'unavailable' });
    }
    return json(502, { ok: false, error: 'unavailable', unconfirmed: true });
  }
  return json(502, { ok: false, error: 'unavailable' });
}

// The calendar's public face is book.quartersmart.com (a proxy we own). It is a fixed
// constant, not CAL_ORIGIN, so pointing CAL_ORIGIN somewhere private never leaks it here.
const PUBLIC_CALENDAR = 'https://book.quartersmart.com';

function calendar(req, s) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(405, { ok: false, error: 'invalid' }, { allow: 'GET, HEAD' });
  const location = `${PUBLIC_CALENDAR}/${s.user}/${s.slug}`;
  return new Response(null, { status: 302, headers: { location, 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}

// ---------- upstream calls ----------

function upstreamHeaders(s, extra = {}) {
  const h = { accept: 'application/json', ...extra };
  if (s.proxyKey) h['x-qs-key'] = s.proxyKey;
  return h;
}

// Open slots between two instants, as a sorted list of UTC milliseconds.
async function fetchSlots(s, startMs, endMs, timeoutMs) {
  const input = s.eventTypeId
    ? { eventTypeId: s.eventTypeId, startTime: new Date(startMs).toISOString(), endTime: new Date(endMs).toISOString(), timeZone: UPSTREAM_TZ }
    : { isTeamEvent: false, usernameList: [s.user], eventTypeSlug: s.slug, startTime: new Date(startMs).toISOString(), endTime: new Date(endMs).toISOString(), timeZone: UPSTREAM_TZ };
  let res;
  try {
    res = await fetch(s.origin + '/api/trpc/slots/getSchedule?input=' + encodeURIComponent(JSON.stringify({ json: input })), {
      headers: upstreamHeaders(s),
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'manual',
    });
  } catch (err) {
    return { ok: false, why: 'fetch ' + (err && err.name) + ' ' + ((err && err.cause && err.cause.code) || '') };
  }
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) return { ok: false, why: 'status ' + res.status };
  const raw = data && data.result && data.result.data && data.result.data.json && data.result.data.json.slots;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, why: 'bad slots body' };
  const set = new Set();
  let n = 0;
  for (const [date, list] of Object.entries(raw)) {
    if (!DATE_RE.test(date) || !Array.isArray(list)) continue;
    for (const x of list.slice(0, 500)) {
      const t = x && typeof x.time === 'string' ? Date.parse(x.time) : NaN;
      if (Number.isFinite(t) && t >= startMs && t <= endMs) set.add(t);
      if (++n > 5000) break;
    }
  }
  return { ok: true, times: [...set].sort((a, b) => a - b) };
}

async function eventInfo(s) {
  if (s.eventTypeId) return { id: s.eventTypeId };
  const key = [s.origin, s.user, s.slug].join('|');
  if (eventCache && eventCache.key === key && Date.now() - eventCache.at < 10 * 60e3) return eventCache.value;
  console.warn('[insert-coin] CAL_EVENT_TYPE_ID is not set; looking the event up (set it to skip this)');
  try {
    const input = { json: { username: s.user, eventSlug: s.slug, isTeamEvent: false, org: null } };
    const res = await fetch(s.origin + '/api/trpc/public/event?input=' + encodeURIComponent(JSON.stringify(input)), {
      headers: upstreamHeaders(s), signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS), redirect: 'manual',
    });
    if (!res.ok) return null;
    const j = await res.json();
    const e = j && j.result && j.result.data && j.result.data.json;
    if (!e || !Number.isInteger(e.id)) return null;
    const value = { id: e.id };
    eventCache = { key, at: Date.now(), value };
    return value;
  } catch {
    return null;
  }
}

// ---------- validation ----------

function validate(b) {
  const str = (x) => (typeof x === 'string' ? x : '');
  const noCtl = (x) => !/[\u0000-\u001f\u007f]/.test(x);

  const name = str(b.name).replace(/\s+/g, ' ').trim();
  const nameLen = [...name].length;
  if (nameLen < 2 || nameLen > 80 || !noCtl(name) || /[<>]/.test(name) || LINK_RE.test(name)) return { error: 'name' };

  const email = str(b.email).trim();
  if (email.length > 254 || !EMAIL_RE.test(email) || /\.\./.test(email)) return { error: 'email' };

  if (b.notes !== undefined && b.notes !== null && typeof b.notes !== 'string') return { error: 'notes' };
  const notes = str(b.notes).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  // Notes go into the invite and the emails sent to whatever address was typed, so no links.
  if ([...notes].length > 1000 || LINK_RE.test(notes)) return { error: 'notes' };

  const tz = str(b.tz);
  if (!validTz(tz)) return { error: 'tz' };

  const start = str(b.start);
  const startMs = ISO_RE.test(start) ? Date.parse(start) : NaN;
  const now = Date.now();
  if (!Number.isFinite(startMs) || startMs % 60e3 !== 0 || startMs < now + 60e3 || startMs > now + 120 * DAY) return { error: 'start' };

  return { name, email, notes: notes || '', tz, startMs };
}

function validTz(tz) {
  if (typeof tz !== 'string' || tz.length > 64 || !/^[A-Za-z][A-Za-z0-9_+\-]*(?:\/[A-Za-z0-9_+\-]+){0,2}$/.test(tz)) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; }
}

function validDate(d) {
  if (typeof d !== 'string' || !DATE_RE.test(d)) return false;
  const t = Date.parse(d + 'T00:00:00Z');
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === d;
}

function dayFormatter(tz) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  return (ms) => {
    const p = f.formatToParts(new Date(ms));
    const g = (t) => p.find((x) => x.type === t).value;
    return `${g('year')}-${g('month')}-${g('day')}`;
  };
}

function dateIn(ms, tz) {
  return dayFormatter(tz)(ms);
}

function addDays(d, n) {
  return new Date(Date.parse(d + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);
}

// ---------- plumbing ----------

// Browsers only: they send Origin on every POST and Sec-Fetch-Site on modern engines.
// A script can send anything, which is why the other gates exist.
function sameOrigin(req, url, context) {
  const site = req.headers.get('sec-fetch-site');
  if (site === 'cross-site' || site === 'same-site') return false;
  const o = req.headers.get('origin');
  if (!o) return true;
  let host;
  try { host = new URL(o).host.toLowerCase(); } catch { return false; }
  if (host === url.host.toLowerCase() || host === 'quartersmart.com' || host === 'www.quartersmart.com') return true;
  const name = String((context && context.site && context.site.name) || env('SITE_NAME') || '').toLowerCase();
  if (name && /^[a-z0-9-]+$/.test(name)) {
    if (host === `${name}.netlify.app`) return true;
    if (host.endsWith(`--${name}.netlify.app`) && /^[a-z0-9-]+$/.test(host.slice(0, -(`--${name}.netlify.app`).length))) return true;
  }
  const where = (context && context.deploy && context.deploy.context) || env('CONTEXT');
  return where === 'dev' && /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(host);
}

// 'dry' only for a request that carries the right key; 'refused' for a wrong one.
function dryRun(req) {
  if (env('BOOKING_DRY_RUN') && !warnedLegacyDryRun) {
    warnedLegacyDryRun = true;
    console.warn('[insert-coin] BOOKING_DRY_RUN is ignored; dry runs need BOOKING_DRY_RUN_KEY and the x-qs-dry-run header');
  }
  const got = req.headers.get('x-qs-dry-run');
  if (got === null) return false;
  const key = env('BOOKING_DRY_RUN_KEY');
  if (!key || key.length < 24 || !sameText(key, got)) {
    console.warn('[insert-coin] dry run header without a valid key; refused');
    return 'refused';
  }
  return true;
}

function sameText(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function clientIp(req, context) {
  return (context && context.ip) || req.headers.get('x-nf-client-connection-ip') || 'unknown';
}

function prune(a, now, windowMs) {
  while (a.length && a[0] <= now - windowMs) a.shift();
}

function allow(key, max, windowMs) {
  return allowAll([[key, max, windowMs]]);
}

// Records a hit on every key only when all of them have room.
function allowAll(rules) {
  const now = Date.now();
  const lists = rules.map(([key, , windowMs]) => {
    let a = hits.get(key);
    if (!a) { a = []; hits.set(key, a); }
    prune(a, now, windowMs);
    return a;
  });
  if (rules.some(([, max], i) => lists[i].length >= max)) return false;
  for (const a of lists) a.push(now);
  if (hits.size > 5000) for (const [k, list] of hits) if (!list.length || list[list.length - 1] <= now - DAY) hits.delete(k);
  return true;
}

async function readLimited(req, max) {
  if (!req.body) return '';
  const reader = req.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { try { await reader.cancel(); } catch { /* closed */ } return null; }
    chunks.push(value);
  }
  const buf = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { buf.set(c, at); at += c.byteLength; }
  return new TextDecoder().decode(buf);
}

function unavailable(where, why) {
  console.error(`[insert-coin] ${where} unavailable: ${why}`);
  return json(503, { ok: false, error: 'unavailable' });
}

function json(status, body, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex',
      ...extra,
    },
  });
}
