'use client';

import { useId, useState } from 'react';
import type { FaqItem } from '@/config/types';
import { Icon } from '@/components/ui/Icon';

export function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  return (
    <ul className="border-t border-ink-900/15">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q} className="border-b border-ink-900/15" data-reveal>
            <h3>
              <button
                type="button"
                id={`${uid}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${uid}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
              >
                <span className="text-[clamp(1.15rem,1.8vw,1.45rem)] font-[600] tracking-[-0.015em]">{item.q}</span>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ease-[var(--ease-out-expo)] ${
                    isOpen ? 'rotate-45 border-ink-900 bg-ink-900 text-accent' : 'border-ink-900/20 group-hover:border-ink-900'
                  }`}
                >
                  <Icon name="plus" className="size-4" />
                </span>
              </button>
            </h3>
            <div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="collapse-grid" data-open={isOpen} inert={!isOpen}>
              <div>
                <p className="max-w-3xl pb-7 leading-relaxed text-ink-700">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
