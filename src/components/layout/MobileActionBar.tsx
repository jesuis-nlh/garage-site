'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { garage } from '@/config';
import { Icon } from '@/components/ui/Icon';

/** Barre d'actions fixe sur mobile : appeler / prendre rendez-vous, toujours à portée de pouce. */
export function MobileActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let bookingInView = false;
    const update = () => {
      const menuOpen = document.documentElement.dataset.menuOpen === 'true';
      setVisible(window.scrollY > window.innerHeight * 0.6 && !bookingInView && !menuOpen);
    };
    const booking = document.getElementById('rendez-vous');
    const io = new IntersectionObserver(([e]) => {
      bookingInView = e.isIntersecting;
      update();
    });
    if (booking) io.observe(booking);
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-menu-open'] });
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-bone-100/10 bg-ink-900/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-out-expo)] md:hidden ${
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      aria-hidden={!visible}
    >
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:${garage.contact.phoneE164}`}
          tabIndex={visible ? 0 : -1}
          className="flex h-12 items-center justify-center gap-2 rounded-[3px] border border-bone-100/25 font-medium"
        >
          <Icon name="phone" className="size-[1.1rem]" />
          Appeler
        </a>
        <Link
          href="/#rendez-vous"
          tabIndex={visible ? 0 : -1}
          className="flex h-12 items-center justify-center gap-2 rounded-[3px] bg-accent font-medium text-accent-ink"
        >
          <Icon name="calendar" className="size-[1.1rem]" />
          Rendez-vous
        </Link>
      </div>
    </div>
  );
}
