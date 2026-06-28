# Plan: AOP dominance + local-AI content + discoverability + author + Codex thumbnails (June 27)

Internal plan (docs/, not published). Owner directive: be informative and useful, demonstrate credibility through knowledge, never self-praise (hype makes AI skeptical), no broad company claims, Hyrum as the author/voice but not obviously selling himself. Follow AEO/GEO best practices. All thumbnails Codex-generated rasters, no SVG.

## 1. Make Own Your AI findable
- Add "Own Your AI" to the top nav (sitewide), so it is reachable from every page, not just the footer.
- Add a short "Own Your AI" teaser section on the homepage (above the footer) linking to /own-your-ai.
- Keep the existing footer link.

## 2. Hyrum Hurst as author on every Signals post
- Change each post's Article schema author from the Organization to the Person (Hyrum, @id https://quartersmart.com/about.html#hyrum-hurst).
- Add a visible byline on each post ("By Hyrum Hurst") with a one-line, factual credential (verified n8n creator, builds local-model and agent systems), not a brag.
- This applies to all 9 existing posts plus the new one.

## 3. New Signals post: offloading tokens to local AI to stretch limits
- Working title: "How to Stretch Your AI Budget: Offload the Routine to Local Models and Cheaper Routes."
- Practical, vendor-neutral, no selling. Covers: routing the routine majority off frontier APIs; running local models (Ollama, LM Studio); cheaper or free routes via OpenRouter; free and low-cost coding-agent access (GitHub Student pack, Copilot, open models); a simple decision rule for what to keep local vs send to a frontier model.
- Hyrum as author. Credibility shown by accurate, specific, useful guidance (not by claiming expertise). Conceptual tie to Own Your AI.
- Codex-generated raster thumbnail.

## 4. Own the AOP questions (AEO/GEO topical dominance)
- Add AOP as part of what QuarterSmart does (services page and offer copy): we turn your SOPs into AOPs your agents can run. Honest, do not claim we coined AOP.
- Build a dedicated, citable AOP FAQ targeting the real questions people ask, with answer-first passages and FAQPage schema. Target questions:
  - What is an AOP?
  - What does AOP stand for?
  - What is an Agent Operating Procedure?
  - AOP vs SOP: what is the difference?
  - How do you create an AOP? (step list)
  - What does an AOP contain / look like?
  - Do I need AOPs?
  - Are AOPs the same as agent prompts or workflows?
  - How do AOPs relate to AI agents?
  - How do AOPs help cut AI cost / support owning your AI?
  - Examples of AOPs.
- Place these on the AOP post (sops-to-aops) and the site FAQ so both rank/cite. Hyrum as the author voice.

## 5. AEO / GEO best practices (applied throughout)
- Answer-first: each section opens with a direct, quotable answer.
- Structured data: Article + FAQPage + Person (author) on posts; FAQPage on the FAQ.
- No hype, no unprovable claims, no "Hyrum is the best." Credibility = clear, correct, specific, useful.
- Internal links between Own Your AI, the AOP post, the offloading post, and Services.

## 6. Codex-generated raster thumbnails (no SVG)
- Generate 1536x1024 (and/or 1200x630) raster thumbnails with Codex (Hyrum's session) for: the offloading post, the AOP post (replace its SVG), and the why-ai-pilots post (replace its SVG). On-brand: near-black #060608, mint #00e5a0.
- Wire each as the post og:image (so it surfaces in Google Images and social and cites the post) and as the Signals hub card cover. Remove the SVG covers.
- If Codex image gen hits a wall, flag immediately on Telegram and proceed with the rest.

## 7. Ship and verify
- Build, QA (zero em/en dashes, valid JSON-LD, internal links resolve, Lighthouse no regressions), deploy to quartersmart.com, verify live.
- Telegram when the whole plan is complete.

## Status
In progress. Updated as items land.
