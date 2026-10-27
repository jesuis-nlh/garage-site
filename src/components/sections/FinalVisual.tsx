'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { GarageConfig } from '@/config/types';

/** Visuel de fin : rendu en clair-obscur, éclairé par un projecteur qui suit le pointeur. */
export function FinalVisual({ still }: { still: GarageConfig['media']['heroStill'] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const section = el?.closest('section');
    if (!el || !section || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--lx', `${e.clientX - r.left}px`);
        el.style.setProperty('--ly', `${e.clientY - r.top}px`);
      });
    };
    section.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={root} aria-hidden="true" className="final-visual pointer-events-none absolute inset-0 -z-10">
      <div data-parallax="14" className="absolute top-[8%] -right-[30%] w-[110%] opacity-35 md:-right-[12%] md:w-[70%] lg:top-[-6%] lg:-right-[6%] lg:w-[58%]">
        <Image
          src={still.src}
          alt=""
          width={still.width}
          height={still.height}
          sizes="(min-width: 1024px) 58vw, 110vw"
          className="h-auto w-full rotate-[-8deg]"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/80 to-transparent" />
      <div className="final-light absolute inset-0" />
    </div>
  );
}
