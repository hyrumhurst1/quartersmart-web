// Frame strip: capture an element (default: the hero canvas) N times at a fixed interval
// and tile the frames into one PNG, so motion can be reviewed as a contact sheet.
// Usage: node tools/strip.mjs <url> <out.png> [selector=canvas[data-attract]] [frames=12] [everyMs=150] [w=1440] [h=900] [cols=4] [startWaitMs=600] [scrollY]
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/hyrum/Desktop/claude code/package.json');
const { chromium } = require('playwright');
const sharp = require('sharp');
const [url, out, sel = 'canvas[data-attract]', frames = '12', every = '150', w = '1440', h = '900', cols = '4', startWait = '600', sy] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, colorScheme: 'dark' });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
if (sy) await page.evaluate((y) => window.scrollTo(0, +y), sy);
await page.waitForTimeout(+startWait);
const el = await page.$(sel);
const shots = [];
for (let i = 0; i < +frames; i++) {
  const t0 = Date.now();
  shots.push(await el.screenshot());
  const wait = +every - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
}
const meta = await sharp(shots[0]).metadata();
const fw = Math.round(meta.width / 2), fh = Math.round(meta.height / 2), C = +cols, R = Math.ceil(shots.length / C);
const tiles = await Promise.all(shots.map((b) => sharp(b).resize(fw, fh, { kernel: 'nearest' }).png().toBuffer()));
await sharp({ create: { width: fw * C + (C - 1) * 4, height: fh * R + (R - 1) * 4, channels: 3, background: '#303030' } })
  .composite(tiles.map((b, i) => ({ input: b, left: (i % C) * (fw + 4), top: Math.floor(i / C) * (fh + 4) })))
  .png().toFile(out);
console.log(JSON.stringify({ out, frames: shots.length, errs }));
await browser.close();
