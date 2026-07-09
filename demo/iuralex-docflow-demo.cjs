'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:3002';
const EMAIL = 'nicolas@cliender.com';
const PASSWORD = 'DemoCliender123';
const VIDEO_DIR = path.join(__dirname, 'video');
const OUTPUT_NAME = 'iuralex-docflow-demo-60s.webm';
const REHEARSAL = process.argv.includes('--rehearse');
const DISCOVER = process.argv.includes('--discover');

if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

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
    console.error(`REHEARSAL FAIL: "${label}" not found - ${selector}`);
    return false;
  }
  console.log(`REHEARSAL OK: "${label}"`);
  return true;
}

async function moveCursorTo(page, locator, steps = 22) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
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
  const { postClickDelay = 1000 } = opts;
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const visible = await el.isVisible().catch(() => false);
  if (!visible) {
    console.error(`WARN moveAndClick skipped: "${label}"`);
    return false;
  }
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const box = await el.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
      await page.waitForTimeout(450);
    }
    await el.click();
  } catch (e) {
    console.error(`WARN moveAndClick "${label}" failed: ${e.message}`);
    return false;
  }
  await page.waitForTimeout(postClickDelay);
  return true;
}

async function typeSlowly(page, selector, text, charDelay = 45) {
  const el = page.locator(selector).first();
  await moveAndClick(page, el, `field ${selector}`, { postClickDelay: 200 });
  await el.fill('');
  await el.pressSequentially(text, { delay: charDelay });
  await page.waitForTimeout(400);
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await injectCursor(page);
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await typeSlowly(page, 'input[type="email"]', EMAIL, 35);
  await typeSlowly(page, 'input[type="password"]', PASSWORD, 35);
  await moveAndClick(page, 'button[type="submit"]', 'Login submit', { postClickDelay: 1500 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
}

async function gotoFinanzas(page) {
  await page.goto(`${BASE_URL}/finanzas`, { waitUntil: 'networkidle' });
  await injectCursor(page);
  await page.waitForSelector('table tbody tr', { timeout: 15000 });
  await page.waitForTimeout(800);
}

async function runRehearsal() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  let ok = true;
  try {
    await login(page);
    await gotoFinanzas(page);

    const checks = [
      ['h1:has-text("Finanzas")', 'Finanzas header'],
      ['text=Total facturado', 'KPI Total facturado'],
      ['text=Cobrado', 'KPI Cobrado'],
      ['text=Por cobrar', 'KPI Por cobrar'],
      ['text=Vencidas', 'KPI Vencidas'],
      ['button:has-text("Facturas")', 'Tab Facturas'],
      ['button:has-text("Presupuestos")', 'Tab Presupuestos'],
      ['button:has-text("Hojas de encargo")', 'Tab Hojas de encargo'],
      ['tr:has-text("F-2026-0001")', 'Row F-2026-0001'],
      ['tr:has-text("F-2026-0003")', 'Row F-2026-0003 (overdue)'],
      ['tr:has-text("F-2026-0001") button[title="Descargar PDF"]', 'Download btn F-2026-0001'],
    ];
    for (const [sel, lbl] of checks) {
      if (!(await ensureVisible(page, sel, lbl))) ok = false;
    }

    await moveAndClick(page, 'button:has-text("Presupuestos")', 'Tab Presupuestos');
    await page.waitForTimeout(800);
    for (const [sel, lbl] of [
      ['tr:has-text("P-2026-0001")', 'Row P-2026-0001 (accepted)'],
    ]) if (!(await ensureVisible(page, sel, lbl))) ok = false;

    await moveAndClick(page, 'button:has-text("Hojas de encargo")', 'Tab Encargos');
    await page.waitForTimeout(800);
    for (const [sel, lbl] of [
      ['tr:has-text("Construcciones Mediterráneo")', 'Eng row Construcciones'],
      ['tr:has-text("María García")', 'Eng row María García'],
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

async function panKpis(page) {
  const kpis = ['text=Total facturado', 'text=Cobrado', 'text=Por cobrar', 'text=Vencidas'];
  for (const sel of kpis) {
    await moveCursorTo(page, sel, 18);
    await page.waitForTimeout(900);
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
  let recordStart = null;

  try {
    await login(page);
    await gotoFinanzas(page);
    recordStart = Date.now();
    await page.waitForTimeout(2000);
    await panKpis(page);
    await page.waitForTimeout(800);

    // Facturas phase
    await moveCursorTo(page, 'tr:has-text("F-2026-0003")', 22);
    await page.waitForTimeout(2400);
    await moveCursorTo(page, 'tr:has-text("F-2026-0001")', 18);
    await page.waitForTimeout(1300);
    await moveAndClick(page,
      'tr:has-text("F-2026-0001") button[title="Descargar PDF"]',
      'Download PDF F-2026-0001',
      { postClickDelay: 1800 });

    // Presupuestos phase
    await moveAndClick(page, 'button:has-text("Presupuestos")', 'Tab Presupuestos', { postClickDelay: 1300 });
    await page.waitForTimeout(700);
    for (const num of ['P-2026-0004', 'P-2026-0003', 'P-2026-0002', 'P-2026-0001']) {
      const sel = `tr:has-text("${num}")`;
      const exists = await page.locator(sel).first().isVisible().catch(() => false);
      if (exists) {
        await moveCursorTo(page, sel, 16);
        await page.waitForTimeout(900);
      }
    }
    await moveCursorTo(page, 'tr:has-text("P-2026-0001")', 14);
    await page.waitForTimeout(2200);

    // Encargos phase
    await moveAndClick(page, 'button:has-text("Hojas de encargo")', 'Tab Encargos', { postClickDelay: 1300 });
    await page.waitForTimeout(700);
    await moveCursorTo(page, 'tr:has-text("Construcciones Mediterráneo")', 20);
    await page.waitForTimeout(2400);
    await moveCursorTo(page, 'tr:has-text("María García")', 18);
    await page.waitForTimeout(2400);

    // Return to Facturas + final hold
    await moveAndClick(page, 'button:has-text("Facturas")', 'Tab Facturas (return)', { postClickDelay: 1500 });
    await page.waitForTimeout(1000);
    await panKpis(page);
    await page.mouse.move(1700, 120, { steps: 22 });
    await page.waitForTimeout(3500);

    const elapsed = (Date.now() - start) / 1000;
    const recElapsed = recordStart ? (Date.now() - recordStart) / 1000 : elapsed;
    console.log(`Total elapsed: ${elapsed.toFixed(1)}s  /  finanzas-onward: ${recElapsed.toFixed(1)}s`);
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
  if (REHEARSAL || DISCOVER) {
    await runRehearsal();
  } else {
    await runRecord();
  }
})();
