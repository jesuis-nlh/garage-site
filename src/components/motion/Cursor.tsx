'use client';

import { useEffect, useRef, useState } from 'react';

const LABELS: Record<string, string> = {
  cta: 'Réserver',
  call: 'Appeler',
  explore: 'Explorer',
};

/**
 * Curseur de précision : point exact + anneau inertiel, états contextuels.
 * Monté uniquement avec un pointeur fin (souris) et sans préférence de mouvement réduit.
 * L'étiquette contextuelle est décalée du pointeur pour ne jamais masquer le contenu.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(fine.matches && !reduce.matches);
    update();
    fine.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !root.current || !dot.current || !ring.current || !label.current) return;
    const html = document.documentElement;
    const r = root.current;
    const d = dot.current;
    const g = ring.current;
    const l = label.current;
    html.classList.add('has-custom-cursor');

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let shown = false;

    const tick = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      g.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const setState = (state: string) => {
      if (r.dataset.state === state) return;
      r.dataset.state = state;
      l.textContent = LABELS[state] ?? '';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        rx = x;
        ry = y;
        shown = true;
        r.dataset.visible = 'true';
      }
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest?.('[data-cursor], a, button, input, textarea, select, label, [role="button"], [role="radio"], summary');
      if (!el) return setState('default');
      const explicit = el.getAttribute('data-cursor');
      if (explicit) return setState(explicit);
      if (el.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select')) return setState('text');
      if (el.matches('a[href^="tel:"]')) return setState('call');
      setState('link');
    };
    const onLeave = () => {
      shown = false;
      r.dataset.visible = 'false';
    };
    const onDown = () => (r.dataset.pressed = 'true');
    const onUp = () => (r.dataset.pressed = 'false');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    html.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      html.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} aria-hidden="true" className="cursor-root" data-state="default" data-visible="false">
      <div ref={ring} className="cursor-ring">
        <div className="cursor-ring-shape" />
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot">
        <i />
      </div>
    </div>
  );
}
