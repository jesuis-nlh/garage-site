import type { ReactNode } from 'react';
import type { Glyph } from '@/content/services';

/*
 * Illustrations techniques au trait (style plan d'ingénieur), une par prestation.
 * Chaque tracé utilise pathLength=1 pour une animation de dessin homogène (classe .glyph-draw).
 */

const P = (props: React.SVGProps<SVGPathElement>) => <path pathLength={1} {...props} />;
const C = (props: React.SVGProps<SVGCircleElement>) => <circle pathLength={1} {...props} />;

function radial(n: number, r: number, cx = 120, cy = 120, offset = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + offset;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  });
}

const drawings: Record<Glyph, ReactNode> = {
  oil: (
    <>
      <P d="M62 150h96l14-40H96l-12-14H62z" />
      <P d="M172 110l26-18 6 8-28 22" />
      <P d="M70 96V84h22v12" />
      <P className="accent" d="M196 132c0 0-10 14-10 22a10 10 0 0 0 20 0c0-8-10-22-10-22z" />
      <P d="M62 172h110M62 168v8M172 168v8" />
      <P d="M84 128h52" strokeDasharray="0.04 0.03" />
    </>
  ),
  scan: (
    <>
      <P d="M58 92h124l-14 52H72z" />
      {radial(8, 0, 0, 0).map((_, i) => (
        <C key={`t${i}`} cx={82 + i * 11} cy={108} r={2.6} />
      ))}
      {radial(8, 0, 0, 0).map((_, i) => (
        <C key={`b${i}`} cx={86 + i * 10} cy={128} r={2.6} />
      ))}
      <P className="accent" d="M40 180h30l8-16 10 30 12-44 10 30h90" />
      <P d="M120 66v18M112 74h16" />
    </>
  ),
  brake: (
    <>
      <C cx={120} cy={120} r={78} />
      <C cx={120} cy={120} r={44} />
      <C cx={120} cy={120} r={20} />
      {radial(18, 61, 120, 120).map(([x, y], i) => (
        <C key={i} cx={x} cy={y} r={2.4} />
      ))}
      {radial(5, 32, 120, 120, -Math.PI / 2).map(([x, y], i) => (
        <C key={`l${i}`} cx={x} cy={y} r={3.5} />
      ))}
      <P className="accent" d="M70 52a84 84 0 0 1 64-14l-4 30a54 54 0 0 0-40 9z" />
      <P className="accent" d="M88 56l4 8M116 46l1 9" />
    </>
  ),
  tire: (
    <>
      <C cx={120} cy={120} r={84} />
      <C cx={120} cy={120} r={66} />
      <C cx={120} cy={120} r={52} />
      {radial(28, 75, 120, 120).map(([x, y], i) => {
        const [x2, y2] = radial(28, 84, 120, 120, 0.06)[i];
        return <P key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`} />;
      })}
      {radial(5, 0, 120, 120).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return (
          <P
            key={`s${i}`}
            d={`M${(120 + Math.cos(a - 0.12) * 16).toFixed(1)} ${(120 + Math.sin(a - 0.12) * 16).toFixed(1)}L${(120 + Math.cos(a - 0.08) * 50).toFixed(1)} ${(120 + Math.sin(a - 0.08) * 50).toFixed(1)}M${(120 + Math.cos(a + 0.12) * 16).toFixed(1)} ${(120 + Math.sin(a + 0.12) * 16).toFixed(1)}L${(120 + Math.cos(a + 0.08) * 50).toFixed(1)} ${(120 + Math.sin(a + 0.08) * 50).toFixed(1)}`}
          />
        );
      })}
      <C className="accent" cx={120} cy={120} r={10} />
    </>
  ),
  shock: (
    <>
      <P d="M104 34h32v10h-32zM112 44v24M128 44v24" />
      <P className="accent" d="M92 70l56 10-56 10 56 10-56 10 56 10-56 10 56 10-56 10 56 10" />
      <P d="M108 76v96h24V76" />
      <P d="M116 172v26h8v-26M104 198h32v10h-32z" />
      <C cx={120} cy={203} r={2.5} />
    </>
  ),
  snow: (
    <>
      {[0, 60, 120].map((rot) => (
        <g key={rot} transform={`rotate(${rot} 120 120)`}>
          <P d="M120 52v136" />
          <P d="M106 66l14 12 14-12M106 174l14-12 14 12" />
        </g>
      ))}
      <C className="accent" cx={120} cy={120} r={12} />
      <P d="M36 210c18-8 30 8 48 0s30 8 48 0 30 8 48 0" />
    </>
  ),
  battery: (
    <>
      <P d="M52 84h136v96H52z" />
      <P d="M72 84V70h24v14M144 84V70h24v14" />
      <P d="M78 106h12M84 100v12M150 106h12" />
      <P className="accent" d="M126 120l-20 26h16l-8 24 26-32h-16l10-18z" />
      <P d="M52 196h136" strokeDasharray="0.03 0.02" />
    </>
  ),
  clutch: (
    <>
      <C cx={120} cy={120} r={80} />
      <C cx={120} cy={120} r={62} />
      <C cx={120} cy={120} r={18} />
      {radial(6, 40, 120, 120).map(([x, y], i) => (
        <P key={i} d={`M${(x - 6).toFixed(1)} ${(y - 4).toFixed(1)}h12v8h-12z`} />
      ))}
      {radial(20, 71, 120, 120).map(([x, y], i) => (
        <C key={`r${i}`} cx={x} cy={y} r={1.6} />
      ))}
      <C className="accent" cx={120} cy={120} r={8} />
    </>
  ),
  belt: (
    <>
      <C cx={92} cy={82} r={38} />
      <C cx={92} cy={82} r={8} />
      <C cx={150} cy={170} r={24} />
      <C cx={150} cy={170} r={6} />
      <C className="accent" cx={176} cy={108} r={14} />
      <P d="M54 82c0 34 54 112 72 112M130 82c26 0 60 12 60 26s-16 38-18 46" />
      <P className="accent" d="M176 122l20 30" />
    </>
  ),
  exhaust: (
    <>
      <P d="M30 134h52M30 146h52" />
      <P d="M82 122h86a18 18 0 0 1 0 36H82z" />
      <P d="M168 134h28M168 146h28" />
      <P d="M98 122v36M150 122v36" strokeDasharray="0.05 0.04" />
      <P className="accent" d="M202 128c10-6 6-16 14-22M206 146c12-2 12-12 22-14" />
    </>
  ),
  plug: (
    <>
      <P d="M84 70h72v64a36 36 0 0 1-72 0z" />
      <P d="M102 70V42M138 70V42" />
      <P d="M120 170v32h48" />
      <P className="accent" d="M126 92l-14 20h12l-6 18 18-24h-12l6-14z" />
    </>
  ),
};

export function ServiceGlyph({ glyph, className = '', animate = true }: { glyph: Glyph; className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 240 240" className={`${animate ? 'glyph-draw' : ''} ${className}`} aria-hidden="true" fill="none">
      {/* Gabarit commun : cercle de construction et repères */}
      <g className="glyph-frame" stroke="currentColor" strokeWidth="0.6" opacity="0.35">
        <circle cx="120" cy="120" r="112" strokeDasharray="2 5" />
        <path d="M120 0v12M120 228v12M0 120h12M228 120h12" />
      </g>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {drawings[glyph]}
      </g>
    </svg>
  );
}
