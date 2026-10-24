import { usePageMeta } from '../../components/layout/usePageMeta.js';
import PageHero from '../../components/ui/PageHero.jsx';
import { Notice, StatusPill } from '../../components/ui/Status.jsx';
import { staffDirectory, statusIntegration } from '../../data/staff.js';
import { revealOnScroll, useScene } from '../../animation/useScene.js';
import './admin.css';

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function StaffCard({ member }) {
  return (
    <li className="staff-card" data-reveal>
      <div className="staff-card__portrait">
        {member.portrait ? (
          <img src={member.portrait} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="display">{initials(member.name)}</span>
        )}
      </div>
      <div className="staff-card__body">
        <h3 className="staff-card__name display">{member.name}</h3>
        <p className="caps staff-card__role">{member.role}</p>
        {/* Live status only renders once a real integration supplies it. */}
        {statusIntegration.connected && member.status ? (
          <StatusPill tone={member.status.online ? 'positive' : 'neutral'}>
            {member.status.onDuty ? 'On duty' : member.status.online ? 'Online' : 'Offline'}
          </StatusPill>
        ) : (
          <StatusPill tone="pending">Status unavailable</StatusPill>
        )}
      </div>
    </li>
  );
}

function EmptyRoster() {
  return (
    <div className="roster-empty">
      <ul role="list" className="roster-empty__ghosts" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <li key={i}>
            <span className="roster-empty__portrait" />
            <span className="roster-empty__line" />
            <span className="roster-empty__line roster-empty__line--short" />
          </li>
        ))}
      </ul>
      <div className="roster-empty__message">
        <p className="caps roster-empty__label">Roster — not yet published</p>
        <h2 className="heading">
          The team will be <em>introduced before launch</em>.
        </h2>
        <p className="lede">
          Staff names, portraits and roles appear here once administration approves the roster. No placeholder people
          are shown in the meantime.
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  usePageMeta('Administration', 'The administration team — staff names, roles and, once connected, live duty status.');
  const scope = useScene(({ root, reduced }) => {
    if (!reduced) revealOnScroll(root);
  });
  const { members } = staffDirectory;
  const lastUpdated = statusIntegration.lastUpdated
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(statusIntegration.lastUpdated))
    : null;

  return (
    <>
      <PageHero
        index="Chapter 01"
        eyebrow="Administration"
        title={
          <>
            The people who <em>keep it fair</em>.
          </>
        }
        lede="A visible staff team with clear responsibilities. This directory lists who is who — and, once the server integration is connected, who is on duty right now."
        seed={13}
      />

      <section ref={scope} className="admin-directory section theme-light" aria-labelledby="directory-heading">
        <div className="container">
          <div className="admin-directory__bar" data-reveal>
            <h2 id="directory-heading" className="caps">
              Directory — {String(members.length).padStart(2, '0')} staff
            </h2>
            <dl className="admin-directory__meta">
              <div>
                <dt className="caps">Live status</dt>
                <dd>
                  <StatusPill tone={statusIntegration.connected ? 'positive' : 'pending'}>
                    {statusIntegration.connected ? 'Connected' : 'Not connected'}
                  </StatusPill>
                </dd>
              </div>
              <div>
                <dt className="caps">Last updated</dt>
                <dd>{lastUpdated ?? '—'}</dd>
              </div>
            </dl>
          </div>

          {!statusIntegration.connected && (
            <div className="admin-directory__notice" data-reveal>
              <Notice title="Live duty status is not connected yet">
                Online and on-duty states will only be shown when they come from the game server integration. Until
                then every entry reads “Status unavailable” rather than guessing.
              </Notice>
            </div>
          )}

          {members.length > 0 ? (
            <ul role="list" className="staff-grid" data-reveal-group>
              {members.map((member) => (
                <StaffCard key={member.id} member={member} />
              ))}
            </ul>
          ) : (
            <EmptyRoster />
          )}
        </div>
      </section>
    </>
  );
}
