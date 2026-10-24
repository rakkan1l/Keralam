import ButtonLink from '../../components/ui/ButtonLink.jsx';
import { StatusPill } from '../../components/ui/Status.jsx';
import { applications, applyLink, launch } from '../../config/site.js';
import { revealOnScroll, useScene } from '../../animation/useScene.js';
import { prelaunch } from './content.js';

function formatLaunch(date) {
  if (!date) return 'To be announced';
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(date));
}

export default function Prelaunch() {
  const scope = useScene(({ root, reduced }) => {
    if (!reduced) revealOnScroll(root);
  });

  return (
    <section ref={scope} className="prelaunch section theme-light" aria-labelledby="prelaunch-title">
      <div className="container prelaunch__grid" data-reveal-group>
        <div>
          <p className="chapter__label" data-reveal>
            <span className="chapter__index display">05</span>
            <span className="caps">{prelaunch.eyebrow}</span>
          </p>
          <h2 id="prelaunch-title" className="display prelaunch__title" data-reveal>
            {prelaunch.title[0]}
            <br />
            {prelaunch.title[1]} <em>{prelaunch.title[2]}</em>
          </h2>
        </div>
        <div className="prelaunch__side">
          <p className="lede" data-reveal>
            {prelaunch.body}
          </p>
          <dl className="prelaunch__ledger" data-reveal>
            <div>
              <dt className="caps">Game server</dt>
              <dd>
                <StatusPill tone="pending">{launch.serverLive ? 'Live' : 'Not yet launched'}</StatusPill>
              </dd>
            </div>
            <div>
              <dt className="caps">Launch date</dt>
              <dd>{formatLaunch(launch.launchDate)}</dd>
            </div>
            <div>
              <dt className="caps">Applications</dt>
              <dd>
                <StatusPill tone={applications.acceptingOnline ? 'positive' : 'pending'}>
                  {applications.acceptingOnline ? 'Accepting online' : 'Online form opening soon'}
                </StatusPill>
              </dd>
            </div>
          </dl>
          <div data-reveal>
            <ButtonLink to={applyLink.to} size="lg">
              {applyLink.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
