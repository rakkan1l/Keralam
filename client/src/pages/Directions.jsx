import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Route, Plus, Trash2, ExternalLink, Info, ArrowDownUp } from 'lucide-react';
import Seo from '../components/Seo';
import PointInput from '../components/PointInput';
import Button from '../components/ui/Button';
import Chips from '../components/ui/Chips';
import Badge from '../components/ui/Badge';
import { EmptyState, ErrorState } from '../components/ui/States';
import LazyMap from '../components/map/LazyMap';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';
import { ALONG_CATEGORIES } from '../utils/constants';
import { formatDuration, districtName } from '../utils/format';

function parsePoint(v, label) {
  if (!v) return null;
  const [lng, lat] = v.split(',').map(Number);
  return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat, label: label || `${lat.toFixed(3)}, ${lng.toFixed(3)}` } : null;
}

export default function Directions() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [search] = useSearchParams();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(() => parsePoint(search.get('to'), search.get('toLabel')));
  const [stops, setStops] = useState([]);
  const [cats, setCats] = useState(['attractions', 'food', 'fuel', 'viewpoints']);

  const plan = useMutation({
    mutationFn: () => endpoints.planRoute({ from: [from.lng, from.lat], to: [to.lng, to.lat], waypoints: stops.map((s) => [s.lng, s.lat]) }),
    onError: (err) => toast.error(errorMessage(err)),
  });
  const along = useMutation({
    mutationFn: (line) => endpoints.alongRoute({ line, categories: cats.length ? cats : ['attractions'], bufferKm: 6 }),
  });

  const route = plan.data;
  useEffect(() => {
    if (route?.geometry?.coordinates) along.mutate(route.geometry.coordinates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, cats]);

  const canPlan = from && to;
  const addStop = (s) => {
    const [lng, lat] = s.location.coordinates;
    setStops((prev) => (prev.some((p) => p.id === s._id) ? prev : [...prev, { id: s._id, lng, lat, label: s.name }]));
    toast.success(`${s.name} ✓`);
  };
  useEffect(() => {
    if (canPlan && route) plan.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops]);

  const markers = useMemo(
    () => [
      from && { id: 'from', ...from, title: from.label, kind: 'start' },
      to && { id: 'to', ...to, title: to.label, kind: 'end' },
      ...stops.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, title: s.label, kind: 'place' })),
      ...(along.data || []).map((a) => ({ id: `a${a._id}`, lat: a.location.coordinates[1], lng: a.location.coordinates[0], title: a.name, subtitle: t(`directions.categories.${a.category}`), kind: a.targetType === 'place' ? 'gem' : 'business' })),
    ].filter(Boolean),
    [from, to, stops, along.data, t],
  );
  const line = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]);

  return (
    <div className="container-page py-8">
      <Seo title={t('directions.title')} description={t('directions.subtitle')} />
      <h1 className="text-3xl sm:text-4xl">{t('directions.title')}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t('directions.subtitle')}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-5">
          <div className="card space-y-4 p-5">
            <PointInput id="from" label={t('directions.from')} value={from} onChange={setFrom} allowGps />
            <div className="flex justify-center">
              <button type="button" className="rounded-full p-2 text-muted hover:bg-sand-100" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap">
                <ArrowDownUp className="size-4" />
              </button>
            </div>
            <PointInput id="to" label={t('directions.to')} value={to} onChange={setTo} />
            {stops.length > 0 && (
              <ol className="space-y-1.5">
                {stops.map((s, i) => (
                  <li key={s.id} className="flex items-center justify-between rounded-xl bg-sand-100 px-3 py-2 text-sm">
                    <span>{i + 1}. {s.label}</span>
                    <button type="button" onClick={() => setStops((prev) => prev.filter((p) => p.id !== s.id))} aria-label={t('directions.removeStop')} className="rounded-full p-1 hover:bg-white">
                      <Trash2 className="size-4 text-laterite-600" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <Button className="w-full" disabled={!canPlan} loading={plan.isPending} onClick={() => plan.mutate()}>
              <Route className="size-4" aria-hidden /> {t('directions.plan')}
            </Button>
          </div>

          {route && (
            <div className="card p-5" aria-live="polite">
              <h2 className="text-lg">{t('directions.summary')}</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-forest-50 p-3">
                  <p className="text-xs text-muted">{t('directions.distance')}</p>
                  <p className="text-xl font-semibold">{route.distanceKm} km</p>
                </div>
                <div className="rounded-xl bg-forest-50 p-3">
                  <p className="text-xs text-muted">{t('directions.duration')}</p>
                  <p className="text-xl font-semibold">{formatDuration(route.durationMin)}</p>
                </div>
              </div>
              {route.estimated && <Badge tone="amber" className="mt-3">{t('directions.estimateNotice')}</Badge>}
              <p className="mt-2 flex gap-1.5 text-xs text-muted"><Info className="size-3.5 shrink-0" aria-hidden />{route.notice}</p>
              {route.alternatives?.length > 0 && (
                <p className="mt-2 text-xs text-muted">+{route.alternatives.length} alternative: {route.alternatives.map((a) => `${a.distanceKm} km · ${formatDuration(a.durationMin)}`).join(', ')}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" href={`https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}${stops.length ? `&waypoints=${stops.map((s) => `${s.lat},${s.lng}`).join('|')}` : ''}`}>
                  <ExternalLink className="size-4" aria-hidden /> {t('directions.openGoogle')}
                </Button>
                <Button size="sm" variant="secondary" href={route.external.osm}>{t('directions.openOsm')}</Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <LazyMap className="h-[26rem]" markers={markers} route={line} />
          {plan.error && <ErrorState error={plan.error} onRetry={() => plan.mutate()} />}
          {route ? (
            <section>
              <h2 className="mb-3 text-xl">{t('directions.alongTheWay')}</h2>
              <Chips options={ALONG_CATEGORIES} value={cats} multiple onChange={setCats} labelFor={(c) => t(`directions.categories.${c}`)} />
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {(along.data || []).map((a) => (
                  <li key={a._id} className="card flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.name}</p>
                      <p className="text-xs text-muted">
                        {t(`directions.categories.${a.category}`)} · {districtName(a.district, i18n.language)} · {a.fromStartKm} km · {a.offRouteKm} km off route
                      </p>
                      {a.isDemo && <Badge tone="amber" className="mt-1">{t('common.demo')}</Badge>}
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => addStop(a)}>
                      <Plus className="size-4" aria-hidden /> {t('directions.addToRoute')}
                    </Button>
                  </li>
                ))}
              </ul>
              {along.data && !along.data.length && <EmptyState />}
            </section>
          ) : (
            <EmptyState icon={Route} title={t('directions.plan')} body={t('directions.noTraffic')} />
          )}
        </div>
      </div>
    </div>
  );
}
