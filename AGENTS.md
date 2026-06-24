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

## 5. Strategy / positioning

**Canonical:** `research/quartersmart-positioning-playbook.md` (detailed: copy, pricing, 90-day plan,
entity consolidation, case-study scaffold). `research/quartersmart-positioning-blueprint.md` is an
earlier, superseded version kept for provenance.

Core thesis: reposition QuarterSmart from "AI-powered LMS / course studio" to an
**"AI implementation and workforce enablement partner."** Method:
**Assess → Train → Pilot → Automate → Scale → Measure.** Proof anchor: *verified n8n creator with 25
public workflow templates.*

> ### POSITIONING RULE — training as a system, not an LMS product (owner directive, updated 2026-06-23)
> This SUPERSEDES the 2026-06-08 "NO LMS at all" rule. Owner (Hyrum) reversed it on 2026-06-23.
> QuarterSmart now leads with **"Train your team. Automate the rest."** Training and onboarding ARE part
> of the offer, but framed as **systems we build, host, and maintain**, not as a commodity LMS or
> course-studio product.
> - Lead with: AI implementation, workforce enablement, AI onboarding and training SYSTEMS,
>   SOPs-to-training-and-automation, workflow automation, knowledge systems, hosting and maintenance.
> - Signature mechanic: each important SOP becomes both a training course AND an automation
>   ("your SOPs do double duty").
> - Still do NOT brand QuarterSmart as an "LMS," "course platform," "course studio," or "instructional
>   design" vendor. Training is an OUTPUT of implementation, not the product.
> - Canonical model now lives in `work1/hyrum/`: `quartersmart_business_model_2026-06-23.md`,
>   `quartersmart_rebrand_2026-06-23.md`, and `quartersmart_website_content_2026-06-23.md`.

---

## 6. Owner & related context

- Owner: **Hyrum Hurst**, founder of QuarterSmart.
- The live `aied.dev` (AI Ed) is the design source. QuarterSmart is the brand we're moving toward.
- An old, abandoned Next.js consumer version of AI Ed exists at `../aied/` on the origin machine — **ignore it**, it is not what's live.
- A pristine, un-rewritten backup of the pulled site is at `../aied-mirror/` on the origin machine.

---

## 7. Status log (append newest at top — keep the next agent informed)

- **2026-06-24 (final QuarterSmart brand kit)** - Produced the final selected four-quarter
  QuarterSmart raster kit in `brand/`: `qs-logo-primary-dark.png`, `qs-logo-primary-light.png`,
  `qs-mark-dark.png`, `qs-mark-transparent.png`, `qs-mark-white.png`, `qs-mark-black.png`, and
  `qs-og-image.png`. The selected mark is a circle split into four equal quarters with the top-right
  quarter in brighter mint `#1ffdb3`, the other quarters in mint `#00e5a0`, and wordmark text
  spelled exactly `QuarterSmart`. Do not return to the earlier connected-node or alternate Q concepts.

- **2026-06-24 (QuarterSmart quarter-circle logo concepts)** - Generated six new high-resolution
  raster logo concepts with the built-in imagegen tool and saved them in `brand/concepts/`:
  `quarter-v1-wedge-dark.png`, `quarter-v1-wedge-light.png`, `quarter-v2-ring-dark.png`,
  `quarter-v2-ring-light.png`, `quarter-v3-q-cutout-dark.png`, and
  `quarter-v4-detached-quarter-dark.png`. Direction is the "quarter" visual pun only: circle/ring
  with a missing, cut-out, or detached 90-degree quarter. Hard avoid remains no connected dots,
  node graphs, circuits, or branching motifs because the prior connected-node Q read too close to n8n.

- **2026-06-24 (QuarterSmart logo concepts)** - Generated six raster logo concept boards with the built-in
  imagegen tool and saved them in `brand/concepts/`: direction 1 split-output dark/light, direction 2 Q
  monogram dark/light, direction 3 wordmark-spark dark, and direction 4 stacked-blocks dark. All saved
  deliverables are at least 1024px tall/wide; light variants were padded on white to 1774x1024.

- **2026-06-11 (verifiable metrics + associations)** - (1) NEW /workflow-usage/ methodology page: full
  per-template table of all 25 n8n templates, total **10,876 documented uses** (June 2026), definitions
  of what the number does and does not mean, Dataset schema. (2) Replaced every "10,000+ people run
  QuarterSmart workflows" claim sitewide with the use-based metric linked to the methodology page
  (METRIC RULE: uses, not people; never imply unique users or customers). (3) about.html gained an
  "Experience and collaborations" section (#experience) naming Learning Journey AI + Nicholas Wagner
  Ph.D. (IDA national security AI, NSF AAAS Fellow, State Dept Speakers Program, SCSP AI+ Expo workshop;
  all verified on learningjourneyai.com/about), Dual Logic, Structure Properties/Quackfolio, Ability
  Builders. RULE REFINED: named work-history companies are now ALLOWED on about.html framed as Hyrum's
  experience; still never framed as QuarterSmart clients. (4) NEW ENTITY_HANDOFF.md (unpublished) = the
  master fact file for agents building Hyrum's OTHER sites (hyrumhurst.com, hyrum-ai, AI hub).

- **2026-06-09 (entity build-out)** - Executed the 10-task GEO brief. about.html is now the canonical
  entity page (Mesa AZ location, team intro, anchors #hyrum-hurst/#cullen-brown/#public-proof/
  #n8n-workflows/#credentials/#entity-summary, proof grid, entity summary, merged schema graph with
  stable @ids: AboutPage/Organization+address/Person Hyrum rich sameAs/Person Cullen/Service). THREE NEW
  PAGES: /ai-implementation/, /workforce-enablement/, /n8n-automation/ (full meta, FAQ schema,
  cross-linked, in sitemap, in home footer). llms.txt rewritten per brief (Mesa, six stages, people,
  evidence with real URLs). Schema @id convention: about.html#hyrum-hurst and about.html#cullen-brown
  are now THE stable Person ids; do not change them. NEW FACT: QuarterSmart is based in Mesa, Arizona.

- **2026-06-09 (full revamp)** — Structural + perf + AEO overhaul. (1) **Section order** now ends on the
  CTA: hero → ignite scroll → problem → how-it-works (+inline CTA) → services → who-its-for → partners →
  FAQ → rocket → CTA → footer. The **loop-vid section was deleted entirely** (HTML+CSS+JS+9MB video).
  (2) **Perf:** hero video re-encoded 10.7MB→0.44MB + poster (assets/images/hero-poster.webp, preloaded);
  ignite/flying/radar frames recompressed (58MB radar→8.6MB); flying frames + ignite batch-2 now lazy-load
  via IntersectionObserver; home-rocket canvas rewritten (DPR-capped once-sizing, cover-fit, reduced-motion,
  rAF-throttled); nav blur 48→20px; grain 0.18→0.07; ~470 lines dead CSS purged (splash/curtain/orbs/
  grid/waves/scroll-cue/loop). **Deleted assets:** scroll-frames (apple), rocket-frames, loop-bg.mp4,
  aied-splash.mp4, og-teams/og-government. ⚠️ §2's animation table is now: ignite (home scroll launch, 96), flying (home rocket cruise, 96), rocket (about.html flight-over-earth, 96, restored from git 2026-06-09), radar (radar.html cursor scrub, 120). Radar's splash/curtain intro was removed 2026-06-09 (instant reveal). Site weight 117MB→30MB. (3) **Funnel:** prefilled-
  subject mailtos everywhere, hero fine-print risk-reversal, inline CTA after how-it-works, nav anchors
  (How it works / Services), single-button final CTA, card footers now link to #cta. (4) **AEO:** new
  citable "What is QuarterSmart?" FAQ (first position, mirrored in FAQPage schema, 7/7 parity), enriched
  Organization schema (foundingDate, slogan, member incl. Cullen, knowsAbout, founder sameAs), about.html
  retitled "Hyrum Hurst | Founder of QuarterSmart", 5 signals pages got absolute og:image URLs, og-weekly
  regenerated QuarterSmart-branded. (5) Copy de-clichéd (one "X not Y" max, no list repetition, concrete
  example in Automate card). Logos now .webp in HTML (PNGs kept for OG generation).

- **2026-06-08 (full rewrite)** — Ran a 6-lens audit (funnel, credibility, SEO/AEO, animation, perf, copy),
  then rewrote. Key changes: (1) **NO em dashes** anywhere (purged 215, verified 0). (2) Hyrum's PERSONAL
  stats (#49 / 25 templates / top-50) **removed from the homepage**; homepage keeps only company framing
  ("10,000+ using QuarterSmart workflows"); personal creds live on **About** with the real linkable profile
  **n8n.io/creators/hyrum-hurst**. (3) Added a **client proof strip** (Dual Logic, Learning Journey AI,
  Structure Properties, Ability Builders) + a real About bio from the resume (`research/hyrum-hurst-resume.md`)
  + certs + CyberNews/Qwoted links. (4) Added **Cullen Brown (Operator & Outreach Manager)** to the About
  team section + Person schema + homepage Partners + FAQ. (5) Funnel: prefilled-mailto CTAs with a free/20-min
  no-obligation reassurance line. (6) Switched canonical domain **aied.dev → quartersmart.com** sitewide
  (aied.dev pointed at the old live site). (7) Regenerated **og-home.png** (QuarterSmart branded, no LMS).
  **Still open (need owner input / tooling):** real headshots (About uses initials avatars), a Cal.com/form
  booking link (mailto is the current path), per-page section reorder so home ends on a CTA, frame-sequence
  perf (lazy-load/WebP), regenerate og-weekly/og-teams images, and confirm quartersmart.com will serve this.

- **2026-06-08 (collab)** — Added **Cullen Brown (`cullenbrown07`)** as a write collaborator. New
  [`HANDOFF.md`](HANDOFF.md) onboards Cullen + his agents (points here as canonical). Also: removed the
  splash/curtain intro (hero reveals instantly), restored the headline typewriter, rewrote hero copy to
  be less AI-sounding (headline "We ship the AI your team actually uses."; eyebrow → real credential
  "#49 n8n creator · 10,000+ users"), and surfaced real proof numbers (#49 / 10,000+ users / 25 templates)
  + contact hyrum@quartersmart.com sitewide. HANDOFF.md added to the deploy strip list (not published).

- **2026-06-08 (structure)** — Owner: positioning is **teams-only**, so removed the separate audience
  pages — **deleted `teams/`, `government/`, `schools/`**. Repointed all their CTAs to the assessment
  contact (`mailto:learn@aied.dev`) and the home `#how-it-works` anchor; stripped Teams/Government from
  nav (home + radar); reframed the home "Who it's for" cards to *Operational teams* + *Regulated & secure
  environments*; removed the entries from sitemap.xml and llms.txt; unlinked two editorial refs in the
  weekly-advancements signals post. Site is now: home, about, radar (Signals), 6 signals posts, privacy,
  terms, coming-soon. Do not re-add audience pages without owner direction.
- **2026-06-08 (rebrand)** — Executed the full QuarterSmart rebrand across all 15 pages (copywriting +
  seo-geo/AEO + seo-content methodologies, via a multi-agent workflow + adversarial QA). All pages now
  QuarterSmart, no-LMS, positioned as AI implementation & workforce enablement partner; JSON-LD added
  (Organization/WebSite/Service/Person/ProfilePage/FAQ/Breadcrumb); QuarterSmart SVG logo + favicon in;
  llms.txt rewritten; sitemap refreshed (+About +Schools). Animations/CSS/JS/paths untouched. Brand &
  Messaging System spec lives at `docs/BRAND_MESSAGING_SYSTEM.md`. **Known follow-ups (raster, need design
  tooling):** OG social images (`assets/images/og/og-*.png`) and PNG favicons (`favicon-32.png`, `icon-*.png`)
  still show AI Ed visually — regenerate with QuarterSmart branding. Logo is a clean SVG *recreation* of the
  brand-kit Q; replace with official exports from `brand/` if available. About-page portrait is a labeled placeholder.
- **2026-06-08 (later)** — Owner directive: **NO LMS at all** (see §5 hard rule). Added canonical
  `research/quartersmart-positioning-playbook.md` (Assess→Train→Pilot→Automate→Scale→Measure; 6 service
  offers; pricing; 90-day plan; entity consolidation Hyrum→QuarterSmart, AI Ed 301s/nests under it).
  Marked the earlier blueprint superseded. Updated `docs/REBRAND_PLAN.md` to the no-LMS, 6-stage model.
- **2026-06-08** — Mirrored live aied.dev into this repo, rewrote paths for the `/quartersmart-web/`
  subpath, deployed to GitHub Pages (all 14 pages + all 5 frame sequences verified 200). Added brand kit
  (`brand/`), positioning research (`research/`), and this agent-handoff setup. Next: begin QuarterSmart
  rebrand (logo swap → copy/positioning → page-by-page). Brand assets are in-repo but NOT yet published.
