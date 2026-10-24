import { StatusPill } from '../../components/ui/Status.jsx';
import { revealOnScroll, useScene } from '../../animation/useScene.js';

export default function GangRecords({ gang }) {
  const scope = useScene(({ root, reduced }) => {
    if (!reduced) revealOnScroll(root);
  });
  const history = gang?.history ?? [];

  return (
    <section ref={scope} id="records" className="gang-records section theme-light" aria-labelledby="records-title">
      <div className="container">
        <div className="gang-records__head" data-reveal-group>
          <p className="eyebrow" data-reveal>
            History & records
          </p>
          <h2 id="records-title" className="heading" data-reveal>
            What is written here <em>stays written</em>.
          </h2>
          <p className="lede" data-reveal>
            War records and notable history are added only from verified records by authorised administrators. Nothing
            is shown until it has been confirmed.
          </p>
        </div>

        <div className="gang-records__grid" data-reveal-group>
          <article className="record-card" data-reveal>
            <header className="record-card__head">
              <h3 className="record-card__title display">War record</h3>
              <StatusPill tone="pending">Archive in preparation</StatusPill>
            </header>
            <div className="ledger ledger--light" role="table" aria-label="War record">
              <div className="ledger__row ledger__row--head caps" role="row">
                <span role="columnheader">Date</span>
                <span role="columnheader">Opponent</span>
                <span role="columnheader">Outcome</span>
              </div>
              <div className="ledger__row ledger__row--empty" role="row">
                <span role="cell">—</span>
                <span role="cell">No wars recorded</span>
                <span role="cell">—</span>
              </div>
            </div>
            <p className="muted record-card__note">
              Each war will open a full record with participants, dates, the recorded outcome and the kill list.
            </p>
          </article>

          <article className="record-card" data-reveal>
            <header className="record-card__head">
              <h3 className="record-card__title display">Notable history</h3>
              <StatusPill tone="pending">{history.length ? `${history.length} entries` : 'No entries'}</StatusPill>
            </header>
            {history.length > 0 ? (
              <ol role="list" className="timeline">
                {history.map((event) => (
                  <li key={`${event.date}-${event.title}`}>
                    <time className="caps" dateTime={event.date}>
                      {event.date}
                    </time>
                    <span>{event.title}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ol role="list" className="timeline timeline--empty" aria-label="No history recorded">
                <li>
                  <span className="caps">—</span>
                  <span>The first chapter begins at launch.</span>
                </li>
              </ol>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
