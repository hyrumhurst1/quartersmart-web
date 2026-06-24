// Netlify build: copy only the publishable site into dist/, stripping
// reference/handoff files (brand, research, docs, agent files) so they
// never reach the live site. Then auto-generate sitemap.xml from the built
// pages and (on production deploys) ping IndexNow so search engines and AI
// answer engines re-crawl automatically. Set-and-forget: publishing a new
// page and pushing is all that is needed; this keeps the sitemap current.
import { cpSync, rmSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const EXCLUDE = new Set([
  ".git", ".github", "node_modules", "dist",
  "brand", "research", "docs", "design-system", "tmp",
  "AGENTS.md", "CLAUDE.md", "README.md", "HANDOFF.md", "ENTITY_HANDOFF.md",
  "netlify.toml", "netlify-build.mjs", ".gitignore", ".nojekyll",
]);

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
let n = 0;
for (const e of readdirSync(".", { withFileTypes: true })) {
  if (EXCLUDE.has(e.name)) continue;
  cpSync(e.name, "dist/" + e.name, { recursive: true });
  n++;
}
console.log(`netlify-build: copied ${n} top-level entries into dist/`);

// --- Auto sitemap + IndexNow. Wrapped so it can NEVER fail the deploy. ---
try {
  const BASE = "https://quartersmart.com";
  const INDEXNOW_KEY = "d591360aa424cff14713dc6970f59a91";
  const SKIP_DIRS = new Set(["assets", "logos"]); // asset dirs, not pages
  const urls = [];
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        walk(join(dir, e.name), prefix + "/" + e.name);
      } else if (e.name.endsWith(".html") && e.name !== "404.html") {
        const path = e.name === "index.html" ? prefix : prefix + "/" + e.name.replace(/\.html$/, "");
        urls.push(path === "" ? BASE + "/" : BASE + path);
      }
    }
  };
  walk("dist", "");
  const uniq = [...new Set(urls)].sort((a, b) =>
    a === BASE + "/" ? -1 : b === BASE + "/" ? 1 : a.localeCompare(b));

  if (uniq.length >= 5) {
    const today = new Date().toISOString().slice(0, 10);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      uniq.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
      `\n</urlset>\n`;
    writeFileSync("dist/sitemap.xml", xml);
    console.log(`netlify-build: generated sitemap.xml with ${uniq.length} urls`);

    // Only ping IndexNow on the real production deploy, never previews.
    if (process.env.CONTEXT === "production") {
      try {
        const r = await fetch("https://api.indexnow.org/indexnow", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ host: "quartersmart.com", key: INDEXNOW_KEY, keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`, urlList: uniq }),
        });
        console.log(`netlify-build: IndexNow ping status ${r.status} for ${uniq.length} urls`);
      } catch (err) {
        console.log(`netlify-build: IndexNow ping skipped (${err.message})`);
      }
    } else {
      console.log("netlify-build: non-production context, IndexNow ping skipped");
    }
  } else {
    console.log(`netlify-build: only ${uniq.length} urls found, keeping committed sitemap.xml`);
  }
} catch (err) {
  console.log(`netlify-build: sitemap/IndexNow step skipped (${err.message})`);
}
