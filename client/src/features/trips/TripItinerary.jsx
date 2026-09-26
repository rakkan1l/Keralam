import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Utensils, BedDouble, ArrowUp, ArrowDown, Trash2, TriangleAlert, CloudRain, Info, Car } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import LazyMap from '../../components/map/LazyMap';
import { formatDuration, inr, districtName, formatDate, cx } from '../../utils/format';

const KIND_ICON = { place: MapPin, meal: Utensils, stay: BedDouble };
const CONF_TONE = { verified: 'green', estimated: 'amber', unavailable: 'neutral' };

function hrefFor(item) {
  if (!item.slug) return null;
  if (item.targetType === 'place') return `/places/${item.slug}`;
  if (item.targetType === 'business') return `/listings/${item.slug}`;
  if (item.targetType === 'stay') return `/stays/${item.slug}`;
  return null;
}

/** Day-by-day itinerary. With `onChange`, items can be reordered or removed. */
export default function TripItinerary({ trip, onChange }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const s = trip.summary || {};

  const mutateDay = (dayIdx, fn) => {
    const days = trip.days.map((d, i) => (i === dayIdx ? { ...d, items: fn([...d.items]) } : d));
    onChange({ ...trip, days });
  };
  const move = (dayIdx, idx, dir) =>
    mutateDay(dayIdx, (items) => {
      const j = idx + dir;
      if (j < 0 || j >= items.length) return items;
      [items[idx], items[j]] = [items[j], items[idx]];
      return items;
    });
  const remove = (dayIdx, idx) => mutateDay(dayIdx, (items) => items.filter((_, i) => i !== idx));

  const markers = trip.days.flatMap((d) =>
    d.items
      .filter((i) => i.coordinates?.length === 2)
      .map((i, k) => ({ id: `${d.day}-${k}-${i.title}`, lng: i.coordinates[0], lat: i.coordinates[1], title: i.title, subtitle: t('trip.day', { n: d.day }), href: hrefFor(i), kind: i.kind === 'meal' ? 'business' : i.kind === 'stay' ? 'stay' : 'place' })),
  );
  const line = markers.map((m) => [m.lat, m.lng]);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
      <div className="min-w-0 space-y-12">
        {trip.days.map((day, dayIdx) => (
          <section key={day.day} aria-labelledby={`day-${day.day}`}>
            <header className="mb-5 flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 id={`day-${day.day}`} className="h2">{t('trip.day', { n: day.day })}</h2>
              {day.date && <span className="text-sm text-muted">{formatDate(day.date, lang, { weekday: 'long', day: 'numeric', month: 'short' })}</span>}
            </header>
            <ol className="relative ml-2 space-y-5 border-l border-line pl-7">
              {day.items.map((item, idx) => {
                const Icon = KIND_ICON[item.kind] || MapPin;
                const href = hrefFor(item);
                return (
                  <li key={item._id || `${item.title}-${idx}`} className="relative">
                    <span className={cx('absolute top-0.5 -left-[41px] grid size-7 place-items-center rounded-full ring-4 ring-sand-100', item.kind === 'place' ? 'bg-forest-800 text-white' : 'bg-white text-forest-700 border border-line')}>
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    {item.travelFromPrevious?.distanceKm > 0.5 && (
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted">
                        <Car className="size-3.5" aria-hidden /> {item.travelFromPrevious.distanceKm} km · {formatDuration(item.travelFromPrevious.durationMin)} · {t('common.estimated').toLowerCase()}
                      </p>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-forest-700 tabular-nums">
                          {item.startTime}
                          {item.durationMin ? <span className="font-normal text-muted"> · {formatDuration(item.durationMin)}</span> : ''}
                        </p>
                        <h3 className="mt-0.5 text-[16px] font-semibold">{href ? <Link to={href} className="hover:underline">{item.title}</Link> : item.title}</h3>
                        {item.district && <p className="text-[13px] text-muted">{districtName(item.district, lang)}</p>}
                        {item.notes?.filter(Boolean).map((n) => <p key={n} className="mt-1 text-sm text-ink-soft">{n}</p>)}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.costEstimate && (
                            <Badge tone={CONF_TONE[item.costEstimate.confidence]}>
                              {item.costEstimate.amount != null ? `${inr(item.costEstimate.amount)} · ` : ''}
                              {t(`trip.confidence.${item.costEstimate.confidence || 'unavailable'}`)}
                            </Badge>
                          )}
                          {item.kind === 'place' && item.openingHoursStatus === 'conflict' && <Badge tone="red">{t('trip.openingConflict')}</Badge>}
                          {item.kind === 'place' && item.openingHoursStatus === 'unknown' && <Badge tone="outline">{t('trip.hoursUnknown')}</Badge>}
                        </div>
                        {item.warnings?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {item.warnings.map((w) => <li key={w} className="flex gap-1.5 text-xs text-laterite-700"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />{w}</li>)}
                          </ul>
                        )}
                      </div>
                      {onChange && (
                        <div className="flex shrink-0 gap-0.5">
                          <button type="button" onClick={() => move(dayIdx, idx, -1)} disabled={idx === 0} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sand-200 hover:text-ink disabled:opacity-30" aria-label={`${t('trip.moveUp')}: ${item.title}`}><ArrowUp className="size-4" /></button>
                          <button type="button" onClick={() => move(dayIdx, idx, 1)} disabled={idx === day.items.length - 1} className="grid size-9 place-items-center rounded-full text-muted hover:bg-sand-200 hover:text-ink disabled:opacity-30" aria-label={`${t('trip.moveDown')}: ${item.title}`}><ArrowDown className="size-4" /></button>
                          <button type="button" onClick={() => remove(dayIdx, idx)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-laterite-50 hover:text-laterite-600" aria-label={`${t('trip.remove')}: ${item.title}`}><Trash2 className="size-4" /></button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
              {!day.items.length && <li className="text-sm text-muted">—</li>}
            </ol>
          </section>
        ))}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <LazyMap className="h-64" markers={markers} route={line} />
        <div className="panel p-6">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="caption">{t('trip.totalDistance')}</p><p className="font-display text-2xl">{s.totalDistanceKm ?? '—'}<span className="ml-1 text-sm text-muted">km</span></p></div>
            <div><p className="caption">{t('trip.travelTime')}</p><p className="font-display text-2xl">{formatDuration(s.totalTravelMin) || '—'}</p></div>
          </div>
          {s.estimatedCost && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="caption">{t('trip.estimatedCost')}</p>
              <p className="font-display text-2xl">{inr(s.estimatedCost.min)}</p>
              <p className="mt-1 text-xs text-muted">{s.estimatedCost.note}</p>
            </div>
          )}
          {s.unknownCosts?.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-medium">{t('trip.unknownCosts')} ({s.unknownCosts.length})</summary>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted">{s.unknownCosts.map((c) => <li key={c}>{c}</li>)}</ul>
            </details>
          )}
        </div>
        {s.weatherAlternatives?.length > 0 && (
          <div className="border-t border-line pt-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CloudRain className="size-4 text-lagoon-500" aria-hidden />{t('trip.weatherAlternatives')}</h3>
            <ul className="space-y-1.5 text-sm">
              {s.weatherAlternatives.map((w) => <li key={w.forItem}>{w.forItem} → <Link to={`/places/${w.slug}`} className="link">{w.alternative}</Link></li>)}
            </ul>
          </div>
        )}
        {s.warnings?.length > 0 && (
          <div className="border-t border-line pt-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><TriangleAlert className="size-4 text-turmeric-600" aria-hidden />{t('trip.warnings')}</h3>
            <ul className="space-y-1 text-sm text-ink-soft">{s.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
        )}
        {s.seasonalNotes?.length > 0 && (
          <div className="border-t border-line pt-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Info className="size-4 text-lagoon-500" aria-hidden />{t('trip.seasonalNotes')}</h3>
            <ul className="space-y-1 text-sm text-ink-soft">{s.seasonalNotes.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
        )}
        {trip.disclaimer && <p className="text-xs text-muted">{trip.disclaimer}</p>}
      </aside>
    </div>
  );
}

/** Strip server-computed fields that the save endpoint doesn't accept. */
export function toSavePayload(trip) {
  return {
    title: trip.title,
    inputs: trip.inputs,
    summary: trip.summary,
    generator: trip.generator,
    days: trip.days.map((d) => ({
      day: d.day,
      date: d.date,
      title: d.title,
      stay: d.stay?.title ? { targetId: d.stay.targetId, title: d.stay.title, slug: d.stay.slug } : undefined,
      items: d.items.map((i) => ({
        kind: i.kind,
        targetType: i.targetType,
        targetId: i.targetId,
        title: i.title,
        slug: i.slug,
        district: i.district,
        coordinates: i.coordinates?.length === 2 ? i.coordinates : undefined,
        startTime: i.startTime,
        durationMin: i.durationMin,
        notes: i.notes?.filter(Boolean),
      })),
    })),
  };
}
