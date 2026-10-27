'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { garage } from '@/config';
import { Wordmark } from '@/components/ui/Wordmark';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { OpenStatus } from '@/components/ui/OpenStatus';
import { navLinks } from './nav';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pathname === '/' ? activeId : null;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section active dans la navigation
  useEffect(() => {
    if (pathname !== '/') return;
    const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Menu mobile : verrouillage du défilement, piège de focus, Échap
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.menuOpen = open ? 'true' : 'false';
    if (!open) return;
    html.style.overflow = 'hidden';
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>('a, button') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const tel = `tel:${garage.contact.phoneE164}`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? 'border-b border-bone-100/10 bg-ink-900/80 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <div className="container-x flex h-full items-center justify-between gap-6">
          <Link href="/" className="relative z-10 shrink-0" data-cursor="link">
            <Wordmark />
            <span className="sr-only"> — retour à l’accueil</span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-8 text-[0.95rem]">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <Link
                    href={l.href}
                    aria-current={active === l.id ? 'true' : undefined}
                    className={`link-underline py-1 transition-colors ${active === l.id ? 'text-bone-100' : 'text-steel-200 hover:text-bone-100'}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={tel}
              className="hidden items-center gap-2 text-[0.95rem] text-bone-100 transition-colors hover:text-accent lg:inline-flex"
              aria-label={`Appeler le garage au ${garage.contact.phoneDisplay}`}
            >
              <Icon name="phone" className="size-[1.1rem]" />
              <span className="hidden tabular xl:inline">{garage.contact.phoneDisplay}</span>
            </a>
            <div className="hidden sm:block">
              <Button href="/#rendez-vous" magnetic className="h-11! px-4! text-[0.9rem]">
                Prendre rendez-vous
              </Button>
            </div>
            <Link
              href="/#rendez-vous"
              className="flex h-11 items-center gap-2 rounded-[3px] bg-accent px-3.5 text-[0.9rem] font-medium text-accent-ink sm:hidden"
            >
              <Icon name="calendar" className="size-[1.05rem]" />
              RDV<span className="sr-only"> : prendre rendez-vous</span>
            </Link>
            <a
              href={tel}
              className="hidden size-11 place-items-center rounded-[3px] border border-bone-100/20 text-bone-100 sm:grid lg:hidden"
              aria-label={`Appeler le garage au ${garage.contact.phoneDisplay}`}
            >
              <Icon name="phone" />
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="grid size-11 place-items-center rounded-[3px] border border-bone-100/20 text-bone-100 lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </header>

      {/* Hors du <header> : son backdrop-filter créerait un bloc conteneur pour les éléments fixes */}
      <div
        id="menu-mobile"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto bg-ink-950 lg:hidden"
      >
        <div className="container-x flex min-h-full flex-col justify-between gap-12 py-10">
          <nav aria-label="Navigation mobile">
            <ul className="flex flex-col">
              {navLinks.map((l, i) => (
                <li key={l.id} className="border-b border-bone-100/10">
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="intro-fade flex items-center justify-between py-5 text-[2rem] font-[680] tracking-[-0.03em] [font-stretch:112%]"
                    style={{ ['--i' as string]: i - 4 }}
                  >
                    {l.label}
                    <Icon name="arrow-right" className="size-6 text-steel-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-6">
            <OpenStatus className="label text-steel-300" />
            <p className="text-steel-200">
              {garage.address.street}
              <br />
              {garage.address.postalCode} {garage.address.city}
            </p>
            <div className="flex flex-col gap-3">
              <Button href="/#rendez-vous" size="lg" onClick={() => setOpen(false)}>
                Prendre rendez-vous
              </Button>
              <Button href={tel} variant="outline" size="lg" icon={null} leadingIcon="phone">
                {garage.contact.phoneDisplay}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
