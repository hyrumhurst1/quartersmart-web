# Signals audit backlog (2026-06-28)

A 3-agent GEO/content/technical audit of the live Signals section ran after the traction +
thumbnail work. GEO readiness scored ~82/100; content is solid (all posts >1,500 words, zero em/en
dashes, author box + schema everywhere). The items below were FIXED the same night; the rest are
DEFERRED because they involve rewriting existing published copy (editorial judgment, owner's call) or
conflict with a binding rule.

## Fixed 2026-06-28
- HTML `meta name="author"` was "QuarterSmart" on 9 posts -> now "Hyrum Hurst" on all 10 posts.
- Removed a leftover visible "By QuarterSmart" byline div on openai-pricing (kept the read-time).
- llms.txt now enumerates all 10 Signals posts (individual URLs + summaries) for AI-crawler discovery.
- Author-bio link now underlined (WCAG 1.4.1; post accessibility 94 -> 98).

## Deferred — owner's call (editorial rewrites of existing posts)
1. **De-hype the older posts (HIGH for brand voice).** glasswing ("Tech Avengers", "superhuman hacker",
   "most dangerous AI tool") and mythos (title "Why That Should Terrify You", "staggering",
   "superhuman offensive capabilities") conflict with the anti-hype voice. The underlying numbers
   (4,700 vulnerabilities, 11x speed) are credible without the editorializing.
2. **Remove unsupported company claims (HIGH, matches "no broad company claims").** weekly-advancements
   has promo lines ("secure deployment is the backbone of our government and contractor work") not
   supported by the post. free-ai-students self-quotes ("There's genuinely no excuse", attributed to
   "QuarterSmart Signals") and uses "goldmine" / "best AI tools in the world".
3. **Stale-date notices (MEDIUM).** Six April-2026 posts cite specific prices/programs that will change;
   add a visible "Originally published / Last reviewed" line (and a pricing-disclaimer on openai-pricing).
4. **Operator takeaways (MEDIUM).** mythos and glasswing are news recaps with no "what this means for
   your team" section or path to a QS resource; add 200-300 words + link to a cornerstone post.
5. **FAQPage schema on the 7 older posts (HIGH for citability).** The 3 cornerstones have it; adding
   visible Q&A accordions + FAQPage schema to the older posts would raise their AI-citation odds.
6. **Citation quality (LOW).** Some older posts cite bare social/forum domains (x.com/sama,
   reddit.com/r/artificial); swap for article-level URLs or drop dead links.
7. **read-time in the eyebrow (LOW)** on 5 older posts, for consistency with the cornerstones.
8. **heading-order a11y (LOW).** Callout boxes use `<h4>` after an `<h2>`, skipping `<h3>`; change to
   `<h3>` (coordinate with the callout CSS) to clear the last a11y flag.

## Deferred — conflicts with a binding rule
- **Person @id uses `about.html#hyrum-hurst`, which now 301-redirects to `/about/`.** The audit
  recommends switching every @id to `/about/#hyrum-hurst`. NOT changed: ENTITY_HANDOFF designates the
  `about.html#...` @ids as the stable canonical IRIs (binding "stable @ids" rule). @ids are graph keys
  and need not resolve, so this is low-risk to leave. Owner should decide whether to re-canonicalize.

## Off-site (not a code fix)
- No Wikipedia entity for QuarterSmart/Hyrum limits the strongest brand-mention signal (long-term).
- GSC "Request indexing" on the newest post URLs is the fastest per-URL Google indexing nudge.
