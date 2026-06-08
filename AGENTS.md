# AGENTS.md — QuarterSmart Web (read this first)

> This file is the shared context for **any AI agent (Claude Code, Codex, etc.) on any device**
> working in this repo. `CLAUDE.md` imports it. Keep it current: when you finish a meaningful
> chunk of work, update the **Status log** at the bottom so the next agent (or the same agent on
> another machine) knows what happened.

---

## 1. What this repo is

A **static website** deployed to **GitHub Pages**.

- **Repo:** `hyrumhurst1/quartersmart-web`
- **Live URL:** https://hyrumhurst1.github.io/quartersmart-web/  (served under the `/quartersmart-web/` subpath)
- **Deploy:** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) → GitHub Pages. No build step; it uploads the static files as-is.

### What the site currently contains
It is a **faithful mirror of the live `aied.dev` site** (the "AI Ed by QuarterSmart" B2B site that was
hosted on Netlify via Netlify Drop, site id `sparkly-zabaione-5d27ce`). We pulled it over HTTP because
the source was not git-tracked and not findable locally. It is **hand-built static HTML/CSS/inline-JS — NOT Next.js**.

Pages: `index.html` (home), `teams/`, `government/`, `schools/`, `radar.html`, `privacy.html`,
`terms.html`, `coming-soon.html`, and 6 posts under `signals/`.

### Where this is going
We are **rebranding this AI Ed design into the QuarterSmart site**. The design, animations, and layout
stay; the brand (name, logo, copy, positioning) becomes QuarterSmart. See §4 (brand) and §5 (strategy).

---

## 2. CRITICAL deployment rules (don't break these)

The original site used **root-absolute paths** (`/assets/...`). Because GitHub Pages serves this repo
under `/quartersmart-web/`, **all paths were rewritten to be depth-relative**:

- A file at the repo root (e.g. `index.html`, `radar.html`) uses `assets/...` (no leading slash).
- A file one level deep (e.g. `teams/index.html`, `signals/foo.html`) uses `../assets/...`.
- This applies to HTML attributes, CSS `url(...)`, **and inline-JS string literals** (the scroll-frame
  animation loaders build URLs like `'../assets/video/rocket-frames/frame-'+n+'.jpg'`).

**If you add or move a page, or add assets, keep paths relative to that file's depth.** Never reintroduce
a leading `/` on an internal path — it will 404 under the subpath.

**Scroll-frame animation sequences** (these are the signature visuals — do not break them):

| Sequence | Path | Pad | Frames | Used on |
|---|---|---|---|---|
| scroll | `assets/images/scroll-frames/frame_NNNN.jpg` | 4 | 1–97 | home |
| radar | `assets/images/radar-frames/frame_NNNN.jpg` | 4 | 1–120 | radar.html |
| flying | `assets/video/flying-frames/frame-NNN.jpg` | 3 | 1–96 | home |
| ignite | `assets/video/ignite-frames/frame-NNN.jpg` | 3 | 1–96 | teams, schools |
| rocket | `assets/video/rocket-frames/frame-NNN.jpg` | 3 | 1–96 | teams, schools |

(`rocket` and `ignite` are the rocket-launch animations the owner specifically wants to keep.)

Videos: `assets/video/aied-hero-loop.mp4`, `loop-bg.mp4`, `aied-splash.mp4`.

### Verifying a change
After pushing, confirm the deploy succeeded (`gh run list --limit 1`) and that pages + a sample frame
from each sequence return 200. There is no local build; to preview locally, serve the repo root with any
static server (e.g. `npx serve .`) and browse `http://localhost:3000/` (note: local has no subpath, so
relative paths resolve fine).

---

## 3. Repo layout

```
quartersmart-web/
├─ index.html, radar.html, privacy.html, terms.html, coming-soon.html
├─ teams/  government/  schools/  signals/        # site pages
├─ assets/                                         # images, video, frame sequences, og
├─ logos/                                          # current (AI Ed) logos — to be replaced by QuarterSmart
├─ favicon.ico, icon-*.png, apple-touch-icon.png, sitemap.xml, robots.txt, llms.txt, .nojekyll
│
├─ AGENTS.md          # ← this file (canonical agent context)
├─ CLAUDE.md          # imports AGENTS.md
├─ README.md          # human overview
├─ brand/             # QuarterSmart brand kit (NOT published to the live site yet)
│   ├─ quartersmart-wordmark-kit.png
│   ├─ quartersmart-favicon-kit.png
│   └─ BRAND.md        # palette + usage spec
├─ research/          # strategy (NOT published)
│   └─ quartersmart-positioning-blueprint.md
└─ docs/              # detailed handoff notes (NOT published)
```

**`brand/`, `research/`, `docs/`, and the root `*.md` files are intentionally NOT published.** The deploy
workflow strips them from the Pages artifact before upload, so they live in git (viewable on GitHub and by
agents) but are not on the live website. This is deliberate — the QuarterSmart brand is **not public yet**.

---

## 4. Brand (QuarterSmart) — see `brand/BRAND.md`

- Logo: a mint-green **"Q"** with a white quarter-circle cut from the top-right (a visual pun on "quarter").
- Wordmark: `Q` + `UARTERSMART` in white uppercase, wide tracking, on near-black.
- **Palette (already matches the current site):** accent mint `#00e5a0` (bright variant `#1ffdb3`),
  background `#060608`, text `#f0f4f8`, muted `#8b95a5`.
- Source kits: `brand/quartersmart-wordmark-kit.png`, `brand/quartersmart-favicon-kit.png`.

Because the site's existing accent (`#00e5a0`) equals the brand mint, recoloring is minimal — the rebrand
is mostly **logo swap + copy/positioning changes**, not a palette overhaul.

---

## 5. Strategy / positioning — see `research/quartersmart-positioning-blueprint.md`

Core thesis from the research: reposition QuarterSmart from "AI-powered LMS / course studio" to an
**"AI implementation and adoption partner for operational teams."** Package ladder:
**Readiness Sprint → Pilot + Enablement → Rollout Partner**. LMS becomes an optional delivery artifact,
not the lead offer. Full detail (pricing, messaging, SEO/entity model, case-study template) is in the
research file. This informs the rebrand copy.

---

## 6. Owner & related context

- Owner: **Hyrum Hurst**, founder of QuarterSmart.
- The live `aied.dev` (AI Ed) is the design source. QuarterSmart is the brand we're moving toward.
- An old, abandoned Next.js consumer version of AI Ed exists at `../aied/` on the origin machine — **ignore it**, it is not what's live.
- A pristine, un-rewritten backup of the pulled site is at `../aied-mirror/` on the origin machine.

---

## 7. Status log (append newest at top — keep the next agent informed)

- **2026-06-08** — Mirrored live aied.dev into this repo, rewrote paths for the `/quartersmart-web/`
  subpath, deployed to GitHub Pages (all 14 pages + all 5 frame sequences verified 200). Added brand kit
  (`brand/`), positioning research (`research/`), and this agent-handoff setup. Next: begin QuarterSmart
  rebrand (logo swap → copy/positioning → page-by-page). Brand assets are in-repo but NOT yet published.
