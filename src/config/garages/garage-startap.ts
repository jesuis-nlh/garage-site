import type { GarageConfig, SourceRef } from '../types';

/*
 * Instance de démonstration du gabarit, présentée par STARTAP dans ses réalisations.
 * Garage fictif : aucune enseigne, adresse, note ni avis réels.
 * Le numéro est un simple modèle (le même que dans `_template.ts`).
 */

const demo: SourceRef = {
  label: 'Données de démonstration (garage fictif)',
  url: 'https://startap-site.vercel.app/realisations',
  checkedAt: '2026-10-27',
};

export const garageStartap: GarageConfig = {
  id: 'garage-startap',
  brand: {
    name: 'Garage STARTAP',
    shortName: 'Garage STARTAP',
    wordmark: { primary: 'STARTAP', secondary: 'Garage · Démonstration' },
    colors: { accent: '#FFD400', accentInk: '#0E0F11' },
  },
  copy: {
    heroEyebrow: 'Site de démonstration · Centre auto · Lyon',
    heroTitle: ['La précision mécanique.', 'La tranquillité d’esprit.'],
    heroLead:
      'Entretien, freinage, pneus, diagnostic : votre centre auto de quartier prend en charge votre véhicule, avec ou sans rendez-vous, du lundi au samedi.',
    garageTitle: 'Un atelier de quartier, des explications claires.',
    garageIntro:
      'Le Garage STARTAP est un garage fictif, imaginé pour montrer ce que peut offrir le site d’un centre auto : un accueil simple, des prestations lisibles et une prise de rendez-vous rapide.',
    garageBody: [
      'Tout commence par l’écoute : ce que vous avez remarqué, depuis quand, dans quelles conditions. Ces détails orientent le contrôle du véhicule et évitent les interventions inutiles.',
      'Avant d’intervenir, l’atelier vous explique ce qui doit être fait et pourquoi. Au moment de la restitution, vous savez précisément ce qui a été réalisé sur votre voiture.',
    ],
    finalTitle: 'Besoin d’un entretien ou d’un diagnostic ? Parlons de votre véhicule.',
    finalLead: 'Décrivez votre besoin en deux minutes, ou appelez directement l’atelier : on vous indique la marche à suivre et le créneau le plus adapté.',
  },
  contact: {
    phoneDisplay: '04 00 00 00 00',
    phoneE164: '+33400000000',
  },
  address: {
    street: 'Adresse de démonstration',
    postalCode: '69000',
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    country: 'FR',
    geo: { lat: 45.764, lng: 4.8357 },
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lyon',
    source: demo,
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
  hoursSource: demo,
  access: {},
  areaServed: ['Lyon', 'Villeurbanne'],
  booking: {
    walkIn: true,
    slots: ['Matin (8 h – 12 h)', 'Après-midi (12 h – 18 h 30)', 'Indifférent'],
  },
  // Démonstration : aucune note ni aucun avis, la section « Avis clients » est masquée.
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
      value: '6 j/7',
      label: 'Ouverture',
      detail: 'Du lundi au vendredi de 8 h à 18 h 30, le samedi de 8 h à 17 h.',
    },
    {
      value: 'Sans RDV',
      label: 'Accueil',
      detail: 'Le garage vous reçoit avec ou sans rendez-vous.',
    },
    {
      value: '10',
      label: 'Prestations',
      detail: 'De l’entretien courant à la distribution, présentées une à une.',
    },
    {
      value: 'Devis',
      label: 'Avant intervention',
      detail: 'Vous validez le devis avant toute intervention sur le véhicule.',
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
      validated: true,
    },
    {
      title: 'Contrôle & devis',
      text: 'Votre véhicule est examiné ; vous validez le devis avant toute intervention.',
      validated: true,
    },
    {
      title: 'Restitution',
      text: 'On vous explique les travaux réalisés et on vous remet une facture détaillée.',
      validated: true,
    },
  ],
  faq: [
    {
      q: 'Faut-il prendre rendez-vous ?',
      a: 'Le garage accueille avec ou sans rendez-vous. Réserver un créneau reste le meilleur moyen d’être pris en charge à l’heure qui vous convient.',
    },
    {
      q: 'Le formulaire en ligne confirme-t-il mon rendez-vous ?',
      a: 'Non. Il transmet votre demande à l’atelier, qui vous recontacte pour confirmer le créneau. Pour une demande urgente, le plus rapide reste d’appeler le garage.',
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
    title: 'Garage STARTAP · Site de démonstration d’un centre auto à Lyon',
    description:
      'Site de démonstration réalisé par STARTAP pour un garage fictif : prestations, déroulé d’une intervention, demande de rendez-vous et questions fréquentes.',
    keywords: ['site garage automobile', 'site centre auto', 'démonstration site web garage', 'STARTAP'],
  },
  legal: {
    publisherName: 'STARTAP (site de démonstration)',
  },
  launch: {
    servicesConfirmed: true,
    copyApproved: true,
    accessConfirmed: true,
    brandAssetsApproved: true,
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
    illustrativeNotice: 'Site de démonstration réalisé par STARTAP. Garage fictif, visuels en rendu 3D.',
  },
};
