import { useEffect, useRef } from 'react';
import CityScene from '../../components/art/CityScene.jsx';
import { media } from '../../config/media.js';
import { gsap } from '../../animation/gsap.js';
import { revealOnScroll, useScene } from '../../animation/useScene.js';
import { prologue } from './content.js';

/** Optional muted loop that only loads and plays while visible, and never for reduced motion. */
function IntroVideo() {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className="prologue__video"
      src={media.introVideo}
      poster={media.introPoster || undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}

export default function Prologue() {
  const scope = useScene(({ root, reduced }) => {
    if (reduced) return;
    const frame = root.querySelector('.prologue__frame');
    gsap.fromTo(
      frame,
      { clipPath: 'inset(14% 10% 14% 10%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top 90%', end: 'center 55%', scrub: true },
      },
    );
    gsap.fromTo(
      root.querySelector('.prologue__art'),
      { scale: 1.18 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
    gsap.from(root.querySelectorAll('.prologue__word'), {
      opacity: 0.12,
      stagger: 0.25,
      ease: 'none',
      scrollTrigger: { trigger: root.querySelector('.prologue__lines'), start: 'top 80%', end: 'bottom 55%', scrub: true },
    });
    revealOnScroll(root);
  });

  return (
    <section ref={scope} id="prologue" className="prologue section theme-dark" aria-labelledby="prologue-title">
      <div className="container">
        <p className="eyebrow" data-reveal>
          {prologue.eyebrow}
        </p>
      </div>

      <div className="prologue__frame grain">
        <div className="prologue__art">
          <CityScene seed={5} variant="dusk" focus="left" layers={false} />
          {media.introVideo && <IntroVideo />}
        </div>
        <div className="prologue__letterbox" aria-hidden="true" />
        <p className="prologue__caption caps">{prologue.caption}</p>
      </div>

      <div className="container prologue__body">
        <h2 id="prologue-title" className="display prologue__lines">
          {prologue.lines.map((line, index) => (
            <span key={line} className={`prologue__word${index === prologue.lines.length - 1 ? ' is-accent' : ''}`}>
              {line}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
