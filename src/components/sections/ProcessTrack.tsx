'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { ProcessStep } from '@/config/types';

/**
 * Étapes reliées par un rail qui se remplit à mesure qu'elles entrent dans l'écran
 * (IntersectionObserver + transitions CSS, sans détournement du défilement).
 * Le texte reste toujours lisible : seuls le rail et les pastilles s'animent.
 */
export function ProcessTrack({ steps }: { steps: ProcessStep[] }) {
  const root = useRef<HTMLOListElement>(null);
  const [reached, setReached] = useState(-1);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-step]'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setReached((r) => Math.max(r, items.indexOf(e.target as HTMLElement)));
        });
      },
      { rootMargin: '0px 0px -30% 0px', threshold: 0.6 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  const progress = steps.length > 1 ? Math.max(0, reached) / (steps.length - 1) : 1;
  const rail = { '--p': reached < 0 ? 0 : progress } as CSSProperties;

  return (
    <ol ref={root} className="relative mt-16 grid gap-12 md:mt-24 md:grid-cols-4 md:gap-8" style={rail}>
      <span aria-hidden="true" className="absolute top-[1.15rem] right-0 left-0 hidden h-px bg-bone-100/15 md:block">
        <span className="absolute inset-0 origin-left scale-x-[var(--p)] bg-accent transition-transform duration-[1600ms] ease-[var(--ease-out-expo)]" />
      </span>
      <span aria-hidden="true" className="absolute top-0 bottom-0 left-[1.15rem] w-px bg-bone-100/15 md:hidden">
        <span className="absolute inset-0 origin-top scale-y-[var(--p)] bg-accent transition-transform duration-[1200ms] ease-[var(--ease-out-expo)]" />
      </span>
      {steps.map((step, i) => {
        const on = i <= reached;
        return (
          <li key={step.title} data-step className="relative pl-14 md:pl-0">
            <span
              className={`absolute top-0 left-0 grid size-[2.3rem] place-items-center rounded-full border label tabular transition-[background-color,border-color,color] duration-500 md:relative ${
                on ? 'border-accent bg-accent text-accent-ink' : 'border-bone-100/25 bg-ink-900 text-bone-100'
              }`}
              style={{ transitionDelay: `${i * 260}ms` }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-0 text-[1.45rem] font-[650] tracking-[-0.02em] [font-stretch:108%] md:mt-8">{step.title}</h3>
            <p className="mt-3 max-w-xs leading-relaxed text-steel-300">{step.text}</p>
          </li>
        );
      })}
    </ol>
  );
}
