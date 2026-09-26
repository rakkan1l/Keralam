import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Siren } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import LocationPicker from '../components/LocationPicker';
import Chips from '../components/ui/Chips';
import { PlaceCard, BusinessCard, StayCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import Badge from '../components/ui/Badge';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { useUserLocation } from '../context/LocationContext';
import { useQueryParams } from '../hooks/useQueryParams';
import { endpoints } from '../services/api';
import { NEARBY_CATEGORIES, NEARBY_SEARCH_TERMS } from '../utils/constants';

const SERVICE_CATS = ['hospitals', 'pharmacies', 'police', 'atms', 'fuel', 'ev-charging', 'toilets'];

function TransportRow({ node }) {
  const { t } = useTranslation();
  const [lng, lat] = node.location.coordinates;
  return (
    <div className="card flex items-center justify-between gap-3 p-4">
      <div>
        <p className="font-medium">{node.name}{node.code ? ` (${node.code})` : ''}</p>
        <p className="text-xs text-muted">{t('common.kmAway', { km: node.distanceKm })}</p>
      </div>
      <a className="text-sm font-medium text-forest-700 hover:underline" href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer">{t('common.directions')}</a>
    </div>
  );
}

export default function NearMe() {
  const { t } = useTranslation();
  const { position } = useUserLocation();
  const [params, set] = useQueryParams();
  const category = params.category || 'attractions';
  const radius = Number(params.radius) || 15;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['nearby', position?.lat, position?.lng, category, radius],
    queryFn: () => endpoints.nearby({ lat: position.lat, lng: position.lng, category, radius, limit: 30 }),
    enabled: Boolean(position),
  });
  const items = data?.data || [];
  const type = items[0]?.targetType;
  const external = position ? `https://www.google.com/maps/search/${encodeURIComponent(NEARBY_SEARCH_TERMS[category])}/@${position.lat},${position.lng},14z` : null;

  return (
    <div className="container-page py-8">
      <Seo title={t('nearby.title')} description={t('nearby.subtitle')} />
      <h1 className="text-3xl sm:text-4xl">{t('nearby.title')}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t('nearby.subtitle')}</p>

      <div className="card mt-6 p-5">
        <LocationPicker />
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <Chips className="flex-1" options={NEARBY_CATEGORIES} value={category} onChange={(v) => set({ category: v || 'attractions' })} labelFor={(c) => t(`nearby.categories.${c}`)} ariaLabel={t('common.category')} />
        <div>
          <label className="label" htmlFor="radius">{t('nearby.radius')}</label>
          <select id="radius" className="input w-28" value={radius} onChange={(e) => set({ radius: e.target.value })}>
            {[5, 15, 30, 50, 100].map((r) => <option key={r} value={r}>{r} km</option>)}
          </select>
        </div>
      </div>

      {SERVICE_CATS.includes(category) && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl bg-laterite-50 p-3 text-sm text-laterite-700 ring-1 ring-laterite-100">
          <Siren className="size-4 shrink-0" aria-hidden /> {t('nearby.demoServicesNote')} <Link to="/help" className="font-semibold underline">{t('nav.help')}</Link>
        </p>
      )}

      <div className="mt-6">
        {!position ? (
          <EmptyState title={t('nearby.askLocation')} body={t('nearby.locationWhy')} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <GridSkeleton count={6} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted">{t('common.results', { count: items.length })}</p>
                {external && (
                  <a href={external} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline">
                    <ExternalLink className="size-4" aria-hidden /> {t('nearby.externalSearch')}
                  </a>
                )}
              </div>
              {items.length ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {items.map((i) =>
                    type === 'place' ? <PlaceCard key={i._id} place={i} /> : type === 'stay' ? <StayCard key={i._id} stay={i} /> : type === 'transport' ? <TransportRow key={i._id} node={i} /> : <BusinessCard key={i._id} business={i} />,
                  )}
                </div>
              ) : (
                <EmptyState action={external && <a href={external} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-forest-700 underline">{t('nearby.externalSearch')}</a>} />
              )}
            </div>
            <div className="lg:sticky lg:top-20 lg:self-start">
              <LazyMap
                className="h-80 lg:h-[70vh]"
                user={position}
                markers={items
                  .map((i) => toMarker(i, i.targetType === 'transport' ? 'transport' : i.targetType, i.targetType === 'place' ? `/places/${i.slug}` : i.targetType === 'stay' ? `/stays/${i.slug}` : i.targetType === 'business' ? `/listings/${i.slug}` : undefined))
                  .filter(Boolean)}
              />
              {position.source === 'manual' && <Badge className="mt-2" tone="blue">{position.label}</Badge>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
