import { useTranslation } from 'react-i18next';
import { BadgeCheck, Info, TriangleAlert, Check, X, Minus } from 'lucide-react';
import { cx, formatDate } from '../../utils/format';

/** A titled content block within a detail page (no box — separated by rhythm and a hairline). */
export function InfoBlock({ title, children, aside, className = '' }) {
  return (
    <section className={cx('border-t border-line pt-8', className)}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="h3 text-lg">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * Key facts strip. Each item: { label, value, verified }. Missing values render as
 * "Not available" in muted italics so they're clearly distinct from verified facts.
 */
export function KeyFacts({ items }) {
  const { t } = useTranslation();
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
      {items.map(({ label, value, verified, hint }) => (
        <div key={label}>
          <dt className="caption mb-1">{label}</dt>
          <dd className={cx('text-[15px]', value ? 'font-medium text-ink' : 'text-muted italic')}>
            {value || hint || t('common.notAvailable')}
            {value && verified === false && <span className="mt-0.5 block text-xs font-normal text-muted not-italic">{t('common.unverified')}</span>}
            {value && verified === true && (
              <span className="mt-0.5 flex items-center gap-1 text-xs font-normal text-forest-600">
                <BadgeCheck className="size-3.5" aria-hidden />
                {t('common.verified')}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const TRI_ICON = { yes: Check, no: X, partial: Minus };

/**
 * Shows only the tri-state facts that are actually known; everything unknown is
 * summarised in one line rather than listed as rows of "Unknown".
 * `risk` flips the colour logic so that "yes" reads as a warning (e.g. strong currents).
 */
export function KnownFacts({ data = {}, keys, labelFor, risk = false, emptyText, footer }) {
  const { t } = useTranslation();
  const known = keys.filter((k) => ['yes', 'no', 'partial'].includes(data[k]));
  const unknownCount = keys.length - known.length;
  return (
    <div>
      {known.length > 0 ? (
        <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {known.map((k) => {
            const v = data[k];
            const Icon = TRI_ICON[v];
            const warn = risk ? v === 'yes' : v === 'no';
            return (
              <li key={k} className="flex items-center gap-2.5 text-[15px]">
                <span className={cx('grid size-6 shrink-0 place-items-center rounded-full', warn ? 'bg-laterite-50 text-laterite-600' : v === 'partial' ? 'bg-turmeric-100 text-turmeric-600' : 'bg-forest-50 text-forest-700')}>
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span>
                  {labelFor(k)}
                  <span className="sr-only">: {t(`tri.${v}`)}</span>
                  {v === 'partial' && <span className="text-muted"> — {t('tri.partial').toLowerCase()}</span>}
                  {v === 'no' && !risk && <span className="text-muted"> — {t('tri.no').toLowerCase()}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {unknownCount > 0 && (
        <p className={cx('flex items-start gap-2 text-sm text-muted', known.length > 0 && 'mt-4')}>
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {known.length ? t('common.moreUnverified', { count: unknownCount }) : emptyText}
        </p>
      )}
      {footer}
    </div>
  );
}

const SAFETY_KEYS = ['swimmingRestricted', 'strongCurrents', 'slipperyTerrain', 'wildlifeRisk', 'restrictedAreas', 'nightAccessRestricted', 'monsoonClosure'];
const ACCESS_KEYS = ['wheelchair', 'elderlyFriendly', 'strollerFriendly', 'accessibleToilets', 'lift', 'stairsOrSlopes'];

export function SafetyPanel({ safety = {}, notices = [] }) {
  const { t, i18n } = useTranslation();
  return (
    <InfoBlock
      title={t('place.safety')}
      aside={safety.verified ? <span className="flex items-center gap-1 text-xs text-forest-600"><BadgeCheck className="size-3.5" aria-hidden />{t('common.verified')}{safety.lastReviewedAt ? ` · ${formatDate(safety.lastReviewedAt, i18n.language)}` : ''}</span> : null}
    >
      {notices.length > 0 && <NoticeList notices={notices} />}
      <KnownFacts data={safety} keys={SAFETY_KEYS} labelFor={(k) => t(`place.${k}`)} risk emptyText={t('place.safetyUnverified')} />
      {safety.notes && <p className="mt-4 text-[15px] text-ink-soft">{safety.notes}</p>}
    </InfoBlock>
  );
}

export function AccessibilityPanel({ accessibility = {} }) {
  const { t } = useTranslation();
  const distances = [
    accessibility.parkingDistanceM != null && `${t('place.parkingDistance')}: ${accessibility.parkingDistanceM} m`,
    accessibility.walkingDistanceM != null && `${t('place.walkingDistance')}: ${accessibility.walkingDistanceM} m`,
  ].filter(Boolean);
  return (
    <InfoBlock
      title={t('place.accessibility')}
      aside={accessibility.confirmed ? <span className="flex items-center gap-1 text-xs text-forest-600"><BadgeCheck className="size-3.5" aria-hidden />{t('common.verified')}</span> : null}
    >
      <KnownFacts
        data={accessibility}
        keys={ACCESS_KEYS}
        labelFor={(k) => t(`place.${k}`)}
        emptyText={t('place.unconfirmedAccessibility')}
        footer={distances.length > 0 && <p className="mt-3 text-sm text-ink-soft">{distances.join(' · ')}</p>}
      />
      {accessibility.notes && <p className="mt-3 text-[15px] text-ink-soft">{accessibility.notes}</p>}
    </InfoBlock>
  );
}

export function NoticeList({ notices }) {
  const { t, i18n } = useTranslation();
  const strong = (s) => ['danger', 'warning'].includes(s);
  return (
    <ul className="mb-5 space-y-3" aria-label={t('place.officialNotices')}>
      {notices.map((n) => (
        <li key={n._id} className={cx('rounded-xl border-l-[3px] px-4 py-3 text-sm', strong(n.severity) ? 'border-laterite-500 bg-laterite-50' : 'border-turmeric-400 bg-turmeric-100/60')}>
          <p className="flex items-center gap-1.5 font-semibold text-ink">
            <TriangleAlert className="size-4 text-laterite-600" aria-hidden /> {i18n.language === 'ml' && n.titleMl && n.mlReviewed ? n.titleMl : n.title}
          </p>
          <p className="mt-1 text-ink-soft">{i18n.language === 'ml' && n.messageMl && n.mlReviewed ? n.messageMl : n.message}</p>
          <p className="mt-1.5 text-xs text-muted">
            {t('common.source')}: {n.sourceUrl ? <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{n.source}</a> : n.source} · {t('common.lastUpdated', { date: formatDate(n.updatedAt, i18n.language) })}
          </p>
        </li>
      ))}
    </ul>
  );
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function hasHours(hours) {
  return Boolean(hours && (hours.open24h || DAYS.some((d) => Array.isArray(hours[d]) && hours[d].length)));
}

export function OpeningHours({ hours }) {
  const { t } = useTranslation();
  if (!hasHours(hours)) return <p className="text-sm text-muted italic">{t('place.noHours')}</p>;
  if (hours.open24h) return <p className="text-[15px] font-medium">{t('place.open24')}</p>;
  return (
    <div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[15px]">
        {DAYS.map((d) => (
          <div key={d} className="contents">
            <dt className="text-muted">{t(`place.days.${d}`)}</dt>
            <dd>{!Array.isArray(hours[d]) ? <span className="text-muted italic">{t('common.unknown')}</span> : hours[d].length ? hours[d].join(', ') : t('place.closed')}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted">{hours.verified ? t('common.verified') : t('common.unverified')}{hours.notes ? ` · ${hours.notes}` : ''}</p>
    </div>
  );
}

/** Simple label/value row for sidebars. */
export function ValueRow({ label, value, unknown }) {
  const { t } = useTranslation();
  const missing = value == null || value === '' || value === 'unknown';
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-[15px]">
      <dt className="text-muted">{label}</dt>
      <dd className={cx('text-right', missing ? 'text-muted italic' : 'font-medium text-ink')}>{missing ? unknown || t('common.notAvailable') : value}</dd>
    </div>
  );
}

/** Kept for compatibility with pages that list a single tri-state fact. */
export function TriRow({ label, value = 'unknown' }) {
  const { t } = useTranslation();
  return <ValueRow label={label} value={value !== 'unknown' ? t(`tri.${value}`) : null} />;
}

/** Light container for sidebar content. */
export function Panel({ title, icon: Icon, children, footer }) {
  return (
    <section className="rounded-[var(--radius-panel)] bg-white p-6">
      {title && (
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
          {Icon && <Icon className="size-4 text-forest-600" aria-hidden />}
          {title}
        </h2>
      )}
      {children}
      {footer && <p className="mt-4 border-t border-line pt-3 text-xs text-muted">{footer}</p>}
    </section>
  );
}
