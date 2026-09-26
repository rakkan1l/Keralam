import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import { DistrictTile } from '../components/cards/TileCards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/States';
import LazyMap from '../components/map/LazyMap';
import { endpoints } from '../services/api';
import { districtName } from '../utils/format';

export default function Districts() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['districts'], queryFn: endpoints.districts });
  return (
    <div className="container-page py-8">
      <Seo title={t('districts.title')} description={t('home.byDistrictSub')} />
      <h1 className="text-3xl sm:text-4xl">{t('districts.title')}</h1>
      <p className="mt-2 text-muted">{t('home.byDistrictSub')}</p>
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <GridSkeleton count={14} className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {data.map((d) => <DistrictTile key={d.slug} district={d} />)}
          </div>
          <LazyMap
            className="mt-8 h-[28rem]"
            markers={data.filter((d) => d.location).map((d) => ({ id: d.slug, lat: d.location.coordinates[1], lng: d.location.coordinates[0], title: districtName(d.slug, i18n.language), subtitle: d.tagline, href: `/districts/${d.slug}` }))}
          />
        </>
      )}
    </div>
  );
}
