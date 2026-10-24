import { factLabels } from '../../data/gangs.js';
import GangArt, { Emblem } from './GangArt.jsx';
import { numeral } from './GangDirectory.jsx';

export default function GangDossier({ entries, selectedId, onSelect }) {
  const index = Math.max(0, entries.findIndex((gang) => gang.id === selectedId));
  const gang = entries[index];
  if (!gang) return null;

  const facts = factLabels.map((label) => ({
    label,
    value: gang.facts.find((fact) => fact.label === label)?.value ?? null,
  }));
  const prev = entries[(index - 1 + entries.length) % entries.length];
  const next = entries[(index + 1) % entries.length];

  return (
    <section id="dossier" className="dossier theme-dark section" aria-labelledby="dossier-title" aria-live="polite">
      <div className="container dossier__grid" key={gang.id}>
        <div className="dossier__visual">
          <GangArt gang={gang} focus="left" className="dossier__art" />
          <div className="dossier__emblem">
            <Emblem gang={gang} numeral={numeral(index)} />
            <span className="caps">{gang.emblem ? 'Emblem' : 'Emblem not yet supplied'}</span>
          </div>
        </div>

        <div className="dossier__body">
          <p className="eyebrow">
            Profile {String(index + 1).padStart(2, '0')} / {String(entries.length).padStart(2, '0')}
          </p>
          <h2 id="dossier-title" className="display dossier__name">
            {gang.name}
          </h2>
          {gang.isPreview && <p className="dossier__flag caps">Development preview — not a real gang</p>}
          <p className="lede dossier__desc">{gang.description}</p>

          <dl className="dossier__facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="caps">{fact.label}</dt>
                <dd className={fact.value ? '' : 'is-empty'}>{fact.value ?? 'Not yet recorded'}</dd>
              </div>
            ))}
          </dl>

          <div className="dossier__nav">
            <button type="button" className="text-link" onClick={() => onSelect(prev.id)}>
              ← {prev.name}
            </button>
            <button type="button" className="text-link" onClick={() => onSelect(next.id)}>
              {next.name} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
