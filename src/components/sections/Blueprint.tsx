'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { ResolvedService } from '@/lib/services';
import { requestBooking } from '@/lib/booking-bus';
import { Icon } from '@/components/ui/Icon';
import { BodyLayer, MechanicsLayer, hotspots } from './BlueprintArt';

const VB = { w: 1200, h: 520 };

/**
 * Vue en coupe interactive : un projecteur suit le pointeur et révèle la mécanique
 * sous la carrosserie. Les repères (boutons) ouvrent la fiche de la prestation.
 * Clavier / tactile : la sélection d'un repère y déplace le projecteur.
 */
export function Blueprint({ services }: { services: ResolvedService[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [xray, setXray] = useState(false);
  const cardId = useId();
  const points = useMemo(() => services.filter((s) => hotspots[s.id]), [services]);

  // Mode du projecteur piloté hors état React (évite un rendu par image au survol)
  const setMode = useCallback((mode: 'idle' | 'pointer' | 'focus') => {
    if (stage.current && stage.current.dataset.mode !== mode) stage.current.dataset.mode = mode;
  }, []);
  const current = points.find((s) => s.id === selected) ?? null;

  const moveTo = useCallback((x: number, y: number, radius?: number) => {
    const el = stage.current;
    if (!el) return;
    el.style.setProperty('--sx', `${x}px`);
    el.style.setProperty('--sy', `${y}px`);
    if (radius !== undefined) el.style.setProperty('--sr', `${radius}px`);
  }, []);

  const focusHotspot = useCallback(
    (id: string) => {
      const el = stage.current;
      const h = hotspots[id];
      if (!el || !h) return;
      const r = el.getBoundingClientRect();
      setMode('focus');
      moveTo((h.x / VB.w) * r.width, (h.y / VB.h) * r.height, Math.max(90, r.width * 0.12));
    },
    [moveTo, setMode],
  );

  // Pointeur fin : le projecteur suit la souris
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setMode('pointer');
        moveTo(e.clientX - r.left, e.clientY - r.top, Math.max(110, r.width * 0.14));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      setMode('idle');
      el.style.setProperty('--sr', '0px');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [moveTo, setMode]);

  // Appareils tactiles : balayage unique à l'entrée dans l'écran, puis premier repère
  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || !points[0]) return;
        io.disconnect();
        setSelected(points[0].id);
        focusHotspot(points[0].id);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [points, focusHotspot]);

  useEffect(() => {
    const onResize = () => selected && stage.current?.dataset.mode === 'focus' && focusHotspot(selected);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selected, focusHotspot]);

  return (
    <div className="mt-14 lg:mt-20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4" data-reveal>
        <p className="label text-steel-400">Vue latérale · schéma indicatif</p>
        <button
          type="button"
          aria-pressed={xray}
          onClick={() => setXray((v) => !v)}
          className="flex h-10 items-center gap-3 rounded-full border border-bone-100/20 px-4 label text-steel-200 transition-colors hover:border-bone-100/60"
        >
          <span className={`relative h-4 w-7 rounded-full transition-colors ${xray ? 'bg-accent' : 'bg-bone-100/20'}`} aria-hidden="true">
            <span className={`absolute top-0.5 size-3 rounded-full bg-ink-900 transition-[left] duration-300 ${xray ? 'left-3.5' : 'left-0.5'}`} />
          </span>
          Afficher toute la mécanique
        </button>
      </div>

      <p className="mb-3 label text-steel-400 md:hidden" aria-hidden="true">
        ← Faites glisser pour explorer →
      </p>
      <div className="no-scrollbar -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] md:mx-0 md:overflow-visible md:px-0">
        <div
          ref={stage}
          data-cursor="explore"
          data-mode="idle"
          data-xray={xray}
          className="bp-stage relative aspect-[1200/520] w-full min-w-[640px] overflow-hidden rounded-[4px] border border-bone-100/10 bg-ink-950 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:calc(100%/24)_calc(100%/10.4)] md:min-w-0"
          style={{ '--sx': '-999px', '--sy': '-999px', '--sr': '0px' } as CSSProperties}
        >
          <div className="bp-ghost absolute inset-0 text-bone-100 opacity-[0.14]">
            <MechanicsLayer />
          </div>
          <div className="bp-body absolute inset-0 text-bone-100/75">
            <BodyLayer />
          </div>
          <div className="bp-mech absolute inset-0 text-bone-100">
            <MechanicsLayer />
          </div>
          {/* Sol + cote */}
          <div aria-hidden="true" className="absolute inset-x-[8%] top-[84.6%] h-px bg-bone-100/20" />

          {points.map((s) => {
            const h = hotspots[s.id];
            const isSel = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={`${s.title} — ${h.caption}`}
                aria-expanded={isSel}
                aria-controls={cardId}
                onClick={() => {
                  setSelected(isSel ? null : s.id);
                  if (!isSel) focusHotspot(s.id);
                }}
                onFocus={() => focusHotspot(s.id)}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 p-2"
                style={{ left: `${(h.x / VB.w) * 100}%`, top: `${(h.y / VB.h) * 100}%` }}
              >
                <span className="relative grid size-5 place-items-center sm:size-6">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 [animation:pulse-ring_2.4s_var(--ease-out-expo)_infinite] rounded-full border border-accent"
                  />
                  <span
                    aria-hidden="true"
                    className={`relative size-full rounded-full border-2 border-accent transition-[background-color,transform] duration-300 ${isSel ? 'scale-110 bg-accent' : 'bg-ink-950 group-hover:bg-accent'}`}
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-full ml-1 hidden -translate-y-1/2 rounded-[2px] bg-bone-100 px-2 py-1 label whitespace-nowrap text-ink-900 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 md:block"
                >
                  {h.caption}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fiche du repère sélectionné */}
      <div id={cardId} aria-live="polite" className="mt-6 min-h-[11rem] md:min-h-[8.5rem]">
        {current ? (
          <div key={current.id} className="intro-fade grid gap-6 border-t border-bone-100/15 pt-6 md:grid-cols-12 md:items-start">
            <div className="md:col-span-4">
              <p className="label text-accent">{hotspots[current.id].caption}</p>
              <h3 className="mt-2 display text-[1.75rem]">{current.title}</h3>
            </div>
            <p className="text-steel-200 md:col-span-5">{current.short}</p>
            <div className="flex flex-col gap-3 md:col-span-3 md:items-end">
              <button
                type="button"
                onClick={() => requestBooking({ service: current.id })}
                className="inline-flex items-center gap-2 font-medium text-accent hover:underline"
                data-cursor="cta"
              >
                Demander ce service <Icon name="arrow-right" className="size-4" />
              </button>
              <Link href={`/services/${current.slug}`} className="link-underline inline-flex items-center gap-2 text-steel-200">
                Détails de la prestation <Icon name="arrow-up-right" className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="border-t border-bone-100/15 pt-6 text-steel-300">Sélectionnez un repère jaune pour afficher la prestation correspondante.</p>
        )}
      </div>
    </div>
  );
}
