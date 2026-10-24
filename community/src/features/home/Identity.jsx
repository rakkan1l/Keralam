import { revealOnScroll, useScene } from '../../animation/useScene.js';
import { identity } from './content.js';

export default function Identity() {
  const scope = useScene(({ root, reduced }) => {
    if (!reduced) revealOnScroll(root);
  });
  const [before, accent, after] = identity.statement;

  return (
    <section ref={scope} className="identity section theme-light" aria-labelledby="identity-title">
      <div className="container identity__grid">
        <div className="identity__aside">
          <p className="eyebrow" data-reveal>
            {identity.eyebrow}
          </p>
          <span className="identity__numeral display" aria-hidden="true" data-reveal>
            I
          </span>
        </div>
        <h2 id="identity-title" className="heading identity__statement" data-reveal>
          {before}
          <em>{accent}</em>
          {after}
        </h2>
      </div>

      <div className="container">
        <ol role="list" className="identity__principles" data-reveal-group>
          {identity.principles.map((item, index) => (
            <li key={item.title} className="identity__principle" data-reveal>
              <span className="caps identity__index">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="identity__title">{item.title}</h3>
              <p className="muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
