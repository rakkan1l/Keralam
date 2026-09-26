import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import Chips from '../components/ui/Chips';
import Pagination from '../components/ui/Pagination';
import { EventCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { DistrictSelect, Toggle } from '../components/FilterPanel';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
import { endpoints } from '../services/api';
import { EVENT_CATEGORIES, EVENT_WINDOWS } from '../utils/constants';
import { cx } from '../utils/format';

export default function Events() {
  const { t } = useTranslation();
  const [params, set] = useQueryParams();
  const when = params.when || 'upcoming';
  const query = { when, district: params.district, category: params.category, free: params.free, page: params.page, limit: 12 };
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['events', query], queryFn: () => endpoints.events(query), placeholderData: keepPreviousData });
  return (
    <div className="container-page py-8">
      <Seo title={t('events.title')} description={t('events.subtitle')} />
      <h1 className="text-3xl sm:text-4xl">{t('events.title')}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t('events.subtitle')}</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {EVENT_WINDOWS.map((w) => (
          <button key={w} role="tab" aria-selected={when === w} type="button" onClick={() => set({ when: w === 'upcoming' ? '' : w })} className={cx('chip shrink-0', when === w && 'chip-active')}>
            {t(`events.${w}`)}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="w-56"><DistrictSelect value={params.district} onChange={(v) => set({ district: v })} /></div>
        <div className="w-44"><Toggle label={t('common.free')} checked={params.free === 'true'} onChange={(v) => set({ free: v ? 'true' : '' })} /></div>
      </div>
      <Chips className="mt-4" options={EVENT_CATEGORIES} value={listParam(params.category)} multiple onChange={(v) => set({ category: v })} labelFor={(c) => t(`eventCategories.${c}`)} ariaLabel={t('common.category')} />

      <div className="mt-6">
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <GridSkeleton />
        ) : data.data.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{data.data.map((e) => <EventCard key={e._id} event={e} />)}</div>
            <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
