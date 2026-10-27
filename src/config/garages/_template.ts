import type { GarageConfig } from '../types';

/*
 * Modèle de départ pour un nouveau garage.
 * 1. Dupliquez ce fichier (ex. `garage-dupont-lyon7.ts`) et remplacez CHAQUE valeur
 *    par une information réelle et vérifiée (source + date de relevé).
 * 2. Déclarez-le dans `src/config/index.ts`, puis définissez NEXT_PUBLIC_GARAGE_ID.
 * 3. Lancez `npm run check:launch` : le script liste ce qui manque avant la mise en ligne.
 * Ce fichier n'est importé nulle part : ses valeurs fictives ne peuvent pas apparaître sur le site.
 */
export const templateGarage: GarageConfig = {
  id: 'nouveau-garage',
  brand: {
    name: 'Nom commercial du garage',
    shortName: 'Nom court',
    wordmark: { primary: 'Nom', secondary: 'Quartier · Ville' },
    colors: { accent: '#3D7BFF', accentInk: '#0E0F11' },
  },
  copy: {
    heroEyebrow: 'Garage indépendant · Lyon 7e',
    heroTitle: ['La précision mécanique.', 'La tranquillité d’esprit.'],
    heroLead: 'Phrase de positionnement : spécialités réelles, zone, modalités d’accueil.',
    garageTitle: 'Titre éditorial de la section « Notre garage ».',
    garageIntro: 'Présentation courte et factuelle du garage.',
    garageBody: ['Philosophie de travail.', 'Engagements réellement tenus.'],
    finalTitle: 'Besoin d’un entretien ou d’un diagnostic ? Parlons de votre véhicule.',
    finalLead: 'Phrase d’invitation au contact.',
  },
  contact: { phoneDisplay: '04 00 00 00 00', phoneE164: '+33400000000', email: 'contact@exemple.fr' },
  address: {
    street: 'Adresse',
    postalCode: '69000',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    country: 'FR',
    geo: { lat: 45.75, lng: 4.85 },
    mapsUrl: 'https://maps.google.com/?cid=',
    source: { label: 'Source', url: 'https://', checkedAt: '2026-01-01' },
  },
  hours: {
    mon: [
      { open: '08:00', close: '12:00' },
      { open: '14:00', close: '18:00' },
    ],
    tue: [{ open: '08:00', close: '18:00' }],
    wed: [{ open: '08:00', close: '18:00' }],
    thu: [{ open: '08:00', close: '18:00' }],
    fri: [{ open: '08:00', close: '18:00' }],
    sat: [],
    sun: [],
  },
  hoursSource: { label: 'Source', url: 'https://', checkedAt: '2026-01-01' },
  access: { transit: undefined, parking: undefined },
  areaServed: ['Lyon 7e'],
  booking: { walkIn: false, slots: ['Matin', 'Après-midi', 'Indifférent'] },
  rating: undefined,
  testimonials: [],
  services: [{ id: 'entretien' }, { id: 'diagnostic' }, { id: 'hybride' }],
  trust: [],
  process: [],
  faq: [],
  seo: { title: 'Titre SEO unique', description: 'Description SEO unique', keywords: [] },
  legal: {},
  launch: { servicesConfirmed: false, copyApproved: false, accessConfirmed: false, brandAssetsApproved: false },
  media: {
    heroStill: { src: '/media/brake-assembly.png', alt: '', width: 2400, height: 1800 },
    secondary: { src: '/media/wheel.png', alt: '', width: 2400, height: 1800 },
    workshopPhotos: [],
  },
};
