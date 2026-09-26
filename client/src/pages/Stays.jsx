import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import FilterPanel, { FilterGroup, Toggle, DistrictSelect, SelectChip, FilterBar, ResultsMeta } from '../components/FilterPanel';
import Chips from '../components/ui/Chips';
import Pagination from '../components/ui/Pagination';
import { PageIntro } from '../components/ui/Section';
import { StayCard, CARD_GRID } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
import { endpoints } from '../services/api';
import { STAY_TYPES, PRICE_BANDS, TRAVELLER_TYPES, STAY_EXPERIENCES } from '../utils/constants';

const FACILITIES = ['wifi', 'parking', 'pool', 'restaurant'];
const MORE = ['facility', 'traveller', 'experience', 'accessible'];

export default function Stays() {
  const { t } = useTranslation();
  const [params, set] = useQueryParams();
  const query = { type: params.type, district: params.district, price: params.price, facility: params.facility, traveller: params.traveller, experience: params.experience, accessible: params.accessible, page: params.page, limit: 12 };
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['stays', query], queryFn: () => endpoints.stays(query), placeholderData: keepPreviousData });
  return (
    <div className="container-page pb-16">
      <Seo title={t('stays.title')} description={t('stays.subtitle')} />
      <PageIntro eyebrow={t('nav.sectionMore')} title={t('stays.title')} subtitle={t('stays.subtitle')} />
      <FilterBar>
        <Chips scroll className="mb-3" options={STAY_TYPES} value={listParam(params.type)} multiple onChange={(v) => set({ type: v })} labelFor={(s) => t(`stayTypes.${s}`)} />
        <div className="flex flex-wrap gap-2">
          <DistrictSelect chip value={params.district} onChange={(v) => set({ district: v })} />
          <SelectChip value={params.price} onChange={(v) => set({ price: v })} placeholder={t('food.priceRange')} options={PRICE_BANDS.map((p) => [p, t(`price.${p}`)])} />
          <FilterPanel activeCount={MORE.filter((k) => params[k]).length} onClear={() => set(Object.fromEntries(MORE.map((k) => [k, ''])))}>
            <FilterGroup label={t('stays.traveller')}>
              <Chips options={TRAVELLER_TYPES} value={listParam(params.traveller)} multiple onChange={(v) => set({ traveller: v })} labelFor={(v) => t(`stays.travellers.${v}`)} />
            </FilterGroup>
            <FilterGroup label={t('stays.experience')}>
              <Chips options={STAY_EXPERIENCES} value={listParam(params.experience)} multiple onChange={(v) => set({ experience: v })} labelFor={(v) => t(`stays.experiences.${v}`)} />
            </FilterGroup>
            <FilterGroup label={t('stays.facilities')}>
              <Chips options={FACILITIES} value={listParam(params.facility)} multiple onChange={(v) => set({ facility: v })} labelFor={(v) => t(`stays.facilityNames.${v}`)} />
            </FilterGroup>
            <Toggle label={t('explore.accessible')} checked={params.accessible === 'true'} onChange={(v) => set({ accessible: v ? 'true' : '' })} />
          </FilterPanel>
        </div>
      </FilterBar>
      <ResultsMeta total={data?.meta?.total} />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <GridSkeleton count={6} className={CARD_GRID} />
      ) : data.data.length ? (
        <>
          <div className={CARD_GRID}>{data.data.map((s) => <StayCard key={s._id} stay={s} />)}</div>
          <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
