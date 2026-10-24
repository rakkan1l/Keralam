import CityScene from '../../components/art/CityScene.jsx';
import ButtonLink, { Arrow } from '../../components/ui/ButtonLink.jsx';
import { StatusPill } from '../../components/ui/Status.jsx';
import { applications, applyLink, launch } from '../../config/site.js';
import { gsap } from '../../animation/gsap.js';
import { useScene } from '../../animation/useScene.js';
import { hero } from './content.js';

export default function Hero() {
  const scope = useScene(({ root, reduced }) => {
    if (reduced) return;
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .from(root.querySelector('.hero__art'), { scale: 1.12, opacity: 0, duration: 2.4, ease: 'power2.out' })
      .from(root.querySelectorAll('.hero__line-inner'), { yPercent: 110, duration: 1.5, stagger: 0.12 }, 0.35)
      .from(root.querySelectorAll('[data-hero-fade]'), { y: 24, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.9)
      .from(root.querySelector('.hero__rule'), { scaleX: 0, duration: 1.6, ease: 'power3.inOut' }, 0.6);

    // Gentle depth on scroll: layers drift at different rates. Scrubbed, never scroll-jacked.
    const drift = { sky: 4, far: 8, mid: 14, near: 22 };
    Object.entries(drift).forEach(([layer, amount]) => {
      const el = root.querySelector(`[data-layer="${layer}"]`);
      if (!el) return;
      gsap.to(el, {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    gsap.to(root.querySelector('.hero__content'), {
      yPercent: -18,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
    });
  });

  return (
    <section ref={scope} className="hero theme-dark grain" aria-labelledby="hero-title">
      <div className="hero__art">
        <CityScene seed={21} variant="night" focus="center" />
      </div>
      <div className="hero__veil" aria-hidden="true" />

      <div className="container hero__content">
        <p className="eyebrow hero__eyebrow" data-hero-fade>
          {hero.eyebrow}
        </p>
        <h1 id="hero-title" className="display hero__title">
          {hero.lines.map((line, index) => (
            <span key={line} className="hero__line">
              <span className="hero__line-inner">{index === hero.accentLine ? <em>{line}</em> : line}</span>
            </span>
          ))}
        </h1>
        <span className="hero__rule" aria-hidden="true" />
        <p className="lede hero__lede" data-hero-fade>
          {hero.lede}
        </p>
        <div className="hero__actions" data-hero-fade>
          <ButtonLink to={applyLink.to} size="lg">
            {applyLink.label}
          </ButtonLink>
          <a href="#prologue" className="text-link">
            Explore the city <Arrow />
          </a>
        </div>
      </div>

      <div className="container hero__footer" data-hero-fade>
        <a href="#prologue" className="scroll-cue">
          <span className="scroll-cue__line" aria-hidden="true" />
          <span className="caps">Scroll</span>
        </a>
        <ul role="list" className="hero__status" aria-label="Launch status">
          <li>
            <span className="caps">Server</span>
            <StatusPill tone="pending">{launch.serverLive ? 'Live' : 'Not yet launched'}</StatusPill>
          </li>
          <li>
            <span className="caps">Applications</span>
            <StatusPill tone={applications.acceptingOnline ? 'positive' : 'pending'}>
              {applications.acceptingOnline ? 'Open' : 'Opening soon'}
            </StatusPill>
          </li>
        </ul>
      </div>
    </section>
  );
}
