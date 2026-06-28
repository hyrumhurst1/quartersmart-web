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

## Status: complete (June 27)
All shipped to production and verified live.
- Anonymization: live. Zero "Structure Properties" in published HTML. Case study now at /case-studies/sf-property-management/ with a 301 from the old slug. Name kept in llms.txt only.
- n8n: workflow-usage trimmed to the top 4 most used templates; the full 25-template list with counts and the n8n creator-profile link moved to llms.txt; JSON-LD ItemList trimmed to 4.
- Redirects: /blog/*, /vs-lms, /radar, /coming-soon, /teams, /schools, /government, and the old case-study slug all 301 (verified live).
- For Agencies nav: Signals added (desktop + drawer).
- SEO/CTR: short titles lengthened (contact, privacy, terms); homepage title and description made benefit-led with a 65 percent proof hook; over-long meta descriptions trimmed.
- Calendly: created a "Book a Call" event type (30 min, phone call, invitee provides their number, working-hours availability) in Hyrum's account. Public link https://calendly.com/hyrum-quartersmart/book-a-call wired into all 81 "Book a call" CTAs sitewide (opens in a new tab).
- Lighthouse on the live new pages: 100/100/100/100.

## Owner follow-ups (not blocking)
- Inbound links from high-quality domains: off-site, cannot be fixed in code. Pursue a few partner and press links (the n8n creator profile, CyberNews, Learning Journey AI, Qwoted already exist; add directory listings and partner backlinks over time).
- Calendly: review the default availability and connect your Google or Outlook calendar so booked times match your real schedule.
- Delete the wiring-test entries from the Netlify Forms dashboard (qs-wiring-test@quartersmart.com).
- Thin content: most pages are substantial. If Bing keeps flagging it, the contact and legal pages are thinnest and could get a short FAQ block later.
