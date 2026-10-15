// Vérification avant mise en ligne : liste ce qui bloque ou doit être validé.
// Usage : npm run check:launch   (lit NEXT_PUBLIC_GARAGE_ID, NEXT_PUBLIC_SITE_URL et les variables de transmission)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.env.NEXT_PUBLIC_GARAGE_ID || 'midas-villeurbanne-zola';
const file = path.join(root, 'src/config/garages', `${id}.ts`);
if (!fs.existsSync(file)) {
  console.error(`Configuration introuvable : ${file}`);
  process.exit(2);
}
const mod = await import(file);
const g = Object.values(mod).find((v) => v && typeof v === 'object' && v.id === id);

const blockers = [];
const warnings = [];
const ok = [];
const check = (cond, okMsg, failMsg, list = blockers) => (cond ? ok.push(okMsg) : list.push(failMsg));

// Domaine et transmission des demandes
const site = process.env.NEXT_PUBLIC_SITE_URL || '';
check(/^https:\/\//.test(site), `URL du site : ${site}`, 'NEXT_PUBLIC_SITE_URL absente ou non HTTPS (canonique, sitemap, Open Graph).');
const email = process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_TO && process.env.LEAD_EMAIL_FROM;
const webhook = process.env.LEAD_WEBHOOK_URL;
check(
  email || webhook,
  `Transmission des demandes : ${[email && 'e-mail (Resend)', webhook && 'webhook'].filter(Boolean).join(' + ')}`,
  'Aucune transmission configurée : le formulaire affichera « demande non envoyée » (RESEND_* ou LEAD_WEBHOOK_URL).',
);

// Mentions légales (LCEN art. 6)
const legal = g.legal || {};
for (const [key, label] of [
  ['publisherName', 'raison sociale'],
  ['legalForm', 'forme juridique'],
  ['siret', 'SIRET'],
  ['publicationDirector', 'directeur de la publication'],
  ['host', 'hébergeur (nom, adresse, téléphone)'],
]) {
  check(Boolean(legal[key]), `Mentions légales : ${label}`, `Mentions légales : ${label} manquant(e).`);
}

// Validations de l'exploitant
const l = g.launch || {};
check(l.servicesConfirmed, 'Prestations confirmées', 'Liste des prestations à confirmer par l’exploitant (launch.servicesConfirmed).');
check(l.copyApproved, 'Textes validés', 'Textes éditoriaux à faire valider (launch.copyApproved).');
check(l.accessConfirmed, 'Accès confirmés', 'Informations d’accès / transports à vérifier (launch.accessConfirmed).', warnings);
check(l.brandAssetsApproved, 'Logo validé', 'Logotype provisoire : valider les éléments de marque (launch.brandAssetsApproved).', warnings);
const unvalidated = (g.process || []).filter((s) => !s.validated).map((s) => s.title);
check(!unvalidated.length, 'Déroulé validé', `Étapes du déroulé à valider : ${unvalidated.join(', ')}.`);

// Contenus recommandés
check(
  (g.media?.workshopPhotos || []).length > 0,
  'Photos réelles de l’atelier',
  'Aucune photo réelle de l’atelier ou de l’équipe (rendus 3D utilisés à la place).',
  warnings,
);
check((g.testimonials || []).length > 0, 'Avis nominatifs sourcés', 'Aucun avis nominatif : seule la note globale sourcée est affichée.', warnings);
check(Boolean(g.contact?.email), 'E-mail de contact', 'Pas d’e-mail de contact public (facultatif).', warnings);
check(fs.existsSync(path.join(root, 'public/og.jpg')), 'Image Open Graph présente', 'public/og.jpg manquante (npm run render:og).');

// Fraîcheur des sources
const sources = [g.address?.source, g.hoursSource, g.rating?.source].filter(Boolean);
const stale = sources.filter((s) => (Date.now() - new Date(s.checkedAt).getTime()) / 864e5 > 90);
check(
  !stale.length,
  'Sources relevées il y a moins de 90 jours',
  `Sources à revérifier (plus de 90 jours) : ${stale.map((s) => s.label).join(', ')}.`,
  warnings,
);

console.log(`\nVérification avant mise en ligne — ${g.brand.name}\n`);
ok.forEach((m) => console.log(`  ✔ ${m}`));
warnings.forEach((m) => console.log(`  ⚠ ${m}`));
blockers.forEach((m) => console.log(`  ✘ ${m}`));
console.log(`\n${blockers.length} point(s) bloquant(s), ${warnings.length} avertissement(s).`);
process.exit(blockers.length ? 1 : 0);
