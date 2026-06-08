# quartersmart-web

Static website deployed to **GitHub Pages**: https://hyrumhurst1.github.io/quartersmart-web/

Currently a faithful mirror of the live **AI Ed by QuarterSmart** site (`aied.dev`), being rebranded
into the **QuarterSmart** site. Design and animations stay; brand and positioning change.

## For AI agents (any device)

**Read [`AGENTS.md`](AGENTS.md) first.** It is the shared, always-current context for agents working in
this repo (Claude Code reads it via `CLAUDE.md`; Codex and others read `AGENTS.md` directly). Update its
**Status log** when you finish meaningful work.

## Layout

- Site pages: `index.html`, `radar.html`, `privacy.html`, `terms.html`, `coming-soon.html`, `teams/`, `government/`, `schools/`, `signals/`
- `assets/` — images, video, and scroll-frame animation sequences
- `brand/` — QuarterSmart brand kit + spec (**not published**)
- `research/` — positioning blueprint (**not published**)
- `docs/` — handoff notes & rebrand plan (**not published**)

`brand/`, `research/`, `docs/`, and the root `*.md` files are stripped from the published Pages artifact —
they're in git for reference, not on the live site.

## Deploy

Push to `main`. GitHub Actions builds and publishes automatically (no build step — static upload).

## Important

This site uses **depth-relative paths** so it works under the `/quartersmart-web/` subpath. Don't add
leading-slash (`/assets/...`) internal paths — see `AGENTS.md` §2.
