/**
 * Wide editorial landscape for the home hero: Western Ghats ridges fading into
 * morning haze above a backwater. Used until a hero photograph is configured
 * (see HERO_IMAGE in pages/Home.jsx).
 */
const Palm = ({ x, y, s = 1, lean = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`} fill="none" stroke="#0f1e17" strokeLinecap="round">
    <path d="M0 0 C 4 -60, 12 -120, 30 -180" strokeWidth="8" />
    <g strokeWidth="6">
      <path d="M30 -180 C 6 -190, -28 -180, -52 -150" />
      <path d="M30 -180 C 60 -192, 90 -180, 108 -150" />
      <path d="M30 -180 C 14 -210, -14 -220, -42 -212" />
      <path d="M30 -180 C 52 -212, 80 -222, 106 -208" />
      <path d="M30 -180 C 26 -154, 12 -132, -2 -118" />
      <path d="M30 -180 C 40 -154, 56 -136, 74 -126" />
    </g>
  </g>
);

export default function HeroArt({ className = '' }) {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id="h-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c6b0" />
          <stop offset=".45" stopColor="#ece2d4" />
          <stop offset="1" stopColor="#e8ebe4" />
        </linearGradient>
        <linearGradient id="h-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9c2bc" />
          <stop offset=".5" stopColor="#5f8b86" />
          <stop offset="1" stopColor="#274d4a" />
        </linearGradient>
        <radialGradient id="h-sun">
          <stop offset="0" stopColor="#fff6e2" />
          <stop offset=".3" stopColor="#f6d7a2" />
          <stop offset="1" stopColor="#f6d7a2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="h-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13251c" stopOpacity="0" />
          <stop offset="1" stopColor="#13251c" stopOpacity=".55" />
        </linearGradient>
        <filter id="h-grain">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0" />
        </filter>
      </defs>
      <rect width="1600" height="900" fill="url(#h-sky)" />
      <circle cx="1180" cy="300" r="260" fill="url(#h-sun)" />
      <path d="M0 440 L160 360 L300 410 L470 300 L640 390 L820 320 L990 400 L1170 300 L1340 380 L1600 330 V620 H0Z" fill="#b9c9bd" opacity=".75" />
      <path d="M0 480 Q180 400 380 460 T780 430 T1180 450 T1600 420 V640 H0Z" fill="#8aa996" />
      <path d="M0 540 Q260 470 540 520 T1080 505 T1600 490 V660 H0Z" fill="#4f7a64" />
      <path d="M0 590 Q300 540 620 575 T1240 560 T1600 552 V680 H0Z" fill="#2f5241" />
      <path d="M0 612 H1600 V900 H0Z" fill="url(#h-water)" />
      <g stroke="#eef3f0" strokeWidth="3" strokeLinecap="round" opacity=".45">
        <path d="M140 680 H340" />
        <path d="M560 720 H820" />
        <path d="M1000 668 H1160" />
        <path d="M1260 760 H1500" />
        <path d="M280 820 H520" />
      </g>
      <g transform="translate(700 650)">
        <path d="M0 44 Q180 80 360 44 L330 70 Q180 96 30 70Z" fill="#2b1a0f" />
        <path d="M64 44 Q180 -24 296 44Z" fill="#c4a06a" />
        <path d="M64 44 Q180 -24 296 44" stroke="#6e4726" strokeWidth="4" fill="none" />
      </g>
      <path d="M0 620 Q140 588 300 616 L300 660 H0Z" fill="#1e372b" />
      <path d="M1300 612 Q1450 584 1600 606 V660 H1300Z" fill="#1e372b" />
      <Palm x={80} y={640} s={1.25} lean={-5} />
      <Palm x={200} y={648} s={0.95} lean={4} />
      <Palm x={1440} y={630} s={1.2} lean={5} />
      <Palm x={1540} y={640} s={0.9} lean={-3} />
      <rect width="1600" height="900" fill="url(#h-shade)" />
      <rect width="1600" height="900" filter="url(#h-grain)" opacity=".12" />
    </svg>
  );
}
