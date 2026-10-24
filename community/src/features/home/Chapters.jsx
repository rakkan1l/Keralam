import { Link } from 'react-router-dom';
import CityScene from '../../components/art/CityScene.jsx';
import ButtonLink, { Arrow } from '../../components/ui/ButtonLink.jsx';
import { StatusPill } from '../../components/ui/Status.jsx';
import { rulesDocument } from '../../data/rules.js';
import { gsap } from '../../animation/gsap.js';
import { revealOnScroll, useScene } from '../../animation/useScene.js';

function ChapterLabel({ index, children }) {
  return (
    <p className="chapter__label" data-reveal>
      <span className="chapter__index display">{index}</span>
      <span className="caps">{children}</span>
    </p>
  );
}

function AdministrationChapter() {
  return (
    <div className="chapter chapter--admin theme-light section" data-reveal-group>
      <div className="container chapter__split">
        <div className="chapter__copy">
          <ChapterLabel index="01">Administration</ChapterLabel>
          <h3 className="heading" data-reveal>
            The people who <em>keep it fair</em>.
          </h3>
          <p className="lede" data-reveal>
            A visible staff team with clear roles. The directory shows who is responsible for what — and, once the
            server integration is connected, who is on duty.
          </p>
          <Link to="/admin" className="text-link" data-reveal>
            Meet the administration <Arrow />
          </Link>
        </div>
        <figure className="roster" data-reveal aria-label="Administration directory preview">
          <div className="roster__head caps">
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          {[0, 1, 2].map((row) => (
            <div key={row} className="roster__row" aria-hidden="true">
              <span className="roster__portrait" />
              <span className="roster__bar" style={{ width: `${62 - row * 9}%` }} />
              <span className="roster__bar roster__bar--short" />
            </div>
          ))}
          <figcaption className="roster__caption">
            <StatusPill tone="pending">Roster not yet published</StatusPill>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

function GangsChapter() {
  return (
    <div className="chapter chapter--gangs theme-dark grain">
      <div className="chapter__backdrop" data-parallax>
        <CityScene seed={42} variant="dusk" focus="right" layers={false} />
      </div>
      <div className="chapter__shade" aria-hidden="true" />
      <div className="container chapter__gangs-inner" data-reveal-group>
        <ChapterLabel index="02">Gangs</ChapterLabel>
        <h3 className="display chapter__gangs-title" data-reveal>
          The families <br />
          <em>that shape</em> the streets.
        </h3>
        <div className="chapter__gangs-foot" data-reveal>
          <p className="lede">
            An editorial archive of the gangs recognised by administration — their identity, their story and their
            record.
          </p>
          <ButtonLink to="/gangs" variant="ghost">
            Enter the gang archive
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function WarArchiveChapter() {
  return (
    <div className="chapter chapter--wars theme-charcoal section" data-reveal-group>
      <div className="container">
        <div className="chapter__wars-head">
          <div>
            <ChapterLabel index="03">War archive</ChapterLabel>
            <h3 className="heading" data-reveal>
              Conflict, <em>on the record</em>.
            </h3>
          </div>
          <p className="lede" data-reveal>
            Wars between gangs will be documented: dates, participants, recorded outcomes and each war’s kill list,
            from verified records only.
          </p>
        </div>
        <div className="ledger" role="table" aria-label="War archive preview" data-reveal>
          <div className="ledger__row ledger__row--head caps" role="row">
            <span role="columnheader">Date</span>
            <span role="columnheader">Participants</span>
            <span role="columnheader">Outcome</span>
            <span role="columnheader">Record</span>
          </div>
          <div className="ledger__row ledger__row--empty" role="row">
            <span role="cell">—</span>
            <span role="cell">No wars recorded yet</span>
            <span role="cell">—</span>
            <span role="cell">
              <StatusPill tone="pending">In preparation</StatusPill>
            </span>
          </div>
        </div>
        <Link to="/gangs#records" className="text-link chapter__wars-link" data-reveal>
          About war records <Arrow />
        </Link>
      </div>
    </div>
  );
}

function RulesChapter() {
  return (
    <div className="chapter chapter--rules theme-light section" data-reveal-group>
      <div className="container chapter__rules-grid">
        <div className="chapter__copy">
          <ChapterLabel index="04">Rules</ChapterLabel>
          <h3 className="heading" data-reveal>
            Clear rules, <em>published openly</em>.
          </h3>
          <p className="lede" data-reveal>
            Know the standard before you arrive. Every rule is organised by category and easy to find.
          </p>
          <Link to="/rules" className="text-link" data-reveal>
            Read the rules <Arrow />
          </Link>
        </div>
        <ol role="list" className="rules-index">
          {rulesDocument.categories.map((category, index) => (
            <li key={category.id} data-reveal>
              <Link to={`/rules#${category.id}`} className="rules-index__item">
                <span className="caps rules-index__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="rules-index__title">{category.title}</span>
                <Arrow />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default function Chapters() {
  const scope = useScene(({ root, reduced }) => {
    if (reduced) return;
    revealOnScroll(root);
    const backdrop = root.querySelector('[data-parallax]');
    gsap.fromTo(
      backdrop,
      { yPercent: -10, scale: 1.1 },
      {
        yPercent: 10,
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: backdrop.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });

  return (
    <section ref={scope} className="chapters" aria-label="Explore the website">
      <AdministrationChapter />
      <GangsChapter />
      <WarArchiveChapter />
      <RulesChapter />
    </section>
  );
}
