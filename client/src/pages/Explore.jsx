import { useEffect, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { List, Map as MapIcon, LocateFixed, Search } from 'lucide-react';
import Seo from '../components/Seo';
import FilterPanel, { FilterGroup, Toggle, SelectChip, DistrictSelect } from '../components/FilterPanel';
import Chips from '../components/ui/Chips';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { PageIntro } from '../components/ui/Section';
import { PlaceCard, CARD_GRID } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
import { useDebounce } from '../hooks/useDebounce';
import { useUserLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { endpoints } from '../services/api';
import { PLACE_CATEGORIES, EXTRA_CATEGORIES, MOODS, TIME_BUCKETS, BUDGETS } from '../utils/constants';
import { cx } from '../utils/format';

const MORE_KEYS = ['mood', 'time', 'season', 'family', 'accessible', 'crowd', 'indoor', 'hiddenGem'];

export function PlaceExplorer({ fixed = {}, title, subtitle, eyebrow }) {
  const { t } = useTranslation();
  const [params, set, clear] = useQueryParams();
  const { position, request, status } = useUserLocation();
  const toast = useToast();
  const view = params.view || 'list';
  const useNear = params.near === '1' && position;
  const [text, setText] = useState(params.q || '');
  const q = useDebounce(text.trim(), 350);
  useEffect(() => {
    if ((params.q || '') !== q) set({ q });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

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
  const { data, isLoading, isFetching, error, refetch } = useQuery({ queryKey: ['places', query], queryFn: () => endpoints.places(query), placeholderData: keepPreviousData });
  const mapQuery = useQuery({
    queryKey: ['places-map', { ...query, page: undefined, limit: undefined }],
    queryFn: () => endpoints.placeMap({ ...query, page: undefined, limit: undefined, lat: undefined, lng: undefined }),
    enabled: view === 'map',
  });

  const moreCount = MORE_KEYS.filter((k) => params[k] && !(k in fixed)).length;
  const anyFilter = moreCount + ['district', 'category', 'budget', 'q'].filter((k) => params[k]).length;
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
    <div className="container-page pb-16">
      <Seo title={title} description={subtitle} />
      <PageIntro eyebrow={eyebrow} title={title} subtitle={subtitle}>
        <label className="relative mt-7 block max-w-2xl">
          <span className="sr-only">{t('common.search')}</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={t('explore.searchPlaceholder')} className="input h-13 rounded-full pl-12 text-base" />
        </label>
      </PageIntro>

      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-sand-100/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Chips scroll className="mb-3" options={[...PLACE_CATEGORIES, ...EXTRA_CATEGORIES]} value={listParam(params.category)} multiple onChange={(v) => set({ category: v })} labelFor={(c) => t(`categories.${c}`)} ariaLabel={t('common.category')} />
        <div className="flex flex-wrap items-center gap-2">
          <DistrictSelect chip value={params.district} onChange={(v) => set({ district: v })} />
          <SelectChip value={params.budget} onChange={(v) => set({ budget: v })} placeholder={t('common.budget')} options={BUDGETS.map((b) => [b, t(`budget.${b}`)])} />
          <FilterPanel activeCount={moreCount} onClear={() => set(Object.fromEntries(MORE_KEYS.map((k) => [k, ''])))}>
            <FilterGroup label={t('common.mood')}>
              <Chips options={MOODS} value={listParam(params.mood)} multiple onChange={(v) => set({ mood: v })} labelFor={(m) => t(`moods.${m}`)} />
            </FilterGroup>
            <FilterGroup label={t('common.time')}>
              <Chips options={TIME_BUCKETS} value={params.time} onChange={(v) => set({ time: v })} labelFor={(v) => t(`time.${v}`)} />
            </FilterGroup>
            <FilterGroup label={t('common.season')}>
              <Chips options={['now', 'monsoon']} value={params.season} onChange={(v) => set({ season: v })} labelFor={(v) => (v === 'now' ? t('explore.inSeasonNow') : t('explore.monsoonFriendly'))} />
            </FilterGroup>
            <div className="divide-y divide-line">
              {!fixed.hiddenGem && <Toggle label={t('explore.hiddenGemsOnly')} checked={params.hiddenGem === 'true'} onChange={(v) => set({ hiddenGem: v ? 'true' : '' })} />}
              <Toggle label={t('explore.familyFriendly')} checked={params.family === 'true'} onChange={(v) => set({ family: v ? 'true' : '' })} />
              <Toggle label={t('explore.accessible')} checked={params.accessible === 'true'} onChange={(v) => set({ accessible: v ? 'true' : '' })} />
              <Toggle label={t('explore.lowCrowd')} checked={params.crowd === 'low'} onChange={(v) => set({ crowd: v ? 'low' : '' })} />
              <Toggle label={t('explore.indoor')} checked={params.indoor === 'true'} onChange={(v) => set({ indoor: v ? 'true' : '' })} />
            </div>
          </FilterPanel>
          <button type="button" onClick={nearMe} className={cx('chip', params.near === '1' && 'chip-active')} aria-pressed={params.near === '1'}>
            <LocateFixed className={cx('size-4', status === 'locating' && 'animate-pulse')} aria-hidden /> {t('explore.nearMeShort')}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <SelectChip
              value={params.sort}
              onChange={(v) => set({ sort: v })}
              placeholder={t('common.popular')}
              ariaLabel={t('common.sortBy')}
              options={[['rating', t('common.rating')], ['name', t('common.name')], ['newest', t('common.newest')], ...(useNear ? [['distance', t('common.distance')]] : [])]}
            />
            <div className="inline-flex rounded-full bg-sand-200 p-0.5" role="group" aria-label="View">
              {[['list', List, t('common.showList')], ['map', MapIcon, t('common.showMap')]].map(([key, Icon, label]) => (
                <button key={key} type="button" onClick={() => set({ view: key === 'list' ? '' : key }, { resetPage: false })} aria-pressed={view === key} className={cx('inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium', view === key ? 'bg-white text-ink shadow-sm' : 'text-muted')}>
                  <Icon className="size-4" aria-hidden /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-5">
        <p className="text-sm text-muted" aria-live="polite">{data?.meta ? t('common.results', { count: data.meta.total }) : ' '}</p>
        {anyFilter > 0 && <button type="button" onClick={() => { setText(''); clear(); }} className="text-sm font-medium text-forest-700 hover:underline">{t('common.clear')}</button>}
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : view === 'map' ? (
        <LazyMap className="h-[70vh]" markers={(mapQuery.data || []).map((p) => toMarker(p, 'place', `/places/${p.slug}`)).filter(Boolean)} user={useNear ? position : undefined} />
      ) : isLoading ? (
        <GridSkeleton count={6} className={CARD_GRID} />
      ) : places.length ? (
        <>
          <div className={cx(CARD_GRID, 'transition-opacity', isFetching && 'opacity-60')}>
            {places.map((p) => <PlaceCard key={p._id} place={p} />)}
          </div>
          <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
        </>
      ) : (
        <EmptyState action={anyFilter ? <Button variant="secondary" onClick={() => { setText(''); clear(); }}>{t('common.clear')}</Button> : null} />
      )}
    </div>
  );
}

export default function Explore() {
  const { t } = useTranslation();
  return <PlaceExplorer eyebrow={t('nav.sectionExplore')} title={t('explore.title')} subtitle={t('explore.subtitle')} />;
}
