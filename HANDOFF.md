# HANDOFF — for Cullen & his AI agents

Welcome. You have **write access** to this repo. This file gets you (and any AI agent you run —
Claude Code, Codex, Cursor, etc.) productive fast. **Then read [`AGENTS.md`](AGENTS.md) — it's the
canonical source of truth and has the hard rules.**

> Agents: read **`AGENTS.md` first**, then `docs/REBRAND_PLAN.md`. Append a line to the AGENTS.md
> **Status log** whenever you finish meaningful work so the next person/agent isn't lost.

## What this is (30 seconds)

A **static website** for **QuarterSmart** — an *AI implementation & workforce enablement partner*
(helps teams actually adopt AI: assess → train → pilot → automate → scale → measure). It's a rebrand
of a site that used to be "AI Ed."

- **Repo:** `hyrumhurst1/quartersmart-web`
- **Live:** https://hyrumhurst1.github.io/quartersmart-web/ (GitHub Pages, served under `/quartersmart-web/`)
- **Deploy:** push to `main` → GitHub Actions builds & publishes automatically. **No build step** — it's
  hand-written static HTML/CSS/JS. Edits to `index.html` etc. go live ~1 min after push.

## 🚫 The one hard rule: NO LMS

QuarterSmart is **not** an LMS / course platform / training-content product. Never describe it that way
(copy, meta, schema). It's an implementation/enablement *partner*. See `AGENTS.md` §5.

## How to work in it safely

- **It's all static HTML.** The homepage is `index.html` (big inline `<style>` + inline `<script>`).
  Other pages: `about.html`, `radar.html` (Signals), `privacy.html`, `terms.html`, `coming-soon.html`,
  and `signals/*.html`.
- **Relative paths matter.** Root pages use `assets/...`; subdir pages (`signals/`) use `../assets/...`.
  Never use a leading-slash `/assets/...` — it 404s under the `/quartersmart-web/` subpath. (`AGENTS.md` §2)
- **Don't break the animations.** Scroll-driven canvas sequences (rocket-launch "ignite" frames on the
  home hero scroll, "flying" frames lower down). Don't touch the `<script>` frame-loaders or change
  asset-path depth.
- **Preview locally:** serve the repo root with any static server, e.g. `npx serve .` →
  `http://localhost:3000/` (locally there's no subpath, so relative paths just work).
- **Verify after pushing:** check the Actions run is green and the page + a sample animation frame return 200.

## What's reference-only (in git, NOT on the live site)

The deploy workflow strips these from the published artifact — they're for collaborators/agents only:
`AGENTS.md`, `CLAUDE.md`, `README.md`, `HANDOFF.md`, and the `brand/`, `research/`, `docs/` folders.

- `brand/` — QuarterSmart logo kit + `BRAND.md` (palette: mint `#00e5a0` on near-black `#060608`).
- `research/` — positioning playbook (the strategy/voice).
- `docs/` — `BRAND_MESSAGING_SYSTEM.md` (voice + SEO/AEO + schema rules) and `REBRAND_PLAN.md`.

## Owner & contact

- Owner: **Hyrum Hurst** — hyrum@quartersmart.com
- Coordinate big changes with Hyrum; log them in `AGENTS.md` §7 Status log.
