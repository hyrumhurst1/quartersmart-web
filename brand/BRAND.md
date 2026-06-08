# QuarterSmart Brand Kit

> Brand assets and spec for the QuarterSmart rebrand of this site.
> **Not published to the live site yet** — these live in git for reference/agent access only.

## Assets in this folder

| File | What it is |
|---|---|
| `quartersmart-wordmark-kit.png` | Full wordmark (`Q UARTERSMART`) + Q-icon variations on dark/app-tile/framed treatments |
| `quartersmart-favicon-kit.png` | Favicon master + size renders (512, 256, 128, 64, 32) |

> These are reference/preview kit sheets (one PNG each, multiple variants laid out). When implementing,
> export the individual logo/favicon files at the needed sizes/formats (SVG preferred for the logo,
> `.ico` + PNG sizes for favicons) from the source design before wiring them into the site.

## Logo

- A mint-green **"Q"** with a **white quarter-circle** removed from the upper-right — a visual pun on
  "quarter." The Q's tail is a squared stroke.
- Wordmark: the Q followed by **`UARTERSMART`** in white, uppercase, wide letter-spacing.
- Works on near-black background; also shown as a rounded app-tile and a thin-framed "tech" treatment.

## Palette

| Token | Hex | Use |
|---|---|---|
| Accent (mint) | `#00e5a0` | Primary brand green — Q mark, accents, CTAs, highlights |
| Accent bright | `#1ffdb3` | Brighter mint for glow/hover/emphasis |
| Background | `#060608` | Near-black page background |
| Text | `#f0f4f8` | Primary off-white text |
| Muted | `#8b95a5` | Secondary/muted text |

**Note:** these are the SAME tokens the current site already uses (`--accent`, `--text`, `--muted` in the
page CSS, background `#060608`). So the rebrand needs minimal recoloring — it's primarily a **logo + wordmark
+ copy** swap, not a palette change.

## Typography (current site, likely to keep)

- Display/headings: **Space Grotesk** (Google Fonts)
- Mono/labels: **JetBrains Mono** (Google Fonts)

## Rebrand checklist (when we go live with QuarterSmart branding)

- [ ] Replace `logos/` AI Ed marks with QuarterSmart Q logo (SVG)
- [ ] Replace `favicon.ico`, `icon-*.png`, `apple-touch-icon.png` with QuarterSmart favicon exports
- [ ] Swap "AI Ed" wordmark/text → "QuarterSmart" across pages
- [ ] Update `<title>`, meta description, OG/Twitter tags, `assets/images/og/*` images
- [ ] Update copy/positioning per `research/quartersmart-positioning-blueprint.md`
- [ ] Update `sitemap.xml`, `robots.txt`, `llms.txt`, canonical URLs to the QuarterSmart domain
