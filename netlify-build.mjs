// Netlify build: copy only the publishable site into dist/, stripping
// reference/handoff files (brand, research, docs, agent files) so they
// never reach the live site. Then auto-generate sitemap.xml from the built
// pages and (on production deploys) ping IndexNow so search engines and AI
// answer engines re-crawl automatically. Set-and-forget: publishing a new
// page and pushing is all that is needed; this keeps the sitemap current.
import { cpSync, rmSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from "node:fs";
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
  const entries = [];
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        walk(join(dir, e.name), prefix + "/" + e.name);
      } else if (e.name.endsWith(".html") && e.name !== "404.html" && !/^google[0-9a-f]+\.html$/i.test(e.name)) {
        // (skip Google Search Console verification files like google<hash>.html)
        const path = e.name === "index.html" ? prefix : prefix + "/" + e.name.replace(/\.html$/, "");
        const url = path === "" ? BASE + "/" : BASE + path;
        let image = null, title = "", desc = "", date = "";
        try {
          const h = readFileSync(join(dir, e.name), "utf8");
          image = (h.match(/<meta property="og:image" content="([^"]+)"/) || [])[1] || null;
          title = (h.match(/<meta property="og:title" content="([^"]+)"/) || [])[1] || "";
          desc = (h.match(/<meta property="og:description" content="([^"]+)"/) || [])[1] || "";
          date = (h.match(/"datePublished": "([^"]+)"/) || [])[1] || "";
        } catch { /* ignore unreadable file */ }
        entries.push({ url, image, title, desc, date });
      }
    }
  };
  walk("dist", "");
  const seen = new Set();
  const uniqE = entries.filter((e) => !seen.has(e.url) && seen.add(e.url))
    .sort((a, b) => (a.url === BASE + "/" ? -1 : b.url === BASE + "/" ? 1 : a.url.localeCompare(b.url)));
  const uniq = uniqE.map((e) => e.url);

  if (uniq.length >= 5) {
    const today = new Date().toISOString().slice(0, 10);
    // Sitemap with Google image extension: each page lists its main image, tying the image to the page that should be cited.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
      uniqE.map((e) => `  <url><loc>${e.url}</loc><lastmod>${today}</lastmod>` + (e.image ? `<image:image><image:loc>${e.image}</image:loc></image:image>` : "") + `</url>`).join("\n") +
      `\n</urlset>\n`;
    writeFileSync("dist/sitemap.xml", xml);
    console.log(`netlify-build: generated sitemap.xml with ${uniq.length} urls (+ image entries)`);

    // RSS feed of Signals posts (discovery + readers + crawlers).
    try {
      const posts = uniqE.filter((e) => e.url.includes("/signals/") && e.url !== BASE + "/signals" && e.title);
      posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      const items = posts.map((p) => `  <item>\n    <title>${p.title}</title>\n    <link>${p.url}</link>\n    <guid isPermaLink="true">${p.url}</guid>\n    <pubDate>${new Date((p.date || today) + "T08:00:00Z").toUTCString()}</pubDate>\n    <description>${p.desc}</description>\n  </item>`).join("\n");
      const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>QuarterSmart Signals</title>\n  <link>${BASE}/signals</link>\n  <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>\n  <description>Operator-focused reads on the models, tools, and shifts that change how teams adopt and run AI. By Hyrum Hurst, QuarterSmart.</description>\n  <language>en-us</language>\n  <lastBuildDate>${new Date(today + "T08:00:00Z").toUTCString()}</lastBuildDate>\n${items}\n</channel>\n</rss>\n`;
      writeFileSync("dist/feed.xml", rss);
      console.log(`netlify-build: generated feed.xml with ${posts.length} posts`);
    } catch (err) {
      console.log(`netlify-build: RSS skipped (${err.message})`);
    }

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
