import { useTranslation } from 'react-i18next';
import { Check, X, Minus, CircleHelp, ShieldAlert, Accessibility, BadgeCheck, TriangleAlert } from 'lucide-react';
import { cx, formatDate } from '../../utils/format';

const TRI_STYLE = {
  yes: { icon: Check, cls: 'text-forest-700 bg-forest-50' },
  no: { icon: X, cls: 'text-laterite-700 bg-laterite-50' },
  partial: { icon: Minus, cls: 'text-turmeric-600 bg-turmeric-100' },
  unknown: { icon: CircleHelp, cls: 'text-muted bg-sand-200' },
};

/** A fact row that visually distinguishes confirmed values from unknown ones. */
export function TriRow({ label, value = 'unknown', invert = false }) {
  const { t } = useTranslation();
  // For risks ("strong currents: yes") the "yes" answer is the warning state.
  const style = invert && value === 'yes' ? TRI_STYLE.no : invert && value === 'no' ? TRI_STYLE.yes : TRI_STYLE[value] || TRI_STYLE.unknown;
  const Icon = style.icon;
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <dt className="text-forest-900">{label}</dt>
      <dd className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', style.cls)}>
        <Icon className="size-3.5" aria-hidden />
        {t(`tri.${value}`)}
      </dd>
    </div>
  );
}

export function ValueRow({ label, value, unknown }) {
  const { t } = useTranslation();
  const missing = value == null || value === '' || value === 'unknown';
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <dt className="text-forest-900">{label}</dt>
      <dd className={cx('text-right', missing ? 'italic text-muted' : 'font-medium text-ink')}>{missing ? unknown || t('common.unknown') : value}</dd>
    </div>
  );
}

export function Panel({ title, icon: Icon, children, footer, tone = 'default' }) {
  return (
    <section className={cx('card p-5', tone === 'warn' && 'ring-turmeric-400/40')}>
      <h2 className="mb-2 flex items-center gap-2 font-sans text-base font-semibold">
        {Icon && <Icon className="size-5 text-forest-600" aria-hidden />}
        {title}
      </h2>
      {children}
      {footer && <p className="mt-3 border-t border-sand-200 pt-3 text-xs text-muted">{footer}</p>}
    </section>
  );
}

export function SafetyPanel({ safety = {}, notices = [] }) {
  const { t, i18n } = useTranslation();
  const keys = ['swimmingRestricted', 'strongCurrents', 'slipperyTerrain', 'wildlifeRisk', 'restrictedAreas', 'nightAccessRestricted', 'monsoonClosure'];
  return (
    <Panel
      title={t('place.safety')}
      icon={ShieldAlert}
      footer={safety.verified ? `${t('common.verified')}${safety.lastReviewedAt ? ` · ${formatDate(safety.lastReviewedAt, i18n.language)}` : ''}` : t('place.safetyUnverified')}
    >
      {notices.length > 0 && <NoticeList notices={notices} />}
      <dl className="divide-y divide-sand-200">
        {keys.map((k) => (
          <TriRow key={k} label={t(`place.${k}`)} value={safety[k]} invert />
        ))}
      </dl>
      {safety.notes && <p className="mt-3 rounded-xl bg-sand-100 p-3 text-sm text-forest-900">{safety.notes}</p>}
    </Panel>
  );
}

export function NoticeList({ notices }) {
  const { t, i18n } = useTranslation();
  const tone = { danger: 'bg-laterite-50 ring-laterite-100 text-laterite-700', warning: 'bg-laterite-50 ring-laterite-100 text-laterite-700', caution: 'bg-turmeric-100 ring-turmeric-400/30 text-turmeric-600', info: 'bg-lagoon-50 ring-lagoon-500/20 text-lagoon-700' };
  return (
    <ul className="mb-3 space-y-2" aria-label={t('place.officialNotices')}>
      {notices.map((n) => (
        <li key={n._id} className={cx('rounded-xl p-3 text-sm ring-1', tone[n.severity] || tone.caution)}>
          <p className="flex items-center gap-1.5 font-semibold">
            <TriangleAlert className="size-4" aria-hidden /> {i18n.language === 'ml' && n.titleMl && n.mlReviewed ? n.titleMl : n.title}
          </p>
          <p className="mt-1 text-ink">{i18n.language === 'ml' && n.messageMl && n.mlReviewed ? n.messageMl : n.message}</p>
          <p className="mt-1.5 text-xs text-muted">
            {t('common.source')}: {n.sourceUrl ? <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{n.source}</a> : n.source} · {t('common.lastUpdated', { date: formatDate(n.updatedAt, i18n.language) })}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function AccessibilityPanel({ accessibility = {} }) {
  const { t } = useTranslation();
  const keys = ['wheelchair', 'elderlyFriendly', 'strollerFriendly', 'accessibleToilets', 'lift', 'stairsOrSlopes'];
  return (
    <Panel
      title={t('place.accessibility')}
      icon={Accessibility}
      footer={
        <span className="inline-flex items-center gap-1">
          {accessibility.confirmed && <BadgeCheck className="size-3.5 text-forest-600" aria-hidden />}
          {accessibility.confirmed ? t('place.confirmedAccessibility') : t('place.unconfirmedAccessibility')}
        </span>
      }
    >
      <dl className="divide-y divide-sand-200">
        {keys.map((k) => (
          <TriRow key={k} label={t(`place.${k}`)} value={accessibility[k]} invert={k === 'stairsOrSlopes'} />
        ))}
        <ValueRow label={t('place.parkingDistance')} value={accessibility.parkingDistanceM != null ? `${accessibility.parkingDistanceM} m` : null} />
        <ValueRow label={t('place.walkingDistance')} value={accessibility.walkingDistanceM != null ? `${accessibility.walkingDistanceM} m` : null} />
      </dl>
      {accessibility.notes && <p className="mt-3 text-sm text-forest-900">{accessibility.notes}</p>}
    </Panel>
  );
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function OpeningHours({ hours }) {
  const { t } = useTranslation();
  const hasAny = hours && (hours.open24h || DAYS.some((d) => Array.isArray(hours[d]) && hours[d].length));
  if (!hasAny) return <p className="text-sm italic text-muted">{t('place.noHours')}</p>;
  if (hours.open24h) return <p className="text-sm font-medium">{t('place.open24')}</p>;
  return (
    <div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {DAYS.map((d) => (
          <div key={d} className="contents">
            <dt className="text-muted">{t(`place.days.${d}`)}</dt>
            <dd>{!Array.isArray(hours[d]) ? <span className="italic text-muted">{t('common.unknown')}</span> : hours[d].length ? hours[d].join(', ') : t('place.closed')}</dd>
          </div>
        ))}
      </dl>
      {!hours.verified && <p className="mt-2 text-xs text-muted">{t('common.unverified')}</p>}
      {hours.notes && <p className="mt-2 text-xs text-muted">{hours.notes}</p>}
    </div>
  );
}
