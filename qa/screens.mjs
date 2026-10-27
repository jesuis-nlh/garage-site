// QA visuelle : captures multi-appareils + erreurs console.
// Usage : node qa/screens.mjs [baseUrl]
import fs from 'node:fs';
import { chromium, devices } from 'playwright-core';

const base = process.argv[2] || 'http://localhost:3100';
const out = new URL('./screens/', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const errors = [];

const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'tablet', viewport: { width: 834, height: 1112 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 },
  { name: 'mobile', ...devices['iPhone 13'], deviceScaleFactor: 1 },
];

for (const p of profiles) {
  const { name, ...opts } = p;
  // Vue « réelle » du hero (animations actives)
  const ctx = await browser.newContext({ ...opts, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const page = await ctx.newPage();
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`[${name}] ${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`[${name}] requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${out}${name}-hero.png` });
  await ctx.close();

  // Page complète (mouvement réduit : contenu final sans attendre les révélations)
  const ctx2 = await browser.newContext({ ...opts, locale: 'fr-FR', timezoneId: 'Europe/Paris', reducedMotion: 'reduce' });
  const page2 = await ctx2.newPage();
  page2.on('pageerror', (e) => errors.push(`[${name}/rm] pageerror: ${e.message}`));
  await page2.goto(base, { waitUntil: 'networkidle' });
  await page2.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page2.waitForLoadState('networkidle');
  await page2.waitForTimeout(800);
  await page2.screenshot({ path: `${out}${name}-full.png`, fullPage: true });
  const overflow = await page2.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) errors.push(`[${name}] horizontal overflow: ${overflow}px`);
  await ctx2.close();
}

console.log(errors.length ? errors.join('\n') : 'Aucune erreur console.');
await browser.close();
