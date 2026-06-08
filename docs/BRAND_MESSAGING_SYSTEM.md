# QuarterSmart Brand & Messaging System (rebrand source of truth)

This is the spec every page rebrand must follow. Derived from `../research/quartersmart-positioning-playbook.md`,
`../brand/BRAND.md`, the `copywriting` skill, and the `seo-geo` (AEO/GEO) skill. **Read this fully before editing any page.**

---

## 0. HARD RULES (do not violate)

1. **NO LMS — at all.** Never use "LMS," "course studio," "course development," "instructional design,"
   "training platform," "Secured LMS," "microlearning," or "course library" anywhere (copy, meta, alt,
   schema, titles). Remove the tagline "powered by QuarterSmart Secured LMS" entirely — do not relabel it.
   Capabilities like *knowledge systems / AI assistants / secure deployment* may be described, but never as an LMS.
2. **Do NOT touch animations, layout, or structure.** Never edit `<style>` blocks, `<script>` blocks, canvas/
   frame-loader JS, class names, or the DOM structure. Only change **visible text, brand names, logo/favicon
   references, `<meta>`/`<title>`, alt text, and ADD JSON-LD**. The scroll/radar/flying/rocket/ignite frame
   animations must keep working.
3. **Do NOT change asset paths' depth.** Keep relative paths exactly as deep as they are (root pages use
   `assets/...`, subdir pages like `teams/` use `../assets/...`). Logos live at site root: root pages use
   `logos/quartersmart-mark.svg`; subdir pages use `../logos/quartersmart-mark.svg`.
4. **Brand name:** "QuarterSmart" (one word, camelCase) in body text; "QUARTERSMART" only inside the logo
   lockup. Never "Quarter Smart" or "Quartersmart."
5. Keep it honest: only verifiable proof. Allowed proof line: **"Verified n8n creator with 25 public
   workflow templates."** Do NOT publish "Top 50" or "10K+ uses" (unverified).

---

## 1. Positioning

- **What QuarterSmart is:** an **AI implementation and workforce enablement partner**. It helps
  organizations move from scattered AI experiments to org-wide, measurable adoption.
- **One-liner:** *QuarterSmart helps organizations move from AI curiosity to operational adoption.*
- **Method (use as a narrative spine):** **Assess → Train → Pilot → Automate → Scale → Measure.**
- **Audience:** operators and leaders (CEO/COO/GM/ops & dept leads) at small-to-mid orgs with real
  workflows, real teams, and real constraints; regulated/secure environments welcome.
- **Differentiators:** developer-forward (ships working automations, not decks), n8n-backed execution,
  secure deployment when needed, outcome/measurement focus.

## 2. Voice & tone (from copywriting skill)

Confident, plain, operator-practical, B2B. Clarity over cleverness. Benefits over features. Specific over
vague. Active voice. No exclamation points. No buzzword soup ("streamline/synergy/revolutionary"). Short
paragraphs (2–4 sentences). Use rhetorical questions and concrete outcomes ("cut weekly reporting from 4
hours to 15 minutes" style — but only invent numbers as obviously-illustrative, never as fake proof).

**Say:** AI implementation · workforce enablement · AI rollout · workflow automation · knowledge systems ·
internal champions · measured rollout · secure deployment · existing-tool leverage.
**Avoid:** AI LMS · course/training platform · chatbot builder · automation freelancer · "AI hacks" · prompt tricks.

## 3. Brand swap rules (apply on every page)

- Replace every visible "AI Ed" / "AI Ed by QuarterSmart" / "AIEd" → **"QuarterSmart"**.
- Remove "powered by QuarterSmart Secured LMS" and any "Secured LMS" phrasing.
- **Logos:** replace AI Ed logo `<img>`s. Old refs look like
  `logos/transparent/wordmark-boxed/aied-wordmark-boxed-white-...png` or `.../icon/aied-icon-white-...png`.
  New nav logo lockup (mark + text, font-independent):

  ```html
  <a class="nav-logo" href="./">
    <img src="logos/quartersmart-mark.svg" alt="QuarterSmart" width="26" height="26">
    <span style="font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-0.02em;color:var(--text,#f0f4f8);font-size:18px;">QuarterSmart</span>
  </a>
  ```
  (Use `../logos/quartersmart-mark.svg` on subdir pages. Keep the page's existing `nav-logo` class/href so
  CSS still applies. If the logo `<img>` has no surrounding text, add the `<span>`.)
  For nav-CTA buttons that used an icon image, drop the icon and keep **text only** (e.g., "Talk to us").
- **Favicon:** ensure these are in `<head>` (root pages; use `../` for subdir):
  ```html
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  ```
- **Footer:** "QuarterSmart — AI implementation & workforce enablement." Keep links to https://quartersmart.com.
- Email addresses: keep `learn@aied.dev` / `privacy@aied.dev` as-is for now (domain TBD) UNLESS the page
  already uses a quartersmart.com address.

## 4. SEO / AEO rules (from seo-geo + seo-content skills)

- **Title formula:** `<Primary value> — QuarterSmart` (≤ 60 chars). Meta description 140–160 chars, benefit + outcome.
- **Citable passages (AEO):** Each major section should open with a **direct answer in the first 40–60 words**.
  Include at least one **self-contained 134–167 word block** that answers an implied question and could be
  quoted by an AI engine without surrounding context.
- **Question-style H2/H3** where natural ("What does an AI rollout actually involve?", "Who is Hyrum Hurst?").
- Short paragraphs; use lists/tables for multi-item or comparative content. Add a visible **"Last updated"**
  date on content/legal pages (use 2026-06-08).
- **Entity clarity:** establish "QuarterSmart" (Organization) and "Hyrum Hurst" (Person, founder) explicitly;
  repeat the canonical description; cross-link the About page.
- **JSON-LD** (add inside `<head>` or end of `<body>`; use absolute https://aied.dev/... URLs for now):
  - Every page: `Organization` (or reference it) + `WebSite`.
  - Home: `Organization` + `WebSite` + `Service` (the rollout offers) + `FAQPage` if the page has FAQs.
  - About: `Person` (Hyrum Hurst, founder, with `sameAs`) + `ProfilePage` + `BreadcrumbList`.
  - Others: `WebPage` + `BreadcrumbList`.
  Organization block to reuse (adapt per page):
  ```html
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Organization","name":"QuarterSmart",
   "url":"https://aied.dev/","description":"AI implementation and workforce enablement partner. QuarterSmart helps organizations assess, train, pilot, automate, scale, and measure AI adoption.",
   "founder":{"@type":"Person","name":"Hyrum Hurst"},
   "sameAs":["https://quartersmart.com","https://n8n.io/creators/hyrum/"]}
  </script>
  ```
  Person block for About:
  ```html
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Person","name":"Hyrum Hurst",
   "jobTitle":"Founder","worksFor":{"@type":"Organization","name":"QuarterSmart","url":"https://aied.dev/"},
   "description":"Founder of QuarterSmart, an AI implementation and workforce enablement company. Verified n8n creator with 25 public workflow templates.",
   "knowsAbout":["AI implementation","workforce enablement","workflow automation","AI adoption","secure deployment"],
   "sameAs":["https://n8n.io/creators/hyrum/","https://quartersmart.com"]}
  </script>
  ```

## 5. Reusable copy blocks

- **Home hero (H1):** *AI implementation and workforce enablement for teams that need rollout, not hype.*
- **Home subhead:** *QuarterSmart helps organizations identify the right AI opportunities, build workforce
  fluency, pilot high-friction workflows, automate real work, and scale what proves out.*
- **Proof bar:** Strategy-led · Developer-forward · Built for real operations · Secure when needed ·
  Verified n8n creator with 25 public workflow templates.
- **Primary CTA:** *Book an AI Rollout Assessment.* Secondary: *See how QuarterSmart works.*
- **Method section:** the 6 steps (Assess/Train/Pilot/Automate/Scale/Measure) with one line each.
- **Services (no LMS):** AI Rollout Assessment · Leadership & Team Enablement · Pilot & Workflow Prototyping ·
  Workflow Automation & Integration · Knowledge Systems & AI Assistants · Measurement & Optimization ·
  (Custom Systems & Secure Deployment).
- **Founder line:** *Hyrum Hurst is the founder of QuarterSmart, an AI implementation and workforce
  enablement company. He is a verified n8n creator with 25 public workflow templates.*

## 6. Per-page intent

| Page | Treatment | Focus |
|---|---|---|
| `index.html` | FULL | Reposition home around AI implementation/enablement; method spine; services (no LMS); proof; founder teaser → About; FAQ; strong CTAs. Org+WebSite+Service(+FAQ) schema. |
| `teams/index.html` | FULL | Audience = companies/operational teams. Rollout for real workflows; enablement + champions; pilots; measurement. Keep rocket/ignite animation. |
| `government/index.html` | FULL | Audience = government/public sector. Lead with secure/air-gapped deployment, governance, compliance; still implementation-partner (not LMS). |
| `schools/index.html` | FULL | Audience = schools/education orgs as an OPERATIONAL buyer (staff/admin AI enablement & workflow automation) — NOT selling courses/LMS. Frame as helping the institution implement AI for its teams. |
| `radar.html` | FULL | "Signals" — QuarterSmart's AI news/insight hub. Rebrand only; keep the radar animation; reframe intro as QuarterSmart insight, not AI Ed. |
| `coming-soon.html` | FULL | Generic QuarterSmart coming-soon + waitlist; no LMS. |
| `about.html` | DONE | Already QuarterSmart-voiced; just confirm consistency + ensure Person/ProfilePage schema present. |
| `privacy.html`, `terms.html` | LIGHT | Brand-swap (QuarterSmart, drop LMS), update title/meta, add WebPage schema, keep legal body. |
| `signals/*.html` (6) | LIGHT | Brand-swap nav/footer/author/meta to QuarterSmart, drop LMS, add Article+Organization schema. Keep the editorial article body. |

## 7. QA checklist (every page must pass)

- [ ] Zero occurrences of: "AI Ed", "AIEd", "LMS", "Secured LMS", "course", "instructional design".
- [ ] Logo + favicon swapped to QuarterSmart; nav logo shows mark + "QuarterSmart".
- [ ] `<title>` and meta description updated (QuarterSmart, no LMS, ≤60 / 140–160 chars).
- [ ] At least one self-contained citable passage + a question H2 (on content pages).
- [ ] JSON-LD present and valid for the page type.
- [ ] `<style>`/`<script>`/animation code and asset path depth UNCHANGED.
- [ ] Internal links still resolve (relative, correct depth).
