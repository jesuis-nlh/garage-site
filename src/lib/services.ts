import { garage } from '@/config';
import { serviceCatalogue, type ServiceDefinition } from '@/content/services';
import { concerns } from '@/content/finder';
import { frenchTypography } from './typography';
import type { ServiceSelection } from '@/config/types';

export type ResolvedService = ServiceDefinition & { price?: ServiceSelection['price'] };

/** Prestations réellement proposées par le garage actif, textes du catalogue + surcharges. */
export const services: ResolvedService[] = garage.services.map((sel) =>
  frenchTypography({
    ...serviceCatalogue[sel.id],
    ...(sel.short ? { short: sel.short } : {}),
    ...(sel.long ? { long: sel.long } : {}),
    price: sel.price,
  }),
);

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);

/** Symptômes filtrés sur les prestations disponibles dans ce garage. */
export const availableConcerns = frenchTypography(concerns)
  .map((c) => ({ ...c, services: c.services.filter((id) => services.some((s) => s.id === id)) }))
  .filter((c) => c.services.length > 0);
