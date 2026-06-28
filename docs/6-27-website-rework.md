# 6/27 Website Rework

Working record of the June 27 2026 rework pass on quartersmart.com. Internal doc (lives in `docs/`, not published).

## Scope (from owner)
1. Anonymize Structure Properties on the public site (no full name, no link). Call them "a San Francisco property management company" with the portfolio stat. Name is OK to keep in `llms.txt`.
2. Set up a Calendly and link it on the site (replace the mailto booking).
3. Trim the n8n template list on the site to "most used templates" (top 4 with counts). Keep the full list in `llms.txt` and add the n8n links there.
4. Remove the legacy blog (and other stale AI Ed URLs) and redirect them.
5. Fix the missing Signals tab in the For Agencies nav.
6. Improve CTR (decent impressions, few clicks) and address Bing Webmaster feedback (short titles, short meta descriptions, thin content, inbound links).
7. This doc.
8. Verify everything is live, the site is fully optimized, then Telegram.

## Audit findings (June 27)
- No `/blog/`, `/vs-lms`, `/radar`, `/coming-soon` pages exist in the repo. They are stale AI Ed era URLs Google still has indexed. GSC top pages include `/vs-lms` (1 click, 10 impressions, the top click), `/blog/ai-chatbots-for-employee-training` (7 impressions), `/radar`, `/#courses`, `/#how-it-works`. These need 301 redirects so the indexed URLs stop 404ing.
- Homepage: 114 impressions, 0 clicks. The main CTR problem.
- Genuinely short titles: contact (34), privacy (29), terms (27), 404 (29). Most others are 49 to 66 chars (fine).
- Meta descriptions are all 132+ chars; several are over 165 and will truncate in SERP (the opposite of Bing's "too short", but worth tightening).
- For Agencies nav is missing the Signals link (desktop + drawer).
- "Structure Properties" appears on 7 published pages (services, index, for-agencies, faq, case-studies index, case-studies/structure-properties detail, about) and the case study lives at `/case-studies/structure-properties/`, linked from 5 pages. No external link to their site.

## Decisions
- Anonymized label: "a San Francisco property management company" (and headings like "A San Francisco property management company") keeping the verifiable stats (4,000+ units, $500M+ portfolio, 65%, 36%, 39 courses, 7 roles). Case study URL renamed `/case-studies/structure-properties/` to `/case-studies/sf-property-management/` with a 301; all 5 internal links updated. Name stays in `llms.txt` per owner.
- n8n: site shows top 4 only ("most used templates") with a link to the n8n creator profile; JSON-LD ItemList trimmed to match. Full 25-template list (with counts and the creator link) moves into `llms.txt`.
- Redirects added in `netlify.toml`: `/blog/* -> /signals`, `/vs-lms -> /services`, `/radar -> /signals`, `/coming-soon -> /`, plus old AI Ed audience pages (`/teams`, `/schools`, `/government`) `-> /`.
- CTR/Bing: lengthen the short titles (contact, privacy, terms, 404), tighten the long meta descriptions toward 150 to 160 chars, and make the homepage title and description more benefit and outcome driven. Inbound links are off-site and cannot be fixed in code; noted as an ongoing recommendation.

## Status
(updated as work completes; see git log for specifics)
