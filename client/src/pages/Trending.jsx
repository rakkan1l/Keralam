import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import { PageIntro } from '../components/ui/Section';
import { PlaceCard, BusinessCard, EventCard, CARD_GRID } from '../components/cards/Cards';
import { GridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/States';
import { useQueryParams } from '../hooks/useQueryParams';
import { endpoints } from '../services/api';
import { cx } from '../utils/format';

const TABS = [
  ['places', 'home.trendingPlaces'],
  ['seasonal', 'home.seasonal'],
  ['cafes', 'home.trendingCafes'],
  ['events', 'home.trendingEvents'],
];

export default function Trending() {
  const { t } = useTranslation();
  const [params, set] = useQueryParams();
  const tab = params.type || 'places';
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['trending', tab, 12], queryFn: () => endpoints.trending({ type: tab, limit: 12 }) });
  return (
    <div className="container-page pb-16">
      <Seo title={t('pages.trendingTitle')} description={t('pages.trendingSub')} />
      <PageIntro eyebrow={t('nav.trending')} title={t('pages.trendingTitle')} subtitle={t('pages.trendingSub')} />
      <div className="mb-8 flex gap-2 overflow-x-auto" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} type="button" onClick={() => set({ type: key === 'places' ? '' : key })} className={cx('chip', tab === key && 'chip-active')}>
            {t(label)}
          </button>
        ))}
      </div>
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <GridSkeleton count={6} className={CARD_GRID} />
      ) : data.length ? (
        <ol className={CARD_GRID}>
          {data.map((item, i) => (
            <li key={item._id} className="relative">
              <span className="absolute -top-2 -left-2 z-20 grid size-8 place-items-center rounded-full bg-forest-800 text-xs font-semibold text-white tabular-nums">{i + 1}</span>
              {tab === 'events' ? <EventCard event={item} /> : tab === 'cafes' ? <BusinessCard business={item} /> : <PlaceCard place={item} />}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
