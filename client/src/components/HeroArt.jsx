/** Wide illustrated Kerala landscape for the home hero (no external image dependency). */
export default function HeroArt({ className = '' }) {
  const palm = (x, y, s, c = '#0b1f15') => (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={c} strokeLinecap="round">
      <path d="M0 0 C 3 -40, 8 -80, 20 -120" strokeWidth="6" />
      <g strokeWidth="5">
        <path d="M20 -120 C 0 -126, -22 -118, -36 -98" />
        <path d="M20 -120 C 42 -128, 60 -120, 72 -100" />
        <path d="M20 -120 C 8 -142, -10 -148, -28 -144" />
        <path d="M20 -120 C 36 -144, 54 -150, 70 -140" />
        <path d="M20 -120 C 18 -104, 8 -90, 0 -80" />
        <path d="M20 -120 C 26 -104, 36 -94, 46 -86" />
      </g>
    </g>
  );
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4c98f" />
          <stop offset="0.55" stopColor="#f6e2c2" />
          <stop offset="1" stopColor="#e9efe6" />
        </linearGradient>
        <linearGradient id="hero-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fb9b8" />
          <stop offset="1" stopColor="#2f6f73" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.6" stopColor="#f7c46b" />
          <stop offset="1" stopColor="#f7c46b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#hero-sky)" />
      <circle cx="1120" cy="330" r="170" fill="url(#hero-sun)" />
      <path d="M0 470 L180 360 L320 430 L520 300 L700 410 L880 330 L1060 420 L1260 320 L1440 400 L1600 350 V600 H0Z" fill="#9fbfa6" opacity=".8" />
      <path d="M0 520 Q200 420 420 500 T860 470 T1300 480 T1600 450 V640 H0Z" fill="#5c8f6f" />
      <path d="M0 580 Q260 520 520 570 T1040 560 T1600 540 V680 H0Z" fill="#2c6448" />
      <path d="M0 600 H1600 V900 H0Z" fill="url(#hero-water)" />
      <g stroke="#e6f0ee" strokeWidth="4" strokeLinecap="round" opacity=".55">
        <path d="M120 660 H300" />
        <path d="M520 700 H760" />
        <path d="M980 650 H1120" />
        <path d="M1260 730 H1480" />
        <path d="M300 800 H520" />
        <path d="M860 820 H1100" />
      </g>
      <g transform="translate(640 640)">
        <path d="M0 40 Q170 72 340 40 L312 64 Q170 88 28 64Z" fill="#4a2c17" />
        <path d="M60 40 Q170 -30 280 40Z" fill="#c9a36a" />
        <path d="M60 40 Q170 -30 280 40" stroke="#7d5127" strokeWidth="4" fill="none" />
        <path d="M100 40 V14 M140 40 V2 M200 40 V2 M240 40 V14" stroke="#7d5127" strokeWidth="3" />
      </g>
      <path d="M0 610 Q120 580 260 606 L260 640 H0Z" fill="#1c4532" />
      <path d="M1340 604 Q1460 578 1600 598 V640 H1340Z" fill="#1c4532" />
      {palm(70, 620, 1.3)}
      {palm(170, 626, 1.05)}
      {palm(1420, 612, 1.25)}
      {palm(1520, 620, 1.0)}
      {palm(1330, 626, 0.8)}
    </svg>
  );
}
