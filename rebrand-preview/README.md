# rebrand-preview/ : QuarterSmart rebrand CONTENT REVIEW BUILD

> Staging directory. All files here are NEW and do not touch the live site
> (`index.html`, `about.html`, the service folders, `signals/`, root GEO files
> are all untouched). Created on the `rebrand` branch, 2026-06-23.

## What this is

A barebones, content-first layout of the finished 2026-06-23 rebrand copy for the
7 site pages, plus a Structure Properties case-study detail page. The point is to
review the **words + SEO/GEO/schema**, not the design. Final branding, wireframe,
and visual polish come from Claude Design; this content is built to drop into that
wireframe later with minimal rework.

Tagline: **Train your team. Automate the rest.**

## Pages (open `/rebrand-preview/` on the deploy)

| Page | Path |
|---|---|
| Home | `/rebrand-preview/` |
| Services | `/rebrand-preview/services/` |
| Case Studies | `/rebrand-preview/case-studies/` |
| Structure Properties (detail) | `/rebrand-preview/case-studies/structure-properties/` |
| About | `/rebrand-preview/about/` |
| For Agencies | `/rebrand-preview/for-agencies/` |
| FAQ | `/rebrand-preview/faq/` |
| Contact | `/rebrand-preview/contact/` |

## What is included

- All page copy from `work1/hyrum/quartersmart_website_content_2026-06-23.md`, used close to verbatim.
- Per-page `<title>`, meta description, canonical, Open Graph/Twitter tags.
- JSON-LD: `ProfessionalService` (Organization) + `WebSite` on every page; full `Person`
  (Hyrum + Cullen) + `AboutPage` on About; `Service` + `OfferCatalog` on Services and For Agencies;
  `FAQPage` on Home, Services, Case Studies, About, For Agencies, FAQ, and Contact (visible FAQ text
  mirrors schema text); `Article` + `BreadcrumbList` on the Structure Properties detail page.
- Stable entity `@id`s preserved verbatim from `ENTITY_HANDOFF.md`:
  `…/#organization`, `…/about.html#hyrum-hurst`, `…/about.html#cullen-brown`.
- Verified `sameAs` set only (n8n, LinkedIn, Qwoted, GitHub) + CyberNews as `subjectOf`. No placeholders.
- Staged GEO files (`llms.txt`, `sitemap.xml`, `robots.txt`) reflecting the new page set. These are
  STAGED here, not promoted to the site root. Promoting them to root is a launch/cutover step.

## Conventions used

- Paths are root-relative (e.g. `/rebrand-preview/services/`, `/favicon.svg`), correct for the
  Netlify deploy (root domain). Not intended for the GitHub Pages subpath mirror.
- Hard rules honored: no em dashes; no public pricing; CTAs are only "Book a call" and "Request a
  proposal"; no LMS framing; metric is uses-not-people and links to `/workflow-usage/`.
- Booking CTAs currently use `mailto:hyrum@quartersmart.com`. Swap for a Cal.com/booking link when chosen.

## Known open items (for Hyrum)

- Final logo + design system (Claude Design). Logo concepts exist in `brand/concepts/`.
- Whether to show a soft "care plans starting at $X/mo" anchor (currently OUT; internal floor is ~$300/mo).
- Keep or drop the `signals/` blog section.
- Whether Services stays one page or keeps the 3 legacy service-page folders.
- `@id` reconciliation: stable ids use `about.html#…`; the new About page is at the clean URL `/about`.
  Kept the `.html` ids per the binding ENTITY_HANDOFF "do not change" rule. Decide at cutover.
