import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "signals";
const CORNER = [
  { slug: "sops-to-aops", label: "What an AOP is" },
  { slug: "stretch-ai-budget", label: "Stretch your AI budget" },
  { slug: "why-ai-pilots-fail", label: "Why 95% of pilots fail" },
];
const RSS = '  <link rel="alternate" type="application/rss+xml" title="QuarterSmart Signals" href="/feed.xml">\n';

let touched = 0;
for (const f of readdirSync(DIR)) {
  if (!f.endsWith(".html")) continue;
  const path = join(DIR, f);
  let html = readFileSync(path, "utf8");
  const slug = f.replace(/\.html$/, "");
  let changed = false;

  // 1. RSS feed autodiscovery link in <head> (idempotent), all signals pages incl. hub
  if (!html.includes('type="application/rss+xml"') && html.includes("</head>")) {
    html = html.replace("</head>", RSS + "</head>");
    changed = true;
  }

  // 2. Author byline + read-next block, posts only (skip the hub index)
  if (f !== "index.html" && !html.includes('class="qs-section qs-bordered post-end"') && html.includes("</main>")) {
    const links = CORNER.filter((c) => c.slug !== slug)
      .map((c) => `<a href="/signals/${c.slug}">${c.label}</a>`)
      .concat('<a href="/signals/">All Signals</a>')
      .join(" &middot; ");
    const block = `
  <!-- Author byline + read next (E-E-A-T + internal linking) -->
  <section class="qs-section qs-bordered post-end">
    <div class="qs-wrap qs-wrap--prose">
      <div class="post-author">
        <img class="post-author__img" src="/assets/images/team/hyrum-hurst.webp" alt="Hyrum Hurst" width="64" height="64" loading="lazy">
        <div>
          <p class="post-author__name">Hyrum Hurst</p>
          <p class="post-author__bio">Founder of QuarterSmart and a verified n8n creator. He builds local-model and agent systems for growing teams and writes Signals on how AI adoption actually works in practice. <a href="/about/#hyrum-hurst">More about Hyrum</a>.</p>
        </div>
      </div>
      <p class="post-more"><span class="post-more__label">Read next</span> ${links}</p>
    </div>
  </section>
`;
    html = html.replace("</main>", block + "</main>");
    changed = true;
  }

  if (changed) { writeFileSync(path, html); touched++; console.log("updated " + f); }
}
console.log(`post-end: touched ${touched} files`);
