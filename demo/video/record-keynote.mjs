// Records the IURALEX keynote into a webm using Playwright Chromium recordVideo.
import { chromium } from '/Users/nicolasag/node_modules/playwright-core/index.mjs';

const OUT_DIR = '/Users/nicolasag/CRM-LEGAL/demo/video/frames-keynote/';
const HTML_URL = 'file:///Users/nicolasag/CRM-LEGAL/demo/video/keynote.html';

console.log('[rec] launching chromium...');
const browser = await chromium.launch({
  headless: true,
  executablePath: '/Users/nicolasag/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=medium']
});

const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT_DIR, size: { width: 1920, height: 1080 } }
});

const page = await context.newPage();
console.log('[rec] loading keynote.html...');
await page.goto(HTML_URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

console.log('[rec] capturing 82s timeline...');
const start = Date.now();
await page.waitForTimeout(82000);
console.log('[rec] elapsed', Date.now() - start, 'ms');

await page.close();
await context.close();
await browser.close();
console.log('[rec] done — webm in', OUT_DIR);
