import { useState } from 'react';
import ButtonLink from '../../components/ui/ButtonLink.jsx';
import { Notice } from '../../components/ui/Status.jsx';
import { revealOnScroll, useScene } from '../../animation/useScene.js';
import GangArt from './GangArt.jsx';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
export const numeral = (index) => ROMAN[index] ?? String(index + 1);

function EmptyArchive() {
  return (
    <div className="gang-empty">
      <p className="caps gang-empty__label">Index — 00 entries</p>
      <h2 className="display gang-empty__title">
        The archive is <em>being written</em>.
      </h2>
      <p className="lede">
        Gang profiles are published only after administration confirms the first recognised gangs. Until then, this
        page stays empty rather than inventing names or histories.
      </p>
      <ButtonLink to="/apply">Apply to join the community</ButtonLink>
    </div>
  );
}

export default function GangDirectory({ entries, isPreview, selectedId, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);
  const activeId = hoveredId ?? selectedId;

  const scope = useScene(
    ({ root, reduced }) => {
      if (!reduced) revealOnScroll(root, { y: 24, stagger: 0.06 });
    },
    [entries.length],
  );

  if (entries.length === 0) {
    return (
      <section className="gang-directory section theme-light" aria-label="Gang directory">
        <div className="container">
          <EmptyArchive />
        </div>
      </section>
    );
  }

  return (
    <section ref={scope} className="gang-directory section theme-light" aria-labelledby="directory-title">
      <div className="container">
        <div className="gang-directory__head" data-reveal>
          <h2 id="directory-title" className="caps">
            Index — {String(entries.length).padStart(2, '0')} entries
          </h2>
          <p className="muted">Select an entry to open its profile.</p>
        </div>

        {isPreview && (
          <div className="gang-directory__notice" data-reveal>
            <Notice title="Development preview">
              These entries are layout placeholders, not real gangs. No official gang information has been published
              yet. Production builds show an empty archive until real entries are added.
            </Notice>
          </div>
        )}

        <div className="gang-directory__layout">
          <ol role="list" className="gang-list" data-reveal-group onMouseLeave={() => setHoveredId(null)}>
            {entries.map((gang, index) => (
              <li key={gang.id} data-reveal>
                <button
                  type="button"
                  className={`gang-row${gang.id === selectedId ? ' is-selected' : ''}`}
                  aria-pressed={gang.id === selectedId}
                  aria-controls="dossier"
                  onClick={() => onSelect(gang.id)}
                  onMouseEnter={() => setHoveredId(gang.id)}
                  onFocus={() => setHoveredId(gang.id)}
                  onBlur={() => setHoveredId(null)}
                >
                  <span className="gang-row__num caps">{String(index + 1).padStart(2, '0')}</span>
                  <span className="gang-row__thumb" aria-hidden="true">
                    <GangArt gang={gang} />
                  </span>
                  <span className="gang-row__name display">{gang.name}</span>
                  <span className="gang-row__meta">
                    {gang.isPreview ? <span className="gang-row__tag caps">Preview</span> : gang.tagline}
                  </span>
                  <span className="gang-row__open caps" aria-hidden="true">
                    Open
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="gang-preview" aria-hidden="true">
            <div className="gang-preview__frame">
              {entries.map((gang, index) => (
                <div key={gang.id} className={`gang-preview__item${gang.id === activeId ? ' is-active' : ''}`}>
                  <GangArt gang={gang} focus={['left', 'center', 'right'][index % 3]} />
                  <span className="gang-preview__numeral display">{numeral(index)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
