import { useId } from 'react';

/**
 * Lightweight illustrated artwork used when a listing has no photo yet. Each scene
 * reflects the category (beach, hills, waterfall, backwater…) and varies its time of
 * day from the item's name, so cards stay distinct without shipping stock images.
 */

const PALETTES = [
  { sky: ['#f6d8a8', '#f3efe2'], sun: '#f2b15a' }, // dawn
  { sky: ['#cfe6ea', '#f3f1e8'], sun: '#f7d77e' }, // day
  { sky: ['#f0b58f', '#f6e3c9'], sun: '#e27c4f' }, // dusk
];

export function sceneFor(categories = [], kind) {
  const c = new Set(categories);
  if (kind) {
    if (['restaurant', 'cafe', 'street-food', 'bakery'].includes(kind)) return 'food';
    if (['hotel', 'resort', 'homestay', 'hostel', 'villa', 'treehouse', 'camping', 'budget-room', 'luxury'].includes(kind)) return 'stay';
    if (kind === 'houseboat') return 'backwater';
    if (['theatre', 'mall', 'gaming-zone', 'indoor-entertainment'].includes(kind)) return 'city';
    if (kind === 'event') return 'event';
    if (kind === 'dish') return 'food';
  }
  if (c.has('waterfalls')) return 'waterfall';
  if (c.has('beaches')) return 'beach';
  if (c.has('backwaters') || c.has('lakes-dams')) return 'backwater';
  if (c.has('hill-stations') || c.has('treks') || c.has('viewpoints')) return 'hills';
  if (c.has('forests') || c.has('wildlife') || c.has('nature-walks')) return 'forest';
  if (c.has('heritage') || c.has('museums') || c.has('religious')) return 'heritage';
  if (c.has('villages')) return 'backwater';
  return 'hills';
}

function hash(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function Palm({ x, y, s = 1, color = '#1c4532' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeLinecap="round">
      <path d="M0 0 C 2 -30, 6 -55, 14 -80" strokeWidth="4" />
      <g strokeWidth="3.5">
        <path d="M14 -80 C 0 -84, -14 -78, -24 -66" />
        <path d="M14 -80 C 28 -86, 40 -80, 48 -68" />
        <path d="M14 -80 C 6 -94, -6 -98, -18 -96" />
        <path d="M14 -80 C 24 -96, 36 -100, 46 -94" />
        <path d="M14 -80 C 12 -70, 6 -60, 0 -54" />
      </g>
    </g>
  );
}

export default function SceneArt({ scene = 'hills', seed = '', className = '', label }) {
  const uid = useId().replace(/:/g, '');
  const h = hash(seed);
  const p = PALETTES[h % PALETTES.length];
  const shift = (h % 40) - 20;

  const sky = (
    <>
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <linearGradient id={`water${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d9fb0" />
          <stop offset="1" stopColor="#2f7f95" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#sky${uid})`} />
      <circle cx={300 + shift} cy={70 + (h % 20)} r="26" fill={p.sun} opacity="0.85" />
    </>
  );

  const scenes = {
    beach: (
      <>
        <path d="M0 150 H400 V260 H0Z" fill={`url(#water${uid})`} />
        <path d="M0 150 Q100 142 200 150 T400 150" stroke="#e8f3f5" strokeWidth="3" fill="none" opacity=".7" />
        <path d="M0 200 Q120 180 260 196 T400 188 V260 H0Z" fill="#ead7ae" />
        <path d="M0 212 Q140 196 280 210 T400 204" stroke="#fff" strokeWidth="3" fill="none" opacity=".6" />
        <Palm x={60} y={214} s={1.1} />
        <Palm x={96} y={220} s={0.8} />
      </>
    ),
    hills: (
      <>
        <path d="M0 150 L70 90 L140 140 L220 70 L310 130 L400 95 V260 H0Z" fill="#8dbba0" />
        <path d="M0 180 Q80 130 170 170 T340 150 T400 160 V260 H0Z" fill="#3c7d5b" />
        <path d="M0 215 Q100 180 200 210 T400 200 V260 H0Z" fill="#24503b" />
        {[40, 80, 120, 160, 200, 240].map((x, i) => (
          <path key={x} d={`M${x + (i % 2) * 6} ${222 + (i % 3) * 5} q20 -8 40 0`} stroke="#5c9a78" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".7" />
        ))}
      </>
    ),
    waterfall: (
      <>
        <path d="M0 60 L120 40 L160 120 L0 150Z" fill="#3c7d5b" />
        <path d="M400 50 L260 36 L230 120 L400 160Z" fill="#2c6448" />
        <path d="M160 40 H240 L236 200 H164Z" fill="#dfeff2" />
        <path d="M176 44 V196 M196 44 V200 M216 44 V198" stroke="#fff" strokeWidth="3" opacity=".8" />
        <path d="M0 150 L150 120 L164 200 L0 230Z" fill="#24503b" />
        <path d="M400 160 L240 120 L236 200 L400 230Z" fill="#1c4532" />
        <ellipse cx="200" cy="222" rx="150" ry="30" fill={`url(#water${uid})`} />
        <path d="M0 240 H400 V260 H0Z" fill="#143324" />
      </>
    ),
    backwater: (
      <>
        <path d="M0 140 Q200 128 400 140 V260 H0Z" fill={`url(#water${uid})`} />
        <path d="M0 140 Q60 120 140 136 L140 150 H0Z" fill="#3c7d5b" />
        <path d="M260 138 Q330 118 400 132 V150 H260Z" fill="#3c7d5b" />
        <Palm x={40} y={140} s={0.8} />
        <Palm x={340} y={134} s={0.9} />
        <g transform="translate(150 170)">
          <path d="M0 20 Q70 34 140 20 L128 30 Q70 40 12 30Z" fill="#6b3f22" />
          <path d="M26 20 Q70 -8 114 20Z" fill="#c9a36a" />
          <path d="M26 20 Q70 -8 114 20" stroke="#8a5a2b" strokeWidth="2" fill="none" />
        </g>
        <path d="M40 215 H130 M230 230 H330" stroke="#e8f3f5" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      </>
    ),
    forest: (
      <>
        <path d="M0 170 Q200 130 400 170 V260 H0Z" fill="#3c7d5b" />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 20 + i * 45 + ((h >> i) % 12);
          const hgt = 70 + ((h >> (i + 2)) % 40);
          return <path key={i} d={`M${x} ${220 - hgt} L${x + 26} 220 H${x - 26}Z`} fill={i % 2 ? '#1c4532' : '#24503b'} />;
        })}
        <path d="M0 220 H400 V260 H0Z" fill="#143324" />
      </>
    ),
    heritage: (
      <>
        <path d="M0 200 H400 V260 H0Z" fill="#d9c9a3" />
        <g fill="#a44e2d">
          <path d="M120 200 V120 L200 80 L280 120 V200Z" />
          <path d="M100 124 L200 70 L300 124 L290 130 L200 82 L110 130Z" fill="#843e24" />
        </g>
        <g fill="#f6e7c8">
          <rect x="150" y="140" width="20" height="30" rx="10" />
          <rect x="190" y="140" width="20" height="30" rx="10" />
          <rect x="230" y="140" width="20" height="30" rx="10" />
          <rect x="185" y="175" width="30" height="25" />
        </g>
        <Palm x={60} y={206} s={0.9} />
        <Palm x={340} y={206} s={0.8} />
      </>
    ),
    food: (
      <>
        <rect width="400" height="260" fill="#f5ddd0" />
        <circle cx="200" cy="140" r="96" fill="#fff" />
        <circle cx="200" cy="140" r="78" fill="#3c7d5b" opacity=".9" />
        <path d="M130 140 Q200 60 270 140 Q200 210 130 140Z" fill="#8dbba0" />
        <circle cx="180" cy="130" r="18" fill="#e8b04b" />
        <circle cx="220" cy="148" r="16" fill="#c0603a" />
        <circle cx="206" cy="118" r="10" fill="#faf8f3" />
      </>
    ),
    stay: (
      <>
        <path d="M0 190 Q200 160 400 190 V260 H0Z" fill="#3c7d5b" />
        <g>
          <path d="M140 190 V130 H260 V190Z" fill="#faf8f3" />
          <path d="M126 134 L200 92 L274 134Z" fill="#a44e2d" />
          <rect x="186" y="156" width="28" height="34" fill="#6b3f22" />
          <rect x="152" y="146" width="22" height="18" fill="#cfe6ea" />
          <rect x="226" y="146" width="22" height="18" fill="#cfe6ea" />
        </g>
        <Palm x={80} y={196} s={0.9} />
        <Palm x={320} y={196} s={1} />
      </>
    ),
    city: (
      <>
        <path d="M0 200 H400 V260 H0Z" fill="#24503b" />
        {[30, 90, 150, 210, 270, 330].map((x, i) => (
          <rect key={x} x={x} y={100 + (i % 3) * 25} width="50" height={100 - (i % 3) * 25} fill={i % 2 ? '#2c6448' : '#3c7d5b'} />
        ))}
      </>
    ),
    event: (
      <>
        <rect width="400" height="260" fill="#1c4532" />
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={(i * 53 + (h % 50)) % 400} cy={30 + ((i * 37) % 120)} r={3 + (i % 3)} fill={['#e8b04b', '#f5ddd0', '#8dbba0'][i % 3]} opacity=".8" />
        ))}
        <path d="M0 200 Q100 170 200 200 T400 190 V260 H0Z" fill="#143324" />
        <path d="M60 60 Q200 20 340 60" stroke="#e8b04b" strokeWidth="2" fill="none" strokeDasharray="4 8" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {scene !== 'food' && scene !== 'event' && sky}
      {scenes[scene] || scenes.hills}
    </svg>
  );
}
