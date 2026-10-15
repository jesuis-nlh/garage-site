import Link from 'next/link';
import type { CSSProperties } from 'react';
import { garage } from '@/config';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { OpenStatus } from '@/components/ui/OpenStatus';
import { Stars } from '@/components/ui/Stars';
import { HeroMedia } from './HeroMedia';

const i = (n: number) => ({ '--i': n }) as CSSProperties;

export function Hero() {
  const { copy, contact, address, rating, booking, media } = garage;
  const fmt = (n: number) => n.toLocaleString('fr-FR');

  return (
    <section id="accueil" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink-900">
      <HeroMedia media={media} />

      {/* Trame technique discrète */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 hidden lg:block">
        <div className="container-x grid h-full grid-cols-4">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="h-full border-l border-bone-100/[0.045]" />
          ))}
        </div>
      </div>

      <div className="relative container-x flex flex-1 flex-col justify-end pt-[calc(var(--header-h)+54vw)] pb-10 sm:pt-[calc(var(--header-h)+27rem)] xl:justify-center xl:pt-[calc(var(--header-h)+3rem)] xl:pb-14">
        <p className="intro-fade flex items-start gap-3 label text-steel-300 sm:items-center" style={i(0)}>
          <span aria-hidden="true" className="mt-1 size-2 shrink-0 bg-accent sm:mt-0" />
          {copy.heroEyebrow}
        </p>

        <h1 id="hero-title" className="mt-5 max-w-[8.6em] display display-xl xl:mt-8">
          <span className="intro-line" style={i(0)}>
            <span>{copy.heroTitle[0]}</span>
          </span>
          <span className="intro-line text-steel-300" style={i(1)}>
            <span>{copy.heroTitle[1]}</span>
          </span>
        </h1>

        <p className="intro-fade mt-5 max-w-[34rem] text-[1.08rem] leading-relaxed text-steel-200 sm:mt-7 sm:text-lg" style={i(2)}>
          {copy.heroLead}
        </p>

        <div className="intro-fade mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4" style={i(3)}>
          <Button href="/#rendez-vous" size="lg" magnetic>
            Prendre rendez-vous
          </Button>
          <Button href="/#services" variant="outline" size="lg" icon={null}>
            Nos services
          </Button>
          <a
            href={`tel:${contact.phoneE164}`}
            className="group mt-2 inline-flex items-center justify-center gap-3 py-2 text-[1.05rem] sm:mt-0 sm:ml-2"
            aria-label={`Appeler le garage au ${contact.phoneDisplay}`}
          >
            <span className="grid size-10 place-items-center rounded-full border border-bone-100/25 transition-colors group-hover:border-accent group-hover:text-accent">
              <Icon name="phone" className="size-[1.05rem]" />
            </span>
            <span className="link-underline tabular">{contact.phoneDisplay}</span>
          </a>
        </div>
      </div>

      {/* Bandeau d'informations vérifiées */}
      <div className="intro-fade relative border-t border-bone-100/10 bg-ink-900/60 backdrop-blur-sm" style={i(5)}>
        <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
          {rating && (
            <div className="col-span-2 flex flex-col gap-1.5 border-b border-bone-100/10 py-4 sm:col-span-1 sm:border-b-0 lg:py-6">
              <dt className="sr-only">Note des clients</dt>
              <dd className="flex items-center gap-3">
                <Stars value={rating.value} best={rating.best} className="h-3.5 text-bone-100" />
                <span className="font-medium tabular">
                  {String(rating.value).replace('.', ',')}/{rating.best}
                </span>
              </dd>
              <dd className="text-sm text-steel-300">
                <a href={rating.source.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                  {fmt(rating.count)} avis clients · {rating.platform}
                </a>
              </dd>
            </div>
          )}
          <div className="flex flex-col gap-1.5 border-bone-100/10 py-4 pr-4 sm:border-l sm:pl-6 lg:py-6">
            <dt className="label text-steel-400">Aujourd’hui</dt>
            <dd className="text-[0.95rem]">
              <OpenStatus />
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 border-l border-bone-100/10 py-4 pl-4 sm:pl-6 lg:py-6">
            <dt className="label text-steel-400">Adresse</dt>
            <dd className="text-[0.95rem]">
              <Link href="/#contact" className="link-underline">
                {address.street}, {address.city}
              </Link>
            </dd>
          </div>
          <div className="hidden flex-col gap-1.5 border-l border-bone-100/10 py-4 pl-6 lg:flex lg:py-6">
            <dt className="label text-steel-400">Accueil</dt>
            <dd className="text-[0.95rem]">{booking.walkIn ? 'Avec ou sans rendez-vous' : 'Sur rendez-vous'}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
