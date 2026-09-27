# QuarterSmart "Night Arcade" rebrand: full report (for the librarian agent)

Date: 2026-09-27 (overnight session, about 22:00 to 06:00 Arizona time). Author: Claude (Opus 5.5) in the
Claude desktop app, working with Codex CLI (gpt-6-astra) for image generation and critique, and many
background agents and workflows. Owner: Hyrum Hurst (QuarterSmart founder).

## 0. Status: LIVE
- quartersmart.com has served the Night Arcade site since 2026-09-27 07:57 Arizona time. PR hyrumhurst1/quartersmart-web#7 was merged at commit 227a37e.
- Post-launch checks passed on production: 6 key pages, overflow 0, no console errors; the retired URLs 301 correctly.
- Continued development: branch `night-arcade-polish`, draft PR #8. Previews go to deploy-preview-8--capable-speculoos-78ab6e.netlify.app, and verified checkpoints get merged to main.

- **Update 2026-09-27 08:36 AZ:** Hyrum (in the Codex campaign session, PR #9) reserved the "o" assistant leak report for Phase 2. It is unpublished, and every route plus its share image is forced to 404. The build excludes it and fails if any published page links to it. Do not republish it until he authorizes it.

## 1. What QuarterSmart is now (the positioning)
- **Early AI adoption partner for owner-led businesses (20 to 80 staff).** Promise: know the second AI news drops and
  put it to work from day one, but only when it's worth it ("we say wait a lot").
- **Offer ladder:**
  - Signals, free (AI news with a verdict: act now / prepare / wait / ignore; "Reported" for leaks).
  - Head Start, from $1,500 (find the AI you already pay for, plus a 30-day plan; the fee counts toward the next step).
  - Day One Setup, from $2,500 per tool.
  - First Quarter membership, from $1,500/mo; Pro from $3,500/mo.
  - Build (scoped custom agents and automations).
  - Partner Bench, for agencies (/for-agencies/).
- **Approach line:** "Train your team. Automate the rest."
- **Credibility:** Hyrum is CTO of Learning Journey AI (an AI education company), so staying current on applied AI is
  his day job. This gets one light line for humans and is explicit for AI agents (Person schema jobTitle/worksFor,
  llms.txt, the founder page).
- **Name puns:** 25% = a quarter = the early group ("25%? That's a quarter.").
- **Brand idea saved for Hyrum:** a quarter is the coin you insert to play the AI game. See
  `work/IDEA-insert-a-quarter.md`. Used lightly only: "insert coin" = book a call.
- **Removed or retired:**
  - Cullen Brown.
  - All case studies.
  - Own Your AI.
  - Old proof (n8n counts, SOP/training studio).
  - Retired pages live in `site/graveyard/` (excluded from the deploy) with 301s in `site/netlify.toml`.

## 2. Where everything lives
| Thing | Path |
|---|---|
| Site source (git repo `hyrumhurst1/quartersmart-web`, branch `rebrand-2026-q4`, draft PR #7) | `C:\Users\hyrum\Desktop\quartersmart-rebrand\site\` |
| Build script (partials, Signals hub, sitemap, RSS, cache-bust, IndexNow on production) | `site/netlify-build.mjs` → `site/dist/` |
| Netlify site | `capable-speculoos-78ab6e` (quartersmart.com). Preview: https://deploy-preview-7--capable-speculoos-78ab6e.netlify.app |
| Partials (nav/HUD + select menu, footer + arena, head, ld-org, mark) | `site/_partials/` |
| Reusable arcade kit + style guide | `site/brand/arcade-kit/` (`STYLE_GUIDE.md`, `README.md`, sprites, engines, css, fonts, prompts). Refresh: `python tools/kit.py` |
| Owner confirm list (facts/prices/legal to confirm) | `work/CONFIRM.md` |
| Messaging + campaign pack (from the Codex campaign session) | `work/messaging.md`, `work/campaign-v3.md` |
| Build guide / direction log | `work/BUILD_GUIDE.md` |
| Audit findings (conversion/UX, 56 verified) | `work/audit-findings.json` |
| Raw Codex art | `work/pixel`, `pixel2`, `pixel3`, `pixel4` (magenta-keyed originals) |
| Tools | `tools/` (shot.mjs, strip.mjs, eval.mjs, serve.mjs, og.mjs, kit.py, px3_process.py, patch scripts) |
| Local preview server | `node tools/serve.mjs site/dist 8772` (pretty URLs) → http://localhost:8772/ |

## 3. The design system ("Night Arcade")
- **Direction:** retro video games as if a tasteful minimalist studio made them; arcade studio, not hacker cliché.
  It's a retro site, not a retro theme. Night everywhere. Nothing overly stands out. Fast and fluid. Less wordy.
- **Theme:** Evergreen, a Forest x Obsidian hybrid, is the default. Tokens are in `site/assets/qs.css`. A little rose
  (`--rose #ebbcba`) and ember orange (`--ember #eba66f`) are the seasoning. There are six themes (evergreen, midnight,
  obsidian, rose, forest, paper), switched from the footer and the menu.
- **Type:** Departure Mono for pixel display, only at 11px multiples. IBM Plex Sans for body, JetBrains Mono for code.
- **Echo text** (`.echo`, `.echo--chase`, `.echo--sm` in term.css): stacked layers stepping down in rose, butter,
  sage and teal. This replaced glow "neon" signs.
- **Terminal windows:** titles embedded in the border, btop style. Examples: `attract.exe` (hero), `why.exe` (story),
  `signals.exe`, `levels.exe`.
- **Full rules:** `site/brand/arcade-kit/STYLE_GUIDE.md`.

## 4. What was built tonight (reusable components)
1. **Attract-mode hero** (`assets/js/attract.js` + `attract-pack-classics.js`, `attract-pack-floor.js`,
   `attract-pack-quest.js`)
   - A full-screen pixel world in a terminal window. The QuarterSmart wordmark uses a custom 8-row bold pixel font.
   - Games: 20 base + 18 pack games, plus a title screen with a 6-layer echo.
   - Each game re-lays the wordmark (line, stack, wave, arc, vertical, italic) and restyles it (band, bright, bricks,
     bunker, gold, multi, neon outline).
   - Transitions are ribbon morphs: pixels paired by a spatial key, paths from a smooth field, four styles.
   - The order reshuffles every loop, with a rising level counter. A parade of past characters walks on the ground.
   - It opens on a random clean game each load. Stars, a crescent moon, comets and a UFO fill the sky.
   - It pauses off-screen. Reduced motion shows the title still.
   - Pack API: `window.QSAttractPacks.push(A => ({ id: { name, dur, word, parade, init, update, draw } }))`.
   - Debug: `?scene=<id>&t=<ms>`, `?title`.
2. **Night sky** (`assets/js/night.js`)
   - A fixed low-res star canvas behind every page (dark themes).
   - Mixed shapes: dots, plus signs, 4- and 8-point sparkles, diamonds, dotted twinkles.
   - Mostly still, with a few slow twinkles. Patchy density. Frozen while scrolling. The odd comet.
   - Exposes `window.QSSky` (pal, field, drawStar, drawComet, crescent).
3. **why.exe story** (`assets/js/quarter.js`)
   - A timed story (about 8s) that plays when about 35% of the window is in view.
   - The UFO beams up the first quarter, lowers a tiny alien, the alien shoots the other two dark quarters with small
     bolts, and gets beamed back up. The light quarter lifts, and "25%? That's a quarter."
   - Afterwards a tiny UFO drifts; there is a replay button.
   - Score and quarter-lives sit in the window frame: click the quarter to lose a life, three times gives "continue?".
4. **Hidden navigation** (`_partials/nav.html`, `assets/js/select.js`, `assets/css/select.css`)
   - No nav bar. A pixel joystick labelled MENU sits top right and rocks on hover. An "insert coin" book-a-call slot
     sits next to it and shows "book a call" once you scroll.
   - The SELECT STAGE menu spawns with an 8x8 Bayer dither. It has power-up tiles, a preview box and a 1P cursor.
   - It also has an echo RADAR marquee, a BANG bubble ("Up-to-date AI news you can actually use."), a joystick and
     button deck, and a coin door that drops a coin and ticks Credit 00 to 01.
   - A hidden player-at-cabinet easter egg sits in the menu.
   - Keyboard: m opens, arrows move, Esc closes. A 180ms top-edge hover opens it too.
   - The coin-drop micro-animation runs on every book CTA and no longer delays navigation noticeably.
5. **Footer coin arena** (`assets/js/arena.js`)
   - A 31s brawl loop with 11 characters, never fewer than 3 fighting, over the hovering QuarterSmart coin.
   - Click the coin for +25. Debug: `?arena=<ms>&arenastill`.
6. **Hidden quarters** (`assets/js/quest.js`)
   - Four gold quarter pieces hidden on the site. Collect all 4 for a toast ("That's a whole").
   - Progress is kept in localStorage `qs-quarters`.
   - The logo's quarter pops on hover; the footer logo pops on its own (`.brand--pop .brand--idle`).
7. **pxstage morph engine for inner pages** (`assets/js/radar.js`)
   - Scene library: radar (a rocking dish plus a sweeping scope), powerups, avatar, cabinet, keyboard, assistant, mail,
     tower, rocket, and more.
   - It uses the same ribbon morphs and opens exactly on the still image.
8. **Signals hub** (`signals/index.html`, `assets/css/hub-posts-new.css`)
   - An arcade radar station in terminal windows. The list is built from post meta by the build
     (`<!-- @signals-list -->` etc.).
9. **Share images** (`tools/og.mjs --force`)
   - Night-arcade cards (terminal window, echo wordmark, title, cabinets or radar), written to `site/assets/og/`.
10. **Build cache-bust**
    - `/assets/*` is served immutable for a year, so the build stamps `?v=<sha1-10>` on every asset link in the HTML.
    - Never add hand version queries again.
11. **Page transitions** (qs.css)
    - The next page fills in as 22px quarter cells, via cross-document view transitions. Off under reduced motion.

## 5. Process that worked (reusable know-how)
- **Codex image generation** (the working command; the old codex binary failed):
  `C:\Users\hyrum\AppData\Roaming\npm\codex.cmd exec -m gpt-6-astra -s workspace-write --skip-git-repo-check -C <dir> -i <ref.png> - < prompt.md`
  - Ask for flat `#ff00ff` backgrounds, an exact palette and exact art-pixel sizes. Codex then downsizes and verifies
    the result itself.
  - Key the magenta out with `tools/px3_process.py`.
  - Prompts are in `work/codex-pixel*-prompt.md` and the kit's `prompts/`.
- **Visual QA:** Playwright via `require` from `C:/Users/hyrum/Desktop/claude code/package.json`, driving Chrome at
  `C:/Program Files/Google/Chrome/Application/chrome.exe`.
  - `tools/shot.mjs` prints overflow and console errors.
  - `tools/strip.mjs` tiles frames over time, the best way to judge motion.
  - `tools/eval.mjs` runs page JS.
- **Workflows** that paid off:
  - File-owned parallel fix groups followed by an adversarial checker per group.
  - A five-lens audit (CRO, buyer persona, motion, accessibility, Codex), each finding verified before fixing.
- **Pitfalls hit:**
  - Bash heredocs containing Python with mixed quotes fail. Write patch scripts to `tools/*.py` or use a quoted
    `'PYEOF'` heredoc.
  - Python escapes like `\25B6` in CSS strings get mangled; this broke the replay glyph.
  - A canvas morph must draw its first frame before blitting, or you get a one-frame flash.
  - A pixel echo that is offset diagonally across thin strokes turns into mush. Extrude only below each column's
    lowest pixel.
  - Sticky offsets assumed the old 64px nav. There is no sticky header now.
- **Blocked:**
  - OpenRouter video review of the animations. Reading the key from `Desktop/claude code/.env.local` was denied as
    credential access.
  - To enable it: set `OPENROUTER_API_KEY` in the session environment.

## 6. Decisions and why
- Glow neon became echo text: Hyrum's clarification ("multiple layers of text that flashes and changes").
- Floppies were removed: Hyrum disliked them. Power-ups replace them (radar, map, wrench and joystick, token, robot)
  and map 1:1 to the five levels.
- The scroll-scrubbed story became a timed story: "too much and too fast when scrubbing", so it now plays at its own
  pace.
- No nav bar, but a persistent "insert coin / book a call": the hidden menu is the brand, and the dock keeps
  conversion.
- The homepage level picker opens on Head Start ("start here"), not the membership.
- Copy was vetted by a conversion review. The hero now names who it's for, plus "Book a free 20-minute call" and
  "See plans and prices".
- Held back until Hyrum confirms:
  - the patient-data line (no PHI without a BAA);
  - capacity claims;
  - the membership terms.
  - See `work/CONFIRM.md`.

## 7. Open items (see work/CONFIRM.md for the full list)
1. **Calendly** (Hyrum only): the event is 30 min, a phone call, and open on weekends and at midnight. The site
   promises a free 20-minute call. Fix it in Calendly and keep the slug `book-a-call`.
2. Confirm prices and terms, get a legal review of Privacy and Terms, and confirm the referral-fee line.
3. After DevDay (Sep 29): update the "o" Signal, the Signals Log, the 404 latest-signal slot, and remove the homepage
   DevDay row.
4. Analytics: none installed (Hyrum's call). Add UTM/source to the Calendly links.
5. Library MCP tools were not available in this session, so this report and `LibraryEntries.md` were written as files
   for ingestion.
