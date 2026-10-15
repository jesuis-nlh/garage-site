import type { ReactNode } from 'react';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article>
      {/* Bandeau sombre : l'en-tête transparent reste lisible en haut de page */}
      <header className="bg-ink-900 pt-[calc(var(--header-h)+4rem)] pb-16">
        <div className="container-x max-w-4xl">
          <p className="label text-steel-300">Informations légales</p>
          <h1 className="mt-6 display display-l">{title}</h1>
          <p className="mt-4 text-sm text-steel-300">Dernière mise à jour : {updated}</p>
        </div>
      </header>
      <div className="theme-light bg-bone-100 py-20 text-ink-900">
        <div className="container-x grid max-w-4xl gap-12 leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_h2]:text-[1.35rem] [&_h2]:font-[650] [&_h2]:tracking-[-0.015em] [&_p]:mt-3 [&_p]:text-ink-700 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-ink-700">
          {children}
        </div>
      </div>
    </article>
  );
}
