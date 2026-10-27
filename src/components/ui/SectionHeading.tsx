import type { ReactNode } from 'react';

interface Props {
  index: string;
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  tone?: 'dark' | 'light';
  className?: string;
}

export function SectionHeading({ index, kicker, title, lead, id, tone = 'dark', className = '' }: Props) {
  const muted = tone === 'light' ? 'text-ink-700' : 'text-steel-300';
  return (
    <div className={`grid gap-6 lg:grid-cols-12 lg:gap-8 ${className}`}>
      <p className={`flex items-center gap-3 label lg:col-span-3 lg:pt-3 ${muted}`} data-reveal>
        <span aria-hidden="true" className="size-2 bg-accent" />
        <span className="tabular">{index}</span>
        <span aria-hidden="true" className="h-px w-8 bg-current opacity-40" />
        <span>{kicker}</span>
      </p>
      <div className="lg:col-span-9">
        <h2 id={id} className="max-w-[18ch] display display-l" data-split>
          {title}
        </h2>
        {lead && (
          <p className={`mt-6 max-w-2xl text-lg leading-relaxed ${muted}`} data-reveal>
            {lead}
          </p>
        )}
      </div>
    </div>
  );
}
