import { chromium } from "../node_modules/.pnpm/playwright-core@1.64.0-alpha-1790635538000/node_modules/playwright-core/index.mjs";
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, screen: { width: 390, height: 844 } });
await p.goto("http://localhost:4173/", { waitUntil: "load" });
const r = await p.evaluate(() => {
  const el = [...document.querySelectorAll(".katex")].find((e) => e.getBoundingClientRect().right > window.innerWidth + 1);
  if (!el) return { none: true };
  const cs = getComputedStyle(el);
  const pcs = getComputedStyle(el.parentElement);
  return { display: cs.display, overflowX: cs.overflowX, maxWidth: cs.maxWidth, parentTag: el.parentElement.tagName, parentOverflow: pcs.overflowX, parentDisplay: pcs.display, width: Math.round(el.getBoundingClientRect().width) };
});
console.log(JSON.stringify(r, null, 2));
await b.close();
