/**
 * Modèle de configuration d'un garage.
 * Tout le contenu propre à une entreprise vit ici : les composants ne contiennent
 * aucune donnée codée en dur (nom, adresse, horaires, avis, prestations…).
 */

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** Plage horaire au format 24 h, heure de Paris : { open: '08:00', close: '18:30' } */
export interface TimeRange {
  open: string;
  close: string;
}

/** Provenance d'une information publiée (traçabilité des données vérifiées). */
export interface SourceRef {
  label: string;
  url: string;
  /** Date de relevé, format ISO (AAAA-MM-JJ). */
  checkedAt: string;
}

export type ServiceId =
  | 'entretien'
  | 'diagnostic'
  | 'freinage'
  | 'pneumatiques'
  | 'suspension'
  | 'climatisation'
  | 'batterie'
  | 'embrayage'
  | 'distribution'
  | 'echappement'
  | 'hybride';

export interface ServiceSelection {
  id: ServiceId;
  /** Tarif publié par le garage. N'afficher qu'un prix vérifié et daté. */
  price?: { label: string; source: SourceRef };
  /** Surcharges éditoriales optionnelles (sinon, texte du catalogue). */
  short?: string;
  long?: string;
}

export interface Testimonial {
  author: string;
  date: string;
  rating: number;
  text: string;
  source: SourceRef;
}

export interface TrustItem {
  value: string;
  label: string;
  detail: string;
  source?: SourceRef;
}

export interface ProcessStep {
  title: string;
  text: string;
  /** false = formulation à faire valider par le garage avant mise en ligne (signalé par check:launch). */
  validated: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface GarageConfig {
  id: string;
  brand: {
    name: string;
    shortName: string;
    /** Logotype typographique (à remplacer par le logo officiel si fourni). */
    wordmark: { primary: string; secondary: string };
    network?: { name: string; url: string };
    colors: {
      /** Couleur d'accent unique de la marque. */
      accent: string;
      /** Couleur du texte posé sur l'accent (contraste AA). */
      accentInk: string;
    };
  };
  copy: {
    heroEyebrow: string;
    heroTitle: [string, string];
    heroLead: string;
    garageTitle: string;
    garageIntro: string;
    garageBody: string[];
    finalTitle: string;
    finalLead: string;
  };
  contact: {
    phoneDisplay: string;
    phoneE164: string;
    email?: string;
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
    region: string;
    country: 'FR';
    geo: { lat: number; lng: number };
    mapsUrl: string;
    source: SourceRef;
  };
  hours: Record<DayKey, TimeRange[]>;
  hoursSource: SourceRef;
  access: {
    transit?: string;
    parking?: string;
  };
  areaServed: string[];
  booking: {
    /** Lien de réservation officiel tiers (ex. réseau), en complément du formulaire. */
    external?: { url: string; label: string };
    walkIn: boolean;
    /** Créneaux proposés dans le formulaire. */
    slots: string[];
  };
  rating?: {
    value: number;
    best: number;
    count: number;
    platform: string;
    method: string;
    source: SourceRef;
  };
  testimonials: Testimonial[];
  services: ServiceSelection[];
  trust: TrustItem[];
  process: ProcessStep[];
  faq: FaqItem[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  legal: {
    publisherName?: string;
    legalForm?: string;
    siret?: string;
    rcs?: string;
    vatNumber?: string;
    publicationDirector?: string;
    host?: string;
  };
  /** Validations à obtenir de l'exploitant avant mise en ligne (contrôlées par `npm run check:launch`). */
  launch: {
    servicesConfirmed: boolean;
    copyApproved: boolean;
    accessConfirmed: boolean;
    brandAssetsApproved: boolean;
  };
  media: {
    heroVideo?: { mp4: string; webm?: string; poster: string };
    heroStill: { src: string; alt: string; width: number; height: number };
    secondary: { src: string; alt: string; width: number; height: number };
    /** Photos réelles de l'atelier et de l'équipe (prioritaires sur les rendus 3D). */
    workshopPhotos: { src: string; alt: string; width: number; height: number }[];
    /** Mention affichée lorsque les visuels sont des illustrations et non des photos du lieu. */
    illustrativeNotice?: string;
  };
}
