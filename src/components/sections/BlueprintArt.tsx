/*
 * Dessins vectoriels de la vue latérale (viewBox 0 0 1200 520, véhicule orienté vers la gauche).
 * Deux calques superposés : carrosserie et mécanique (révélée par le projecteur).
 */

const FRONT = { x: 318, y: 380 };
const REAR = { x: 948, y: 380 };

function Wheel({ x, y }: { x: number; y: number }) {
  const spokes = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return `M${x + Math.cos(a) * 11} ${y + Math.sin(a) * 11}L${x + Math.cos(a) * 40} ${y + Math.sin(a) * 40}`;
  }).join('');
  return (
    <g>
      <circle cx={x} cy={y} r={60} />
      <circle cx={x} cy={y} r={52} opacity={0.5} />
      <circle cx={x} cy={y} r={42} />
      <circle cx={x} cy={y} r={10} />
      <path d={spokes} />
    </g>
  );
}

export function BodyLayer() {
  return (
    <svg viewBox="0 0 1200 520" className="absolute inset-0 h-full w-full" aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        {/* Silhouette */}
        <path d="M150 412C136 410 128 392 128 372L130 340C131 322 142 310 162 304C230 288 330 276 440 266L486 262C530 232 580 196 628 178C690 160 800 156 870 166C920 176 980 214 1012 246C1030 262 1052 268 1066 276C1080 290 1084 320 1082 350L1078 404C1076 410 1068 414 1058 414L1016 414A76 76 0 1 0 880 414L386 414A76 76 0 1 0 250 414L168 414C160 414 152 414 150 412Z" />
        {/* Vitrage */}
        <path d="M500 262C545 232 590 202 636 188C700 174 800 172 862 180C905 190 950 220 978 252C900 255 600 260 500 262Z" />
        <path d="M742 176L748 258M756 176L762 258" />
        {/* Rétroviseur */}
        <path d="M478 258C470 242 484 234 500 238L506 256Z" />
        {/* Portes */}
        <path d="M492 266C484 300 480 360 492 412M752 260L756 412M862 258C872 300 874 360 868 410" />
        <path d="M694 292h30M820 290h28" strokeWidth={2.2} />
        {/* Lignes de caractère et bas de caisse */}
        <path d="M168 324C400 302 800 298 1072 304" opacity={0.6} />
        <path d="M392 400L880 400" opacity={0.6} />
        {/* Optiques */}
        <path d="M140 318C160 306 200 300 236 300L226 318C196 322 160 326 140 324Z" />
        <path d="M1040 270C1056 274 1070 282 1077 294L1060 298C1050 288 1044 280 1040 270Z" />
        <path d="M134 386h42M134 396h42" opacity={0.6} />
        <Wheel {...FRONT} />
        <Wheel {...REAR} />
      </g>
    </svg>
  );
}

function Coil({ x1, y1, x2, y2, turns = 6, w = 12 }: { x1: number; y1: number; x2: number; y2: number; turns?: number; w?: number }) {
  const pts: string[] = [];
  const n = turns * 2;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x1 + (x2 - x1) * t + (i === 0 || i === n ? 0 : i % 2 ? w : -w);
    const y = y1 + (y2 - y1) * t;
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return <path d={pts.join('')} />;
}

function Brake({ x, y }: { x: number; y: number }) {
  const holes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return <circle key={i} cx={x + Math.cos(a) * 26} cy={y + Math.sin(a) * 26} r={1.6} />;
  });
  return (
    <g>
      <circle cx={x} cy={y} r={34} />
      <circle cx={x} cy={y} r={17} />
      {holes}
      <path className="bp-accent" d={`M${x - 36} ${y - 18}A40 40 0 0 1 ${x - 14} ${y - 38}L${x - 10} ${y - 27}A29 29 0 0 0 ${x - 25} ${y - 13}Z`} />
    </g>
  );
}

export function MechanicsLayer() {
  return (
    <svg viewBox="0 0 1200 520" className="absolute inset-0 h-full w-full" aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
        {/* Moteur */}
        <rect x={204} y={302} width={176} height={88} rx={6} />
        <rect x={214} y={286} width={156} height={16} rx={3} />
        {[236, 276, 316, 356].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={334} r={13} />
            <path d={`M${cx} 347v28`} />
          </g>
        ))}
        <path d="M212 378h160" opacity={0.5} />
        <circle cx={300} cy={282} r={6} className="bp-accent" />
        {/* Distribution */}
        <circle cx={190} cy={302} r={11} />
        <circle cx={190} cy={370} r={15} />
        <path d="M179 302v68M201 302v68" className="bp-accent" />
        {/* Boîte / embrayage */}
        <path d="M380 318l58 10v58l-58 6z" />
        <circle cx={398} cy={356} r={24} className="bp-accent" />
        <circle cx={398} cy={356} r={7} />
        <path d="M398 380L318 380" strokeDasharray="5 5" />
        {/* Batterie */}
        <rect x={430} y={276} width={52} height={30} rx={2} />
        <path d="M440 276v-6h8v6M464 276v-6h8v6M440 291h8M468 287v8M464 291h8" />
        {/* Climatisation : condenseur + circuit */}
        <rect x={138} y={330} width={14} height={66} />
        {[340, 350, 360, 370, 380, 390].map((y) => (
          <path key={y} d={`M138 ${y}h14`} opacity={0.6} />
        ))}
        <path d="M152 338C200 318 300 300 486 300L520 300" strokeDasharray="2 6" />
        <rect x={510} y={292} width={38} height={18} rx={2} />
        {/* Habitacle : direction, sièges, prise diagnostic */}
        <path d="M528 310L566 252" />
        <ellipse cx={570} cy={246} rx={7} ry={26} transform="rotate(-24 570 246)" />
        <path d="M640 380V300C640 290 650 270 676 268L700 270C708 280 706 300 700 320L720 380Z" opacity={0.55} />
        <path d="M820 380V320C820 300 830 286 856 286L880 290L884 380Z" opacity={0.55} />
        <path d="M528 330h22l-3 10h-16z" className="bp-accent" />
        <path d="M550 335C600 335 640 360 700 392L860 392" strokeDasharray="3 5" opacity={0.6} />
        {/* Réservoir */}
        <rect x={812} y={384} width={84} height={22} rx={6} opacity={0.6} />
        {/* Échappement */}
        <path d="M300 390C318 414 350 420 420 420L470 420M540 420L1010 420" />
        <rect x={470} y={411} width={70} height={18} rx={8} />
        <ellipse cx={1040} cy={414} rx={30} ry={12} className="bp-accent" />
        <path d="M1070 414h18" />
        {/* Suspensions */}
        <Coil x1={FRONT.x + 6} y1={FRONT.y - 40} x2={FRONT.x + 18} y2={300} />
        <Coil x1={REAR.x} y1={REAR.y - 40} x2={REAR.x} y2={304} />
        <path d={`M${REAR.x - 16} 304h32M${FRONT.x + 6} 298h26`} />
        {/* Freins + pneus */}
        <circle cx={FRONT.x} cy={FRONT.y} r={60} strokeWidth={3} opacity={0.5} />
        <circle cx={REAR.x} cy={REAR.y} r={60} strokeWidth={3} opacity={0.5} />
        <Brake {...FRONT} />
        <Brake {...REAR} />
      </g>
    </svg>
  );
}

/** Positions des repères (unités du viewBox), par prestation. */
export const hotspots: Record<string, { x: number; y: number; caption: string }> = {
  entretien: { x: 300, y: 282, caption: 'Huile & filtres' },
  distribution: { x: 190, y: 336, caption: 'Courroie de distribution' },
  embrayage: { x: 398, y: 356, caption: 'Embrayage' },
  batterie: { x: 456, y: 291, caption: 'Batterie' },
  climatisation: { x: 145, y: 362, caption: 'Condenseur de climatisation' },
  diagnostic: { x: 539, y: 335, caption: 'Prise de diagnostic' },
  freinage: { x: FRONT.x - 20, y: FRONT.y - 30, caption: 'Disque & étrier' },
  suspension: { x: REAR.x + 2, y: 336, caption: 'Ressort & amortisseur' },
  pneumatiques: { x: REAR.x + 43, y: REAR.y + 42, caption: 'Pneumatique' },
  echappement: { x: 1040, y: 414, caption: 'Silencieux' },
  hybride: { x: 700, y: 404, caption: 'Batterie de traction' },
};
