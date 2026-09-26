import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LocateFixed, Info } from 'lucide-react';
import Seo from '../components/Seo';
import Chips from '../components/ui/Chips';
import Pagination from '../components/ui/Pagination';
import { PageIntro } from '../components/ui/Section';
import { BusinessCard, CARD_GRID } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { DistrictSelect, SelectChip, FilterBar, ResultsMeta } from '../components/FilterPanel';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
import { useUserLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { endpoints } from '../services/api';
import { SECTIONS } from '../utils/constants';
import { cx } from '../utils/format';

/** Data-driven discovery page for shopping, theatres and parks/activities. */
export default function BusinessSection({ section }) {
  const { t } = useTranslation();
  const [params, set] = useQueryParams();
  const { position, request, status } = useUserLocation();
  const toast = useToast();
  const near = params.near === '1' && position;
  const kinds = SECTIONS[section];
  const query = {
    section,
    kind: params.kind,
    district: params.district,
    language: section === 'theatres' ? params.language : undefined,
    page: params.page,
    limit: 12,
    ...(near ? { lat: position.lat, lng: position.lng, radius: 50 } : {}),
  };
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['businesses', query], queryFn: () => endpoints.businesses(query), placeholderData: keepPreviousData });
  const items = data?.data || [];

  const locate = async () => {
    if (params.near === '1') return set({ near: '' });
    try {
      if (!position) await request();
      set({ near: '1' });
    } catch {
      toast.error(t('nearby.denied'));
    }
  };

  return (
    <div className="container-page pb-16">
      <Seo title={t(`sections.${section}.title`)} description={t(`sections.${section}.subtitle`)} />
      <PageIntro eyebrow={t('nav.sectionMore')} title={t(`sections.${section}.title`)} subtitle={t(`sections.${section}.subtitle`)} />
      <FilterBar>
        {kinds.length > 1 && <Chips scroll className="mb-3" options={kinds} value={listParam(params.kind)} multiple onChange={(v) => set({ kind: v })} labelFor={(k) => t(`businessKinds.${k}`)} />}
        <div className="flex flex-wrap gap-2">
          <DistrictSelect chip value={params.district} onChange={(v) => set({ district: v })} />
          {section === 'theatres' && (
            <SelectChip value={params.language} onChange={(v) => set({ language: v })} placeholder={t('sections.theatres.languages')} options={['Malayalam', 'English', 'Tamil', 'Hindi'].map((l) => [l, l])} />
          )}
          <button type="button" onClick={locate} className={cx('chip', near && 'chip-active')} aria-pressed={Boolean(near)}>
            <LocateFixed className={cx('size-4', status === 'locating' && 'animate-pulse')} aria-hidden /> {t('explore.nearMeShort')}
          </button>
        </div>
      </FilterBar>
      {section === 'theatres' && <p className="mt-5 flex items-center gap-2 text-sm text-muted"><Info className="size-4" aria-hidden />{t('sections.theatres.noShowtimes')}</p>}
      <ResultsMeta total={data?.meta?.total} />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <GridSkeleton className={CARD_GRID} />
      ) : items.length ? (
        <>
          <div className={CARD_GRID}>{items.map((b) => <BusinessCard key={b._id} business={b} />)}</div>
          <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
