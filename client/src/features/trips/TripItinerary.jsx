import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Utensils, BedDouble, ArrowUp, ArrowDown, Trash2, TriangleAlert, CloudRain, Info, Car, Clock } from 'lucide-react';
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
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {trip.days.map((day, dayIdx) => (
          <section key={day.day} className="card p-5" aria-labelledby={`day-${day.day}`}>
            <header className="mb-4 flex items-baseline justify-between">
              <h3 id={`day-${day.day}`} className="text-xl">{t('trip.day', { n: day.day })}</h3>
              {day.date && <span className="text-sm text-muted">{formatDate(day.date, lang, { weekday: 'long', day: 'numeric', month: 'short' })}</span>}
            </header>
            <ol className="relative space-y-3 border-l-2 border-forest-100 pl-5">
              {day.items.map((item, idx) => {
                const Icon = KIND_ICON[item.kind] || MapPin;
                const href = hrefFor(item);
                return (
                  <li key={item._id || `${item.title}-${idx}`} className="relative">
                    <span className="absolute -left-[31px] top-1 grid size-5 place-items-center rounded-full bg-forest-700 text-white ring-4 ring-white">
                      <Icon className="size-3" aria-hidden />
                    </span>
                    {item.travelFromPrevious?.distanceKm > 0.5 && (
                      <p className="mb-1 flex items-center gap-1 text-xs text-muted">
                        <Car className="size-3.5" aria-hidden /> {item.travelFromPrevious.distanceKm} km · {formatDuration(item.travelFromPrevious.durationMin)} ({t('common.estimated').toLowerCase()})
                      </p>
                    )}
                    <div className="rounded-2xl bg-sand-50 p-3 ring-1 ring-sand-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-xs font-semibold text-forest-700">
                            <Clock className="size-3.5" aria-hidden /> {item.startTime}
                            {item.durationMin ? ` · ${formatDuration(item.durationMin)}` : ''}
                          </p>
                          <p className="mt-0.5 font-medium">{href ? <Link to={href} className="hover:underline">{item.title}</Link> : item.title}</p>
                          {item.district && <p className="text-xs text-muted">{districtName(item.district, lang)}</p>}
                        </div>
                        {onChange && (
                          <div className="flex shrink-0 gap-0.5">
                            <button type="button" onClick={() => move(dayIdx, idx, -1)} className="rounded-full p-1.5 hover:bg-white" aria-label={t('trip.moveUp')}><ArrowUp className="size-4" /></button>
                            <button type="button" onClick={() => move(dayIdx, idx, 1)} className="rounded-full p-1.5 hover:bg-white" aria-label={t('trip.moveDown')}><ArrowDown className="size-4" /></button>
                            <button type="button" onClick={() => remove(dayIdx, idx)} className="rounded-full p-1.5 hover:bg-white" aria-label={t('trip.remove')}><Trash2 className="size-4 text-laterite-600" /></button>
                          </div>
                        )}
                      </div>
                      {item.notes?.filter(Boolean).map((n) => <p key={n} className="mt-1 text-sm text-forest-900">{n}</p>)}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.costEstimate && (
                          <Badge tone={CONF_TONE[item.costEstimate.confidence]}>
                            {item.costEstimate.amount != null ? `${inr(item.costEstimate.amount)} · ` : ''}
                            {t(`trip.confidence.${item.costEstimate.confidence || 'unavailable'}`)}
                          </Badge>
                        )}
                        {item.kind === 'place' && item.openingHoursStatus === 'conflict' && <Badge tone="red">{t('trip.openingConflict')}</Badge>}
                        {item.kind === 'place' && item.openingHoursStatus === 'unknown' && <Badge>{t('trip.hoursUnknown')}</Badge>}
                      </div>
                      {item.costEstimate?.note && <p className="mt-1 text-xs text-muted">{item.costEstimate.note}</p>}
                      {item.warnings?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {item.warnings.map((w) => (
                            <li key={w} className="flex gap-1.5 text-xs text-laterite-700"><TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />{w}</li>
                          ))}
                        </ul>
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

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <LazyMap className="h-72" markers={markers} route={line} />
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-forest-50 p-3">
              <p className="text-xs text-muted">{t('trip.totalDistance')}</p>
              <p className="text-lg font-semibold">{s.totalDistanceKm ?? '—'} km</p>
            </div>
            <div className="rounded-xl bg-forest-50 p-3">
              <p className="text-xs text-muted">{t('trip.travelTime')}</p>
              <p className="text-lg font-semibold">{formatDuration(s.totalTravelMin)}</p>
            </div>
          </div>
          {s.estimatedCost && (
            <div className="mt-4">
              <p className="text-sm font-semibold">{t('trip.estimatedCost')}: {inr(s.estimatedCost.min)}</p>
              <p className="mt-1 text-xs text-muted">{s.estimatedCost.note}</p>
            </div>
          )}
          {s.unknownCosts?.length > 0 && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-medium">{t('trip.unknownCosts')} ({s.unknownCosts.length})</summary>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-muted">{s.unknownCosts.map((c) => <li key={c}>{c}</li>)}</ul>
            </details>
          )}
        </div>
        {s.weatherAlternatives?.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold"><CloudRain className="size-4 text-lagoon-500" aria-hidden />{t('trip.weatherAlternatives')}</h3>
            <ul className="space-y-1.5 text-sm">
              {s.weatherAlternatives.map((w) => (
                <li key={w.forItem}>{w.forItem} → <Link to={`/places/${w.slug}`} className="font-medium text-forest-700 hover:underline">{w.alternative}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {(s.warnings?.length > 0 || s.seasonalNotes?.length > 0) && (
          <div className="card p-5">
            {s.warnings?.length > 0 && (
              <>
                <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold"><TriangleAlert className="size-4 text-turmeric-600" aria-hidden />{t('trip.warnings')}</h3>
                <ul className="mb-3 space-y-1 text-sm">{s.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
              </>
            )}
            {s.seasonalNotes?.length > 0 && (
              <>
                <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold"><Info className="size-4 text-lagoon-500" aria-hidden />{t('trip.seasonalNotes')}</h3>
                <ul className="space-y-1 text-sm">{s.seasonalNotes.map((w) => <li key={w}>{w}</li>)}</ul>
              </>
            )}
          </div>
        )}
        {trip.disclaimer && <p className={cx('text-xs text-muted')}>{trip.disclaimer}</p>}
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
