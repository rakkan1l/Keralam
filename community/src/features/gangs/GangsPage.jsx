import { useState } from 'react';
import { usePageMeta } from '../../components/layout/usePageMeta.js';
import ButtonLink from '../../components/ui/ButtonLink.jsx';
import { gangs, previewGangs } from '../../data/gangs.js';
import { showGangPreview } from '../../config/site.js';
import GangsOpening from './GangsOpening.jsx';
import GangDirectory from './GangDirectory.jsx';
import GangDossier from './GangDossier.jsx';
import GangRecords from './GangRecords.jsx';
import './gangs.css';

// Official entries always win; placeholders only appear when there are none and the preview flag is on.
const isPreview = gangs.length === 0 && showGangPreview;
const entries = gangs.length > 0 ? gangs : isPreview ? previewGangs : [];

export default function GangsPage() {
  usePageMeta('Gangs', 'The gang archive — recognised gangs, their identity, history and war records.');
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? null);
  const selected = entries.find((gang) => gang.id === selectedId);

  const select = (id) => {
    setSelectedId(id);
    const target = document.getElementById('dossier');
    if (!target) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <>
      <GangsOpening count={gangs.length} isPreview={isPreview} />
      <GangDirectory entries={entries} isPreview={isPreview} selectedId={selectedId} onSelect={select} />
      {entries.length > 0 && <GangDossier entries={entries} selectedId={selectedId} onSelect={setSelectedId} />}
      <GangRecords gang={selected} />
      <section className="gangs-cta theme-dark section grain" aria-labelledby="gangs-cta-title">
        <div className="container gangs-cta__inner">
          <h2 id="gangs-cta-title" className="display gangs-cta__title">
            Every story starts <em>with a resident</em>.
          </h2>
          <ButtonLink to="/apply" size="lg">
            Apply Now
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
