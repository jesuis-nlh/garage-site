// Pipeline de rendu des visuels : serveur statique local + Chromium headless + ffmpeg.
// Usage : node scripts/render/render.mjs [stills|video|preview]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'scripts/render/out');
const mediaDir = path.join(root, 'public/media');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(mediaDir, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(`${base}/scripts/render/index.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });

const frame = async (opts) => {
  const url = await page.evaluate((o) => window.renderFrame(o), opts);
  return Buffer.from(url.split(',')[1], 'base64');
};

const mode = process.argv[2] || 'preview';
const t0 = Date.now();

if (mode === 'preview') {
  for (const name of (process.argv[3] || 'brake,wheel,hero').split(',')) {
    const transparent = name === 'brake' || name === 'wheel';
    fs.writeFileSync(path.join(outDir, `preview-${name}.png`), await frame({ name, width: 960, height: name === 'hero' ? 540 : 720, transparent, t: 0 }));
    console.log('preview', name, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
}

if (mode === 'stills') {
  // Supersampling 2x puis réduction (ImageMagick) pour un anticrénelage propre
  const jobs = [
    { name: 'brake', w: 2400, h: 1800, transparent: true, out: 'brake-assembly.png' },
    { name: 'wheel', w: 2400, h: 1800, transparent: true, out: 'wheel.png' },
  ];
  for (const j of jobs) {
    const raw = path.join(outDir, `raw-${j.name}.png`);
    fs.writeFileSync(raw, await frame({ name: j.name, width: j.w * 1.5, height: j.h * 1.5, transparent: j.transparent }));
    await run('convert', [
      raw,
      '-filter',
      'Lanczos',
      '-resize',
      `${j.w}x${j.h}`,
      ...(j.out.endsWith('.jpg') ? ['-quality', '90'] : ['-strip']),
      path.join(mediaDir, j.out),
    ]);
    console.log('still', j.out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
}

if (mode === 'video') {
  const fps = 24,
    seconds = 8,
    w = 1920,
    h = 1080;
  const frames = fps * seconds;
  const tmp = path.join(outDir, 'hero-frames');
  fs.mkdirSync(tmp, { recursive: true });
  for (let i = 0; i < frames; i++) {
    const buf = await frame({ name: 'hero', width: w, height: h, t: i / frames, mime: 'image/jpeg', quality: 0.96 });
    fs.writeFileSync(path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), buf);
    if (i === 0) fs.writeFileSync(path.join(mediaDir, 'hero-poster.jpg'), buf);
    if (i % 24 === 0) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  const input = ['-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%04d.jpg')];
  await run('ffmpeg', [
    ...input,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '24',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-an',
    path.join(mediaDir, 'hero-loop.mp4'),
  ]);
  await run('ffmpeg', [
    ...input,
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '38',
    '-row-mt',
    '1',
    '-deadline',
    'good',
    '-cpu-used',
    '2',
    '-an',
    path.join(mediaDir, 'hero-loop.webm'),
  ]);
  await run('convert', [path.join(mediaDir, 'hero-poster.jpg'), '-quality', '82', path.join(mediaDir, 'hero-poster.jpg')]);
  console.log('video done', ((Date.now() - t0) / 1000).toFixed(1) + 's');
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}: ${err.slice(-800)}`))));
  });
}

await browser.close();
server.close();
