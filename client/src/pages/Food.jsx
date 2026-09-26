import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import Chips from '../components/ui/Chips';
import Pagination from '../components/ui/Pagination';
import { PageIntro } from '../components/ui/Section';
import { DishCard, BusinessCard, CARD_GRID_4, CARD_GRID } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { DistrictSelect, SelectChip, FilterBar, ResultsMeta } from '../components/FilterPanel';
import { useQueryParams } from '../hooks/useQueryParams';
import { endpoints } from '../services/api';
import { FOOD_CATEGORIES, PRICE_BANDS } from '../utils/constants';
import { cx } from '../utils/format';

export default function Food() {
  const { t } = useTranslation();
  const [params, set] = useQueryParams();
  const tab = params.tab || 'dishes';
  const dishes = useQuery({
    queryKey: ['dishes', params.category, params.page],
    queryFn: () => endpoints.dishes({ category: params.category, page: params.page, limit: 24 }),
    enabled: tab === 'dishes',
    placeholderData: keepPreviousData,
  });
  const places = useQuery({
    queryKey: ['businesses', 'food', params.category, params.district, params.price, params.page],
    queryFn: () => endpoints.businesses({ section: 'food', foodCategory: params.category, district: params.district, price: params.price, page: params.page, limit: 12 }),
    enabled: tab === 'places',
    placeholderData: keepPreviousData,
  });
  const q = tab === 'dishes' ? dishes : places;
  const items = q.data?.data || [];

  return (
    <div className="container-page pb-16">
      <Seo title={t('food.title')} description={t('food.subtitle')} />
      <PageIntro eyebrow={t('home.foodEyebrow')} title={t('food.title')} subtitle={t('food.subtitle')}>
        <div className="mt-7 inline-flex rounded-full bg-sand-200 p-1" role="tablist">
          {['dishes', 'places'].map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => set({ tab: k === 'dishes' ? '' : k })} className={cx('h-9 rounded-full px-5 text-sm font-medium transition', tab === k ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink')}>
              {t(`food.${k}`)}
            </button>
          ))}
        </div>
      </PageIntro>

      <FilterBar>
        <Chips scroll options={FOOD_CATEGORIES} value={params.category} onChange={(v) => set({ category: v })} labelFor={(c) => t(`foodCategories.${c}`)} ariaLabel={t('common.category')} />
        {tab === 'places' && (
          <div className="mt-3 flex flex-wrap gap-2">
            <DistrictSelect chip value={params.district} onChange={(v) => set({ district: v })} />
            <SelectChip value={params.price} onChange={(v) => set({ price: v })} placeholder={t('food.priceRange')} options={PRICE_BANDS.map((p) => [p, t(`price.${p}`)])} />
          </div>
        )}
      </FilterBar>

      <ResultsMeta total={q.data?.meta?.total} />
      {q.error ? (
        <ErrorState error={q.error} onRetry={q.refetch} />
      ) : q.isLoading ? (
        <GridSkeleton className={tab === 'dishes' ? CARD_GRID_4 : CARD_GRID} />
      ) : items.length ? (
        <>
          <div className={tab === 'dishes' ? CARD_GRID_4.replace('sm:grid-cols-2', 'grid-cols-2') : CARD_GRID}>
            {items.map((i) => (tab === 'dishes' ? <DishCard key={i._id} dish={i} /> : <BusinessCard key={i._id} business={i} />))}
          </div>
          <Pagination meta={q.data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
