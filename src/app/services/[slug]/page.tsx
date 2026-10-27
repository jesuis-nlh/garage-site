import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { garage } from '@/config';
import { services, serviceBySlug } from '@/lib/services';
import { groupedHours } from '@/lib/hours';
import { formatNumber } from '@/lib/format';
import { jsonLdScript, serviceJsonLd } from '@/lib/structured-data';
import { ServiceGlyph } from '@/components/ui/ServiceGlyph';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { OpenStatus } from '@/components/ui/OpenStatus';

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  const title = `${s.title} à ${garage.address.city}`;
  const description = `${s.short} ${garage.brand.name}, ${garage.address.street} à ${garage.address.city}. Tél. ${garage.contact.phoneDisplay}.`;
  return {
    title,
    description,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title: `${title} · ${garage.brand.name}`, description, url: `/services/${s.slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) notFound();
  const others = services.filter((o) => o.id !== s.id);
  const bookingHref = `/?service=${s.id}#rendez-vous`;
  const { rating } = garage;

  return (
    <>
      <section aria-labelledby="service-title" className="relative overflow-hidden bg-ink-900 pt-[calc(var(--header-h)+3rem)] pb-20 md:pb-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <nav aria-label="Fil d’Ariane" className="intro-fade label text-steel-400">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-bone-100">
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/#services" className="hover:text-bone-100">
                    Prestations
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-steel-200">
                  {s.title}
                </li>
              </ol>
            </nav>
            <p className="intro-fade mt-10 flex items-center gap-3 label text-accent">
              <span aria-hidden="true" className="size-2 bg-accent" />
              {s.kicker}
            </p>
            <h1 id="service-title" className="mt-6 display display-xl">
              <span className="intro-line">
                <span>{s.title}</span>
              </span>
              <span className="intro-line text-steel-300" style={{ ['--i' as string]: 1 }}>
                <span>à {garage.address.city}</span>
              </span>
            </h1>
            <p className="intro-fade mt-8 max-w-xl text-lg leading-relaxed text-steel-200" style={{ ['--i' as string]: 2 }}>
              {s.short}
            </p>
            {s.price && <p className="intro-fade mt-4 text-steel-200">{s.price.label}</p>}
            <div className="intro-fade mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4" style={{ ['--i' as string]: 3 }}>
              <Button href={bookingHref} size="lg" magnetic>
                Demander ce service
              </Button>
              <Button href={`tel:${garage.contact.phoneE164}`} variant="outline" size="lg" icon={null} leadingIcon="phone">
                {garage.contact.phoneDisplay}
              </Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <ServiceGlyph glyph={s.glyph} className="mx-auto w-[min(80vw,26rem)] text-bone-100" />
          </div>
        </div>
      </section>

      <section className="theme-light bg-bone-100 py-20 text-ink-900 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h2 className="display display-m">Ce que comprend la prestation</h2>
            <p className="mt-6 leading-relaxed text-ink-700">{s.long}</p>
            <ul className="mt-8 border-t border-ink-900/15">
              {s.includes.map((item) => (
                <li key={item} className="flex gap-4 border-b border-ink-900/15 py-4" data-reveal>
                  <Icon name="check" className="mt-1 size-4 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="display display-m">Les signes qui doivent vous alerter</h2>
            <ol className="mt-8 grid gap-4">
              {s.signs.map((sign, i) => (
                <li key={sign} className="flex gap-5 rounded-[4px] bg-bone-50 p-5" data-reveal>
                  <span className="pt-1 label text-ink-700 tabular">{String(i + 1).padStart(2, '0')}</span>
                  {sign}
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-ink-700">
              Ces signes justifient un contrôle ; seul l’examen du véhicule en atelier permet de déterminer l’intervention nécessaire.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="local-title" className="bg-ink-800 py-20 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="local-title" className="display display-m">
              {s.title} : votre centre au {garage.address.street}
            </h2>
            <p className="mt-6 text-steel-300">
              {garage.brand.name} accueille les automobilistes de {garage.areaServed.slice(0, 4).join(', ')} et des environs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={bookingHref}>Prendre rendez-vous</Button>
              <Button href="/#contact" variant="outline" icon={null} leadingIcon="pin">
                Plan d’accès
              </Button>
            </div>
          </div>
          <dl className="grid gap-6 lg:col-span-5 lg:col-start-8">
            <div>
              <dt className="label text-steel-400">Horaires</dt>
              <dd className="mt-2">
                {groupedHours(garage.hours).map((g) => (
                  <span key={g.days} className="block">
                    {g.days} : {g.value}
                  </span>
                ))}
                <OpenStatus className="mt-2 text-sm text-steel-300" />
              </dd>
            </div>
            {rating && (
              <div>
                <dt className="label text-steel-400">Avis clients</dt>
                <dd className="mt-2">
                  {String(rating.value).replace('.', ',')}/{rating.best} sur {formatNumber(rating.count)} avis ·{' '}
                  <a href={rating.source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {rating.platform}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section aria-labelledby="others-title" className="bg-ink-950 py-20 md:py-24">
        <div className="container-x">
          <h2 id="others-title" className="label text-steel-300">
            Autres prestations
          </h2>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-[4px] bg-bone-100/10 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/services/${o.slug}`}
                  className="group flex h-full items-center justify-between gap-4 bg-ink-950 p-6 transition-colors hover:bg-ink-850"
                >
                  <span>
                    <span className="block text-[1.15rem] font-[620] tracking-[-0.015em]">{o.title}</span>
                    <span className="mt-1 block label text-steel-400">{o.kicker}</span>
                  </span>
                  <Icon name="arrow-right" className="size-5 shrink-0 text-steel-400 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(serviceJsonLd(s)) }} />
    </>
  );
}
