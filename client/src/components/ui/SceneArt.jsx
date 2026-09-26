import { useId } from 'react';

/**
 * Editorial illustrations used until a real photograph is uploaded for a listing.
 * Each scene is built from atmospheric layers (sky → haze → ridges → foreground)
 * with soft light and a film-grain overlay, and varies its light from a seed so
 * neighbouring cards differ. Real images always take precedence (see SmartImage).
 */

const LIGHTS = [
  { name: 'dawn', sky: ['#e9d3bd', '#f3e7d8', '#eef0ea'], sun: '#f4c78e', haze: '#efe2d3' },
  { name: 'morning', sky: ['#c9dad8', '#e3ebe6', '#f3f1ea'], sun: '#f6e0a6', haze: '#e6ece6' },
  { name: 'golden', sky: ['#e8b88e', '#f1d4b3', '#f5ebdc'], sun: '#f2a864', haze: '#f0dcc6' },
  { name: 'mist', sky: ['#b9c7c3', '#d5dedb', '#e9ece8'], sun: '#eef0ea', haze: '#dde5e1' },
];

export function sceneFor(categories = [], kind) {
  const c = new Set(categories);
  if (kind) {
    if (['restaurant', 'cafe', 'street-food', 'bakery', 'dish'].includes(kind)) return 'food';
    if (['hotel', 'resort', 'homestay', 'hostel', 'villa', 'treehouse', 'camping', 'budget-room', 'luxury'].includes(kind)) return 'stay';
    if (kind === 'houseboat') return 'backwater';
    if (['theatre', 'mall', 'gaming-zone', 'indoor-entertainment', 'market', 'handicrafts', 'spices', 'souvenirs'].includes(kind)) return 'town';
    if (kind === 'event') return 'event';
  }
  if (c.has('waterfalls')) return 'waterfall';
  if (c.has('beaches')) return 'beach';
  if (c.has('backwaters') || c.has('lakes-dams')) return 'backwater';
  if (c.has('heritage') || c.has('museums') || c.has('religious')) return 'heritage';
  if (c.has('forests') || c.has('wildlife') || c.has('nature-walks')) return 'forest';
  if (c.has('hill-stations') || c.has('treks') || c.has('viewpoints')) return 'hills';
  if (c.has('villages')) return 'backwater';
  return 'hills';
}

function hash(s = '') {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

const Palm = ({ x, y, s = 1, c = '#16271f', lean = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`} fill="none" stroke={c} strokeLinecap="round">
    <path d="M0 0 C 4 -50, 10 -100, 26 -150" strokeWidth="7" />
    <g strokeWidth="5.5">
      <path d="M26 -150 C 4 -158, -24 -150, -44 -124" />
      <path d="M26 -150 C 52 -160, 76 -150, 92 -126" />
      <path d="M26 -150 C 12 -176, -12 -184, -36 -178" />
      <path d="M26 -150 C 44 -178, 68 -186, 90 -174" />
      <path d="M26 -150 C 22 -128, 10 -110, -2 -98" />
      <path d="M26 -150 C 34 -128, 48 -114, 62 -106" />
    </g>
  </g>
);

function Layers({ scene, L, u, h }) {
  const v = (h % 60) - 30;
  switch (scene) {
    case 'beach':
      return (
        <>
          <path d="M0 300 H800 V520 H0Z" fill={`url(#sea${u})`} />
          <path d="M0 300 Q200 294 400 300 T800 300" stroke="#fff" strokeOpacity=".5" strokeWidth="2" fill="none" />
          <path d={`M0 392 Q220 ${352 + v / 3} 470 380 T800 366 V520 H0Z`} fill="#e7d6b5" />
          <path d={`M0 404 Q230 ${366 + v / 3} 480 392 T800 378`} stroke="#fff" strokeOpacity=".75" strokeWidth="3" fill="none" />
          <path d="M0 440 Q260 420 520 438 T800 430 V520 H0Z" fill="#dcc79f" />
          <Palm x={90} y={452} s={1.35} lean={-4} />
          <Palm x={170} y={464} s={1} lean={6} />
        </>
      );
    case 'waterfall':
      return (
        <>
          <path d="M0 120 Q120 90 260 110 L300 260 L0 320Z" fill="#5f8a74" />
          <path d="M800 100 Q660 80 520 104 L490 260 L800 330Z" fill="#4e7a64" />
          <path d="M318 96 H482 L474 392 H326Z" fill="#e9f1ef" />
          {[344, 372, 400, 428, 456].map((x, i) => (
            <path key={x} d={`M${x} 100 V${380 + (i % 2) * 12}`} stroke="#fff" strokeOpacity=".8" strokeWidth={i % 2 ? 2 : 3} />
          ))}
          <path d="M0 300 L300 250 L326 392 L0 450Z" fill="#2f5241" />
          <path d="M800 320 L490 250 L474 392 L800 452Z" fill="#264436" />
          <ellipse cx="400" cy="430" rx="300" ry="54" fill={`url(#sea${u})`} />
          <ellipse cx="400" cy="400" rx="120" ry="18" fill="#fff" opacity=".55" />
          <path d="M0 470 H800 V520 H0Z" fill="#1e372b" />
        </>
      );
    case 'backwater':
      return (
        <>
          <path d="M0 282 Q400 268 800 282 V520 H0Z" fill={`url(#sea${u})`} />
          <path d="M0 282 Q110 250 250 272 L262 296 H0Z" fill="#3a634f" />
          <path d="M540 276 Q670 246 800 266 V296 H540Z" fill="#3a634f" />
          <Palm x={60} y={286} s={0.95} lean={-6} />
          <Palm x={140} y={284} s={0.7} lean={4} />
          <Palm x={690} y={278} s={0.85} lean={5} />
          <g transform={`translate(${280 + v} 330)`}>
            <path d="M0 40 Q130 70 260 40 L236 60 Q130 80 24 60Z" fill="#3b2415" />
            <path d="M44 40 Q130 -14 216 40Z" fill="#c7a26b" />
            <path d="M44 40 Q130 -14 216 40" stroke="#6e4726" strokeWidth="3" fill="none" />
          </g>
          <path d="M60 440 H240 M470 470 H700" stroke="#fff" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case 'forest':
      return (
        <>
          <path d="M0 330 Q400 270 800 330 V520 H0Z" fill="#4a7862" />
          {Array.from({ length: 11 }).map((_, i) => {
            const x = 10 + i * 76 + ((h >> i) % 22);
            const ht = 140 + ((h >> (i + 3)) % 90);
            return <path key={i} d={`M${x} ${440 - ht} C ${x - 30} ${440 - ht * 0.4}, ${x - 46} 440, ${x - 46} 440 H ${x + 46} C ${x + 46} 440, ${x + 30} ${440 - ht * 0.4}, ${x} ${440 - ht}Z`} fill={i % 2 ? '#1e372b' : '#264436'} />;
          })}
          <path d="M0 430 H800 V520 H0Z" fill="#13251c" />
        </>
      );
    case 'heritage':
      return (
        <>
          <path d="M0 400 H800 V520 H0Z" fill="#d8c8a6" />
          <g transform="translate(250 150)">
            <path d="M0 250 V130 L150 60 L300 130 V250Z" fill="#9c5231" />
            <path d="M-30 136 L150 40 L330 136 L316 146 L150 58 L-16 146Z" fill="#6c3620" />
            <path d="M60 40 L150 -8 L240 40 L230 48 L150 8 L70 48Z" fill="#6c3620" />
            {[64, 124, 184].map((x) => <rect key={x} x={x} y="160" width="40" height="60" rx="20" fill="#f3e3c6" />)}
            <rect x="130" y="206" width="40" height="44" fill="#3b2415" />
          </g>
          <Palm x={110} y={410} s={1.1} lean={-5} />
          <Palm x={690} y={412} s={1} lean={5} />
        </>
      );
    case 'food':
      return (
        <>
          <rect width="800" height="520" fill="#efe4d3" />
          <circle cx="400" cy="270" r="190" fill="#fbf7ef" />
          <circle cx="400" cy="270" r="160" fill="#2f5241" />
          <path d="M270 270 Q400 110 530 270 Q400 420 270 270Z" fill="#6a957c" />
          <circle cx="360" cy="250" r="44" fill="#e0b262" />
          <circle cx="440" cy="296" r="36" fill="#b4633d" />
          <circle cx="430" cy="226" r="22" fill="#fbf7ef" />
          <circle cx="352" cy="318" r="16" fill="#d9a441" />
        </>
      );
    case 'stay':
      return (
        <>
          <path d="M0 360 Q400 320 800 360 V520 H0Z" fill="#3a634f" />
          <g transform="translate(270 190)">
            <path d="M0 180 V70 H260 V180Z" fill="#f7f1e6" />
            <path d="M-26 78 L130 0 L286 78Z" fill="#9c5231" />
            <rect x="112" y="116" width="36" height="64" fill="#3b2415" />
            <rect x="30" y="100" width="48" height="34" fill="#c9dad8" />
            <rect x="182" y="100" width="48" height="34" fill="#c9dad8" />
          </g>
          <Palm x={150} y={380} s={1.1} lean={-4} />
          <Palm x={660} y={378} s={1.2} lean={5} />
        </>
      );
    case 'town':
      return (
        <>
          <path d="M0 400 H800 V520 H0Z" fill="#2f5241" />
          {[40, 150, 260, 380, 500, 620].map((x, i) => (
            <g key={x}>
              <rect x={x} y={210 + (i % 3) * 40} width="100" height={190 - (i % 3) * 40} fill={i % 2 ? '#3a634f' : '#4a7862'} />
              <path d={`M${x - 8} ${210 + (i % 3) * 40} L${x + 50} ${180 + (i % 3) * 40} L${x + 108} ${210 + (i % 3) * 40}Z`} fill="#9c5231" />
            </g>
          ))}
        </>
      );
    case 'event':
      return (
        <>
          <rect width="800" height="520" fill="#1e372b" />
          {Array.from({ length: 22 }).map((_, i) => (
            <circle key={i} cx={(i * 97 + (h % 80)) % 800} cy={40 + ((i * 53) % 260)} r={3 + (i % 4)} fill={['#e0b262', '#f2dccf', '#98b8a4'][i % 3]} opacity=".85" />
          ))}
          <path d="M60 120 Q400 40 740 120" stroke="#e0b262" strokeWidth="2" fill="none" strokeDasharray="2 12" strokeLinecap="round" />
          <path d="M0 400 Q200 350 400 400 T800 386 V520 H0Z" fill="#13251c" />
        </>
      );
    default: // hills
      return (
        <>
          <path d={`M0 290 L120 ${200 + v} L240 270 L380 170 L520 260 L650 ${190 - v / 2} L800 250 V520 H0Z`} fill="#98b8a4" opacity=".85" />
          <path d="M0 340 Q160 250 330 320 T660 300 T800 310 V520 H0Z" fill="#4a7862" />
          <path d="M0 410 Q200 350 400 400 T800 380 V520 H0Z" fill="#2f5241" />
          {[60, 150, 240, 330, 420, 510, 600, 690].map((x, i) => (
            <path key={x} d={`M${x} ${425 + (i % 3) * 10} q34 -12 68 0`} stroke="#6a957c" strokeWidth="7" fill="none" strokeLinecap="round" opacity=".7" />
          ))}
          <path d="M0 470 H800 V520 H0Z" fill="#1e372b" />
        </>
      );
  }
}

export default function SceneArt({ scene = 'hills', seed = '', className = '', label }) {
  const u = useId().replace(/:/g, '');
  const h = hash(seed || scene);
  const L = LIGHTS[h % LIGHTS.length];
  const sunX = 520 + (h % 200);
  const sunY = 110 + ((h >> 3) % 60);
  const hasSky = !['food', 'event'].includes(scene);
  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`sky${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.sky[0]} />
          <stop offset=".55" stopColor={L.sky[1]} />
          <stop offset="1" stopColor={L.sky[2]} />
        </linearGradient>
        <linearGradient id={`sea${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb3b0" />
          <stop offset="1" stopColor="#35676c" />
        </linearGradient>
        <radialGradient id={`sun${u}`}>
          <stop offset="0" stopColor="#fff8e8" />
          <stop offset=".35" stopColor={L.sun} />
          <stop offset="1" stopColor={L.sun} stopOpacity="0" />
        </radialGradient>
        <filter id={`grain${u}`}>
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0" />
        </filter>
      </defs>
      {hasSky && (
        <>
          <rect width="800" height="520" fill={`url(#sky${u})`} />
          <circle cx={sunX} cy={sunY} r="120" fill={`url(#sun${u})`} />
          <path d="M0 230 Q200 200 400 226 T800 214 V300 H0Z" fill={L.haze} opacity=".7" />
        </>
      )}
      <Layers scene={scene} L={L} u={u} h={h} />
      <rect width="800" height="520" filter={`url(#grain${u})`} opacity=".14" />
    </svg>
  );
}
