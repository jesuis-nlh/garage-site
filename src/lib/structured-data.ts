import { garage, siteUrl } from '@/config';
import { schemaOpeningHours } from './hours';
import { services, type ResolvedService } from './services';

const businessId = `${siteUrl}/#garage`;

/**
 * Données structurées AutoRepair (schema.org).
 * La note moyenne n'est volontairement pas balisée : les avis « auto-publiés » par
 * l'établissement ne sont pas éligibles aux extraits enrichis de Google.
 */
export function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    '@id': businessId,
    name: garage.brand.name,
    url: siteUrl,
    telephone: garage.contact.phoneE164,
    ...(garage.contact.email ? { email: garage.contact.email } : {}),
    image: `${siteUrl}${garage.media.heroStill.src}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: garage.address.street,
      postalCode: garage.address.postalCode,
      addressLocality: garage.address.city,
      addressRegion: garage.address.region,
      addressCountry: garage.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: garage.address.geo.lat, longitude: garage.address.geo.lng },
    hasMap: garage.address.mapsUrl,
    openingHoursSpecification: schemaOpeningHours(garage.hours),
    areaServed: garage.areaServed.map((name) => ({ '@type': 'Place', name })),
    ...(garage.brand.network ? { brand: { '@type': 'Brand', name: garage.brand.network.name } } : {}),
    sameAs: [garage.address.source.url],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Prestations',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, url: `${siteUrl}/services/${s.slug}` },
      })),
    },
  };
}

export function serviceJsonLd(s: ResolvedService) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${s.title} à ${garage.address.city}`,
      serviceType: s.title,
      description: s.short,
      url: `${siteUrl}/services/${s.slug}`,
      provider: { '@id': businessId },
      areaServed: garage.areaServed.map((name) => ({ '@type': 'Place', name })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Prestations', item: `${siteUrl}/#services` },
        { '@type': 'ListItem', position: 3, name: s.title, item: `${siteUrl}/services/${s.slug}` },
      ],
    },
  ];
}

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: garage.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** Sérialisation sûre pour une balise <script type="application/ld+json">. */
export const jsonLdScript = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
