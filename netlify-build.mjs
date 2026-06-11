// Netlify build: copy only the publishable site into dist/, stripping
// reference/handoff files (brand, research, docs, agent files) so they
// never reach the live site. Mirrors the GitHub Pages strip list.
import { cpSync, rmSync, mkdirSync, readdirSync } from "node:fs";

const EXCLUDE = new Set([
  ".git", ".github", "node_modules", "dist",
  "brand", "research", "docs",
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
