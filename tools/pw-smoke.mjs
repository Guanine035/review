import { chromium } from '../node_modules/.pnpm/playwright-core@1.64.0-alpha-1790635538000/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:4173/', { waitUntil: 'load' });
console.log('title:', await page.title());
console.log('h1:', await page.locator('.topbar h1').first().innerText());
await browser.close();
console.log('OK');
