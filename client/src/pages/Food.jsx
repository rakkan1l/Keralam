import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import Chips from '../components/ui/Chips';
import Pagination from '../components/ui/Pagination';
import { DishCard, BusinessCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { DistrictSelect } from '../components/FilterPanel';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
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
    <div className="container-page py-8">
      <Seo title={t('food.title')} description={t('food.subtitle')} />
      <h1 className="text-3xl sm:text-4xl">{t('food.title')}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t('food.subtitle')}</p>

      <div className="mt-6 inline-flex rounded-full bg-sand-200 p-1" role="tablist">
        {['dishes', 'places'].map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => set({ tab: k === 'dishes' ? '' : k })} className={cx('rounded-full px-4 py-2 text-sm font-medium', tab === k ? 'bg-white shadow-sm' : 'text-forest-800')}>
            {t(`food.${k}`)}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <Chips options={FOOD_CATEGORIES} value={params.category} onChange={(v) => set({ category: v })} labelFor={(c) => t(`foodCategories.${c}`)} ariaLabel={t('common.category')} />
        {tab === 'places' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-56"><DistrictSelect value={params.district} onChange={(v) => set({ district: v })} /></div>
            <Chips options={PRICE_BANDS} value={listParam(params.price)} multiple onChange={(v) => set({ price: v })} labelFor={(p) => t(`price.${p}`)} ariaLabel={t('food.priceRange')} />
          </div>
        )}
      </div>

      <div className="mt-6">
        {q.error ? (
          <ErrorState error={q.error} onRetry={q.refetch} />
        ) : q.isLoading ? (
          <GridSkeleton />
        ) : items.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((i) => (tab === 'dishes' ? <DishCard key={i._id} dish={i} /> : <BusinessCard key={i._id} business={i} />))}
            </div>
            <Pagination meta={q.data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
