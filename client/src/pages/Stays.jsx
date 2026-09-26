import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import FilterPanel, { FilterGroup, Toggle, DistrictSelect } from '../components/FilterPanel';
import Chips from '../components/ui/Chips';
import Pagination from '../components/ui/Pagination';
import { StayCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
import { endpoints } from '../services/api';
import { STAY_TYPES, PRICE_BANDS, TRAVELLER_TYPES, STAY_EXPERIENCES } from '../utils/constants';

const FACILITIES = ['wifi', 'parking', 'pool', 'restaurant'];

export default function Stays() {
  const { t } = useTranslation();
  const [params, set, clear] = useQueryParams();
  const query = { type: params.type, district: params.district, price: params.price, facility: params.facility, traveller: params.traveller, experience: params.experience, accessible: params.accessible, page: params.page, limit: 12 };
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['stays', query], queryFn: () => endpoints.stays(query), placeholderData: keepPreviousData });
  const active = ['type', 'district', 'price', 'facility', 'traveller', 'experience', 'accessible'].filter((k) => params[k]).length;
  return (
    <div className="container-page py-8">
      <Seo title={t('stays.title')} description={t('stays.subtitle')} />
      <h1 className="text-3xl sm:text-4xl">{t('stays.title')}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t('stays.subtitle')}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterPanel activeCount={active} onClear={clear}>
          <FilterGroup label={t('common.category')}>
            <Chips options={STAY_TYPES} value={listParam(params.type)} multiple onChange={(v) => set({ type: v })} labelFor={(s) => t(`stayTypes.${s}`)} />
          </FilterGroup>
          <FilterGroup label={t('common.district')}>
            <DistrictSelect value={params.district} onChange={(v) => set({ district: v })} />
          </FilterGroup>
          <FilterGroup label={t('food.priceRange')}>
            <Chips options={PRICE_BANDS} value={listParam(params.price)} multiple onChange={(v) => set({ price: v })} labelFor={(p) => t(`price.${p}`)} />
          </FilterGroup>
          <FilterGroup label={t('stays.traveller')}>
            <Chips options={TRAVELLER_TYPES} value={listParam(params.traveller)} multiple onChange={(v) => set({ traveller: v })} labelFor={(v) => v} />
          </FilterGroup>
          <FilterGroup label={t('stays.experience')}>
            <Chips options={STAY_EXPERIENCES} value={listParam(params.experience)} multiple onChange={(v) => set({ experience: v })} labelFor={(v) => v} />
          </FilterGroup>
          <FilterGroup label={t('stays.facilities')}>
            <Chips options={FACILITIES} value={listParam(params.facility)} multiple onChange={(v) => set({ facility: v })} labelFor={(v) => v} />
          </FilterGroup>
          <Toggle label={t('explore.accessible')} checked={params.accessible === 'true'} onChange={(v) => set({ accessible: v ? 'true' : '' })} />
        </FilterPanel>
        <div>
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : isLoading ? (
            <GridSkeleton count={6} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" />
          ) : data.data.length ? (
            <>
              <p className="mb-4 text-sm text-muted">{t('common.results', { count: data.meta.total })}</p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{data.data.map((s) => <StayCard key={s._id} stay={s} />)}</div>
              <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
