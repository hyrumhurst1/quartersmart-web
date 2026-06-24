---
name: quartersmart-design
description: Use this skill to generate well-branded interfaces and assets for QuarterSmart, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## QuarterSmart at a glance

- AI implementation company. Turns each SOP into **two outputs from one source**: a training course and an automation. Tagline: "Train your team. Automate the rest."
- **Dark theme only.** Near-black `#060608`, single mint accent `#00e5a0` (bright `#1ffdb3`), text `#f0f4f8`, muted `#8b95a5`.
- Fonts: **Space Grotesk** (display + body), **JetBrains Mono** (eyebrows, labels, numbers).
- Mark: a circle split into four equal quarters, top-right quarter brighter mint. Placeholder in `assets/qs-mark.svg` and the `Logo` component. NOT a letter Q.

## Hard rules (non-negotiable)

- **No em dashes or en dashes.** Commas and periods only.
- **No pricing** anywhere.
- Only two CTA labels: **"Book a call"** and **"Request a proposal"**.
- Pragmatic, anti-hype builder voice. No "10x", no gurus. Numbers must be specific and verifiable.
- No emoji. Not an LMS or course platform.

## Key files

- `readme.md` — full design guide: content voice, visual foundations, iconography, component + token index.
- `styles.css` + `tokens/` — link `styles.css` for all CSS custom properties and webfonts.
- `components/` — React primitives (Button, Badge, Eyebrow, Logo, Stat, Card, FeatureCard, CaseStudyCard, NavBar, Footer, Accordion). Load `_ds_bundle.js` and read from `window.QuarterSmartDesignSystem_bb5692`.
- `ui_kits/website/` — full interactive 7-page marketing site recreation to copy patterns from.
- `guidelines/` — foundation specimen cards.
