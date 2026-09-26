import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Siren, MapPin, List, Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import LocationPicker from '../components/LocationPicker';
import Chips from '../components/ui/Chips';
import { PageIntro } from '../components/ui/Section';
import { PlaceCard, BusinessCard, StayCard } from '../components/cards/Cards';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { SelectChip, FilterBar } from '../components/FilterPanel';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { useUserLocation } from '../context/LocationContext';
import { useQueryParams } from '../hooks/useQueryParams';
import { endpoints } from '../services/api';
import { NEARBY_CATEGORIES, NEARBY_SEARCH_TERMS } from '../utils/constants';
import { districtName, cx } from '../utils/format';

const SERVICE_CATS = ['hospitals', 'pharmacies', 'police', 'atms', 'fuel', 'ev-charging', 'toilets'];
// Order categories by what travellers look for most.
const ORDER = ['attractions', 'restaurants', 'cafes', 'hospitals', 'pharmacies', 'fuel', 'atms', 'stays', 'bus-stops', 'railway-stations', 'airports', 'taxi', 'hidden-gems', 'police', 'ev-charging', 'toilets'];

function TransportRow({ node }) {
  const { t, i18n } = useTranslation();
  const [lng, lat] = node.location.coordinates;
  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold">{node.name}{node.code ? ` · ${node.code}` : ''}</p>
        <p className="text-[13px] text-muted">{districtName(node.district, i18n.language)} · {t('common.kmAway', { km: node.distanceKm })}</p>
      </div>
      <a className="link shrink-0 text-sm" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer">{t('common.directions')}</a>
    </div>
  );
}

export default function NearMe() {
  const { t } = useTranslation();
  const { position, setManual } = useUserLocation();
  const [params, set] = useQueryParams();
  const category = params.category || 'attractions';
  const radius = Number(params.radius) || 15;
  const view = params.view || 'list';
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nearby', position?.lat, position?.lng, category, radius],
    queryFn: () => endpoints.nearby({ lat: position.lat, lng: position.lng, category, radius, limit: 30 }),
    enabled: Boolean(position),
  });
  const items = data?.data || [];
  const external = position ? `https://www.google.com/maps/search/${encodeURIComponent(NEARBY_SEARCH_TERMS[category])}/@${position.lat},${position.lng},14z` : null;
  const markers = items
    .map((i) => toMarker(i, i.targetType === 'transport' ? 'transport' : i.targetType, i.targetType === 'place' ? `/places/${i.slug}` : i.targetType === 'stay' ? `/stays/${i.slug}` : i.targetType === 'business' ? `/listings/${i.slug}` : undefined))
    .filter(Boolean);

  return (
    <div className="container-page pb-16">
      <Seo title={t('nearby.title')} description={t('nearby.subtitle')} />
      <PageIntro eyebrow={t('nav.sectionTravel')} title={t('nearby.title')} subtitle={t('nearby.subtitle')} />

      {!position ? (
        <div className="panel mb-10"><LocationPicker /></div>
      ) : (
        <>
          <FilterBar>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-forest-50 px-3.5 text-sm font-medium text-forest-800">
                <MapPin className="size-4" aria-hidden /> {position.label}
              </span>
              <button type="button" onClick={() => setManual(null)} className="text-sm font-medium text-forest-700 hover:underline">{t('nearby.change')}</button>
              <div className="ml-auto flex items-center gap-2">
                <SelectChip value={String(radius)} onChange={(v) => set({ radius: v })} placeholder={t('nearby.radius')} options={[5, 15, 30, 50, 100].map((r) => [String(r), `${r} km`])} />
                <div className="inline-flex rounded-full bg-sand-200 p-0.5 lg:hidden" role="group" aria-label="View">
                  {[['list', List], ['map', MapIcon]].map(([key, Icon]) => (
                    <button key={key} type="button" onClick={() => set({ view: key === 'list' ? '' : key }, { resetPage: false })} aria-pressed={view === key} aria-label={t(key === 'list' ? 'common.showList' : 'common.showMap')} className={cx('grid h-8 w-10 place-items-center rounded-full', view === key ? 'bg-white shadow-sm' : 'text-muted')}>
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Chips scroll options={ORDER.filter((c) => NEARBY_CATEGORIES.includes(c))} value={category} onChange={(v) => set({ category: v || 'attractions' })} labelFor={(c) => t(`nearby.categories.${c}`)} ariaLabel={t('common.category')} />
          </FilterBar>

          {SERVICE_CATS.includes(category) && (
            <p className="mt-5 flex items-center gap-2 rounded-2xl bg-laterite-50 px-4 py-3 text-sm text-laterite-700">
              <Siren className="size-4 shrink-0" aria-hidden /> {t('nearby.demoServicesNote')} <Link to="/help" className="font-semibold underline">{t('nav.emergencyAssistance')}</Link>
            </p>
          )}

          <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className={cx(view === 'map' && 'hidden lg:block')}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-muted" aria-live="polite">{isLoading ? ' ' : t('common.results', { count: items.length })}</p>
                {external && <a href={external} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-sm">{t('nearby.externalShort')} <ExternalLink className="size-3.5" aria-hidden /></a>}
              </div>
              {error ? (
                <ErrorState error={error} onRetry={refetch} />
              ) : isLoading ? (
                <div className="space-y-4">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div>
              ) : items.length ? (
                <div className="divide-y divide-line">
                  {items.map((i) =>
                    i.targetType === 'place' ? <PlaceCard key={i._id} place={i} variant="compact" /> : i.targetType === 'stay' ? <StayCard key={i._id} stay={i} variant="compact" /> : i.targetType === 'transport' ? <TransportRow key={i._id} node={i} /> : <BusinessCard key={i._id} business={i} variant="compact" />,
                  )}
                </div>
              ) : (
                <EmptyState body={t('nearby.emptyBody')} action={external && <a href={external} target="_blank" rel="noopener noreferrer" className="link text-sm">{t('nearby.externalSearch')}</a>} />
              )}
            </div>
            <div className={cx('lg:sticky lg:top-44 lg:self-start', view !== 'map' && 'hidden lg:block')}>
              <LazyMap className="h-[65vh] lg:h-[calc(100vh-13rem)]" user={position} markers={markers} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
