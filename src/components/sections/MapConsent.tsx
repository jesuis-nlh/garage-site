'use client';

import { useState } from 'react';
import { garage } from '@/config';
import { Icon } from '@/components/ui/Icon';

/** Carte chargée uniquement sur action du visiteur (aucun traceur tiers par défaut). */
export function MapConsent() {
  const [loaded, setLoaded] = useState(false);
  const { lat, lng } = garage.address.geo;
  const d = 0.006;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d * 1.6}%2C${lat - d}%2C${lng + d * 1.6}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] border border-bone-100/10 bg-ink-900">
      {loaded ? (
        <iframe
          title={`Plan d’accès — ${garage.brand.name}`}
          src={src}
          className="absolute inset-0 h-full w-full grayscale-[0.4] hue-rotate-180 invert-[0.9]"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center [background-image:linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:2.5rem_2.5rem]">
          <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute top-1/2 left-1/2 w-40 -translate-x-1/2 -translate-y-1/2 text-bone-100/25">
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeDasharray="2 5" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeDasharray="2 7" />
            <path d="M100 0v200M0 100h200" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 px-6 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-ink">
              <Icon name="pin" />
            </span>
            <p className="label text-steel-300 tabular">
              {lat.toFixed(4)}° N · {lng.toFixed(4)}° E
            </p>
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-bone-100/25 px-5 text-[0.92rem] transition-colors hover:border-accent hover:text-accent"
            >
              Afficher la carte interactive
            </button>
            <p className="text-[0.8rem] leading-relaxed text-steel-400">
              La carte est fournie par OpenStreetMap : son affichage transmet votre adresse IP à ce service.{' '}
              <a href={garage.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                Ouvrir dans Google Maps
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
