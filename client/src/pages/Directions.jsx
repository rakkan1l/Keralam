import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Route, Plus, X, ExternalLink, Info, ArrowDownUp, Navigation } from 'lucide-react';
import Seo from '../components/Seo';
import PointInput from '../components/PointInput';
import Button from '../components/ui/Button';
import Chips from '../components/ui/Chips';
import Badge from '../components/ui/Badge';
import { PageIntro } from '../components/ui/Section';
import { EmptyState, ErrorState } from '../components/ui/States';
import LazyMap from '../components/map/LazyMap';
import { useToast } from '../context/ToastContext';
import { endpoints, errorMessage } from '../services/api';
import { ALONG_CATEGORIES } from '../utils/constants';
import { formatDuration, districtName, cx } from '../utils/format';

function parsePoint(v, label) {
  if (!v) return null;
  const [lng, lat] = v.split(',').map(Number);
  return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat, label: label || `${lat.toFixed(3)}, ${lng.toFixed(3)}` } : null;
}

export default function Directions() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [search, setSearch] = useSearchParams();
  const mode = search.get('mode') === 'plan' ? 'plan' : 'directions';
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(() => parsePoint(search.get('to'), search.get('toLabel')));
  const [stops, setStops] = useState([]);
  const [cats, setCats] = useState(['attractions', 'food', 'fuel', 'viewpoints']);

  const plan = useMutation({
    mutationFn: () => endpoints.planRoute({ from: [from.lng, from.lat], to: [to.lng, to.lat], waypoints: mode === 'plan' ? stops.map((s) => [s.lng, s.lat]) : [] }),
    onError: (err) => toast.error(errorMessage(err)),
  });
  const along = useMutation({ mutationFn: (line) => endpoints.alongRoute({ line, categories: cats.length ? cats : ['attractions'], bufferKm: 6 }) });
  const route = plan.data;

  useEffect(() => {
    if (mode === 'plan' && route?.geometry?.coordinates) along.mutate(route.geometry.coordinates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, cats, mode]);
  useEffect(() => {
    if (from && to && route) plan.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, mode]);

  const setMode = (m) => setSearch((prev) => { const n = new URLSearchParams(prev); if (m === 'plan') n.set('mode', 'plan'); else n.delete('mode'); return n; }, { replace: true });
  const addStop = (s) => {
    const [lng, lat] = s.location.coordinates;
    setStops((prev) => (prev.some((p) => p.id === s._id) ? prev : [...prev, { id: s._id, lng, lat, label: s.name }]));
    toast.success(t('directions.stopAdded', { name: s.name }));
  };

  const markers = useMemo(
    () => [
      from && { id: 'from', ...from, title: from.label, kind: 'start' },
      to && { id: 'to', ...to, title: to.label, kind: 'end' },
      ...(mode === 'plan' ? stops.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng, title: s.label, kind: 'place' })) : []),
      ...(mode === 'plan' ? (along.data || []).map((a) => ({ id: `a${a._id}`, lat: a.location.coordinates[1], lng: a.location.coordinates[0], title: a.name, subtitle: t(`directions.categories.${a.category}`), kind: a.targetType === 'place' ? 'gem' : 'business' })) : []),
    ].filter(Boolean),
    [from, to, stops, along.data, t, mode],
  );
  const line = route?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]);
  const googleUrl = from && to ? `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}${mode === 'plan' && stops.length ? `&waypoints=${stops.map((s) => `${s.lat},${s.lng}`).join('|')}` : ''}` : null;

  return (
    <div className="container-page pb-16">
      <Seo title={t('directions.title')} description={t('directions.subtitle')} />
      <PageIntro eyebrow={t('nav.sectionTravel')} title={mode === 'plan' ? t('nav.routePlanner') : t('nav.directions')} subtitle={t('directions.subtitle')}>
        <div className="mt-6 inline-flex rounded-full bg-sand-200 p-1" role="tablist">
          {[['directions', Navigation], ['plan', Route]].map(([m, Icon]) => (
            <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => setMode(m)} className={cx('inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition', mode === m ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink')}>
              <Icon className="size-4" aria-hidden /> {m === 'plan' ? t('nav.routePlanner') : t('nav.directions')}
            </button>
          ))}
        </div>
      </PageIntro>

      <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="panel space-y-3 p-5 sm:p-6">
            <PointInput id="from" label={t('directions.from')} value={from} onChange={setFrom} allowGps dot="bg-forest-500" />
            <div className="flex justify-end">
              <button type="button" className="-my-1 grid size-9 place-items-center rounded-full text-muted hover:bg-sand-100 hover:text-ink" onClick={() => { setFrom(to); setTo(from); }} aria-label={t('directions.swap')}>
                <ArrowDownUp className="size-4" />
              </button>
            </div>
            <PointInput id="to" label={t('directions.to')} value={to} onChange={setTo} dot="bg-laterite-500" />
            {mode === 'plan' && stops.length > 0 && (
              <ol className="space-y-1.5 pt-2">
                <p className="caption">{t('directions.stops')}</p>
                {stops.map((s, i) => (
                  <li key={s.id} className="flex items-center justify-between rounded-[10px] bg-sand-100 py-1.5 pr-1.5 pl-3 text-sm">
                    <span className="truncate">{i + 1}. {s.label}</span>
                    <button type="button" onClick={() => setStops((prev) => prev.filter((p) => p.id !== s.id))} aria-label={`${t('directions.removeStop')}: ${s.label}`} className="grid size-8 place-items-center rounded-full hover:bg-white">
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
            <Button className="mt-2 w-full" disabled={!from || !to} loading={plan.isPending} onClick={() => plan.mutate()}>
              {t('directions.plan')}
            </Button>
          </div>

          {route && (
            <div className="panel p-5 sm:p-6" aria-live="polite">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="caption">{t('directions.distance')}</p><p className="font-display text-3xl">{route.distanceKm}<span className="ml-1 text-base text-muted">km</span></p></div>
                <div><p className="caption">{t('directions.duration')}</p><p className="font-display text-3xl">{formatDuration(route.durationMin)}</p></div>
              </div>
              {route.estimated && <Badge tone="amber" className="mt-4">{t('directions.estimateNotice')}</Badge>}
              <p className="mt-3 flex gap-1.5 text-xs text-muted"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />{route.notice}</p>
              {route.alternatives?.length > 0 && <p className="mt-2 text-xs text-muted">{t('directions.alternatives')}: {route.alternatives.map((a) => `${a.distanceKm} km · ${formatDuration(a.durationMin)}`).join(', ')}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" href={googleUrl}><ExternalLink className="size-4" aria-hidden /> {t('directions.openGoogle')}</Button>
                <Button size="sm" variant="secondary" href={route.external.osm}>{t('directions.openOsm')}</Button>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-8">
          <LazyMap className="h-[22rem] sm:h-[30rem]" markers={markers} route={line} />
          {plan.error && <ErrorState error={plan.error} onRetry={() => plan.mutate()} />}
          {mode === 'plan' &&
            (route ? (
              <section>
                <h2 className="h2 mb-4 text-2xl">{t('directions.alongTheWay')}</h2>
                <Chips scroll options={ALONG_CATEGORIES} value={cats} multiple onChange={setCats} labelFor={(c) => t(`directions.categories.${c}`)} />
                <ul className="mt-4 divide-y divide-line">
                  {(along.data || []).map((a) => (
                    <li key={a._id} className="flex items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold">{a.name}</p>
                        <p className="text-[13px] text-muted">
                          {t(`directions.categories.${a.category}`)} · {districtName(a.district, i18n.language)} · {t('directions.fromStart', { km: a.fromStartKm })} · {t('directions.offRoute', { km: a.offRouteKm })}
                        </p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => addStop(a)} disabled={stops.some((s) => s.id === a._id)}>
                        <Plus className="size-4" aria-hidden /> <span className="hidden sm:inline">{t('directions.addToRoute')}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
                {along.data && !along.data.length && <EmptyState />}
              </section>
            ) : (
              <p className="text-sm text-muted">{t('directions.planHint')}</p>
            ))}
        </div>
      </div>
    </div>
  );
}
