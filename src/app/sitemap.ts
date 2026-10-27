import type { MetadataRoute } from 'next';
import { siteUrl } from '@/config';
import { services } from '@/lib/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...services.map((s) => ({ url: `${siteUrl}/services/${s.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 })),
    { url: `${siteUrl}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
