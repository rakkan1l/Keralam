import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LocateFixed, Info } from 'lucide-react';
import Seo from '../components/Seo';
import SearchBar from '../components/SearchBar';
import Section from '../components/ui/Section';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PlaceCard, BusinessCard, StayCard, EventCard, DishCard } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useUserLocation } from '../context/LocationContext';
import { endpoints } from '../services/api';
import { districtName } from '../utils/format';

export default function Search() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { position, request, status } = useUserLocation();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['search', q, position?.lat, position?.lng],
    queryFn: () => endpoints.search({ q, lat: position?.lat, lng: position?.lng, limit: 12 }),
    enabled: q.length > 0,
  });
  const r = data?.results;
  const grid = 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return (
    <div className="container-page py-8">
      <Seo title={t('search.title', { q })} noindex />
      <SearchBar initial={q} />
      <h1 className="mt-6 text-2xl sm:text-3xl">{t('search.title', { q })}</h1>
      {data && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {data.interpretation.length > 0 && <span className="text-sm text-muted">{t('search.understood')}:</span>}
          {data.interpretation.map((i) => <Badge key={`${i.type}-${i.label}`} tone="green">{i.type === 'district' ? districtName(i.value, i18n.language) : i.type === 'category' ? t(`categories.${i.value}`) : i.type === 'mood' ? t(`moods.${i.value}`) : i.label}</Badge>)}
          <span className="inline-flex items-center gap-1 text-xs text-muted"><Info className="size-3.5" aria-hidden />{t('search.structuredNote')}</span>
        </div>
      )}
      {data?.needsLocation && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-lagoon-50 p-4 text-sm text-lagoon-700">
          {t('search.needsLocation')}
          <Button size="sm" onClick={() => request().catch(() => {})} loading={status === 'locating'}><LocateFixed className="size-4" aria-hidden />{t('nearby.askLocation')}</Button>
        </div>
      )}
      <div className="mt-4">
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <GridSkeleton />
        ) : !data?.total && !r?.districts?.length ? (
          <EmptyState action={<Button to="/explore">{t('nav.explore')}</Button>} />
        ) : (
          <>
            {r.districts.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {r.districts.map((d) => <Link key={d.slug} to={`/districts/${d.slug}`} className="chip">{districtName(d.slug, i18n.language)}</Link>)}
              </div>
            )}
            {r.places.length > 0 && <Section title={t('search.places')}><div className={grid}>{r.places.map((p) => <PlaceCard key={p._id} place={p} />)}</div></Section>}
            {r.dishes.length > 0 && <Section title={t('search.dishes')}><div className={grid}>{r.dishes.map((d) => <DishCard key={d._id} dish={d} />)}</div></Section>}
            {r.food.length > 0 && <Section title={t('search.food')}><div className={grid}>{r.food.map((b) => <BusinessCard key={b._id} business={b} />)}</div></Section>}
            {r.stays.length > 0 && <Section title={t('search.stays')}><div className={grid}>{r.stays.map((s) => <StayCard key={s._id} stay={s} />)}</div></Section>}
            {r.events.length > 0 && <Section title={t('search.events')}><div className={grid}>{r.events.map((e) => <EventCard key={e._id} event={e} />)}</div></Section>}
          </>
        )}
      </div>
    </div>
  );
}
