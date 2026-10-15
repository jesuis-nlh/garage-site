// QA fonctionnelle : interactions, formulaire (non configuré / webhook réel), accessibilité clavier, liens, API.
// Prérequis : serveur sans transmission sur :3100, serveur avec webhook sur :3101, récepteur sur :4555.
import fs from 'node:fs';
import { chromium, devices } from 'playwright-core';

const A = 'http://localhost:3100';
const B = 'http://localhost:3101';
const shots = new URL('./screens/', import.meta.url).pathname;
fs.mkdirSync(shots, { recursive: true });
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? '✔' : '✘'} ${name}${detail ? ` — ${detail}` : ''}`);
};
const consoleErrors = [];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const watch = (page, tag) => {
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(`[${tag}] ${m.text()}`));
  page.on('pageerror', (e) => consoleErrors.push(`[${tag}] pageerror ${e.message}`));
};

// Prochain jour ouvré (lundi–samedi), au format AAAA-MM-JJ
const nextOpenDay = () => {
  const d = new Date(Date.now() + 2 * 864e5);
  while (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};
const nextSunday = () => {
  const d = new Date(Date.now() + 864e5);
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

async function fillAndSubmit(page) {
  const form = page.locator('#rendez-vous form');
  await form.locator('input[name="service"][value="freinage"]').check({ force: true });
  await form.getByLabel('Précisez votre besoin').fill('Grincement à l’avant au freinage.');
  await form.getByRole('button', { name: 'Continuer' }).click();
  await form.getByLabel('Marque').fill('Peugeot');
  await form.getByLabel('Modèle').fill('308');
  await form.getByLabel('Date souhaitée').fill(nextOpenDay());
  await form.locator('label', { hasText: 'Matin' }).click();
  await form.getByRole('button', { name: 'Continuer' }).click();
  await form.getByLabel('Nom et prénom').fill('Camille Test');
  await form.getByLabel('Téléphone').fill('06 12 34 56 78');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Envoyer la demande' }).click();
}

/* ---------- 1. Desktop, pointeur fin ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const page = await ctx.newPage();
  watch(page, 'desktop');
  await page.goto(A, { waitUntil: 'networkidle' });
  await page.mouse.move(700, 420);
  await page.mouse.move(720, 430);
  await page.waitForTimeout(300);
  check('Curseur personnalisé visible au survol (desktop)', await page.locator('.cursor-root[data-visible="true"]').count());
  check('Curseur natif masqué via classe has-custom-cursor', await page.evaluate(() => document.documentElement.classList.contains('has-custom-cursor')));
  await page.locator('#accueil a:has-text("Prendre rendez-vous")').hover();
  await page.waitForTimeout(250);
  check('État curseur « cta » sur le CTA principal', (await page.locator('.cursor-root').getAttribute('data-state')) === 'cta');
  await page.locator('#accueil a[href^="tel:"]').first().hover();
  await page.waitForTimeout(250);
  check('État curseur « call » sur le lien téléphone', (await page.locator('.cursor-root').getAttribute('data-state')) === 'call');
  await page.waitForTimeout(2500);
  const video = await page.evaluate(() => {
    const v = document.querySelector('#accueil video');
    return v ? { paused: v.paused, ready: v.readyState, src: v.currentSrc.split('/').pop() } : null;
  });
  check('Vidéo du hero chargée en différé et lue (desktop)', video && !video.paused && video.ready >= 2, JSON.stringify(video));

  // Magnétisme
  const cta = page.locator('#accueil a:has-text("Prendre rendez-vous")');
  const box = await cta.boundingBox();
  await page.mouse.move(box.x + box.width - 4, box.y + 4, { steps: 4 });
  await page.waitForTimeout(400);
  const transform = await cta.evaluate((el) => el.parentElement?.style.transform || '');
  check('Bouton magnétique : déplacement vers le pointeur', /translate3d\((?!0px, 0px)/.test(transform), transform);

  // Vue en coupe
  const stage = page.locator('.bp-stage');
  await stage.scrollIntoViewIfNeeded();
  const sb = await stage.boundingBox();
  await page.mouse.move(sb.x + sb.width * 0.25, sb.y + sb.height * 0.62, { steps: 6 });
  await page.waitForTimeout(700);
  const sr = await stage.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue('--sr')));
  check('Projecteur de la vue en coupe actif au survol', sr > 50, `--sr=${sr}px`);
  check('État curseur « explore » sur la vue en coupe', (await page.locator('.cursor-root').getAttribute('data-state')) === 'explore');
  await stage.screenshot({ path: `${shots}blueprint-spotlight.png` });
  await page.locator('.bp-stage button[aria-label^="Freinage"]').click();
  await page.waitForTimeout(500);
  check('Repère « Freinage » ouvre la fiche', (await page.locator('[aria-live] h3', { hasText: 'Freinage' }).count()) > 0);
  await page.getByRole('button', { name: 'Afficher toute la mécanique' }).click();
  check('Interrupteur « toute la mécanique »', (await stage.getAttribute('data-xray')) === 'true');
  await stage.screenshot({ path: `${shots}blueprint-xray.png` });

  // Prestations : survol -> panneau, puis pré-remplissage du formulaire
  await page.locator('#services').scrollIntoViewIfNeeded();
  await page.locator('#services ul[aria-label="Prestations"] button', { hasText: 'Climatisation' }).hover();
  await page.waitForTimeout(300);
  check('Survol d’une prestation met à jour le panneau', (await page.locator('#services .sticky h3').textContent())?.includes('Climatisation'));
  await page.locator('#services .sticky').screenshot({ path: `${shots}services-panel.png` });
  await page.locator('#services button[data-cursor="cta"]', { hasText: 'Demander ce service' }).click();
  await page.waitForTimeout(1500);
  check('« Demander ce service » pré-sélectionne la prestation', await page.locator('#rendez-vous input[name="service"][value="climatisation"]').isChecked());
  check('… et amène au formulaire', await page.evaluate(() => Math.abs(document.getElementById('rendez-vous').getBoundingClientRect().top) < 200));

  // Filtres
  await page.locator('#services [role="radio"]', { hasText: 'Mécanique' }).click();
  const rows = await page.locator('#services ul[aria-label="Prestations"] > li').count();
  check('Filtre « Mécanique » réduit la liste', rows === 3, `${rows} lignes`);

  // Orientation
  await page.locator('#orientation [role="radio"]', { hasText: 'Bruit ou vibration au freinage' }).click();
  await page.waitForTimeout(400);
  check('Orientation : message de sécurité affiché', (await page.locator('#orientation [aria-live]').textContent()).includes('pédale'));
  await page.locator('#orientation [aria-live]').screenshot({ path: `${shots}finder-result.png` });
  await page.locator('#orientation button', { hasText: 'Demander un rendez-vous' }).click();
  await page.waitForTimeout(1500);
  check(
    'Orientation → formulaire avec motif et prestation',
    (await page.locator('#rendez-vous form').textContent()).includes('Bruit ou vibration au freinage') &&
      (await page.locator('#rendez-vous input[name="service"][value="freinage"]').isChecked()),
  );

  // Validation
  const form = page.locator('#rendez-vous form');
  await form.getByRole('button', { name: 'Continuer' }).click();
  await form.getByRole('button', { name: 'Continuer' }).click();
  await page.waitForTimeout(200);
  const alert = await form
    .locator('[role="alert"]')
    .textContent()
    .catch(() => '');
  check('Validation accessible : récapitulatif des erreurs', alert.includes('marque') && alert.includes('modèle'), alert.slice(0, 90));
  check('Focus déplacé sur le récapitulatif d’erreurs', await page.evaluate(() => document.activeElement?.getAttribute('role') === 'alert'));
  await form.getByLabel('Date souhaitée').fill(nextSunday());
  await form.getByLabel('Marque').fill('Renault');
  await form.getByLabel('Modèle').fill('Clio');
  await form.getByRole('button', { name: 'Continuer' }).click();
  check('Date un dimanche refusée (centre fermé)', (await form.textContent()).includes('fermé ce jour-là'));
  await form.screenshot({ path: `${shots}form-errors.png` });

  // Soumission sans transmission configurée
  await page.goto(`${A}/?reload=1#rendez-vous`, { waitUntil: 'networkidle' });
  await fillAndSubmit(page);
  await page.waitForTimeout(1200);
  const statusA = await page
    .locator('#rendez-vous [role="status"]')
    .textContent()
    .catch(() => '');
  check('Sans configuration : aucun faux succès, message honnête', statusA.includes('n’a pas été envoyée') && !statusA.includes('transmise à l’atelier'));
  await page.locator('#rendez-vous [role="status"]').screenshot({ path: `${shots}form-not-configured.png` });
  await ctx.close();
}

/* ---------- 2. Transmission réelle via webhook ---------- */
{
  fs.rmSync(new URL('./received.jsonl', import.meta.url), { force: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const page = await ctx.newPage();
  watch(page, 'webhook');
  await page.goto(`${B}/#rendez-vous`, { waitUntil: 'networkidle' });
  await fillAndSubmit(page);
  await page.waitForTimeout(1500);
  const status = await page
    .locator('#rendez-vous [role="status"]')
    .textContent()
    .catch(() => '');
  check(
    'Avec webhook : confirmation « transmise » sans promettre le créneau',
    status.includes('transmise à l’atelier') && status.includes('pas encore réservé'),
  );
  await page.locator('#rendez-vous [role="status"]').screenshot({ path: `${shots}form-success.png` });
  const received = fs.existsSync(new URL('./received.jsonl', import.meta.url))
    ? fs
        .readFileSync(new URL('./received.jsonl', import.meta.url), 'utf8')
        .trim()
        .split('\n')
        .map(JSON.parse)
    : [];
  const last = received.at(-1);
  check(
    'Webhook reçu avec secret et données',
    last?.secret === 'test-secret' && last?.body?.lead?.make === 'Peugeot' && last?.body?.lead?.serviceLabel === 'Freinage',
    JSON.stringify(last?.body?.lead ?? {}).slice(0, 120),
  );
  await ctx.close();
}

/* ---------- 3. Mobile tactile ---------- */
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'fr-FR', timezoneId: 'Europe/Paris' });
  const page = await ctx.newPage();
  watch(page, 'mobile');
  await page.goto(A, { waitUntil: 'networkidle' });
  check('Mobile : pas de curseur personnalisé', (await page.locator('.cursor-root').count()) === 0);
  check('Mobile : CTA « RDV » visible dans l’en-tête', await page.locator('header a', { hasText: 'RDV' }).isVisible());
  const vid = await page.evaluate(() => document.querySelector('#accueil video')?.readyState ?? -1);
  check('Mobile : vidéo non téléchargée', vid === 0, `readyState=${vid}`);
  const toggle = page.locator('header button[aria-controls="menu-mobile"]');
  await toggle.click();
  check(
    'Menu mobile ouvert (dialog)',
    await page
      .locator('#menu-mobile')
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(
        () => true,
        () => false,
      ),
  );
  for (let k = 0; k < 12; k++) await page.keyboard.press('Tab');
  check('Menu mobile : focus piégé dans le panneau', await page.evaluate(() => document.getElementById('menu-mobile').contains(document.activeElement)));
  await page.screenshot({ path: `${shots}mobile-menu.png` });
  await page.keyboard.press('Escape');
  check(
    'Menu mobile : Échap ferme et rend le focus',
    !(await page.locator('#menu-mobile').isVisible()) && (await page.evaluate(() => document.activeElement?.getAttribute('aria-controls'))) === 'menu-mobile',
  );
  const freinRow = page.locator('#services ul[aria-label="Prestations"] button', { hasText: 'Freinage' });
  await freinRow.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  await freinRow.tap();
  await page.waitForTimeout(600);
  check(
    'Mobile : accordéon des prestations',
    (await page.locator('#services ul[aria-label="Prestations"] button', { hasText: 'Freinage' }).getAttribute('aria-expanded')) === 'true',
  );
  await page.locator('.bp-stage').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  check('Mobile : la vue en coupe présélectionne un repère', (await page.locator('.bp-stage button[aria-expanded="true"]').count()) === 1);
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(700);
  check('Mobile : barre d’actions fixe visible après défilement', await page.locator('a', { hasText: 'Appeler' }).last().isVisible());
  await ctx.close();
}

/* ---------- 4. Clavier, mouvement réduit ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', locale: 'fr-FR' });
  const page = await ctx.newPage();
  watch(page, 'reduced');
  await page.goto(A, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  check('Premier Tab : lien d’évitement « Aller au contenu »', (await page.evaluate(() => document.activeElement?.textContent)) === 'Aller au contenu');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check('Indicateur de focus visible', outline !== 'none', outline);
  await page.mouse.move(600, 400);
  await page.waitForTimeout(2500);
  check('Mouvement réduit : pas de curseur personnalisé', (await page.locator('.cursor-root').count()) === 0);
  check('Mouvement réduit : vidéo non lue', (await page.evaluate(() => document.querySelector('#accueil video')?.readyState)) === 0);
  await ctx.close();
}

/* ---------- 5. Page prestation ---------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, locale: 'fr-FR' });
  const page = await ctx.newPage();
  watch(page, 'service');
  await page.goto(`${A}/services/freinage`, { waitUntil: 'networkidle' });
  check('Page prestation : H1', (await page.locator('h1').textContent()).includes('Freinage'));
  await page.screenshot({ path: `${shots}service-page.png` });
  await page.locator('main a', { hasText: 'Demander ce service' }).first().click();
  await page.waitForURL(/service=freinage/);
  await page.waitForTimeout(1500);
  check('Page prestation → formulaire pré-rempli', await page.locator('#rendez-vous input[name="service"][value="freinage"]').isChecked());

  // Liens internes
  const hrefs = new Set();
  for (const url of [A, `${A}/services/freinage`, `${A}/mentions-legales`]) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    (await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))).forEach((h) => h.startsWith('/') && hrefs.add(h.split('#')[0] || '/'));
  }
  const broken = [];
  for (const h of hrefs) {
    const r = await fetch(`${A}${h}`);
    if (r.status !== 200) broken.push(`${h} → ${r.status}`);
  }
  check(`Liens internes (${hrefs.size} chemins)`, broken.length === 0, broken.join(', '));
  await ctx.close();
}

/* ---------- 6. API ---------- */
{
  const post = (body, headers = {}) =>
    fetch(`${A}/api/demande`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  const valid = { service: 'freinage', make: 'Peugeot', model: '308', name: 'Camille Test', phone: '0612345678', consent: true };
  let r = await post({ ...valid, phone: '12' }, { 'x-forwarded-for': '10.0.0.1' });
  const j = await r.json();
  check('API : données invalides → 422 avec erreurs par champ', r.status === 422 && j.errors?.phone);
  r = await post({ ...valid, website: 'http://spam' }, { 'x-forwarded-for': '10.0.0.2' });
  check('API : champ piège → réponse neutre, rien transmis', r.status === 200 && (await r.json()).channel === 'none');
  r = await post(valid, { 'x-forwarded-for': '10.0.0.3', origin: 'https://evil.example' });
  check('API : origine étrangère refusée (403)', r.status === 403);
  r = await post({ ...valid, date: nextSunday() }, { 'x-forwarded-for': '10.0.0.4' });
  check('API : date de fermeture refusée (422)', r.status === 422);
  r = await post('{oops', { 'x-forwarded-for': '10.0.0.5' });
  check('API : JSON invalide → 400', r.status === 400);
  r = await post(valid, { 'x-forwarded-for': '10.0.0.6' });
  check('API : non configurée → 503 NOT_CONFIGURED', r.status === 503 && (await r.json()).code === 'NOT_CONFIGURED');
  let last = 0;
  for (let k = 0; k < 6; k++) last = (await post(valid, { 'x-forwarded-for': '10.0.0.7' })).status;
  check('API : limitation de débit (429 après 5 requêtes)', last === 429);
}

// Le 503 volontaire du scénario « transmission non configurée » est journalisé par le navigateur : attendu.
const unexpected = consoleErrors.filter((e) => !e.includes('status of 503'));
check('Aucune erreur console inattendue', unexpected.length === 0, unexpected.slice(0, 5).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies`);
fs.writeFileSync(new URL('./interactions-report.json', import.meta.url), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
