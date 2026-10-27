'use client';

import { useSyncExternalStore } from 'react';
import { parisNow } from './hours';
import type { DayKey } from '@/config/types';

const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
};

/** Jour courant à Paris côté navigateur ; null pendant le rendu serveur (pas de divergence d'hydratation). */
export function useParisDay(): DayKey | null {
  return useSyncExternalStore(
    subscribe,
    () => parisNow().day,
    () => null,
  );
}
