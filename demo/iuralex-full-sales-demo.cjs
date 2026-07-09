'use strict';
/**
 * IURALEX — Full Sales Hero (60s) demo recorder.
 *
 * Storyboard:
 *   0-5s   Login → /dashboard (Inicio). KPI pan.
 *   5-15s  Sidebar → /cases. List pan → open first case.
 *   15-28s Sidebar → /chat (LEXIA). Type real question and let it stream.
 *   28-38s Sidebar → /plazos. Pan procedural-deadline catalogue.
 *   38-50s Sidebar → /plantillas. Hover NEW "Subir plantilla" button, then card.
 *   50-58s Sidebar → /finanzas. Quick KPI pan.
 *   58-60s Sidebar → /dashboard. Clean final frame.
 *
 * Usage:
 *   node iuralex-full-sales-demo.cjs --rehearse    # selector check
 *   node iuralex-full-sales-demo.cjs               # record
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3002';
const EMAIL = 'nicolas@cliender.com';
const PASSWORD = 'DemoCliender123';
const VIDEO_DIR = path.join(__dirname, 'video');
const OUTPUT_NAME = 'iuralex-full-sales-60s.webm';
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

// ─── Flow steps ──────────────────────────────────────────────────────────
async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await injectCursor(page);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await typeSlowly(page, 'input[type="email"]', EMAIL, 32);
  await typeSlowly(page, 'input[type="password"]', PASSWORD, 32);
  await moveAndClick(page, 'button[type="submit"]', 'Login submit', { postClickDelay: 1800 });
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

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1200);
    for (const [sel, lbl] of [
      ['aside a:has-text("Inicio")', 'Sidebar Inicio'],
      ['aside a:has-text("Expedientes")', 'Sidebar Expedientes'],
      ['aside a:has-text("LEXIA")', 'Sidebar LEXIA'],
      ['aside a:has-text("Plazos")', 'Sidebar Plazos'],
      ['aside a:has-text("Plantillas")', 'Sidebar Plantillas'],
      ['aside a:has-text("Finanzas")', 'Sidebar Finanzas'],
    ]) if (!(await ensureVisible(page, sel, lbl))) ok = false;

    await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1500);
    if (!(await ensureVisible(page, 'h1, h2', 'Cases header'))) ok = false;
    const caseCardCandidates = ['a[href^="/cases/"]', '[role="row"]', 'div[class*="case"]'];
    let foundCaseRow = false;
    for (const s of caseCardCandidates) {
      if (await page.locator(s).first().isVisible().catch(() => false)) {
        console.log(`REHEARSAL OK: case row via "${s}"`);
        foundCaseRow = true;
        break;
      }
    }
    if (!foundCaseRow) console.warn('REHEARSAL WARN: no obvious case-row selector matched');

    await page.goto(`${BASE_URL}/chat`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1200);
    if (!(await ensureVisible(page, 'textarea[placeholder*="LEXIA"]', 'LEXIA textarea'))) ok = false;
    if (!(await ensureVisible(page, 'button[aria-label="Enviar"]', 'LEXIA send btn'))) ok = false;

    await page.goto(`${BASE_URL}/plazos`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1200);
    if (!(await ensureVisible(page, 'body', 'Plazos page body'))) ok = false;

    await page.goto(`${BASE_URL}/plantillas`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1200);
    if (!(await ensureVisible(page, 'button:has-text("Subir plantilla")', 'Subir plantilla btn'))) ok = false;
    if (!(await ensureVisible(page, 'button:has-text("Crear plantilla")', 'Crear plantilla btn'))) ok = false;

    await page.goto(`${BASE_URL}/finanzas`, { waitUntil: 'networkidle' });
    await injectCursor(page);
    await page.waitForTimeout(1200);
    if (!(await ensureVisible(page, 'h1:has-text("Finanzas")', 'Finanzas header'))) ok = false;

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
async function panKpis(page, selectors, dwell = 850) {
  for (const sel of selectors) {
    await moveCursorTo(page, sel, 18);
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

    // ── 0-5s ── Dashboard / Inicio
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' }).catch(() => {});
    await injectCursor(page);
    storyStart = Date.now();
    await page.waitForTimeout(900);
    await panKpis(page, [
      'h1',
      'main h2, main h3',
    ], 450);
    await page.waitForTimeout(300);

    // ── 5-15s ── Expedientes
    await gotoViaSidebar(page, 'Expedientes', '/cases');
    await page.waitForTimeout(700);
    const caseRows = page.locator('main div.cursor-pointer:has(p.font-medium)');
    const count = Math.min(3, await caseRows.count().catch(() => 0));
    console.log(`Found ${count} case cards`);
    for (let i = 0; i < count; i++) {
      await moveCursorTo(page, caseRows.nth(i), 12);
      await page.waitForTimeout(340);
    }
    if (count > 0) {
      await moveAndClick(page, caseRows.first(), 'Open first case', { postClickDelay: 1200 });
      await injectCursor(page);
    } else {
      await page.goto(`${BASE_URL}/cases`, { waitUntil: 'networkidle' });
      await injectCursor(page);
    }
    await page.waitForTimeout(800);
    await panKpis(page, ['h1', 'h2'], 450);

    // ── 15-28s ── LEXIA chat (HERO)
    await gotoViaSidebar(page, 'LEXIA', '/chat');
    await page.waitForTimeout(800);
    const lexiaTextarea = 'textarea[placeholder*="LEXIA"]';
    const question = 'Resume este expediente y dime qué plazos críticos veo';
    await typeSlowly(page, lexiaTextarea, question, 36);
    await page.waitForTimeout(300);
    await moveAndClick(page, 'button[aria-label="Enviar"]', 'LEXIA send', { postClickDelay: 800 });
    await page.waitForTimeout(5500);
    await moveCursorTo(page, 'main', 22);
    await page.waitForTimeout(800);

    // ── 28-38s ── Plazos
    await gotoViaSidebar(page, 'Plazos', '/plazos');
    await page.waitForTimeout(900);
    await panKpis(page, [
      'h1',
      'main h2, main h3',
    ], 500);
    await page.waitForTimeout(500);

    // ── 38-50s ── Plantillas
    await gotoViaSidebar(page, 'Plantillas', '/plantillas');
    await page.waitForTimeout(900);
    await moveCursorTo(page, 'button:has-text("Subir plantilla")', 20);
    await page.waitForTimeout(1500);
    await moveCursorTo(page, 'button:has-text("Crear plantilla")', 14);
    await page.waitForTimeout(800);
    const cards = page.locator('main button, main a, main article, main [class*="card"]');
    const cn = Math.min(3, await cards.count().catch(() => 0));
    for (let i = 0; i < cn; i++) {
      await moveCursorTo(page, cards.nth(i), 10);
      await page.waitForTimeout(320);
    }
    await page.waitForTimeout(400);

    // ── 50-58s ── Finanzas
    await gotoViaSidebar(page, 'Finanzas', '/finanzas');
    await page.waitForTimeout(800);
    await panKpis(page, [
      'text=Total facturado',
      'text=Cobrado',
      'text=Por cobrar',
      'text=Vencidas',
    ], 450);
    await page.waitForTimeout(300);

    // ── 58-60s ── Back to Inicio for clean final frame
    await gotoViaSidebar(page, 'Inicio', '/dashboard');
    await page.mouse.move(1700, 120, { steps: 22 });
    await page.waitForTimeout(1500);

    const elapsed = (Date.now() - start) / 1000;
    const story = storyStart ? (Date.now() - storyStart) / 1000 : elapsed;
    console.log(`Total elapsed: ${elapsed.toFixed(1)}s · story (dashboard-onward): ${story.toFixed(1)}s`);
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
