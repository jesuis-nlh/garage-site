import { garage } from '@/config';

/** Logotype typographique + réticule de précision. Remplaçable par le logo officiel du garage. */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  const { primary, secondary } = garage.brand.wordmark;
  return (
    <span className="flex items-center gap-3">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="3" fill="var(--brand-accent)" />
        <circle cx="16" cy="16" r="7.2" fill="none" stroke="var(--brand-accent-ink)" strokeWidth="1.8" />
        <path d="M16 4.5v5.2M16 22.3v5.2M4.5 16h5.2M22.3 16h5.2" stroke="var(--brand-accent-ink)" strokeWidth="1.8" strokeLinecap="square" />
        <circle cx="16" cy="16" r="1.9" fill="var(--brand-accent-ink)" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[1.3rem] font-[820] tracking-[-0.01em] uppercase [font-stretch:125%] [font-variation-settings:'wdth'_125]">{primary}</span>
        {!compact && <span className="mt-1 label text-[0.58rem] text-steel-300">{secondary}</span>}
      </span>
    </span>
  );
}
