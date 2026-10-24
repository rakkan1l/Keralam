import CityScene from '../../components/art/CityScene.jsx';
import { gsap } from '../../animation/gsap.js';
import { useScene } from '../../animation/useScene.js';

export default function GangsOpening({ count, isPreview }) {
  const scope = useScene(({ root, reduced }) => {
    if (reduced) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(root.querySelectorAll('.gangs-opening__word-inner'), { yPercent: 105, duration: 1.6, stagger: 0.12 }, 0.15)
      .from(root.querySelectorAll('[data-fade]'), { opacity: 0, y: 20, duration: 1.2, stagger: 0.08 }, 0.6)
      .fromTo(
        root.querySelectorAll('.gangs-opening__panel'),
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, stagger: 0.14, ease: 'expo.inOut' },
        0.3,
      );
    root.querySelectorAll('.gangs-opening__panel').forEach((panel, index) => {
      gsap.to(panel.firstElementChild, {
        yPercent: [-8, 6, -14][index] ?? 0,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
  });

  return (
    <header ref={scope} className="gangs-opening theme-dark grain">
      <div className="container">
        <div className="gangs-opening__meta caps" data-fade>
          <span>Archive</span>
          <span>{isPreview ? 'Development preview' : `${String(count).padStart(2, '0')} recognised`}</span>
          <span>Pre-launch edition</span>
        </div>

        <h1 className="display gangs-opening__title">
          <span className="gangs-opening__word">
            <span className="gangs-opening__word-inner">The Gang</span>
          </span>
          <span className="gangs-opening__word gangs-opening__word--offset">
            <span className="gangs-opening__word-inner">
              <em>Archive</em>
            </span>
          </span>
        </h1>

        <div className="gangs-opening__composition">
          <p className="gangs-opening__intro" data-fade>
            The organisations that define the city’s underworld — recognised by administration, told as stories and
            kept as records.
          </p>
          <div className="gangs-opening__panels" aria-hidden="true">
            {[
              { seed: 301, variant: 'dusk', focus: 'left' },
              { seed: 302, variant: 'night', focus: 'center' },
              { seed: 303, variant: 'dusk', focus: 'right' },
            ].map((art) => (
              <div key={art.seed} className="gangs-opening__panel">
                <div className="gangs-opening__panel-art">
                  <CityScene {...art} layers={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
