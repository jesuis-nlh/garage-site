import { hasReviews } from '@/config';

export const navLinks = [
  { href: '/#services', id: 'services', label: 'Services' },
  { href: '/#garage', id: 'garage', label: 'Notre garage' },
  ...(hasReviews ? [{ href: '/#avis', id: 'avis', label: 'Avis clients' }] : []),
  { href: '/#contact', id: 'contact', label: 'Contact' },
];
