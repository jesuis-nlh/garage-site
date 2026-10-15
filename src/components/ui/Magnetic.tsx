'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Attraction « magnétique » discrète vers le pointeur.
 * Désactivée sur écran tactile et lorsque l'utilisateur préfère réduire les animations.
 */
export function Magnetic({ children, strength = 0.28, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const zone = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = zone.current;
    const target = inner.current;
    if (!el || !target) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!mq.matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = target.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength * 1.3;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        target.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      target.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength]);

  return (
    <span ref={zone} className={`-m-4 inline-flex p-4 ${className}`}>
      <span ref={inner} className="inline-flex w-full transition-transform duration-700 ease-[var(--ease-out-expo)] will-change-transform">
        {children}
      </span>
    </span>
  );
}
