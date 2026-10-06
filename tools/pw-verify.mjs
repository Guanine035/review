// Verification harness: drives real Edge via Playwright over the static server.
// Run: node tools/pw-verify.mjs   (server must already be on BASE)
import { chromium } from '../node_modules/.pnpm/playwright-core@1.64.0-alpha-1790635538000/node_modules/playwright-core/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const BASE = process.env.BASE || 'http://localhost:4173/';
const OUT = new URL('../verification/', import.meta.url);
await mkdir(OUT, { recursive: true });
const OUT_DIR = fileURLToPath(OUT);

const VIEWPORTS = [
  { id: 'desktop', width: 1280, height: 800, touch: false },
  { id: 'ipad-portrait', width: 820, height: 1180, touch: true, scale: 2 },
  { id: 'ipad-landscape', width: 1180, height: 820, touch: true, scale: 2 },
  { id: 'narrow', width: 390, height: 844, touch: true, scale: 3 }
];

const TABS = ['notes', 'examples', 'practice', 'exam', 'wrong'];
const report = { base: BASE, errors: [], viewports: {}, flows: {} };

const browser = await chromium.launch({ channel: 'msedge', headless: true });

function wire(page, bucket) {
  page.on('console', (m) => {
    if (m.type() === 'error') bucket.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => bucket.push(`pageerror: ${e.message}`));
}

async function overflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  }));
}

for (const vp of VIEWPORTS) {
  const errors = [];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.scale || 1,
    hasTouch: Boolean(vp.touch),
    screen: { width: vp.width, height: vp.height }
  });
  const page = await context.newPage();
  wire(page, errors);
  await page.goto(BASE, { waitUntil: 'load' });

  const tabCount = await page.locator('#tabbar button').count();
  assert.equal(tabCount, 5, `${vp.id}: expected 5 tabs`);
  const katexCount = await page.locator('.katex').count();
  assert.ok(katexCount > 0, `${vp.id}: KaTeX not rendered on notes`);

  const overflows = {};
  for (const tab of TABS) {
    await page.click(`#tabbar [data-action="nav"][data-id="${tab}"]`);
    await page.waitForTimeout(120);
    const h1 = (await page.locator('.topbar h1').first().innerText()).trim();
    assert.ok(h1.length > 0, `${vp.id}/${tab}: missing heading`);
    const o = await overflow(page);
    overflows[tab] = o.scrollWidth - o.innerWidth;
    if (tab === 'notes') {
      await page.screenshot({ path: fileURLToPath(new URL(`${vp.id}-notes.png`, OUT)), fullPage: false });
    }
  }

  report.viewports[vp.id] = { tabCount, katexCount, overflows, errors };
  report.errors.push(...errors.map((e) => `${vp.id}: ${e}`));
  assert.ok(overflows.notes <= 1, `${vp.id}: notes overflows by ${overflows.notes}px`);
  await context.close();
}

// Deep flow: practice reveal, objective grading, wrong-book persistence, offline reload.
{
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true, screen: { width: 1180, height: 820 } });
  const page = await context.newPage();
  wire(page, errors);
  await page.goto(BASE, { waitUntil: 'load' });

  // Practice: start a 10-question session and reveal a model answer.
  await page.click('#tabbar [data-action="nav"][data-id="practice"]');
  await page.click('[data-action="start-practice"]');
  await page.waitForSelector('.card[data-question]');
  const sessionCount = await page.locator('.topbar h1').first().innerText();
  await page.click('[data-action="reveal"]');
  await page.waitForSelector('.solution .steps li');
  const solutionSteps = await page.locator('.solution .steps li').count();
  assert.ok(solutionSteps > 0, 'practice: solution steps missing');
  report.flows.practice = { heading: sessionCount.trim(), solutionSteps };

  // Grading + wrong book via the generated paper (Section A is True/False with choices).
  await page.click('#tabbar [data-action="nav"][data-id="exam"]');
  await page.click('[data-action="start-exam"][data-type="generated"]');
  await page.waitForSelector('.card[data-question]');
  const card = page.locator('.card[data-question]').first();
  const choices = card.locator('.choice');
  await choices.nth(0).click();
  await card.locator('[data-action="submit"]').click();
  let feedback = (await card.locator('.feedback').first().innerText()).trim();
  if (feedback.startsWith('Correct')) {
    await choices.nth(1).click();
    await card.locator('[data-action="submit"]').click();
    feedback = (await card.locator('.feedback').first().innerText()).trim();
  }
  assert.ok(feedback.startsWith('Not correct'), `grading: expected wrong feedback, got "${feedback}"`);
  report.flows.grading = { feedback };

  await page.click('#tabbar [data-action="nav"][data-id="wrong"]');
  await page.waitForSelector('[data-action="wrong-remove"]');
  const wrongBefore = await page.locator('[data-action="wrong-remove"]').count();
  assert.ok(wrongBefore >= 1, 'wrong book: empty after a wrong answer');

  await page.reload({ waitUntil: 'load' });
  await page.click('#tabbar [data-action="nav"][data-id="wrong"]');
  await page.waitForSelector('[data-action="wrong-remove"]');
  const wrongAfter = await page.locator('[data-action="wrong-remove"]').count();
  assert.equal(wrongAfter, wrongBefore, 'wrong book: did not persist across reload');
  report.flows.wrongBook = { before: wrongBefore, after: wrongAfter };

  // Offline reload through the service worker.
  await page.goto(BASE, { waitUntil: 'load' });
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await context.setOffline(true);
  await page.reload({ waitUntil: 'load' });
  await page.waitForSelector('.topbar h1');
  const offlineHeading = (await page.locator('.topbar h1').first().innerText()).trim();
  assert.ok(offlineHeading.includes('笔记'), `offline: unexpected heading "${offlineHeading}"`);
  await context.setOffline(false);
  report.flows.offline = { heading: offlineHeading };

  report.errors.push(...errors.map((e) => `flows: ${e}`));
  await context.close();
}

await browser.close();

report.status = report.errors.length ? 'FAILED' : 'OK';
await writeFile(new URL('report.json', OUT), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0, `console/page errors: ${report.errors.join(' | ')}`);
console.log('VERIFY OK');
