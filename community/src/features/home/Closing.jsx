import CityScene from '../../components/art/CityScene.jsx';
import ButtonLink from '../../components/ui/ButtonLink.jsx';
import { applyLink } from '../../config/site.js';
import { gsap } from '../../animation/gsap.js';
import { useScene } from '../../animation/useScene.js';
import { closing } from './content.js';

export default function Closing() {
  const scope = useScene(({ root, reduced }) => {
    if (reduced) return;
    gsap.from(root.querySelectorAll('.closing__line'), {
      yPercent: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 1.4,
      scrollTrigger: { trigger: root, start: 'top 70%', once: true },
    });
    gsap.fromTo(
      root.querySelector('.closing__art'),
      { yPercent: 12 },
      { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom bottom', scrub: true } },
    );
  });

  return (
    <section ref={scope} className="closing theme-dark grain" aria-labelledby="closing-title">
      <div className="closing__art">
        <CityScene seed={88} variant="night" focus="center" />
      </div>
      <div className="closing__veil" aria-hidden="true" />
      <div className="container closing__inner">
        <h2 id="closing-title" className="display closing__title">
          {closing.lines.map((line, index) => (
            <span key={line} className="closing__line">
              {index === closing.lines.length - 1 ? <em>{line}</em> : line}
            </span>
          ))}
        </h2>
        <ButtonLink to={applyLink.to} size="lg">
          {applyLink.label}
        </ButtonLink>
      </div>
    </section>
  );
}
