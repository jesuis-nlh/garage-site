import { garage, hasReviews } from '@/config';
import { formatNumber } from '@/lib/format';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Stars } from '@/components/ui/Stars';
import { Icon } from '@/components/ui/Icon';
import type { Testimonial } from '@/config/types';

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Gabarits de mise en page visibles uniquement en développement, jamais en production. */
const devPlaceholders: Testimonial[] =
  process.env.NODE_ENV === 'development'
    ? [1, 2].map((n) => ({
        author: `Exemple ${n}`,
        date: '2026-01-01',
        rating: 5,
        text: 'Gabarit de mise en page : remplacer par un avis réel, sourcé et daté avant mise en ligne.',
        source: { label: 'À renseigner', url: '#', checkedAt: '2026-01-01' },
      }))
    : [];

export function Reviews() {
  // Nothing real to show: no section rather than an empty promise of reviews.
  if (!hasReviews) return null;
  const { rating, testimonials } = garage;
  const list = testimonials.length ? testimonials : devPlaceholders;
  const isPlaceholder = !testimonials.length && list.length > 0;

  return (
    <section id="avis" aria-labelledby="avis-title" className="relative overflow-hidden bg-ink-900 py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading id="avis-title" index="06" kicker="Avis clients" title="La confiance se mesure, elle ne se décrète pas." />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12">
          {rating && (
            <div className="lg:col-span-6" data-reveal>
              <p className="flex items-start leading-none">
                <span className="display text-[clamp(7rem,19vw,16rem)] tracking-[-0.06em] tabular">{String(rating.value).replace('.', ',')}</span>
                <span className="mt-[0.6em] ml-3 text-[clamp(1.5rem,3vw,2.4rem)] text-steel-400">/{rating.best}</span>
              </p>
              <Stars value={rating.value} best={rating.best} className="mt-6 h-6 text-bone-100" />
              <p className="mt-6 text-xl">
                <strong className="font-[650]">{formatNumber(rating.count)} avis clients</strong> sur {rating.platform}
              </p>
              <p className="mt-3 max-w-md text-steel-300">{rating.method}</p>
              <a
                href={rating.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex items-center gap-3 border-b border-bone-100/30 pb-1 transition-colors hover:border-accent hover:text-accent"
              >
                Lire les avis sur {rating.platform}
                <Icon name="arrow-up-right" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <p className="mt-6 label text-steel-400">Relevé le {longDate(rating.source.checkedAt)}</p>
            </div>
          )}

          <div className="lg:col-span-6">
            {list.length > 0 ? (
              <ul className="grid gap-4">
                {list.map((t, k) => (
                  <li
                    key={k}
                    data-reveal
                    className={`rounded-[4px] p-7 ${isPlaceholder ? 'border border-dashed border-accent/60' : 'border border-bone-100/10 bg-ink-850'}`}
                  >
                    {isPlaceholder && <p className="mb-4 label text-accent">Développement uniquement · non publié</p>}
                    <Stars value={t.rating} className="h-3.5 text-bone-100" />
                    <blockquote className="mt-4 text-lg leading-relaxed">« {t.text} »</blockquote>
                    <p className="mt-5 text-sm text-steel-300">
                      {t.author} · {longDate(t.date)} ·{' '}
                      <a href={t.source.url} className="underline" target="_blank" rel="noopener noreferrer">
                        {t.source.label}
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid content-start gap-10 border-t border-bone-100/15 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12" data-reveal>
                <div>
                  <p className="label text-steel-400">Comment ces avis sont collectés</p>
                  <p className="mt-4 text-[1.35rem] leading-snug font-[520] tracking-[-0.01em] [font-stretch:104%]">
                    Les avis publiés sur {rating?.platform ?? 'la plateforme'} proviennent de clients ayant réalisé une prestation dans le centre.
                  </p>
                </div>
                <ul className="grid gap-4 text-steel-200">
                  {[
                    'Note globale issue de l’ensemble des avis',
                    'Avis consultables publiquement, avec leur date',
                    'Source et date de relevé indiquées sur cette page',
                  ].map((x) => (
                    <li key={x} className="flex gap-3">
                      <Icon name="check" className="mt-1 size-4 shrink-0 text-accent" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
