import sharp from "sharp";
import { existsSync, statSync, readFileSync, writeFileSync } from "node:fs";

const SCRATCH = "C:/Users/hyrum/AppData/Local/Temp/claude/C--Users-hyrum-OneDrive-Desktop-ClaudeCode/0ea7b6cb-16e0-4823-807f-6da33a04ea63/scratchpad";
const ASSETS = "assets/images/signals";
const W = 1200, H = 800, MARGIN = 30, WM_W = 270;

// Watermark prepared once at target width
const wmBuf = await sharp("assets/signals-watermark.png").resize({ width: WM_W }).png().toBuffer();
const wmH = (await sharp(wmBuf).metadata()).height;

const jobs = [
  [SCRATCH + "/mythos-raw.png", "claude-mythos-sandbox-escape-cover.jpg"],
  [SCRATCH + "/glasswing-raw.png", "anthropic-project-glasswing-tech-avengers-cover.jpg"],
  [SCRATCH + "/fable5-raw.png", "fable-5-cover.jpg"],
  [SCRATCH + "/freeai-raw.png", "free-claude-pro-gpt-codex-students-cover.jpg"],
  [SCRATCH + "/thirdparty-raw.png", "anthropic-killed-third-party-access-cover.jpg"],
  [SCRATCH + "/pricing-raw.png", "openai-pricing-changes-2026-cover.jpg"],
  [SCRATCH + "/weekly-raw.png", "weekly-advancements-apr-22-2026-cover.jpg"],
  // Re-watermark the 3 existing QS-era covers so all are consistent
  [ASSETS + "/sops-to-aops-cover.jpg", "sops-to-aops-cover.jpg"],
  [ASSETS + "/stretch-ai-budget-cover.jpg", "stretch-ai-budget-cover.jpg"],
  [ASSETS + "/why-ai-pilots-fail-cover.jpg", "why-ai-pilots-fail-cover.jpg"],
];

for (const [src, name] of jobs) {
  if (!existsSync(src)) { console.log("MISSING " + src); continue; }
  const srcBytes = readFileSync(src); // detach from file so src===dest is safe
  const base = await sharp(srcBytes).resize(W, H, { fit: "cover", position: "centre" }).toBuffer();
  const outBuf = await sharp(base)
    .composite([{ input: wmBuf, top: H - wmH - MARGIN, left: W - WM_W - MARGIN }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  writeFileSync(ASSETS + "/" + name, outBuf);
  console.log(name + "  " + Math.round(statSync(ASSETS + "/" + name).size / 1024) + " KB");
}
console.log("done");
