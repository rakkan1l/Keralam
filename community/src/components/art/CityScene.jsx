import { useId, useMemo } from 'react';
import { createRandom } from './random.js';

// Original, procedurally generated city art used until real in-game photography
// is supplied. Deterministic per seed, a few kilobytes of DOM, no network requests.

const W = 1600;
const H = 900;

const PALETTES = {
  night: {
    sky: ['#050404', '#0d0b09', '#1a140c'],
    glow: '#c29a55',
    glowOpacity: 0.32,
    sun: '#dfc68e',
    sunOpacity: 0.16,
    far: '#1c1a17',
    mid: '#12110f',
    near: '#080707',
    window: '#e8cf93',
    haze: '#0b0a09',
  },
  dusk: {
    sky: ['#0a0806', '#1b140c', '#4a3519'],
    glow: '#d1ad6b',
    glowOpacity: 0.45,
    sun: '#ecdcb6',
    sunOpacity: 0.32,
    far: '#2a2117',
    mid: '#17120d',
    near: '#0a0807',
    window: '#f1dcab',
    haze: '#0b0a09',
  },
  paper: {
    sky: ['#fcfaf6', '#f6f2ea', '#ece2cf'],
    glow: '#c29a55',
    glowOpacity: 0.18,
    sun: '#d1ad6b',
    sunOpacity: 0.42,
    far: '#e3dbcb',
    mid: '#d3c8b3',
    near: '#bfb29a',
    window: null,
    haze: '#f6f2ea',
  },
};

function edgeWeight(cx, focus) {
  const center = focus === 'left' ? W * 0.32 : focus === 'right' ? W * 0.68 : W / 2;
  const d = Math.min(1, Math.abs(cx - center) / (W / 2));
  return d;
}

function buildLayer(rand, { baseY, minH, maxH, minW, maxW, gap, focus, open }) {
  const blocks = [];
  let x = -60;
  while (x < W + 60) {
    const w = rand.range(minW, maxW);
    const d = edgeWeight(x + w / 2, focus);
    // `open` keeps the composition's focal area low so typography can breathe.
    const profile = open ? 0.18 + 0.82 * Math.pow(d, 1.35) : rand.range(0.45, 1);
    const h = minH + (maxH - minH) * profile * rand.range(0.6, 1);
    blocks.push({ x, w, h, step: rand.chance(0.35), antenna: rand.chance(0.12) });
    x += w + rand.range(0, gap);
  }

  let d = '';
  for (const b of blocks) {
    const top = baseY - b.h;
    d += `M${b.x.toFixed(1)} ${baseY}V${top.toFixed(1)}H${(b.x + b.w).toFixed(1)}V${baseY}Z`;
    if (b.step) {
      const sw = b.w * 0.55;
      const sx = b.x + (b.w - sw) / 2;
      const sh = Math.min(60, b.h * 0.12);
      d += `M${sx.toFixed(1)} ${top.toFixed(1)}V${(top - sh).toFixed(1)}H${(sx + sw).toFixed(1)}V${top.toFixed(1)}Z`;
    }
    if (b.antenna) {
      const ax = b.x + b.w / 2;
      d += `M${(ax - 1).toFixed(1)} ${top.toFixed(1)}V${(top - 46).toFixed(1)}H${(ax + 1).toFixed(1)}V${top.toFixed(1)}Z`;
    }
  }
  return { d, blocks };
}

function buildWindows(rand, blocks, baseY, { density, cap }) {
  const tiers = ['', '', ''];
  let count = 0;
  for (const b of blocks) {
    if (b.w < 26) continue;
    const top = baseY - b.h + 14;
    for (let y = top; y < baseY - 16; y += 17) {
      for (let x = b.x + 7; x < b.x + b.w - 9; x += 13) {
        if (count >= cap) break;
        if (!rand.chance(density)) continue;
        tiers[rand.int(0, 2)] += `M${x.toFixed(1)} ${y.toFixed(1)}h4v7h-4z`;
        count += 1;
      }
    }
  }
  return tiers;
}

export default function CityScene({
  seed = 7,
  variant = 'night',
  focus = 'center',
  sun = true,
  className = '',
  layers = true,
}) {
  const uid = useId().replace(/:/g, '');
  const palette = PALETTES[variant] || PALETTES.night;

  const scene = useMemo(() => {
    const rand = createRandom(seed);
    const far = buildLayer(rand, { baseY: 760, minH: 110, maxH: 330, minW: 36, maxW: 110, gap: 6, focus, open: false });
    const mid = buildLayer(rand, { baseY: 820, minH: 80, maxH: 470, minW: 44, maxW: 130, gap: 14, focus, open: true });
    const near = buildLayer(rand, { baseY: 900, minH: 40, maxH: 720, minW: 70, maxW: 190, gap: 40, focus, open: true });
    const midWindows = palette.window ? buildWindows(rand, mid.blocks, 820, { density: 0.1, cap: 420 }) : null;
    const nearWindows = palette.window ? buildWindows(rand, near.blocks, 900, { density: 0.05, cap: 260 }) : null;
    const sunX = focus === 'left' ? W * 0.3 : focus === 'right' ? W * 0.7 : W / 2;
    return { far, mid, near, midWindows, nearWindows, sunX };
  }, [seed, focus, palette.window]);

  const windowOpacity = [0.9, 0.55, 0.3];

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.sky[0]} />
          <stop offset="0.62" stopColor={palette.sky[1]} />
          <stop offset="1" stopColor={palette.sky[2]} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.5" cy="1" r="0.75">
          <stop offset="0" stopColor={palette.glow} stopOpacity={palette.glowOpacity} />
          <stop offset="1" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sun-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={palette.sun} stopOpacity={palette.sunOpacity} />
          <stop offset="0.55" stopColor={palette.sun} stopOpacity={palette.sunOpacity * 0.75} />
          <stop offset="0.72" stopColor={palette.sun} stopOpacity={palette.sunOpacity * 0.18} />
          <stop offset="1" stopColor={palette.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`haze-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.haze} stopOpacity="0" />
          <stop offset="1" stopColor={palette.haze} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#sky-${uid})`} />
      <g data-layer="sky">
        <ellipse cx={scene.sunX} cy="760" rx="900" ry="420" fill={`url(#glow-${uid})`} />
        {sun && <circle cx={scene.sunX} cy="560" r="230" fill={`url(#sun-${uid})`} />}
      </g>
      <g data-layer={layers ? 'far' : undefined}>
        <path d={scene.far.d} fill={palette.far} />
      </g>
      <g data-layer={layers ? 'mid' : undefined}>
        <path d={scene.mid.d} fill={palette.mid} />
        {scene.midWindows?.map((d, i) => (
          <path key={i} d={d} fill={palette.window} opacity={windowOpacity[i] * 0.8} />
        ))}
      </g>
      <rect y="560" width={W} height="340" fill={`url(#haze-${uid})`} opacity="0.55" />
      <g data-layer={layers ? 'near' : undefined}>
        <path d={scene.near.d} fill={palette.near} />
        {scene.nearWindows?.map((d, i) => (
          <path key={i} d={d} fill={palette.window} opacity={windowOpacity[i] * 0.5} />
        ))}
      </g>
    </svg>
  );
}
