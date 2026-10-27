'use client';

import { useEffect, useState } from 'react';
import { garage } from '@/config';
import { openStatus, type OpenStatus as Status } from '@/lib/hours';

/** Statut d'ouverture calculé côté navigateur à l'heure de Paris (évite un rendu figé au build). */
export function OpenStatus({ className = '', fallback = 'Horaires d’ouverture' }: { className?: string; fallback?: string }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const update = () => setStatus(openStatus(garage.hours));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${status?.open ? '[animation:blink_2.4s_ease-in-out_infinite] bg-accent' : 'bg-steel-400'}`} />
      <span>{status ? status.label : fallback}</span>
    </span>
  );
}
