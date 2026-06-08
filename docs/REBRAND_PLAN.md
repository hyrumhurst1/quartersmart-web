# QuarterSmart Rebrand Plan

Actionable roadmap for converting this AI Ed mirror into the QuarterSmart site.
Context: `../AGENTS.md`. Brand: `../brand/BRAND.md`. Strategy: `../research/quartersmart-positioning-blueprint.md`.

> Status: **not started / planning.** Brand assets and research are in-repo but the brand is **not public yet**.
> Coordinate via `AGENTS.md` Status log before doing large edits, so cross-device agents don't collide.

## Guiding decisions (from the owner + research)

- **Keep** the design language, layout, and animations (scroll/radar/flying/**rocket**/ignite frame
  sequences — especially the rocket-launch visuals).
- **Reposition** from "AI-powered LMS / course studio" → **"AI implementation & adoption partner for
  operational teams."** Ladder: Readiness Sprint → Pilot + Enablement → Rollout Partner. (See research.)
- **Palette is already on-brand** (`#00e5a0` mint on `#060608`); the change is logo + wordmark + copy,
  not a recolor.

## Phase 1 — Visual identity swap (low risk, high signal)

1. Export individual logo files from `brand/quartersmart-wordmark-kit.png` (prefer recreating as **SVG**):
   full wordmark, Q-only mark (light + on-dark variants).
2. Export favicons from `brand/quartersmart-favicon-kit.png`: `favicon.ico` + `icon-48/96/192/512.png` +
   `apple-touch-icon.png`.
3. Replace files in `logos/` and the root favicon set. Update `<link rel="icon">`/manifest references.
4. Swap every visible **"AI Ed"** wordmark/logo for the QuarterSmart wordmark across all pages.

## Phase 2 — Identity & metadata copy

5. Replace "AI Ed" text references with "QuarterSmart" (nav, footer, headings, alt text).
6. Update `<title>`, meta description, `og:*`/`twitter:*` tags, and regenerate `assets/images/og/*` social
   images with QuarterSmart branding.
7. Update `sitemap.xml`, `robots.txt`, `llms.txt`, and `<link rel="canonical">` to the QuarterSmart domain
   (decide domain first — see open questions).

## Phase 3 — Positioning & messaging (per research)

8. Home: lead with **"AI implementation that your team actually adopts"** (or owner-approved variant);
   subordinate any LMS language.
9. Reframe service sections to the ladder: **Readiness Sprint → Pilot + Enablement → Rollout Partner**.
10. Add/adjust the About (Hyrum Hurst) entity copy and any case-study/“signals” framing per the research
    template. Add Organization + Person structured data (JSON-LD) for entity SEO.
11. Treat LMS/training as an optional delivery artifact on a secondary page, not the lead offer.

## Phase 4 — Launch

12. Re-verify all pages + every frame sequence return 200 on the deploy.
13. Decide hosting/domain for the real launch (GitHub Pages subpath is fine for testing; production likely
    wants a root domain so absolute paths could be restored — see AGENTS.md §2 for the path tradeoff).
14. When ready to make the brand public, remove the workflow exclusion (or move assets) so intended public
    files publish.

## Open questions for the owner

- Production domain for QuarterSmart? (affects canonical URLs + whether to keep relative paths or restore
  root-absolute when served at a domain root)
- Keep all current pages (teams / government / schools / radar / signals) or prune/rename for QuarterSmart?
- Net-new pages per research (Readiness, Pilot, Rollout, About Hyrum, Customer Stories)?
- What happens to the live `aied.dev` Netlify site once QuarterSmart launches? (Owner has not authorized
  taking it down — it remains the design source of truth for now.)
