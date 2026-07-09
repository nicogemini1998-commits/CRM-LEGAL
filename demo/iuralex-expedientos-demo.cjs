'use strict';
/**
 * IURALEX — ExpedientOS Hero (60s) demo recorder.
 *
 * Third video in the series. Focused ONLY on the ExpedientOS module
 * (the "core nervous system" of IURALEX): expediente-centric workflow.
 *
 * Storyboard:
 *   0-4s   Login → /cases. Pan list, show area badges (Civil/Laboral/...).
 *   4-14s  Open one case → /cases/[id]. Linger on ficha viva.
 *   14-26s Pan documents section. Hover "Subir documento" (no upload).
 *   26-40s Sidebar → /chat (LEXIA). HERO: "Resume el expediente..."
 *   40-52s Sidebar → /plazos. Pan procedural deadlines.
 *   52-60s Sidebar → /cases. Clean final frame.
 *
 * Usage:
 *   node iuralex-expedientos-demo.cjs --rehearse    # selector check
 *   node iuralex-expedientos-demo.cjs               # record
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3002';
const EMAIL = 'nicolas@cliender.com';
const PASSWORD = 'DemoCliender123';
const VIDEO_DIR = path.join(__dirname, 'video');
const OUTPUT_NAME = 'iuralex-expedientos-60s.webm';
const REHEARSAL = process.argv.includes('--rehearse');

if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

// ─── Overlay helpers ─────────────────────────────────────────────────────
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    cursor.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    cursor.style.cssText = `
      position: fixed; z-index: 999999; pointer-events: none;
      width: 26px; height: 26px;
      transition: left 0.08s linear, top 0.08s linear;
      filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.35));
      left: 0; top: 0;
    `;
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
  });
}

async function ensureVisible(page, selector, label) {
  const el = page.locator(selector).first();
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`REHEARSAL FAIL: "${label}" not found — ${selector}`);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}

async function moveCursorTo(page, locator, steps = 20) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  try {
    const visible = await el.isVisible().catch(() => false);
    if (!visible) return false;
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const box = await el.boundingBox();
    if (!box) return false;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
    return true;
  } catch (e) {
    console.warn('moveCursorTo failed:', e.message);
    return false;
  }
}

async function moveAndClick(page, locator, label, opts = {}) {
  const { postClickDelay = 900, steps = 18 } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARN moveAndClick skipped: "${label}"`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps });
      await page.waitForTimeout(350);
    }
    await el.click();
  } catch (e) {
    console.error(`WARN moveAndClick "${label}" failed: ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, selector, text, charDelay = 38) {
  const el = page.locator(selector).first();
  await moveAndClick(page, el, `field ${selector}`, { postClickDelay: 200 });
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(400);
}

async function smoothScroll(page, top) {
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'smooth' }), top);
  await page.waitForTimeout(1200);
}

// ─── Flow steps ──────────────────────────────────────────────────────────
async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await injectCursor(page);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await typeSlowly(page, 'input[type="email"]', EMAIL, 28);
  await typeSlowly(page, 'input[type="password"]', PASSWORD, 28);
  await moveAndClick(page, 'button[type="submit"]', 'Login submit', { postClickDelay: 1600 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

async function gotoViaSidebar(page, label, urlPart) {
  const selector = `aside a:has-text("${label}")`;
  const clicked = await moveAndClick(page, selector, `Sidebar → ${label}`, { postClickDelay: 800 });
  if (!clicked || !page.url().includes(urlPart)) {
    await page.goto(`${BASE_URL}${urlPart}`, { waitUntil: 'networkidle' }).catch(() => {});
  }
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await injectCursor(page);
  await page.waitForTimeout(400);
}

// ─── Rehearsal ───────────────────────────────────────────────────────────
async function runRehearsal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  let ok = true;
  try {
    await login(page);

    // /cases list
    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1500);
    if (!(await ensureVisible(page, 'h1, h2', 'Cases header'))) ok = false;
    if (!(await ensureVisible(page, 'main div.cursor-pointer:has(p.font-medium)', 'Case card'))) ok = false;

    // Open first case → detail
    const firstCase = page.locator('main div.cursor-pointer:has(p.font-medium)').first();
    if (await firstCase.isVisible().catch(() => false)) {
      await firstCase.click();
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(1200);
      await injectCursor(page);
      console.log('REHEARSAL: case detail URL =', page.url());
      const map = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h1, h2, h3, button, [class*="badge"], [class*="Badge"]'))
          .filter(el => el.offsetParent !== null)
          .map(el => `${el.tagName} "${el.textContent?.trim().substring(0, 50)}"`)
          .slice(0, 40);
      });
      console.log('Detail elements:\n  ' + map.join('\n  '));
    } else {
      console.warn('REHEARSAL: no case card to click');
    }

    // LEXIA chat
    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1200);
    if (!(await ensureVisible(page, 'textarea[placeholder*="LEXIA"]', 'LEXIA textarea'))) ok = false;
    if (!(await ensureVisible(page, 'button[aria-label="Enviar"]', 'LEXIA send btn'))) ok = false;

    // Plazos
    await page.goto(`${BASE_URL}/plazos`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1200);
    if (!(await ensureVisible(page, 'h1, h2', 'Plazos header'))) ok = false;
    const plazosMap = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, button'))
        .filter(el => el.offsetParent !== null)
        .map(el => `${el.tagName} "${el.textContent?.trim().substring(0, 60)}"`)
        .slice(0, 25);
    });
    console.log('Plazos elements:\n  ' + plazosMap.join('\n  '));

    for (const [sel, lbl] of [
      ['aside a:has-text("Expedientes")', 'Sidebar Expedientes'],
      ['aside a:has-text("LEXIA")', 'Sidebar LEXIA'],
      ['aside a:has-text("Plazos")', 'Sidebar Plazos'],
    ]) if (!(await ensureVisible(page, sel, lbl))) ok = false;

    console.log(ok ? 'REHEARSAL PASSED' : 'REHEARSAL FAILED');
  } catch (e) {
    console.error('Rehearsal error:', e.message);
    ok = false;
  } finally {
    await context.close();
    await browser.close();
  }
  process.exit(ok ? 0 : 1);
}

// ─── Recording ───────────────────────────────────────────────────────────
async function panSelectors(page, selectors, dwell = 600) {
  for (const sel of selectors) {
    await moveCursorTo(page, sel, 16);
    await page.waitForTimeout(dwell);
  }
}

async function runRecord() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: VIDEO_DIR, size: { width: 1920, height: 1080 } },
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const start = Date.now();
  let storyStart = null;

  try {
    await login(page);

    // ── 0-4s ── Expedientes list (landing)
    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' }).catch(() => {});
    await injectCursor(page);
    storyStart = Date.now();
    await page.waitForTimeout(900);
    const caseRows = page.locator('main div.cursor-pointer:has(p.font-medium)');
    const listCount = Math.min(5, await caseRows.count().catch(() => 0));
    console.log(`Found ${listCount} case cards on list`);
    for (let i = 0; i < listCount; i++) {
      await moveCursorTo(page, caseRows.nth(i), 14);
      await page.waitForTimeout(380);
    }

    // ── 4-14s ── Open one case → detail
    if (listCount > 0) {
      await moveAndClick(page, caseRows.first(), 'Open first case', { postClickDelay: 1400 });
      await injectCursor(page);
    } else {
      await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
      await injectCursor(page);
    }
    await page.waitForTimeout(700);
    await panSelectors(page, ['h1', 'h2', 'main [class*="badge"], main [class*="Badge"]'], 700);
    await smoothScroll(page, 250);
    await panSelectors(page, ['main h2, main h3'], 600);

    // ── 14-26s ── Documents section — hover only
    await smoothScroll(page, 600);
    await page.waitForTimeout(600);
    const docCandidates = [
      'text=Documentos',
      'text=documentos',
      'button:has-text("Subir documento")',
      'button:has-text("Subir")',
      'button:has-text("Documento")',
    ];
    for (const sel of docCandidates) {
      const loc = page.locator(sel).first();
      if (await loc.isVisible().catch(() => false)) {
        await moveCursorTo(page, loc, 18);
        await page.waitForTimeout(1100);
      }
    }
    const docRows = page.locator('main a[href*="document"], main div:has(svg):has-text(".pdf"), main [class*="document"]');
    const dn = Math.min(3, await docRows.count().catch(() => 0));
    for (let i = 0; i < dn; i++) {
      await moveCursorTo(page, docRows.nth(i), 12);
      await page.waitForTimeout(450);
    }
    await page.waitForTimeout(500);

    // ── 26-40s ── LEXIA chat (HERO moment)
    await gotoViaSidebar(page, 'LEXIA', '/chat');
    await page.waitForTimeout(700);
    const lexiaTextarea = 'textarea[placeholder*="LEXIA"]';
    const question = 'Dame resumen de Construcciones Mediterráneo: qué casos tienen abiertos, importe total y riesgos legales.';
    await typeSlowly(page, lexiaTextarea, question, 32);
    await page.waitForTimeout(300);
    await moveAndClick(page, 'button[aria-label="Enviar"]', 'LEXIA send', { postClickDelay: 700 });
    await page.waitForTimeout(6000);
    await moveCursorTo(page, 'main', 18);
    await page.waitForTimeout(600);

    // ── 40-52s ── Plazos
    await gotoViaSidebar(page, 'Plazos', '/plazos');
    await page.waitForTimeout(900);
    await panSelectors(page, ['h1', 'main h2, main h3'], 700);
    await smoothScroll(page, 300);
    await page.waitForTimeout(500);
    const plazoItems = page.locator('main li, main tr, main [class*="card"], main button');
    const pn = Math.min(4, await plazoItems.count().catch(() => 0));
    for (let i = 0; i < pn; i++) {
      await moveCursorTo(page, plazoItems.nth(i), 12);
      await page.waitForTimeout(380);
    }
    await page.waitForTimeout(400);

    // ── 52-60s ── Back to Expedientes (clean final frame)
    await gotoViaSidebar(page, 'Expedientes', '/cases');
    await page.waitForTimeout(700);
    const finalRows = page.locator('main div.cursor-pointer:has(p.font-medium)');
    const fn = Math.min(3, await finalRows.count().catch(() => 0));
    for (let i = 0; i < fn; i++) {
      await moveCursorTo(page, finalRows.nth(i), 12);
      await page.waitForTimeout(380);
    }
    await page.mouse.move(1700, 120, { steps: 22 });
    await page.waitForTimeout(1500);

    const elapsed = (Date.now() - start) / 1000;
    const story = storyStart ? (Date.now() - storyStart) / 1000 : elapsed;
    console.log(`Total elapsed: ${elapsed.toFixed(1)}s · story: ${story.toFixed(1)}s`);
  } catch (err) {
    console.error('DEMO ERROR:', err.message, err.stack);
  } finally {
    await context.close();
    const video = page.video();
    if (video) {
      const src = await video.path();
      const dest = path.join(VIDEO_DIR, OUTPUT_NAME);
      try {
        fs.copyFileSync(src, dest);
        console.log('Video saved:', dest);
      } catch (e) {
        console.error('copy failed', e.message, 'src=', src);
      }
    }
    await browser.close();
  }
}

(async () => {
  if (REHEARSAL) {
    await runRehearsal();
  } else {
    await runRecord();
  }
})();
