// Génère l'image Open Graph (1200×630) à partir de la configuration du garage.
// Usage : node scripts/render/og.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// Lecture des valeurs depuis la configuration TypeScript (extraction simple, sans compilation)
const cfg = fs.readFileSync(path.join(root, 'src/config/garages/midas-villeurbanne-zola.ts'), 'utf8');
const pick = (re) => cfg.match(re)?.[1] ?? '';
const data = {
  primary: pick(/primary: '([^']+)'/),
  secondary: pick(/secondary: '([^']+)'/),
  title: [pick(/heroTitle: \['([^']+)'/), pick(/heroTitle: \['[^']+', '([^']+)'\]/)],
  meta: `${pick(/street: '([^']+)'/)} · ${pick(/city: '([^']+)'/)} · ${pick(/phoneDisplay: '([^']+)'/)}`,
};

const types = { '.html': 'text/html', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`http://127.0.0.1:${server.address().port}/scripts/render/og.html`, { waitUntil: 'networkidle' });
await page.evaluate((d) => {
  document.getElementById('primary').textContent = d.primary;
  document.getElementById('secondary').textContent = d.secondary;
  document.getElementById('title').innerHTML = `${d.title[0]}<br><em>${d.title[1]}</em>`;
  document.getElementById('meta').textContent = d.meta;
}, data);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'public/og.jpg'), type: 'jpeg', quality: 86 });
await browser.close();
server.close();
console.log('public/og.jpg', data);
