# rebrand-preview/ : QuarterSmart rebrand (designed build)

> Staging directory on the `rebrand` branch. All files here are NEW and do not
> touch the live site (root `index.html`, `about.html`, the legacy service
> folders, `signals/`, and the root GEO files are untouched).

## What this is

The rebranded QuarterSmart marketing site, built from the **QuarterSmart Design
System** produced in Claude Design (project bb569288). The React/JSX design was
translated into clean, static, accessible HTML + one stylesheet. No client-side
React, no Babel, minimal JS (only a mobile-nav toggle).

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
| Privacy | `/rebrand-preview/privacy/` |
| Terms | `/rebrand-preview/terms/` |

## How it is built

- `assets/site.css` : the single production stylesheet. Design tokens (colors,
  type, spacing, effects) plus every component translated to CSS classes
  (`qs-btn`, `qs-card`, `qs-feature`, `qs-case`, `qs-stat`, `qs-accordion`,
  `qs-nav`, `qs-footer`, `qs-doubleduty`, etc.). Includes focus-visible rings,
  reduced-motion handling, and mobile breakpoints.
- `favicon.svg`, `assets/qs-mark.svg` : the four-quarters mark (top-right quarter
  lit mint). `assets/qs-og.png` : social share image.
- FAQ uses native `<details>`/`<summary>` (accessible, no JS). The accordion,
  cards, buttons, and nav match the design's hover/press/focus behavior in CSS.
- Per page: title/meta/canonical/OG, Organization + WebSite JSON-LD sitewide,
  Service + OfferCatalog on Services and For Agencies, full Person (Hyrum +
  Cullen) + AboutPage on About, Article + BreadcrumbList on the case-study
  detail, ContactPage on Contact, WebPage on the legal pages, and FAQPage
  wherever a visible FAQ exists (visible text mirrors the schema).
- Stable entity `@id`s preserved from `ENTITY_HANDOFF.md`; verified `sameAs` only.
- Staged `llms.txt`, `sitemap.xml`, `robots.txt` (not promoted to root).

## Provenance

`../design-system/` holds the full Claude Design export (tokens, components,
ui_kits) that this build was translated from. It is reference only.

## Hard rules honored

No em dashes; no public pricing; CTAs limited to "Book a call" / "Request a
proposal"; uses-not-people metric linked to `/workflow-usage/`; training framed
as a system we build, not an LMS product.

## Known open items (for Hyrum)

- Booking CTAs use `mailto:hyrum@quartersmart.com`. Swap for a Cal.com link when chosen.
- Legal pages are a reasonable starting point, not a substitute for review by
  counsel (GDPR / CCPA specifics, and the Google Fonts IP-logging angle: consider
  self-hosting the two fonts to avoid sending visitor IPs to Google).
- Root-relative paths target the Netlify deploy. Promotion to the site root
  (clean URLs, GEO files to root, `@id` reconciliation) is the launch cutover step.
