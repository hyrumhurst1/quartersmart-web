# ENTITY HANDOFF — for agents building Hyrum Hurst's OTHER websites

> **Who this is for:** any AI agent working on hyrumhurst.com, hyrum-ai, the AI hub site, or any other
> Hyrum Hurst / QuarterSmart-adjacent web property. The agent managing **quartersmart.com** (the company
> site) maintains this file and that site; do NOT edit quartersmart.com from other projects.
> **Goal:** every site tells the SAME story with the SAME facts, so search engines and AI answer engines
> resolve one consistent entity graph instead of fragments.

Last updated: June 11, 2026.

---

## 1. The entity graph (memorize this)

- **QuarterSmart** = AI implementation and workforce enablement company, based in **Mesa, Arizona**,
  serving Arizona and organizations across the United States. NOT an LMS, course platform, or AI
  education brand (see hard rules). Method: six stages, **Assess, Train, Pilot, Automate, Scale, Measure**.
  Slogan: "We ship the AI your team actually uses."
- **Hyrum Hurst** = Founder of QuarterSmart. AI systems and automation specialist, based in Mesa, Arizona.
  Builds AI workflows with LLMs, n8n automations, internal tools; works in Claude Code daily.
- **Cullen Brown** = Operator and Outreach Manager at QuarterSmart. Runs outreach, client communication,
  and the path from first conversation to live rollout.

**Canonical machine-readable IDs (use these in schema sameAs / references, do not invent new ones):**
- Organization: `https://quartersmart.com/#organization`
- Hyrum (Person): `https://quartersmart.com/about.html#hyrum-hurst`
- Cullen (Person): `https://quartersmart.com/about.html#cullen-brown`

Personal sites (hyrumhurst.com, hyrum-ai, etc.) should mark up Hyrum as a Person whose `worksFor` /
`affiliation` points at the Organization @id above, and include the sameAs set below. When the personal
sites go live, their URLs should be ADDED to Hyrum's sameAs on quartersmart.com (tell the QS agent).

## 2. Verified profile + proof URLs (the sameAs set — all real, all checked)

- n8n creator profile: https://n8n.io/creators/hyrum-hurst
- LinkedIn: https://www.linkedin.com/in/hyrum-hurst-83a5a537a/
- Qwoted expert source: https://app.qwoted.com/sources/hyrum-hurst
- GitHub: https://github.com/hyrumhurst1
- CyberNews feature (Hyrum quoted on local AI models): https://cybernews.com/ai-news/tech-professionals-adapting-local-ai-models-for-diverse-applications/
- Workflow usage data + methodology page: https://quartersmart.com/workflow-usage/
- Company: https://quartersmart.com (about: https://quartersmart.com/about.html)

Do NOT invent other profile URLs. If a URL is unknown, leave it out.

## 3. THE NUMBERS — exact rules (this matters most)

- **The metric is USES, not people.** Correct claim: "QuarterSmart-built workflow templates have
  recorded **10,876 documented uses** across the n8n community (as of June 2026)." Rounded form:
  "more than 10,000 documented uses." NEVER say "10,000+ people/users run QuarterSmart workflows" or
  imply unique users, customers, or production deployments. The methodology page
  (quartersmart.com/workflow-usage/) defines the metric, shows the per-template table, and is the
  citation target. Link to it whenever the number is used.
- **25 published n8n templates.** Top templates by uses (June 2026): YouTube Shorts via Gemini/VEO
  (5,078), HVAC lead capture (1,723), consulting client onboarding (1,085), Telegram-to-video with
  Veo 3 (941), legal contract analysis (541).
- **Top-50 n8n creator worldwide (#49)** — verified creator badge on n8n. Owner-confirmed; the profile
  is the proof anchor. Personal stat: belongs on PERSONAL sites and quartersmart.com/about.html, but
  NOT presented as a QuarterSmart company stat on the QS homepage.
- **Structure Properties figures:** 4,000+ units, $500M+ portfolio (verified via their own press
  release). It is NOT a billion-dollar firm; never say "billion."
- Do NOT publish revenue, client counts, or any metric not listed here.

## 4. Hard style/positioning rules (owner directives — apply on ALL sites)

1. **NO EM DASHES (or en dashes) anywhere.** Use periods or commas. This is absolute.
2. **QuarterSmart is never positioned as an LMS, course studio, training platform, or AI education
   brand.** Banned framing for QS: "AI-powered LMS," "course development studio," "instructional
   design," "training infrastructure," "Secured LMS." Capabilities like knowledge systems, AI
   assistants, and secure deployment are fine; the LMS word and course-product framing are not.
   (Describing work Hyrum did FOR OTHER companies, like building Learning Journey AI's platform or
   Structure Properties' onboarding system, is fine; it is their product, not QuarterSmart's.)
3. **Factual, grounded, non-hype language.** No "#1 AI expert," no "best." Specific metrics over vague
   claims; timestamped data; verifiable links. If a claim cannot be backed by a link or owner-provided
   data, do not publish it.
4. One "X, not Y" rhetorical contrast per page maximum. Avoid AI-sounding copy patterns (triads,
   chained "so" clauses, "move the needle" filler).
5. Contact: **hyrum@quartersmart.com**.

## 5. Hyrum's full background (use for personal-site bios)

**Summary:** AI systems and automation specialist. Designs AI workflows with LLMs, builds end to end
automations and internal tools, leads AI adoption inside organizations. Heavy daily Claude Code use
across live client systems. Based in Mesa, Arizona.

**Work history (all real, owner-provided, fine to name on personal sites):**
- **QuarterSmart** — Founder and AI Automation Consultant (2025–present). AI agents and multi-step
  automations (Claude API, Claude Code, n8n, Zapier): AI-drafted email/SMS outreach, lead routing,
  CRM and data workflows, custom web apps on Next.js and Supabase.
- **Learning Journey AI** — AI Associate (2026–present). Washington DC AI education consultancy founded
  by **Nicholas Wagner, Ph.D.** (CEO). Wagner's public bio: Ph.D. in materials science and engineering
  from Northwestern; AAAS Science & Technology Policy Fellow at the National Science Foundation (AI R&D
  program evaluation); AI and national security work at the Institute for Defense Analyses; U.S. State
  Department Speakers Program; 10+ years across AI, policy, and national security. Hyrum builds and
  maintains the company platform and website, develops course creation workflows, and was a key designer
  on an "AI for Nonprofits" course co-created with Wagner. **The LJAI team led a hands-on AI coding
  workshop at the SCSP AI+ Expo in Washington DC** (verified on learningjourneyai.com/about, which also
  publicly lists Hyrum as AI Associate — link to it as third-party proof of the association).
- **Dual Logic** — AI Automation Consultant, contract (2026–present). Washington DC AI integration
  consultancy; Hyrum builds AI automations and LLM integrations used inside a 500 to 1,000 person
  software company.
- **Structure Properties** — contract (Nov 2025–May 2026). Built "Quackfolio," a custom white label
  onboarding system for this San Francisco property management firm (4,000+ units, $500M+ portfolio):
  7 roles, 39 training videos, Claude-integrated quiz gating, automated certification, compliance
  tracking. The company plans to roll it out as its own software.
- **Ability Builders** — pro bono (2026–present). Mesa, AZ nonprofit helping people with disabilities
  find and keep employment; Hyrum brings Claude Code and AI workflows into their operations.
- **Skytech** — Sales Representative and Trainer (2024–2026). Direct outreach lead gen; trained and
  onboarded 10+ team members. (The "I learned to sell, train, and ship door to door" origin story is
  owner-approved personal-brand material.)

**Press / expert status:** quoted as an AI automation expert in CyberNews (2026); registered expert
source on Qwoted (AI strategy, enterprise adoption, AI procurement, AI governance). Published a case
study in The AI Journal on how high schoolers use AI (three teachers, 100 students; classrooms allowing
AI openly had the LOWEST plagiarism rates). NOTE: the AI Journal byline says "founder of AI Ed and
QuarterSmart," which is stale; if you control any copy referencing it, the company is QuarterSmart.

**Certifications:** Google Certified AI Automations Engineer, Google Generative AI Leader, Google
Prompt Engineering, Google Data Analytics, Vanderbilt AI Automation Certification, plus Credly
marketing/HR and customer service/sales certifications.

**GitHub (hyrumhurst1):** six open-source AI tools, including an empirical Big-O complexity analyzer,
an AI code reviewer, and a load-testing observatory that writes its own health reports.

**Identity disambiguation (intentional):** the actor credit in "Loaded Monday" (2021) on IMDb and the
Arizona school athletics records ARE the same Hyrum Hurst. Owner strategy: do not link athletics
(Hudl etc.) from any site (he wants those de-emphasized; he plans to delete the Hudl profile). The
acting credit is neutral. Do not write "different people" disclaimers; just build the professional
entity densely so it dominates.

## 6. Old brands / history (do not resurrect)

- **AI Ed (aied.dev)** was the prior brand: a free AI literacy platform, later "powered by QuarterSmart
  Secured LMS." It is DEPRECATED. The plan of record: aied.dev should 301 to quartersmart.com (redirect
  not yet implemented; the old site may still be live). Never present AI Ed as a current brand. If
  mentioned at all: "QuarterSmart (formerly operating education projects under AI Ed)."
- Hyrum's old positioning ("custom AI-integrated LMS, AI Education, Onboarding, Instructional Design")
  is dead. Current positioning everywhere: **AI implementation and workforce enablement**.

## 7. Division of labor across sites

- **quartersmart.com** (managed by the QS agent, source of truth for company facts): company entity,
  services (/ai-implementation/, /workforce-enablement/, /n8n-automation/), workflow-usage methodology,
  About/team, Signals content hub. Has llms.txt, sitemap, IndexNow auto-ping, Bing Webmaster + GSC.
- **hyrumhurst.com / hyrum-ai (personal sites):** the PERSON entity. Goal: rank for "Hyrum Hurst" and
  "who is Hyrum Hurst," consolidate the personal story (builder, founder, the solar-to-AI arc, GitHub
  projects, press, certifications, work history incl. Learning Journey AI and Nick Wagner association).
  Use Person schema with `worksFor` → the QS Organization @id, the full sameAs set, and a link to
  quartersmart.com as "his company." Do NOT duplicate QuarterSmart's service pages or copy blocks
  verbatim (duplicate content hurts both); write personal-voice originals.
- **AI hub site:** if it is a content/resource property, attribute authorship to Hyrum Hurst with the
  same Person identity and link back to both other sites. Same hard rules apply.
- Every site should have its own llms.txt following the quartersmart.com pattern (short factual entity
  block, primary pages, people, evidence links).

## 8. Brand basics (if visual consistency is wanted)

Mint accent #00e5a0 (bright #1ffdb3) on near-black #060608, text #f0f4f8, muted #8b95a5.
Fonts: Space Grotesk (display/body) + JetBrains Mono (labels/numbers). Logo: mint "Q" with a white
quarter cut from the top-right; wordmark "QUARTERSMART". Assets live in the quartersmart-web repo
(`logos/`, `brand/`). Personal sites may differ visually; facts may not.

## 9. Quick copy blocks (paste-ready, no em dashes)

**Canonical company line:** "QuarterSmart is an AI implementation and workforce enablement company
based in Mesa, Arizona. It helps organizations move from scattered AI experiments to measurable
adoption through six stages: Assess, Train, Pilot, Automate, Scale, and Measure."

**Canonical Hyrum line:** "Hyrum Hurst is the founder of QuarterSmart, an AI implementation and
workforce enablement company based in Mesa, Arizona. He is a verified top-50 n8n creator whose 25
published workflow templates have recorded more than 10,000 documented uses across the n8n community.
His AI commentary has been featured in CyberNews, and he is a registered expert source on Qwoted."

**Canonical usage-metric line:** "QuarterSmart-built workflow templates have recorded 10,876 documented
uses across the n8n community as of June 2026. Methodology and per-template data:
quartersmart.com/workflow-usage/."
