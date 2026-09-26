import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LocateFixed } from 'lucide-react';
import Seo from '../components/Seo';
import Chips from '../components/ui/Chips';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { BusinessCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { DistrictSelect } from '../components/FilterPanel';
import { useQueryParams, listParam } from '../hooks/useQueryParams';
import { useUserLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { endpoints } from '../services/api';
import { SECTIONS } from '../utils/constants';

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
    accessible: params.accessible,
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
    <div className="container-page py-8">
      <Seo title={t(`sections.${section}.title`)} description={t(`sections.${section}.subtitle`)} />
      <h1 className="text-3xl sm:text-4xl">{t(`sections.${section}.title`)}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t(`sections.${section}.subtitle`)}</p>
      <div className="mt-6 space-y-4">
        {kinds.length > 1 && <Chips options={kinds} value={listParam(params.kind)} multiple onChange={(v) => set({ kind: v })} labelFor={(k) => t(`businessKinds.${k}`)} />}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56"><DistrictSelect value={params.district} onChange={(v) => set({ district: v })} /></div>
          {section === 'theatres' && (
            <Chips options={['Malayalam', 'English', 'Tamil', 'Hindi']} value={params.language} onChange={(v) => set({ language: v })} ariaLabel={t('sections.theatres.languages')} />
          )}
          <Button variant={near ? 'primary' : 'secondary'} size="sm" onClick={locate} loading={status === 'locating'}>
            <LocateFixed className="size-4" aria-hidden /> {t('nav.nearMe')}
          </Button>
        </div>
        {section === 'theatres' && <p className="text-sm text-muted">{t('sections.theatres.noShowtimes')}</p>}
      </div>
      <div className="mt-6">
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <GridSkeleton />
        ) : items.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((b) => <BusinessCard key={b._id} business={b} />)}</div>
            <Pagination meta={data.meta} onPage={(page) => set({ page }, { resetPage: false })} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
