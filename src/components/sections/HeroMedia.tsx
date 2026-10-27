'use client';

import { getImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { loadMotion, whenIdle } from '@/lib/gsap';
import type { GarageConfig } from '@/config/types';

type Media = GarageConfig['media'];

/**
 * Visuel du hero : image fixe (mobile, mouvement réduit, économie de données)
 * et boucle vidéo chargée en différé sur grand écran. Parallaxe au défilement et au pointeur.
 */
export function HeroMedia({ media }: { media: Media }) {
  const outer = useRef<HTMLDivElement>(null);
  const scrollLayer = useRef<HTMLDivElement>(null);
  const pointerLayer = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const mobile = getImageProps({
    src: media.heroStill.src,
    width: media.heroStill.width,
    height: media.heroStill.height,
    alt: media.heroStill.alt,
    sizes: '(min-width: 1280px) 76vw, (min-width: 640px) 640px, 80vw',
    loading: 'eager',
    fetchPriority: 'high',
  }).props;
  const desktop = media.heroVideo ? getImageProps({ src: media.heroVideo.poster, width: 1600, height: 900, alt: '', sizes: '100vw' }).props : null;

  // Vidéo : uniquement grand écran, sans « réduire les animations » ni « économie de données »
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !media.heroVideo) return;
    const ok =
      window.matchMedia('(min-width: 1280px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!ok) return;
    let started = false;
    const start = () => {
      started = true;
      v.play().catch(() => undefined);
    };
    const idle = window.setTimeout(start, 900);
    const io = new IntersectionObserver(([e]) => {
      if (!started) return;
      if (e.isIntersecting) v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => {
      window.clearTimeout(idle);
      io.disconnect();
    };
  }, [media.heroVideo]);

  // Parallaxe (grand écran) : défilement + pointeur. GSAP est chargé après l'affichage.
  useEffect(() => {
    const section = outer.current?.closest('section');
    if (!section || !scrollLayer.current || !pointerLayer.current) return;
    let revert: (() => void) | undefined;
    const cancelIdle = whenIdle(() => {
      if (!window.matchMedia('(min-width: 1280px) and (prefers-reduced-motion: no-preference)').matches) return;
      loadMotion().then(({ gsap }) => {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 1280px) and (prefers-reduced-motion: no-preference)', () => {
          gsap.to(scrollLayer.current, {
            yPercent: 12,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
          });
        });
        mm.add('(min-width: 1280px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
          const xTo = gsap.quickTo(pointerLayer.current, 'x', { duration: 1.2, ease: 'power3.out' });
          const yTo = gsap.quickTo(pointerLayer.current, 'y', { duration: 1.2, ease: 'power3.out' });
          const onMove = (e: PointerEvent) => {
            xTo((e.clientX / window.innerWidth - 0.5) * -22);
            yTo((e.clientY / window.innerHeight - 0.5) * -14);
          };
          section.addEventListener('pointermove', onMove);
          return () => section.removeEventListener('pointermove', onMove);
        });
        revert = () => mm.revert();
      });
    });
    return () => {
      cancelIdle();
      revert?.();
    };
  }, []);

  return (
    <div
      ref={outer}
      aria-hidden="true"
      className="intro-media pointer-events-none absolute top-[calc(var(--header-h)-1rem)] -right-[8vw] -z-10 w-[78vw] max-w-[640px] xl:inset-y-0 xl:top-0 xl:right-0 xl:left-[24%] xl:w-auto xl:max-w-none"
    >
      <div ref={scrollLayer} className="relative h-full w-full will-change-transform">
        <div ref={pointerLayer} className="relative h-full w-full">
          <picture>
            {desktop && <source media="(min-width: 1280px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />}
            {/* Image décorative rendue via getImageProps (direction artistique mobile / desktop) */}
            <img {...mobile} alt="" className="h-auto w-full xl:absolute xl:inset-0 xl:h-full xl:object-cover xl:object-[85%_50%]" />
          </picture>
          {media.heroVideo && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              disablePictureInPicture
              onPlaying={() => setPlaying(true)}
              className={`absolute inset-0 hidden h-full w-full object-cover object-[85%_50%] transition-opacity duration-1000 xl:block ${playing ? 'opacity-100' : 'opacity-0'}`}
            >
              {media.heroVideo.webm && <source src={media.heroVideo.webm} type="video/webm" />}
              <source src={media.heroVideo.mp4} type="video/mp4" />
            </video>
          )}
          {/* Fondus vers le fond de page : bas (mobile), gauche / haut / bas (desktop) */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-ink-900 xl:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-ink-900 via-ink-900/60 to-transparent xl:block" />
          <div className="absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b from-ink-900/80 to-transparent xl:block" />
          <div className="absolute inset-x-0 bottom-0 hidden h-48 bg-gradient-to-t from-ink-900 to-transparent xl:block" />
          {/* Réticule de visée, technique et discret */}
          <svg viewBox="0 0 120 120" className="absolute top-[20%] left-[34%] hidden w-[110px] text-bone-100/50 xl:block">
            <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
            <path d="M60 6v32M60 82v32M6 60h32M82 60h32" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="60" cy="60" r="2" fill="var(--brand-accent)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
