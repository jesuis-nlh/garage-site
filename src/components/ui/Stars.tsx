/** Note en étoiles avec remplissage partiel (ex. 4,5/5). */
export function Stars({ value, best = 5, className = 'h-4' }: { value: number; best?: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, value / best)) * 100;
  const row = (
    <svg viewBox={`0 0 ${best * 20} 20`} className="h-full w-auto" aria-hidden="true">
      {Array.from({ length: best }, (_, i) => (
        <path
          key={i}
          transform={`translate(${i * 20} 0)`}
          d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8L10 1.5z"
          fill="currentColor"
        />
      ))}
    </svg>
  );
  return (
    <span className={`relative inline-block ${className}`} role="img" aria-label={`Note : ${String(value).replace('.', ',')} sur ${best}`}>
      <span className="block h-full text-current opacity-20">{row}</span>
      <span className="absolute inset-y-0 left-0 block h-full overflow-hidden text-accent" style={{ width: `${pct}%` }}>
        {row}
      </span>
    </span>
  );
}
