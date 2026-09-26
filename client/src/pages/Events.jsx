import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import Chips from '../components/ui/Chips';
import Pagination from '../components/ui/Pagination';
import { PageIntro } from '../components/ui/Section';
import { EventCard, CARD_GRID } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { DistrictSelect, SelectChip, FilterBar, ResultsMeta } from '../components/FilterPanel';
import { useQueryParams } from '../hooks/useQueryParams';
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
    <div className="container-page pb-16">
      <Seo title={t('events.title')} description={t('events.subtitle')} />
      <PageIntro eyebrow={t('nav.events')} title={t('events.title')} subtitle={t('events.subtitle')} />
      <FilterBar>
        <div className="scroll-row mb-3 gap-2 pb-1" role="tablist">
          {EVENT_WINDOWS.map((w) => (
            <button key={w} role="tab" aria-selected={when === w} type="button" onClick={() => set({ when: w === 'upcoming' ? '' : w })} className={cx('chip shrink-0', when === w && 'chip-active')}>
              {t(`events.${w}`)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <DistrictSelect chip value={params.district} onChange={(v) => set({ district: v })} />
          <SelectChip value={params.category} onChange={(v) => set({ category: v })} placeholder={t('common.category')} options={EVENT_CATEGORIES.map((c) => [c, t(`eventCategories.${c}`)])} />
          <button type="button" onClick={() => set({ free: params.free === 'true' ? '' : 'true' })} aria-pressed={params.free === 'true'} className={cx('chip', params.free === 'true' && 'chip-active')}>{t('common.free')}</button>
        </div>
      </FilterBar>
      <ResultsMeta total={data?.meta?.total} />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <GridSkeleton className={CARD_GRID} />
      ) : data.data.length ? (
        <>
          <div className={CARD_GRID}>{data.data.map((e) => <EventCard key={e._id} event={e} />)}</div>
          <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
