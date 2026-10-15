import type { GarageConfig } from './types';
import { midasVilleurbanneZola } from './garages/midas-villeurbanne-zola';
import { frenchTypography } from '@/lib/typography';

/** Registre des garages disponibles. Ajouter ici chaque nouvelle configuration. */
const registry: Record<string, GarageConfig> = {
  [midasVilleurbanneZola.id]: midasVilleurbanneZola,
};

const id = process.env.NEXT_PUBLIC_GARAGE_ID || midasVilleurbanneZola.id;
const selected = registry[id];
if (!selected) {
  throw new Error(`Garage inconnu : "${id}". Garages disponibles : ${Object.keys(registry).join(', ')}`);
}

/** Configuration active, avec typographie française appliquée (espaces fines insécables). */
export const garage: GarageConfig = frenchTypography(selected);

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
