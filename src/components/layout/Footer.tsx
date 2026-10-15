import Link from 'next/link';
import { garage } from '@/config';
import { services } from '@/lib/services';
import { groupedHours } from '@/lib/hours';
import { Wordmark } from '@/components/ui/Wordmark';
import { navLinks } from './nav';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-bone-100/10 bg-ink-950 pt-20 pb-28 md:pb-12">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark />
            <p className="mt-6 max-w-sm text-steel-300">
              {garage.address.street}, {garage.address.postalCode} {garage.address.city}.
              {garage.brand.network && <> Centre du réseau {garage.brand.network.name}.</>}
            </p>
            <a href={`tel:${garage.contact.phoneE164}`} className="mt-6 inline-block text-2xl font-[650] tracking-[-0.02em] tabular hover:text-accent">
              {garage.contact.phoneDisplay}
            </a>
          </div>

          <nav aria-label="Prestations" className="lg:col-span-3">
            <h2 className="label text-steel-300">Prestations</h2>
            <ul className="mt-5 grid gap-2.5">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/services/${s.slug}`} className="link-underline text-steel-200 hover:text-bone-100">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Le centre" className="lg:col-span-2">
            <h2 className="label text-steel-300">Le centre</h2>
            <ul className="mt-5 grid gap-2.5">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="link-underline text-steel-200 hover:text-bone-100">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#rendez-vous" className="link-underline text-steel-200 hover:text-bone-100">
                  Rendez-vous & devis
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="link-underline text-steel-200 hover:text-bone-100">
                  Questions fréquentes
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="label text-steel-300">Horaires</h2>
            <dl className="mt-5 grid gap-2.5">
              {groupedHours(garage.hours).map((g) => (
                <div key={g.days} className="flex justify-between gap-6 border-b border-bone-100/10 pb-2.5">
                  <dt className="text-steel-300">{g.days}</dt>
                  <dd className="text-right tabular">{g.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-steel-400">Hors jours fériés et fermetures exceptionnelles.</p>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-bone-100/10 pt-8 text-sm text-steel-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {garage.brand.name}
            {garage.media.illustrativeNotice && (
              <span className="block md:inline md:before:mx-2 md:before:content-['·']">{garage.media.illustrativeNotice}</span>
            )}
          </p>
          <ul className="flex gap-6">
            <li>
              <Link href="/mentions-legales" className="link-underline hover:text-bone-100">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="link-underline hover:text-bone-100">
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
