'use client';

import { useId, useState } from 'react';
import type { ResolvedService } from '@/lib/services';
import type { ServiceCategory } from '@/content/services';
import { ServiceGlyph } from '@/components/ui/ServiceGlyph';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { requestBooking } from '@/lib/booking-bus';

interface Props {
  services: ResolvedService[];
  categories: { id: ServiceCategory; label: string }[];
}

export function ServicesDirectory({ services, categories }: Props) {
  const [filter, setFilter] = useState<ServiceCategory | 'all'>('all');
  const [active, setActive] = useState(services[0]?.id);
  const [expanded, setExpanded] = useState<string | null>(null);
  const uid = useId();

  const list = filter === 'all' ? services : services.filter((s) => s.category === filter);
  const current = services.find((s) => s.id === active) ?? list[0];

  const choose = (next: ServiceCategory | 'all') => {
    setFilter(next);
    const first = next === 'all' ? services[0] : services.find((s) => s.category === next);
    if (first) setActive(first.id);
    setExpanded(null);
  };

  const filters = [{ id: 'all' as const, label: 'Toutes' }, ...categories];

  return (
    <div className="mt-14 lg:mt-20">
      <div
        role="radiogroup"
        aria-label="Filtrer les prestations"
        className="no-scrollbar -mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2"
        data-reveal
      >
        {filters.map((f) => {
          const selected = filter === f.id;
          const n = f.id === 'all' ? services.length : services.filter((s) => s.category === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => choose(f.id)}
              className={`flex h-11 shrink-0 items-center gap-2.5 rounded-full border px-5 text-[0.92rem] transition-[background-color,border-color,color] duration-300 ${
                selected ? 'border-ink-900 bg-ink-900 text-bone-100' : 'border-ink-900/15 text-ink-900 hover:border-ink-900/50'
              }`}
            >
              {f.label}
              <span className={`text-[0.75rem] tabular ${selected ? 'text-accent' : 'text-ink-600'}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <ul className="border-t border-ink-900/15 lg:col-span-7" aria-label="Prestations">
          {list.map((s) => {
            const index = String(services.indexOf(s) + 1).padStart(2, '0');
            const isActive = current?.id === s.id;
            const isOpen = expanded === s.id;
            const panelId = `${uid}-${s.id}`;
            return (
              <li key={s.id} className="border-b border-ink-900/15" data-reveal>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onMouseEnter={() => setActive(s.id)}
                  onFocus={() => setActive(s.id)}
                  onClick={() => {
                    setActive(s.id);
                    setExpanded(isOpen ? null : s.id);
                  }}
                  className="group relative grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-6 text-left md:grid-cols-[3.5rem_1fr_auto_auto] md:py-7"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-0 left-0 h-px bg-ink-900 transition-[width] duration-700 ease-[var(--ease-out-expo)] ${isActive ? 'w-full' : 'w-0'}`}
                  />
                  <span className="label text-ink-600 tabular">{index}</span>
                  <span
                    className={`text-[clamp(1.35rem,2.4vw,2.1rem)] leading-tight font-[640] tracking-[-0.025em] [font-stretch:108%] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] ${
                      isActive ? 'text-ink-900 lg:translate-x-2' : 'text-ink-900/55 group-hover:text-ink-900'
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="hidden label text-ink-600 md:block">{s.kicker}</span>
                  <span
                    className={`grid size-10 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ease-[var(--ease-out-expo)] ${
                      isActive ? 'border-ink-900 bg-ink-900 text-accent' : 'border-ink-900/20 text-ink-900'
                    } ${isOpen ? 'rotate-45' : ''}`}
                  >
                    <Icon name="plus" className="size-4 lg:hidden" />
                    <Icon name="arrow-right" className="hidden size-4 lg:block" />
                  </span>
                </button>
                {/* Détail en accordéon (mobile / tablette) */}
                <div id={panelId} className="collapse-grid lg:hidden" data-open={isOpen}>
                  <div>
                    <ServiceDetail service={s} compact />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Panneau de prévisualisation (desktop) */}
        <div className="hidden lg:col-span-5 lg:block">
          {current && (
            <div className="sticky top-[calc(var(--header-h)+2rem)]" aria-live="polite">
              <div key={current.id} className="relative overflow-hidden rounded-[4px] bg-ink-900 p-10 text-bone-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgb(255_255_255/0.06),transparent_60%)]" aria-hidden="true" />
                <ServiceGlyph glyph={current.glyph} className="relative mx-auto mb-8 w-[min(100%,15rem)] text-bone-100" />
                <ServiceDetail service={current} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceDetail({ service, compact = false }: { service: ResolvedService; compact?: boolean }) {
  const muted = compact ? 'text-ink-700' : 'text-steel-300';
  return (
    <div className={`relative ${compact ? 'pb-8 pl-[3.5rem] md:pl-[4.5rem]' : 'intro-fade'}`}>
      {!compact && <p className="label text-accent">{service.kicker}</p>}
      {!compact && <h3 className="mt-3 display text-[2rem]">{service.title}</h3>}
      <p className={`${compact ? '' : 'mt-4'} leading-relaxed ${muted}`}>{service.short}</p>
      <ul className="mt-6 grid gap-2.5">
        {service.includes.slice(0, 4).map((item) => (
          <li key={item} className="flex gap-3 text-[0.95rem]">
            <Icon name="check" className={`mt-1 size-4 shrink-0 ${compact ? 'text-ink-900' : 'text-accent'}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {service.price && (
        <p className="mt-6 text-sm">
          {service.price.label}{' '}
          <a href={service.price.source.url} className="underline" target="_blank" rel="noopener noreferrer">
            (source)
          </a>
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button variant={compact ? 'ink' : 'primary'} onClick={() => requestBooking({ service: service.id })} magnetic={!compact}>
          Demander ce service
        </Button>
        <Button href={`/services/${service.slug}`} variant={compact ? 'outline-dark' : 'outline'} icon="arrow-up-right">
          Détails
        </Button>
      </div>
    </div>
  );
}
