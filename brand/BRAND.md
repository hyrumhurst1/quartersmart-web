# QuarterSmart Brand Kit

> Brand assets and spec for QuarterSmart. Not published to the live site (the deploy strips `brand/`).
> Final logo selected 2026-06-23: the four-quarter mark (direction Q4).

## Logo

The mark is a **circle split into four equal quarters** in mint, with the **top-right quarter a brighter
mint**, a thin gap separating the quarters. It is a visual pun on "quarter" and reads as a clean,
premium systems mark. Paired with the wordmark **QuarterSmart** (one word, capital Q and capital S).

### Final kit files (this folder)

| File | What it is | Size |
|---|---|---|
| `qs-logo-primary-dark.png` | Full lockup (mark + wordmark) on near-black | 2400x1600 |
| `qs-logo-primary-light.png` | Full lockup for light backgrounds | 2400x1600 |
| `qs-mark-dark.png` | Mark only on near-black (app-icon style) | 2048x2048 |
| `qs-mark-transparent.png` | Mark only on transparent background | 2048x2048 |
| `qs-mark-white.png` | Monochrome all-white mark, transparent | 2048x2048 |
| `qs-mark-black.png` | Monochrome all-black mark, transparent | 2048x2048 |
| `qs-og-image.png` | Social share card (mark + wordmark + tagline) | 1200x630 |
| `favicons/` | favicon.ico + favicon-32 + icon-48/96/192/512 + apple-touch-icon (180) | various |

> Superseded reference sheets (older "Q with quarter-circle cut" concept): `quartersmart-wordmark-kit.png`,
> `quartersmart-favicon-kit.png`. Kept for history; do not use.

### Usage rules

- Primary lockup on dark is the default. Use the light lockup only on white or very light surfaces.
- Mark alone for favicons, the nav, social avatars, and any space too small for the wordmark.
- Keep clear space around the lockup of at least the height of one quarter of the mark.
- Do not recolor the mark outside the brand mint, do not add drop shadows or gradients beyond the single
  brighter-quarter accent, do not stretch or rotate, do not place the dark lockup on a busy or light photo.

## Palette

| Token | Hex | Use |
|---|---|---|
| Accent (mint) | `#00e5a0` | Primary brand green: mark, accents, CTAs, highlights |
| Accent bright | `#1ffdb3` | Brighter mint: the top-right quarter, hover, emphasis |
| Background | `#060608` | Near-black page background |
| Text | `#f0f4f8` | Primary off-white text |
| Muted | `#8b95a5` | Secondary / muted text |

Mint is the single accent on a dark canvas. These match the site's existing CSS tokens, so the rebrand is a
logo plus copy swap, not a palette change.

## Typography

- Recommended for the rebuild: **Geist** or **Inter** (clean geometric sans, free, matches the wordmark and
  the modern dark SaaS aesthetic).
- The prior site used **Space Grotesk** (display) and **JetBrains Mono** (labels). Both are acceptable; the
  design phase settles the final choice.

## Voice

Pragmatic, confident, anti-hype. Builder energy, not guru. No em dashes anywhere. No public pricing on the
site (CTAs are "Book a call" and "Request a proposal"). Tagline: **Train your team. Automate the rest.**

## Go-live checklist

- [ ] Place `favicons/` files at the repo root (favicon.ico, favicon-32.png, icon-48/96/192/512.png, apple-touch-icon.png)
- [ ] Wire `qs-mark-transparent.png` / `qs-logo-primary-dark.png` into the nav and footer
- [ ] Set `qs-og-image.png` as the OG/Twitter image sitewide
- [ ] Swap any remaining "AI Ed" marks/text for QuarterSmart
- [ ] Update `sitemap.xml`, `robots.txt`, `llms.txt`, canonical URLs
