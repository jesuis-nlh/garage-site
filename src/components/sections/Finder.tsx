'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { garage } from '@/config';
import { availableConcerns, services } from '@/lib/services';
import { requestBooking } from '@/lib/booking-bus';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Orientation par symptôme : oriente vers une prestation et une démarche, sans diagnostic à distance. */
export function Finder() {
  const [concernId, setConcernId] = useState<string | null>(null);
  const uid = useId();
  const concern = availableConcerns.find((c) => c.id === concernId) ?? null;
  const matched = concern ? concern.services.map((id) => services.find((s) => s.id === id)!).filter(Boolean) : [];

  return (
    <section id="orientation" aria-labelledby="finder-title" className="theme-light relative bg-bone-200 py-24 text-ink-900 md:py-32 lg:py-40">
      <div className="container-x">
        <SectionHeading
          tone="light"
          id="finder-title"
          index="03"
          kicker="Orientation"
          title="Que se passe-t-il avec votre voiture ?"
          lead="Indiquez ce que vous constatez : nous vous orientons vers la bonne prestation et la démarche à suivre."
        />

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          <fieldset className="lg:col-span-7">
            <legend className="mb-5 label text-ink-700">1 · Ce que vous constatez</legend>
            <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Symptôme constaté">
              {availableConcerns.map((c, idx) => {
                const checked = c.id === concernId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-controls={`${uid}-result`}
                    onClick={() => setConcernId(c.id)}
                    data-reveal
                    className={`group flex min-h-16 items-center justify-between gap-4 rounded-[3px] border px-5 py-4 text-left transition-[background-color,border-color,color] duration-300 ${
                      checked ? 'border-ink-900 bg-ink-900 text-bone-100' : 'border-ink-900/15 bg-bone-50/60 hover:border-ink-900/50'
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <span className={`label tabular ${checked ? 'text-accent' : 'text-ink-600'}`}>{String(idx + 1).padStart(2, '0')}</span>
                      <span className="font-medium">{c.label}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${checked ? 'border-accent bg-accent' : 'border-ink-900/30'}`}
                    >
                      {checked && <span className="size-1.5 rounded-full bg-ink-900" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <p className="mb-5 label text-ink-700">2 · Notre recommandation</p>
              <div id={`${uid}-result`} aria-live="polite" className="relative min-h-[22rem] overflow-hidden rounded-[4px] bg-ink-900 p-7 text-bone-100 sm:p-9">
                {!concern ? (
                  <div className="flex h-full min-h-[18rem] flex-col justify-between">
                    <svg viewBox="0 0 200 80" className="w-40 text-bone-100/40" aria-hidden="true" fill="none" stroke="currentColor">
                      <path d="M0 40h50l10-24 14 48 14-36 10 12h102" strokeWidth="1.4" />
                    </svg>
                    <p className="max-w-xs text-steel-300">Sélectionnez une situation pour afficher les prestations concernées et la marche à suivre.</p>
                  </div>
                ) : (
                  <div key={concern.id} className="intro-fade">
                    {concern.safety && (
                      <p className="mb-6 flex gap-3 rounded-[3px] border border-accent/60 bg-accent/10 p-4 text-[0.95rem]">
                        <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-accent" />
                        <span>{concern.safety}</span>
                      </p>
                    )}
                    <p className="label text-steel-400">Prestations concernées</p>
                    <ul className="mt-3 grid gap-2">
                      {matched.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/services/${s.slug}`}
                            className="group flex items-center justify-between gap-4 border-b border-bone-100/10 py-3 transition-colors hover:text-accent"
                          >
                            <span className="text-[1.15rem] font-[620] tracking-[-0.015em]">{s.title}</span>
                            <Icon name="arrow-up-right" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 leading-relaxed text-steel-200">{concern.advice}</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button onClick={() => requestBooking({ service: concern.services[0], concern: concern.label })}>Demander un rendez-vous</Button>
                      <Button href={`tel:${garage.contact.phoneE164}`} variant="outline" icon={null} leadingIcon="phone">
                        Appeler
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-ink-700">
                Ce guide vous oriente : il ne remplace pas un contrôle du véhicule en atelier et ne préjuge pas de la réparation nécessaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
