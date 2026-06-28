# 2026-06-28 — Signals traction + QS-era thumbnails with watermark

Goal (owner, overnight): get the Signals blog traction without off-site posting — so AI engines
cite it, the cover images surface in image search and point back to the post, and posts stop being
buried. Plus: regenerate every Signals thumbnail as a QuarterSmart-era Codex image, each carrying a
logo + "Signals" watermark in the bottom-right. No SVG thumbnails. Do not text Telegram.

## 1. Thumbnails (all 10 Signals posts)

- **7 new Codex-generated covers** (built on the owner's ChatGPT Codex session, not the metered API),
  near-black + mint, on-concept, no text: mythos (shattered sandbox cube), glasswing (coalition dome),
  fable-5 (glowing glass book), free-ai-students (student laptop + grad cap), third-party-killed
  (snapping chain), openai-pricing (stacked tiers), weekly (radar sweep — echoes the Signals motif).
- **3 newest covers re-watermarked** (AOP, stretch-ai-budget, why-ai-pilots-fail) so all 10 are consistent.
- All exported 1200x800 JPEG (mozjpeg q82, 29–130 KB).
- **Watermark**: four-quarters QS mark + "Signals" in mono, subtle semi-transparent dark backing so it
  stays legible on any frame but disappears into the dark art. Built from `favicon.svg` via sharp.
  Asset saved at `assets/signals-watermark.png` (also copied into dist; unreferenced, harmless).
- **Wiring**: each post's og:image, twitter:image, Article schema image, and inline cover `<img>` now
  point to the new JPG with accurate alt text + 1200x800 dims. Hub cards updated. Weekly was special —
  its CSS-gradient banner became a real cover image and its text hub card became an image card.
- Old AI-Ed-era PNG covers + `og-weekly.png` deleted (grep-confirmed zero remaining references).
- Pipeline scripts archived (not published) in `docs/thumbnail-pipeline/` (`_genthumbs.sh` has the exact
  Codex prompts; `_watermark.mjs`, `_compose.mjs`, `_wire.mjs` reproduce the build).

## 2. On-site traction / SEO / GEO

- **Image sitemap** — `netlify-build.mjs` now emits the Google image-sitemap extension: every URL lists
  its main image (`<image:image>`), tying each cover to the post that should be cited in image search.
- **RSS feed** — `/feed.xml` is auto-generated from the Signals posts on every build (title, link,
  pubDate from `datePublished`, description). Autodiscovery `<link rel="alternate" ...>` added to all
  Signals pages. Aids discovery + feed-reading crawlers.
- **Author E-E-A-T** — a factual author box (headshot + "Founder of QuarterSmart and a verified n8n
  creator… builds local-model and agent systems…" + "More about Hyrum" → `/about/#hyrum-hurst`) now
  closes every post. Credibility through verifiable facts, not self-praise (AEO posture).
- **Internal linking / topic clusters** — a "Read next" line on every post links the three cornerstone
  pieces (AOP, stretch-your-budget, why-pilots-fail) + All Signals, so nothing is orphaned and link
  equity concentrates on the cornerstones.
- **Freshness** — sitemap `lastmod` = build date; IndexNow auto-pings Bing/Yandex on the production
  deploy (existing behavior).

## Honest note on the "3 months to index" problem
For a young, low-authority domain, Google indexing latency is mostly a function of crawl budget and
domain authority, which on-site work can nudge but not fix outright. The levers used here (image
sitemap, fresh lastmod, IndexNow, dense internal linking, RSS, strong schema) are the right on-site
moves and they compound, but the durable accelerant is inbound links / authority, which is off-site.
Manual GSC "Request indexing" on the newest URLs is the fastest per-URL nudge for Google specifically.
