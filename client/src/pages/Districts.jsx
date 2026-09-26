import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import { PageIntro } from '../components/ui/Section';
import { DistrictTile } from '../components/cards/TileCards';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/States';
import LazyMap from '../components/map/LazyMap';
import { endpoints } from '../services/api';
import { districtName } from '../utils/format';

export default function Districts() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['districts'], queryFn: endpoints.districts });
  return (
    <div className="container-page pb-20">
      <Seo title={t('districts.title')} description={t('home.byDistrictSub')} />
      <PageIntro eyebrow={t('home.districtEyebrow')} title={t('home.districtTitle')} subtitle={t('home.byDistrictSub')} />
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_440px]">
          <div className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-2">
            {isLoading ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-16" />) : data.map((d) => <DistrictTile key={d.slug} district={d} />)}
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <LazyMap
              className="h-[26rem] lg:h-[calc(100vh-8rem)]"
              markers={(data || []).filter((d) => d.location).map((d) => ({ id: d.slug, lat: d.location.coordinates[1], lng: d.location.coordinates[0], title: districtName(d.slug, i18n.language), subtitle: d.tagline, href: `/districts/${d.slug}` }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
