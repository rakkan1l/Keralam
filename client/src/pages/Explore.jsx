import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { List, Map as MapIcon, LocateFixed } from 'lucide-react';
import Seo from '../components/Seo';
import FilterPanel, { FilterGroup, Toggle, DistrictSelect } from '../components/FilterPanel';
import Chips from '../components/ui/Chips';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { PlaceCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
import { useUserLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { endpoints } from '../services/api';
import { PLACE_CATEGORIES, EXTRA_CATEGORIES, MOODS, TIME_BUCKETS, BUDGETS } from '../utils/constants';
import { districtName, cx } from '../utils/format';

const FILTER_KEYS = ['district', 'category', 'mood', 'time', 'budget', 'season', 'hiddenGem', 'family', 'accessible', 'crowd', 'indoor', 'q'];

export function PlaceExplorer({ fixed = {}, title, subtitle, seoTitle }) {
  const { t, i18n } = useTranslation();
  const [params, set, clear] = useQueryParams();
  const { position, request, status } = useUserLocation();
  const toast = useToast();
  const view = params.view || 'list';
  const useNear = params.near === '1' && position;

  const query = {
    ...fixed,
    district: params.district,
    category: params.category,
    mood: params.mood,
    time: params.time,
    budget: params.budget,
    season: params.season,
    hiddenGem: fixed.hiddenGem || params.hiddenGem,
    family: params.family,
    accessible: params.accessible,
    crowd: params.crowd,
    indoor: params.indoor,
    q: params.q,
    sort: params.sort || (useNear ? 'distance' : undefined),
    page: params.page || 1,
    limit: 12,
    ...(useNear ? { lat: position.lat, lng: position.lng } : {}),
  };
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['places', query],
    queryFn: () => endpoints.places(query),
    placeholderData: keepPreviousData,
  });
  const mapQuery = useQuery({
    queryKey: ['places-map', { ...query, page: undefined, limit: undefined }],
    queryFn: () => endpoints.placeMap({ ...query, page: undefined, limit: undefined, lat: undefined, lng: undefined }),
    enabled: view === 'map',
  });

  const activeCount = FILTER_KEYS.filter((k) => params[k] && !(k in fixed)).length;
  const nearMe = async () => {
    if (params.near === '1') return set({ near: '' });
    try {
      if (!position) await request();
      set({ near: '1' });
    } catch {
      toast.error(t('nearby.denied'));
    }
  };

  const places = data?.data || [];
  return (
    <div className="container-page py-8">
      <Seo title={seoTitle || title} description={subtitle} />
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel activeCount={activeCount} onClear={clear}>
          <FilterGroup label={t('common.district')}>
            <DistrictSelect value={params.district} onChange={(v) => set({ district: v })} />
          </FilterGroup>
          <FilterGroup label={t('common.category')}>
            <Chips options={[...PLACE_CATEGORIES, ...EXTRA_CATEGORIES]} value={listParam(params.category)} multiple onChange={(v) => set({ category: v })} labelFor={(c) => t(`categories.${c}`)} />
          </FilterGroup>
          <FilterGroup label={t('common.mood')}>
            <Chips options={MOODS} value={listParam(params.mood)} multiple onChange={(v) => set({ mood: v })} labelFor={(m) => t(`moods.${m}`)} />
          </FilterGroup>
          <FilterGroup label={t('common.time')}>
            <Chips options={TIME_BUCKETS} value={params.time} onChange={(v) => set({ time: v })} labelFor={(v) => t(`time.${v}`)} />
          </FilterGroup>
          <FilterGroup label={t('common.budget')}>
            <Chips options={BUDGETS} value={params.budget} onChange={(v) => set({ budget: v })} labelFor={(v) => t(`budget.${v}`)} />
          </FilterGroup>
          <FilterGroup label={t('common.season')}>
            <Chips options={['now', 'monsoon']} value={params.season} onChange={(v) => set({ season: v })} labelFor={(v) => (v === 'now' ? t('explore.inSeasonNow') : t('explore.monsoonFriendly'))} />
          </FilterGroup>
          <div className="space-y-1">
            {!fixed.hiddenGem && <Toggle label={t('explore.hiddenGemsOnly')} checked={params.hiddenGem === 'true'} onChange={(v) => set({ hiddenGem: v ? 'true' : '' })} />}
            <Toggle label={t('explore.familyFriendly')} checked={params.family === 'true'} onChange={(v) => set({ family: v ? 'true' : '' })} />
            <Toggle label={t('explore.accessible')} checked={params.accessible === 'true'} onChange={(v) => set({ accessible: v ? 'true' : '' })} />
            <Toggle label={t('explore.lowCrowd')} checked={params.crowd === 'low'} onChange={(v) => set({ crowd: v ? 'low' : '' })} />
            <Toggle label={t('explore.indoor')} checked={params.indoor === 'true'} onChange={(v) => set({ indoor: v ? 'true' : '' })} />
          </div>
        </FilterPanel>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="mr-auto text-sm text-muted" aria-live="polite">
              {data?.meta ? t('common.results', { count: data.meta.total }) : ' '}
              {params.district && ` · ${districtName(params.district, i18n.language)}`}
            </p>
            <Button variant={params.near === '1' ? 'primary' : 'secondary'} size="sm" onClick={nearMe} loading={status === 'locating'}>
              <LocateFixed className="size-4" aria-hidden /> {t('explore.useMyLocation')}
            </Button>
            <label className="sr-only" htmlFor="sort">{t('common.sortBy')}</label>
            <select id="sort" value={params.sort || ''} onChange={(e) => set({ sort: e.target.value })} className="input h-9 w-auto py-0">
              <option value="">{t('common.popular')}</option>
              <option value="rating">{t('common.rating')}</option>
              <option value="name">{t('common.name')}</option>
              <option value="newest">{t('common.newest')}</option>
              {useNear && <option value="distance">{t('common.distance')}</option>}
            </select>
            <div className="inline-flex rounded-full bg-sand-200 p-1" role="group" aria-label="View">
              {[
                ['list', List, t('common.showList')],
                ['map', MapIcon, t('common.showMap')],
              ].map(([key, Icon, label]) => (
                <button key={key} type="button" onClick={() => set({ view: key === 'list' ? '' : key }, { resetPage: false })} aria-pressed={view === key} className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium', view === key ? 'bg-white shadow-sm' : 'text-forest-800')}>
                  <Icon className="size-4" aria-hidden /> {label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : view === 'map' ? (
            <LazyMap className="h-[70vh]" markers={(mapQuery.data || []).map((p) => toMarker(p, 'place', `/places/${p.slug}`)).filter(Boolean)} user={useNear ? position : undefined} />
          ) : isLoading ? (
            <GridSkeleton count={6} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" />
          ) : places.length ? (
            <>
              <div className={cx('grid gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity', isFetching && 'opacity-60')}>
                {places.map((p) => (
                  <PlaceCard key={p._id} place={p} />
                ))}
              </div>
              <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
            </>
          ) : (
            <EmptyState action={activeCount ? <Button variant="secondary" onClick={clear}>{t('common.clear')}</Button> : null} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const { t } = useTranslation();
  return <PlaceExplorer title={t('explore.title')} subtitle={t('explore.subtitle')} />;
}
