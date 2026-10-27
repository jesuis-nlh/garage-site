'use client';

import { prefersReducedMotion } from './gsap';

export interface BookingPrefill {
  service?: string;
  concern?: string;
}

export const BOOKING_EVENT = 'booking:prefill';

/** Pré-remplit le formulaire de rendez-vous puis y amène le visiteur. */
export function requestBooking(prefill: BookingPrefill) {
  window.dispatchEvent(new CustomEvent<BookingPrefill>(BOOKING_EVENT, { detail: prefill }));
  // Appelé depuis la page d'accueil, qui contient toujours le formulaire (#rendez-vous).
  // Les autres pages renvoient vers /?service=…#rendez-vous, lu par le formulaire au montage.
  const target = document.getElementById('rendez-vous');
  if (!target) return;
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', '#rendez-vous');
}
