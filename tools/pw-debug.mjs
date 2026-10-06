import { chromium } from '../node_modules/.pnpm/playwright-core@1.64.0-alpha-1790635538000/node_modules/playwright-core/index.mjs';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, screen: { width: 390, height: 844 } });
await page.goto('http://localhost:4173/', { waitUntil: 'load' });
const offenders = await page.evaluate(() => {
  const vw = window.innerWidth;
  const out = [];
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > vw + 0.5) {
      out.push({
        tag: el.tagName,
        cls: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
        right: Math.round(r.right),
        width: Math.round(r.width),
        scrollW: el.scrollWidth,
        text: (el.textContent || '').slice(0, 40).replace(/\s+/g, ' ')
      });
    }
  });
  return { vw, docScroll: document.documentElement.scrollWidth, offenders: out.slice(0, 25) };
});
console.log(JSON.stringify(offenders, null, 2));
await browser.close();
