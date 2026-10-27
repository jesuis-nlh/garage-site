import type { GarageConfig } from './types';
import { garageStartap } from './garages/garage-startap';
import { frenchTypography } from '@/lib/typography';

/** Registre des garages disponibles. Ajouter ici chaque nouvelle configuration. */
const registry: Record<string, GarageConfig> = {
  [garageStartap.id]: garageStartap,
};

const id = process.env.NEXT_PUBLIC_GARAGE_ID || garageStartap.id;
const selected = registry[id];
if (!selected) {
  throw new Error(`Garage inconnu : "${id}". Garages disponibles : ${Object.keys(registry).join(', ')}`);
}

/** Configuration active, avec typographie française appliquée (espaces fines insécables). */
export const garage: GarageConfig = frenchTypography(selected);

/** Note ou avis à publier : sans eux, la section « Avis clients » et son lien de navigation sont masqués. */
export const hasReviews = Boolean(garage.rating) || garage.testimonials.length > 0;

/** Numéro affiché d'une section de l'accueil (« 07 »…), qui saute la section des avis quand elle est masquée. */
export const sectionIndex = (n: number) => String(hasReviews || n < 6 ? n : n - 1).padStart(2, '0');

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
