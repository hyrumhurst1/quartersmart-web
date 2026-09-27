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
  "brand", "research", "docs", "design-system", "tmp", "_partials", "_proto", "graveyard", ".build.lock", ".claude",
  "AGENTS.md", "CLAUDE.md", "README.md", "HANDOFF.md", "ENTITY_HANDOFF.md",
  "netlify.toml", "netlify-build.mjs", ".gitignore", ".nojekyll", "netlify",
]);

// Serialize local builds (several agents may build at once). mkdir is atomic.
const LOCK = ".build.lock";
for (let i = 0; ; i++) {
  try { mkdirSync(LOCK); break; } catch {
    if (i > 900) rmSync(LOCK, { recursive: true, force: true }); // stale lock after ~90s
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  }
}
process.on("exit", () => { try { rmSync(LOCK, { recursive: true, force: true }); } catch { /* gone */ } });

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
let n = 0;
for (const e of readdirSync(".", { withFileTypes: true })) {
  if (EXCLUDE.has(e.name)) continue;
  cpSync(e.name, "dist/" + e.name, { recursive: true });
  n++;
}
console.log(`netlify-build: copied ${n} top-level entries into dist/`);

// --- Shared chrome: replace <!-- @include name --> with _partials/name.html,
// then mark the current page's nav links with aria-current. One nav and one
// footer for the whole site instead of 25 hand-kept copies.
{
  const partials = {};
  for (const f of readdirSync("_partials")) partials[f.replace(/\.html$/, "")] = readFileSync(join("_partials", f), "utf8");
  let pages = 0;
  const walkInc = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { if (e.name !== "assets") walkInc(join(dir, e.name), prefix + "/" + e.name); continue; }
      if (!e.name.endsWith(".html")) continue;
      const file = join(dir, e.name);
      let h = readFileSync(file, "utf8");
      if (!h.includes("<!-- @include")) continue;
      h = h.replace(/<!-- @include ([\w-]+) -->/g, (m, name) => {
        if (!(name in partials)) throw new Error(`missing partial ${name} in ${file}`);
        return partials[name];
      });
      // Current section: /signals/foo.html -> /signals/ ; /index.html -> /
      const section = prefix === "" ? "/" : "/" + prefix.split("/")[1] + "/";
      h = h.replace(/<a ([^>]*?)data-nav href="([^"]+)"/g, (m, pre, href) =>
        `<a ${pre}href="${href}"` + (href === section ? ' aria-current="page"' : ""));
      writeFileSync(file, h);
      pages++;
    }
  };
  walkInc("dist", "");
  console.log(`netlify-build: injected shared partials into ${pages} pages`);
}

// --- Signals index: read every post's meta and render the hub list plus a
// JSON copy for the radar. Adding a post file is all it takes to list it.
{
  const meta = (h, attr, key) => {
    const m = h.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`));
    return m ? m[1] : "";
  };
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const unesc = (t) => t.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
  const posts = [];
  for (const f of readdirSync("dist/signals")) {
    if (!f.endsWith(".html") || f === "index.html") continue;
    const h = readFileSync(join("dist/signals", f), "utf8");
    const title = unesc(meta(h, "property", "og:title"));
    if (!title) continue;
    posts.push({
      url: "/signals/" + f.replace(/\.html$/, ""),
      title,
      desc: unesc(meta(h, "name", "description") || meta(h, "property", "og:description")),
      date: (h.match(/"datePublished": "([^"]+)"/) || [])[1] || "",
      kind: meta(h, "name", "qs:kind") || "insight",
      label: unesc(meta(h, "name", "qs:label")) || "Insight",
      verdict: unesc(meta(h, "name", "qs:verdict")) || "",
      cover: meta(h, "name", "qs:cover"),
    });
  }
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  const fmt = (d) => d ? new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";
  const rows = posts.map((p) => `<li data-kind="${p.kind}" data-text="${esc((p.title + " " + p.desc + " " + p.label).toLowerCase())}"><a href="${p.url}">
  <span class="sig__date">${fmt(p.date)}</span>
  <span><span class="sig__t">${esc(p.title)}</span><span class="sig__d">${esc(p.desc)}</span></span>
  <span class="sig__cell sig__cell--a"><span class="label">status</span><span class="chip chip--${p.kind}">${esc(p.label)}</span></span>
  ${p.verdict ? `<span class="sig__cell sig__cell--v"><span class="label">verdict</span><span class="verdict">${esc(p.verdict)}</span></span>` : ""}
</a></li>`).join("\n");
  const hub = "dist/signals/index.html";
  try {
    let h = readFileSync(hub, "utf8");
    h = h.replace("<!-- @signals-list -->", rows)
      .replace("<!-- @signals-json -->", `<script id="sig-data" type="application/json">${JSON.stringify(posts).replace(/</g, "\\u003c")}</script>`)
      .replace(/<!-- @signals-count -->/g, String(posts.length));
    writeFileSync(hub, h);
    console.log(`netlify-build: rendered ${posts.length} Signals into the hub`);
  } catch (err) {
    console.log(`netlify-build: Signals hub skipped (${err.message})`);
  }
}

// --- Cache-bust: /assets/* is served immutable for a year, so every asset link in the built
// HTML gets ?v=<content hash>. Changing a file changes its URL; unchanged files stay cached. ---
try {
  const { createHash } = await import("node:crypto");
  const { existsSync } = await import("node:fs");
  const hashes = new Map();
  const hashOf = (rel) => {
    if (!hashes.has(rel)) {
      const f = join("dist", rel);
      hashes.set(rel, existsSync(f) ? createHash("sha1").update(readFileSync(f)).digest("hex").slice(0, 10) : null);
    }
    return hashes.get(rel);
  };
  let n = 0;
  const walkBust = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { if (e.name !== "assets") walkBust(join(dir, e.name)); continue; }
      if (!e.name.endsWith(".html")) continue;
      const file = join(dir, e.name);
      const h = readFileSync(file, "utf8");
      const out = h.replace(/((?:href|src)=")(\/assets\/[^"?#]+\.(?:css|js|png|webp|jpe?g|svg|gif))(?:\?[^"#]*)?"/g, (m, pre, path) => {
        const v = hashOf(path.slice(1));
        if (!v) return m;
        n++;
        return `${pre}${path}?v=${v}"`;
      });
      if (out !== h) writeFileSync(file, out);
    }
  };
  walkBust("dist");
  console.log(`netlify-build: cache-bust stamped ${n} asset links`);
} catch (err) {
  console.log(`netlify-build: cache-bust skipped (${err.message})`);
}

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
        const path = e.name === "index.html" ? prefix + "/" : prefix + "/" + e.name.replace(/\.html$/, "");
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
      const posts = uniqE.filter((e) => e.url.includes("/signals/") && e.url !== BASE + "/signals/" && !/\/signals\/(policy|log)\/$/.test(e.url) && e.title);
      posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      const items = posts.map((p) => `  <item>\n    <title>${p.title}</title>\n    <link>${p.url}</link>\n    <guid isPermaLink="true">${p.url}</guid>\n    <pubDate>${new Date((p.date || today) + "T08:00:00Z").toUTCString()}</pubDate>\n    <description>${p.desc}</description>\n  </item>`).join("\n");
      const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>QuarterSmart Signals</title>\n  <link>${BASE}/signals/</link>\n  <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>\n  <description>Operator-focused reads on the models, tools, and shifts that change how teams adopt and run AI. By Hyrum Hurst, QuarterSmart.</description>\n  <language>en-us</language>\n  <lastBuildDate>${new Date(today + "T08:00:00Z").toUTCString()}</lastBuildDate>\n${items}\n</channel>\n</rss>\n`;
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
