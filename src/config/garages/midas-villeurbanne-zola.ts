import type { GarageConfig, SourceRef } from '../types';

/*
 * Données relevées le 15/10/2026. Chaque information factuelle publiée
 * (adresse, téléphone, horaires, note) est rattachée à sa source.
 * À faire valider par l'exploitant avant mise en ligne : voir `npm run check:launch`.
 */

const midasPage: SourceRef = {
  label: 'Fiche officielle du centre sur midas.fr',
  url: 'https://www.midas.fr/centres-auto-midas/auvergne-rhone-alpes/rhone/lyon/villeurbanne-zola_1049',
  checkedAt: '2026-10-15',
};

const pagesJaunes: SourceRef = {
  label: 'PagesJaunes — Midas, 83 cours Émile Zola',
  url: 'https://www.pagesjaunes.fr/pros/06530058',
  checkedAt: '2026-10-15',
};

export const midasVilleurbanneZola: GarageConfig = {
  id: 'midas-villeurbanne-zola',
  brand: {
    name: 'Midas Villeurbanne Zola',
    shortName: 'Midas Zola',
    wordmark: { primary: 'Midas', secondary: 'Villeurbanne · Zola' },
    network: { name: 'Midas', url: 'https://www.midas.fr' },
    colors: { accent: '#FFD100', accentInk: '#0E0F11' },
  },
  copy: {
    heroEyebrow: 'Centre auto · Villeurbanne · Cours Émile Zola',
    heroTitle: ['La précision mécanique.', 'La tranquillité d’esprit.'],
    heroLead:
      'Entretien, freinage, pneus, diagnostic : votre centre auto du cours Émile Zola prend en charge votre véhicule, avec ou sans rendez-vous, du lundi au samedi.',
    garageTitle: 'Un atelier de quartier, les standards d’un réseau national.',
    garageIntro:
      'Au 83-85 cours Émile Zola, entre Charpennes et Gratte-Ciel, le centre Midas Villeurbanne Zola accueille les automobilistes de Villeurbanne et de l’est lyonnais six jours sur sept.',
    garageBody: [
      'Tout commence par l’écoute : ce que vous avez remarqué, depuis quand, dans quelles conditions. Ces détails orientent le contrôle du véhicule et évitent les interventions inutiles.',
      'Avant d’intervenir, l’atelier vous explique ce qui doit être fait et pourquoi. Au moment de la restitution, vous savez précisément ce qui a été réalisé sur votre voiture.',
    ],
    finalTitle: 'Besoin d’un entretien ou d’un diagnostic ? Parlons de votre véhicule.',
    finalLead: 'Décrivez votre besoin en deux minutes, ou appelez directement l’atelier : on vous indique la marche à suivre et le créneau le plus adapté.',
  },
  contact: {
    phoneDisplay: '04 78 94 26 48',
    phoneE164: '+33478942648',
  },
  address: {
    street: '83-85 cours Émile Zola',
    postalCode: '69100',
    city: 'Villeurbanne',
    region: 'Auvergne-Rhône-Alpes',
    country: 'FR',
    geo: { lat: 45.771414, lng: 4.870689 },
    mapsUrl: 'https://maps.google.com/?cid=13974800454357259836',
    source: midasPage,
  },
  hours: {
    mon: [{ open: '08:00', close: '18:30' }],
    tue: [{ open: '08:00', close: '18:30' }],
    wed: [{ open: '08:00', close: '18:30' }],
    thu: [{ open: '08:00', close: '18:30' }],
    fri: [{ open: '08:00', close: '18:30' }],
    sat: [{ open: '08:00', close: '17:00' }],
    sun: [],
  },
  hoursSource: midasPage,
  access: {
    transit: 'Métro A : stations Charpennes et République – Villeurbanne à proximité',
  },
  areaServed: ['Villeurbanne', 'Charpennes', 'Gratte-Ciel', 'Tonkin', 'Lyon 6e', 'Lyon 3e', 'Caluire-et-Cuire', 'Vaulx-en-Velin', 'Bron'],
  booking: {
    external: { url: midasPage.url, label: 'Réserver sur midas.fr' },
    walkIn: true,
    slots: ['Matin (8 h – 12 h)', 'Après-midi (12 h – 18 h 30)', 'Indifférent'],
  },
  rating: {
    value: 4.5,
    best: 5,
    count: 2067,
    platform: 'midas.fr',
    method: 'Avis collectés par Midas auprès de clients ayant réalisé une prestation dans le centre.',
    source: midasPage,
  },
  // Aucun avis nominatif n'a pu être relevé verbatim : ajouter ici uniquement des avis réels et sourcés.
  testimonials: [],
  services: [
    { id: 'entretien' },
    { id: 'diagnostic' },
    { id: 'freinage' },
    { id: 'pneumatiques' },
    { id: 'suspension' },
    { id: 'climatisation' },
    { id: 'batterie' },
    { id: 'embrayage' },
    { id: 'distribution' },
    { id: 'echappement' },
  ],
  trust: [
    {
      value: '4,5/5',
      label: 'Note moyenne',
      detail: '2 067 avis clients recueillis par Midas après prestation.',
      source: midasPage,
    },
    {
      value: '6 j/7',
      label: 'Ouverture',
      detail: 'Du lundi au vendredi de 8 h à 18 h 30, le samedi de 8 h à 17 h.',
      source: midasPage,
    },
    {
      value: 'Sans RDV',
      label: 'Accueil',
      detail: 'Le centre vous reçoit avec ou sans rendez-vous.',
      source: midasPage,
    },
    {
      value: 'Réseau',
      label: 'Midas',
      detail: 'Un centre du réseau Midas, au cœur de Villeurbanne.',
      source: pagesJaunes,
    },
  ],
  process: [
    {
      title: 'Votre demande',
      text: 'Choisissez la prestation et le créneau qui vous arrange, en ligne ou par téléphone.',
      validated: true,
    },
    {
      title: 'Confirmation',
      text: 'L’atelier vous recontacte pour confirmer le rendez-vous et préciser votre besoin.',
      validated: false,
    },
    {
      title: 'Contrôle & devis',
      text: 'Votre véhicule est examiné ; vous validez le devis avant toute intervention.',
      validated: false,
    },
    {
      title: 'Restitution',
      text: 'On vous explique les travaux réalisés et on vous remet une facture détaillée.',
      validated: false,
    },
  ],
  faq: [
    {
      q: 'Faut-il prendre rendez-vous ?',
      a: 'Le centre accueille avec ou sans rendez-vous. Réserver un créneau reste le meilleur moyen d’être pris en charge à l’heure qui vous convient.',
    },
    {
      q: 'Le formulaire en ligne confirme-t-il mon rendez-vous ?',
      a: 'Non. Il transmet votre demande à l’atelier, qui vous recontacte pour confirmer le créneau. Pour une demande urgente, le plus rapide reste d’appeler le centre.',
    },
    {
      q: 'Ma voiture est sous garantie constructeur : puis-je la faire entretenir ici ?',
      a: 'Oui. La réglementation européenne (règlement UE n° 461/2010) vous permet de faire entretenir votre véhicule chez le réparateur de votre choix sans perdre la garantie constructeur, dès lors que l’entretien suit le programme du constructeur avec des pièces de qualité équivalente.',
    },
    {
      q: 'Un voyant vient de s’allumer, que faire ?',
      a: 'Un voyant rouge impose de vous arrêter dès que possible, en sécurité. Un voyant orange signale une anomalie à faire contrôler rapidement. Le diagnostic électronique permet de lire les codes défaut enregistrés par le calculateur et d’orienter la réparation.',
    },
    {
      q: 'Puis-je obtenir un devis avant l’intervention ?',
      a: 'Oui. Faites votre demande en ligne ou par téléphone ; selon la prestation, l’atelier peut avoir besoin d’examiner le véhicule pour établir un devis précis.',
    },
  ],
  seo: {
    title: 'Garage auto à Villeurbanne · Midas Zola, cours Émile Zola',
    description:
      'Centre auto Midas au 83-85 cours Émile Zola à Villeurbanne : entretien, freinage, pneus, diagnostic. Avec ou sans rendez-vous, du lundi au samedi. Tél. 04 78 94 26 48.',
    keywords: [
      'garage Villeurbanne',
      'garage automobile Lyon',
      'centre auto Villeurbanne',
      'entretien voiture Villeurbanne',
      'mécanicien Villeurbanne',
      'diagnostic automobile Lyon',
      'freinage Villeurbanne',
      'pneus Villeurbanne',
      'garage près de Charpennes',
      'garage cours Émile Zola',
    ],
  },
  legal: {
    // À compléter avec les informations de l'exploitant (obligatoire — LCEN art. 6).
  },
  launch: {
    // Liste des prestations issue de l'offre du réseau : à confirmer pour ce centre.
    servicesConfirmed: false,
    // Textes éditoriaux (section « Notre garage », déroulé) : à faire valider.
    copyApproved: false,
    // Stations de métro citées : à vérifier sur place.
    accessConfirmed: false,
    // Logotype typographique provisoire : utiliser les éléments officiels du réseau si la charte l'exige.
    brandAssetsApproved: false,
  },
  media: {
    heroVideo: { mp4: '/media/hero-loop.mp4', webm: '/media/hero-loop.webm', poster: '/media/hero-poster.jpg' },
    heroStill: {
      src: '/media/brake-assembly.png',
      alt: 'Disque de frein percé et étrier jaune, rendu 3D',
      width: 2400,
      height: 1800,
    },
    secondary: {
      src: '/media/wheel.png',
      alt: 'Roue complète avec jante, disque et étrier visibles, rendu 3D',
      width: 2400,
      height: 1800,
    },
    workshopPhotos: [],
    illustrativeNotice: 'Visuels : rendus 3D réalisés pour ce site, à titre d’illustration.',
  },
};
