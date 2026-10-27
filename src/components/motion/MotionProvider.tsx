'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { loadMotion, whenIdle } from '@/lib/gsap';

/**
 * Animations déclarées par attributs :
 *  - data-reveal : apparition à l'entrée dans l'écran (IntersectionObserver + transitions CSS)
 *  - data-split  : titres révélés par un masque
 *  - data-parallax="12" : parallaxe douce (GSAP chargé en différé, grands écrans uniquement)
 * Rien n'est animé si l'utilisateur préfère réduire les animations.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]'));
    html.classList.add('reveal-on');

    let batchIndex = 0;
    let batchTimer = 0;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.setProperty('--rd', `${Math.min(batchIndex++, 8) * 70}ms`);
          el.classList.add('is-in');
          io.unobserve(el);
        });
        window.clearTimeout(batchTimer);
        batchTimer = window.setTimeout(() => (batchIndex = 0), 120);
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((el) => io.observe(el));

    // Parallaxe : uniquement grand écran, après chargement
    let revert: (() => void) | undefined;
    const cancelIdle = whenIdle(() => {
      const layers = document.querySelectorAll<HTMLElement>('[data-parallax]');
      if (!layers.length || !window.matchMedia('(min-width: 1024px)').matches) return;
      loadMotion().then(({ gsap }) => {
        const ctx = gsap.context(() => {
          layers.forEach((el) => {
            const amount = Number(el.dataset.parallax) || 10;
            gsap.fromTo(
              el,
              { yPercent: -amount / 2 },
              { yPercent: amount / 2, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
            );
          });
        });
        revert = () => ctx.revert();
      });
    });

    return () => {
      io.disconnect();
      window.clearTimeout(batchTimer);
      cancelIdle();
      revert?.();
    };
  }, [pathname]);

  return null;
}
