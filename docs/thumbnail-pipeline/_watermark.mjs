import sharp from "sharp";
import { statSync } from "node:fs";
// 2x watermark (520x124) for crisp downscaling when composited
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="124" viewBox="0 0 520 124">
  <rect x="0" y="0" width="520" height="124" rx="26" fill="#060608" fill-opacity="0.46"/>
  <g transform="translate(22 16) scale(0.92)">
    <path d="M50 50 L50 7 A43 43 0 0 0 7 50 Z" fill="#0e5340"/>
    <path d="M50 50 L7 50 A43 43 0 0 0 50 93 Z" fill="#0e5340"/>
    <path d="M50 50 L50 93 A43 43 0 0 0 93 50 Z" fill="#0e5340"/>
    <path d="M50 50 L93 50 A43 43 0 0 0 50 7 Z" fill="#00e5a0"/>
    <rect x="48.4" y="6" width="3.2" height="88" fill="#060608"/>
    <rect x="6" y="48.4" width="88" height="3.2" fill="#060608"/>
  </g>
  <text x="140" y="80" font-family="Consolas, 'Courier New', monospace" font-size="54" font-weight="700" letter-spacing="1" fill="#f0f4f8">Signals</text>
</svg>`;
await sharp(Buffer.from(svg), { density: 96 }).png().toFile("assets/signals-watermark.png");
const m = await sharp("assets/signals-watermark.png").metadata();
console.log("watermark: " + m.width + "x" + m.height + ", " + Math.round(statSync("assets/signals-watermark.png").size / 1024) + " KB");
