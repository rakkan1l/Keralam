import CityScene from '../art/CityScene.jsx';
import { useScene } from '../../animation/useScene.js';
import { gsap } from '../../animation/gsap.js';
import './ui.css';

/** Dark, cinematic opening used by interior pages. */
export default function PageHero({ eyebrow, title, lede, seed = 11, variant = 'night', children, index }) {
  const scope = useScene(({ root, reduced }) => {
    if (reduced) return;
    gsap.from(root.querySelectorAll('[data-hero-line]'), { y: 40, opacity: 0, stagger: 0.1, duration: 1.2, delay: 0.1 });
    gsap.to(root.querySelector('.page-hero__art'), {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
    });
  });

  return (
    <header ref={scope} className="page-hero theme-dark grain">
      <div className="page-hero__art">
        <CityScene seed={seed} variant={variant} focus="right" />
      </div>
      <div className="page-hero__veil" aria-hidden="true" />
      <div className="container page-hero__inner">
        {index && (
          <span className="page-hero__index caps" data-hero-line>
            {index}
          </span>
        )}
        {eyebrow && (
          <p className="eyebrow" data-hero-line>
            {eyebrow}
          </p>
        )}
        <h1 className="display page-hero__title" data-hero-line>
          {title}
        </h1>
        {lede && (
          <p className="lede page-hero__lede" data-hero-line>
            {lede}
          </p>
        )}
        {children && <div data-hero-line>{children}</div>}
      </div>
    </header>
  );
}
