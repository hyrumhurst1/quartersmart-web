import { readFileSync, writeFileSync } from "node:fs";
const D = "signals/";
const A = "/assets/images/signals/";
const report = [];

// [file, pngBase, inlineOld, inlineNew]  (inline tags are single-line => CRLF-safe)
const POSTS = [
  ["mythos.html", "claude-mythos-sandbox-escape-cover",
    `<img class="qs-article-cover" src="${A}claude-mythos-sandbox-escape-cover.png" alt="Claude Mythos AI breaking out of a shattered digital sandbox with green energy, Anthropic's most powerful AI model escaped containment" width="1120" height="630">`,
    `<img class="qs-article-cover" src="${A}claude-mythos-sandbox-escape-cover.jpg" alt="A dark cube shattering as mint-green network energy escapes it, representing Claude Mythos breaking out of its sandbox" width="1200" height="800" loading="lazy" decoding="async">`],
  ["glasswing.html", "anthropic-project-glasswing-tech-avengers-cover",
    `<img class="qs-article-cover" src="${A}anthropic-project-glasswing-tech-avengers-cover.png" alt="Project Glasswing war room with tech company logos including Microsoft, Apple, Google, and CrowdStrike surrounding a holographic AI brain, Anthropic's cyber defense coalition" width="1120" height="630">`,
    `<img class="qs-article-cover" src="${A}anthropic-project-glasswing-tech-avengers-cover.jpg" alt="A constellation of connected nodes forming a protective dome over a dark landscape, representing a cyber-defense coalition of organizations" width="1200" height="800" loading="lazy" decoding="async">`],
  ["fable-5.html", "fable-5-cover",
    `<img src="${A}fable-5-cover.png" alt="The word Mythos crossed out above the words Fable 5 in mint green, Anthropic renamed its most capable AI model" loading="lazy" width="1200" height="630">`,
    `<img src="${A}fable-5-cover.jpg" alt="An open book of dark glass with a column of mint-green light rising from its pages, representing the model renamed Fable" loading="lazy" width="1200" height="800" decoding="async">`],
  ["free-ai-students.html", "free-claude-pro-gpt-codex-students-cover",
    `<img src="${A}free-claude-pro-gpt-codex-students-cover.png" alt="Student laptop with glowing AI tool icons including Claude and GPT floating above the screen in a dark study setup, free AI tools for students guide" loading="lazy">`,
    `<img src="${A}free-claude-pro-gpt-codex-students-cover.jpg" alt="A student laptop glowing mint-green with floating AI tool icons and a graduation-cap motif, representing free AI tools for students" loading="lazy" width="1200" height="800" decoding="async">`],
  ["third-party-killed.html", "anthropic-killed-third-party-access-cover",
    `<img src="${A}anthropic-killed-third-party-access-cover.png" alt="Glowing green chain breaking apart with explosive energy, representing Anthropic cutting off third-party API access to Claude" loading="lazy" width="1120" height="560">`,
    `<img src="${A}anthropic-killed-third-party-access-cover.jpg" alt="A glowing mint-green chain snapping apart in the dark, representing cut-off third-party access to Claude" loading="lazy" width="1200" height="800" decoding="async">`],
  ["openai-pricing.html", "openai-pricing-changes-2026-cover",
    `<img class="qs-article-cover" src="${A}openai-pricing-changes-2026-cover.png" alt="OpenAI logo with pricing tiers fanning out as light beams, Free, Plus, Pro, and Enterprise tiers visualized with dollar signs dissolving into particles" width="1120" height="560" loading="lazy">`,
    `<img class="qs-article-cover" src="${A}openai-pricing-changes-2026-cover.jpg" alt="Stacked translucent glowing tiers of increasing height in the dark, representing restructured OpenAI pricing" width="1200" height="800" loading="lazy" decoding="async">`],
];

for (const [file, base, inOld, inNew] of POSTS) {
  let h = readFileSync(D + file, "utf8");
  const before = h;
  if (h.includes(inOld)) h = h.replace(inOld, inNew);
  else report.push("  WARN inline tag not found: " + file);
  h = h.replaceAll(base + ".png", base + ".jpg"); // og + twitter + schema (full URLs)
  if (h !== before) { writeFileSync(D + file, h); report.push("wired " + file); }
  else report.push("  NOCHANGE " + file);
}

// --- Weekly: og path differs, no inline cover (CSS banner), text hub card ---
{
  const file = "weekly-advancements-apr-22-2026.html";
  let h = readFileSync(D + file, "utf8");
  const before = h;
  h = h.replaceAll("https://quartersmart.com/assets/images/og/og-weekly.png",
    "https://quartersmart.com/assets/images/signals/weekly-advancements-apr-22-2026-cover.jpg");
  h = h.replace('<meta property="og:image:height" content="630">', '<meta property="og:image:height" content="800">');
  // Swap the CSS gradient banner for a real cover image (newline-agnostic match through the article-body comment)
  const coverBlock = `  <!-- Cover -->\n  <div class="qs-wrap" style="margin-bottom:var(--sp-7)">\n    <img src="${A}weekly-advancements-apr-22-2026-cover.jpg" alt="A mint-green radar sweep over a dark grid with a few bright blips, this week in AI" loading="lazy" width="1200" height="800" style="display:block;width:100%;height:auto;border:1px solid var(--border-hairline);border-radius:var(--radius-lg)">\n  </div>\n\n  `;
  h = h.replace(/<!-- Banner[\s\S]*?<\/div>\s*(?=<!-- Article body -->)/, coverBlock);
  if (h !== before) { writeFileSync(D + file, h); report.push("wired weekly (og + banner->cover)"); }
  else report.push("  NOCHANGE weekly");
}

// --- Hub: swap card covers png->jpg + weekly text card -> image card ---
{
  const file = "index.html";
  let h = readFileSync(D + file, "utf8");
  const before = h;
  for (const b of ["claude-mythos-sandbox-escape-cover", "anthropic-project-glasswing-tech-avengers-cover",
    "fable-5-cover", "free-claude-pro-gpt-codex-students-cover", "anthropic-killed-third-party-access-cover",
    "openai-pricing-changes-2026-cover"]) {
    h = h.replaceAll(b + ".png", b + ".jpg");
  }
  const genCard = `<div class="sig-card__cover sig-card__cover--gen"><div><div class="k">Apr 21 &middot; 2026</div><div class="t">This Week<br>in AI</div></div></div>`;
  const imgCard = `<img class="sig-card__cover" src="${A}weekly-advancements-apr-22-2026-cover.jpg" alt="A mint-green radar sweep over a dark grid with bright blips, this week in AI" loading="lazy" width="400" height="150">`;
  if (h.includes(genCard)) h = h.replace(genCard, imgCard);
  else report.push("  WARN weekly gen card not found in hub");
  if (h !== before) { writeFileSync(D + file, h); report.push("wired hub"); }
  else report.push("  NOCHANGE hub");
}

console.log(report.join("\n"));
