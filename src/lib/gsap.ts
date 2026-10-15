'use client';

import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';

type Motion = { gsap: typeof GSAP; ScrollTrigger: typeof ST };
let pending: Promise<Motion> | null = null;

/**
 * GSAP + ScrollTrigger chargés à la demande (hors du bundle initial),
 * pour ne pas pénaliser l'affichage et l'interactivité sur mobile.
 */
export function loadMotion(): Promise<Motion> {
  pending ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return pending;
}

/** Exécute un rappel lorsque le navigateur est disponible (après le chargement). */
export function whenIdle(cb: () => void): () => void {
  const hasIdle = typeof window.requestIdleCallback === 'function';
  let id = 0;
  const run = () => {
    id = hasIdle ? window.requestIdleCallback(cb, { timeout: 2500 }) : window.setTimeout(cb, 600);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    window.removeEventListener('load', run);
    if (hasIdle) window.cancelIdleCallback(id);
    else window.clearTimeout(id);
  };
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
