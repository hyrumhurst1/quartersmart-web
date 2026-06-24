# QuarterSmart Design System

Brand, tokens, components, and a marketing-site UI kit for **QuarterSmart**, an AI implementation company in Mesa, Arizona.

> **Tagline:** Train your team. Automate the rest.

---

## 1. Company context

QuarterSmart builds **AI onboarding, training, and automation systems** for growing teams. The signature mechanic: each standard operating procedure (SOP) is turned into **two outputs from one source**:

1. A **training course** the team learns from (AI-generated video, quizzes, certification, owner dashboard).
2. An **automation** that runs the task itself (n8n, Zapier, Power Automate).

QuarterSmart builds, hosts, and maintains the system, then stays on call with coaching. It is **not** an LMS or a course platform; it is a services company that builds training-and-automation systems for clients.

Founders: **Hyrum Hurst** (the builder, Google Certified AI Automations Engineer, verified top-50 n8n creator) and **Cullen Brown** (engagement lead). The site is 7 pages plus a case-study detail page, mobile-first, dark theme.

### Sources used to build this system

- **Local codebase (content review build):** `rebrand-preview/` (mounted read-only). The finished rebrand copy for all 7 pages plus the Structure Properties detail page, with the brand tokens already in `style.css`. All page copy in this system is lifted close to verbatim from here.
- **GitHub repo:** https://github.com/hyrumhurst1/quartersmart-web — the live site source. Useful reference: `brand/BRAND.md` (palette + type spec), `logos/` (older "AI Ed"/Q marks, **not used** here), `index.html`, `about.html`. Explore this repo to build higher-fidelity work against the real product.

> Note: the repo's existing logo art is a **Q mark**. Per the brand owner, the final QuarterSmart mark is a **circle split into four equal quarters with the top-right quarter in brighter mint**, NOT a letter Q. This system ships a geometric **placeholder** of that four-quarters mark (`assets/qs-mark.svg`, and the `Logo` component). Replace with final art when available.

---

## 2. Content fundamentals

How QuarterSmart writes. Match this voice in any new copy.

- **Voice:** pragmatic, anti-hype builder. "We are builders, not gurus." No "10x", no hype, no future-of-AI sermons. Show the working thing.
- **Person:** second person ("your team", "your SOPs") talking about "we". Direct and plain.
- **Casing:** sentence case for headings and buttons. Mono labels/eyebrows are UPPERCASE with wide tracking.
- **Punctuation hard rule:** **NO em dashes or en dashes anywhere.** Commas and periods only. (This is a binding brand rule, honored throughout.)
- **Numbers:** specific and verifiable. "65% less onboarding time", "36% fewer SOP mistakes", "10,000+ template uses", "39-course library", "seven roles". Never invent or inflate. Metrics are uses-not-people where relevant.
- **No pricing anywhere.** Ever.
- **CTAs:** exactly two labels, nothing else: **"Book a call"** and **"Request a proposal"**.
- **Recurring phrases:** "Same source, two outputs." / "Your SOPs do double duty." / "Train your team. Automate the rest." / "land, build, automate, coach, retain." / "ends at a recurring baseline, not at zero."
- **Emoji:** none.
- **Vibe:** confident, calm, concrete. Sentences are short. Claims are backed by a number or a named client (Structure Properties, Learning Journey AI, Skytech).

---

## 3. Visual foundations

- **Theme:** dark only. Near-black canvas `#060608`, a single mint accent. No second hue, no rainbow.
- **Color:** mint `#00e5a0` (primary: mark, CTAs, accents) and bright mint `#1ffdb3` (hover/glow/emphasis). Text off-white `#f0f4f8`, muted `#8b95a5`. Surfaces are layered near-blacks (`#0c1016` → `#161c26`). The only colored fills are **low-alpha mint tints**; everything else is a dark surface or a hairline.
- **Type:** two families. **Space Grotesk** carries display + body; **JetBrains Mono** carries eyebrows, labels, numbers, and the "system" voice. Display is tight-tracked (`-0.02em`) and heavy (700). Body runs 1.65 line height. Mono eyebrows are 12px uppercase with `0.14em` tracking.
- **Spacing:** 4px base grid. Generous negative space is a feature, not a bug. Prose columns cap at ~760px; page content at ~1120px.
- **Backgrounds:** flat near-black. No photographic hero images, no stock photography, no gradients-as-decoration. The one recurring graphic is the **four-quarters mark**, used oversized and faint as a hero motif with the top-right quarter lit.
- **Signature motif:** "one source, two outputs." A single source block forks into two output cards (training course + automation). Rendered cleanly with hairlines, **not** as a node-graph / connected-dots / circuit / branching diagram (that reads too close to n8n and is deliberately avoided).
- **Borders:** 1px hairlines at white 8% (`--border-hairline`); mint 32% (`--border-mint`) for emphasis/focus. Depth comes from surface + hairline, not heavy drop shadows.
- **Corners:** soft and consistent. `sm 6 / md 10 / lg 16 / xl 24` px, pill for badges.
- **Cards:** raised dark surface, hairline border, quiet shadow. Interactive cards lift 2px and gain a mint border on hover. One card may carry the mint **glow** (`--glow-mint`).
- **Shadows / glow:** quiet card shadow for depth; a single mint glow reserved for key CTAs and the lit motif. Avoid heavy blurred drop shadows.
- **Transparency / blur:** the sticky nav uses an 78%-opacity near-black with a 14px backdrop blur. Used sparingly, only for the nav.
- **Animation:** short and confident. `200ms` ease-out (`cubic-bezier(0.2,0.8,0.2,1)`). Fades and small translateY lifts. **No bounce, no springy overshoot, no infinite decorative loops.** Accordions animate `grid-template-rows`.
- **Hover states:** primary button brightens mint; secondary button border + text go mint; links go bright mint; cards lift + mint border.
- **Press states:** buttons nudge down 1px (`translateY(1px)`). No color flip.
- **Imagery vibe:** there is essentially none by default; the brand is type-and-space driven. If imagery is added later, keep it cool, dark, and low-key to sit on near-black.

---

## 4. Iconography

QuarterSmart's source site uses **almost no icons**. It is intentionally type-driven. The conventions this system follows:

- **The mark** is the only proprietary glyph: the four-quarters circle (`assets/qs-mark.svg`, and the `Logo` component which inlines it as SVG so it needs no asset path).
- **Numbers as icons.** The site's structure is numbered ("1. AI enablement, 2. SOPs to training, ..."). `FeatureCard` uses a mono **step-number badge** instead of a decorative icon. Prefer this.
- **Mono dots / unicode arrows.** Small affordances use a mint square dot or a plain `→` (mono). No icon font is bundled.
- **No emoji.** Never.
- If a future surface genuinely needs UI icons, use a thin line set (e.g. Lucide via CDN) at ~1.5px stroke to match the hairline weight, and document it. **Do not** hand-draw SVG illustrations or use filled/duotone icon styles. None is bundled today because the brand does not use one. *(Substitution note: there is no icon set in the source codebase to import.)*

---

## 5. Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this one file; `@import` lines only).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `assets/qs-mark.svg` — placeholder four-quarters mark.
- `readme.md` — this file. `SKILL.md` — Agent-Skills wrapper.

**Foundation cards** (`guidelines/`, shown in the Design System tab)
- Brand: logo lockup, one-source-two-outputs motif.
- Colors: core palette, surfaces & borders, mint tints.
- Type: display & headings, body & lede, mono labels.
- Spacing: scale, radii.

**Components** (`components/<group>/`, namespace `window.QuarterSmartDesignSystem_bb5692`)
- `core/` — **Button**, **Eyebrow**, **Badge**, **Logo**
- `data/` — **Stat** (metric callout)
- `cards/` — **Card**, **FeatureCard**, **CaseStudyCard**
- `navigation/` — **NavBar**, **Footer**
- `disclosure/` — **Accordion** (FAQ)

Each component directory has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a `@dsCard` showcase HTML.

**UI kit** (`ui_kits/website/`)
- `index.html` — interactive 7-page marketing site. Click the nav to move between Home, Services, Case Studies (+ Structure Properties detail), About, For Agencies, FAQ, Contact. Hash-routed, mobile-first.
- `shared.jsx` — SiteShell (router), Section, SectionHeading, Prose, DoubleDuty diagram, QuartersMotif, TrustRow, CTASection.
- `screens-home.jsx`, `screens-services.jsx`, `screens-cases.jsx`, `screens-misc.jsx` — the page screens.

---

## 6. Using this system

In any `@dsCard` HTML or consuming page, link `styles.css`, load `_ds_bundle.js`, then:

```js
const { Button, NavBar, Footer, FeatureCard, CaseStudyCard, Stat, Accordion, Logo } =
  window.QuarterSmartDesignSystem_bb5692;
```

Honor the hard rules: dark theme, mint accent only, no em/en dashes, no pricing, CTAs are only "Book a call" / "Request a proposal", numbers must be verifiable, no emoji.
