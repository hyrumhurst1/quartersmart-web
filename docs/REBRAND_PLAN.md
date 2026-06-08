# QuarterSmart Rebrand Plan

Actionable roadmap for converting this AI Ed mirror into the QuarterSmart site.
Context: `../AGENTS.md`. Brand: `../brand/BRAND.md`.
Strategy (canonical): `../research/quartersmart-positioning-playbook.md` (the blueprint is superseded).

> Status: **not started / planning.** Brand assets and research are in-repo but the brand is **not public yet**.
> Coordinate via `AGENTS.md` Status log before doing large edits, so cross-device agents don't collide.

## 🚫 HARD RULE — NO LMS (owner directive, 2026-06-08)

QuarterSmart is **not about an LMS, course studio, instructional design, or training-content product — at
all.** Do not lead, name, headline, or describe the company around LMS / courses / "training platform"
anywhere (copy, nav, meta, schema, OG). The current mirror is "AI Ed ... powered by QuarterSmart Secured
LMS" — **all of that LMS language gets removed**, not relabeled. Secure knowledge systems / AI assistants /
secure deployment may remain as *capabilities*, but never branded as an LMS.

## Guiding decisions (from the owner + research)

- **Keep** the design language, layout, and animations (scroll/radar/flying/**rocket**/ignite frame
  sequences — especially the rocket-launch visuals).
- **Reposition** from "AI-powered LMS / course studio" → **"AI implementation & workforce enablement
  partner."** Method: **Assess → Train → Pilot → Automate → Scale → Measure.**
- **Proof anchor:** *verified n8n creator with 25 public workflow templates* (don't publish unverified
  "Top 50" / "10K+ uses" without a proof page).
- **Entity consolidation:** Hyrum → QuarterSmart as the single brand; AI Ed should 301-redirect into or
  nest clearly under QuarterSmart (no separate co-equal brand).
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

## Phase 3 — Positioning & messaging (per playbook)

8. Home: lead with **"AI implementation and workforce enablement for teams that need rollout, not hype"**
   (or owner-approved hero variant). **Remove all LMS / course / training-platform language.**
9. Reframe service sections to the playbook's offer map (no LMS service): AI Rollout Assessment ·
   Leadership & Team Enablement · Pilot & Workflow Prototyping · Workflow Automation & Integration ·
   Knowledge Systems & AI Assistants · Measurement & Optimization · (Custom Systems & Secure Deployment).
10. Add a rollout-method section: **Assess → Train → Pilot → Automate → Scale → Measure.**
11. Add/adjust About (Hyrum Hurst) entity copy + n8n proof; add Organization + Person JSON-LD for entity
    SEO. Repeat the playbook's canonical phrases; avoid the "wrong bucket" phrases (LMS, course studio,
    chatbot builder, automation freelancer).

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
