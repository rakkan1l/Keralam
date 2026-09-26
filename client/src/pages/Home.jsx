import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Compass, LocateFixed, Sparkles, Siren, ArrowRight, Clock } from 'lucide-react';
import HeroArt from '../components/HeroArt';
import SearchBar from '../components/SearchBar';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import Seo from '../components/Seo';
import { PlaceCard, EventCard, BusinessCard, StayCard, DishCard } from '../components/cards/Cards';
import { CategoryTile, DistrictTile, MoodChip } from '../components/cards/TileCards';
import { CardSkeleton } from '../components/ui/Skeleton';
import { ErrorState, EmptyState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { PLACE_CATEGORIES, MOODS, TIME_BUCKETS } from '../utils/constants';
import { cx } from '../utils/format';

const EXAMPLES = ['Peaceful beach near Kozhikode', 'Waterfall suitable for families', 'Places under 100 km from Malappuram', 'Cheap food near me', 'What can I do for four hours?'];

/** Horizontal, snap-scrolling row on mobile; grid on desktop. */
function Row({ query, render, empty, cols = 'lg:grid-cols-4' }) {
  const { data, isLoading, error, refetch } = query;
  const items = Array.isArray(data) ? data : data?.data;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  return (
    <div className={cx('scroll-row lg:grid lg:overflow-visible', cols)}>
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="w-72 shrink-0 snap-start lg:w-auto" />)
        : items?.length
          ? items.map((item) => (
              <div key={item._id} className="w-72 shrink-0 snap-start lg:w-auto">
                {render(item)}
              </div>
            ))
          : <div className="w-full lg:col-span-full">{empty || <EmptyState />}</div>}
    </div>
  );
}

function Trending() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('places');
  const q = useQuery({ queryKey: ['trending', tab], queryFn: () => endpoints.trending({ type: tab, limit: 8 }) });
  const tabs = [
    ['places', t('home.trendingPlaces')],
    ['cafes', t('home.trendingCafes')],
    ['events', t('home.trendingEvents')],
    ['seasonal', t('home.seasonal')],
  ];
  return (
    <Section id="trending" title={t('home.trendingNow')} subtitle={t('home.trendingSub')}>
      <div className="mb-5 flex gap-2 overflow-x-auto" role="tablist">
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} type="button" onClick={() => setTab(key)} className={cx('chip shrink-0', tab === key && 'chip-active')}>
            {label}
          </button>
        ))}
      </div>
      <Row
        query={q}
        render={(item) => (tab === 'events' ? <EventCard event={item} /> : tab === 'cafes' ? <BusinessCard business={item} /> : <PlaceCard place={item} />)}
      />
    </Section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const gems = useQuery({ queryKey: ['places', 'gems-home'], queryFn: () => endpoints.places({ hiddenGem: 'true', limit: 8 }) });
  const weekend = useQuery({ queryKey: ['places', 'weekend-home'], queryFn: () => endpoints.places({ time: 'weekend', limit: 4 }) });
  const districts = useQuery({ queryKey: ['districts'], queryFn: endpoints.districts });
  const dishes = useQuery({ queryKey: ['dishes', 'home'], queryFn: () => endpoints.dishes({ limit: 4 }) });
  const eateries = useQuery({ queryKey: ['businesses', 'home-food'], queryFn: () => endpoints.businesses({ section: 'food', limit: 4, sort: 'rating' }) });
  const events = useQuery({ queryKey: ['events', 'week-home'], queryFn: () => endpoints.events({ when: 'week', limit: 4 }) });
  const stays = useQuery({ queryKey: ['stays', 'home'], queryFn: () => endpoints.stays({ limit: 4 }) });

  return (
    <>
      <Seo
        title={t('home.heroTitle')}
        description={t('home.heroSubtitle')}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Keralam', potentialAction: { '@type': 'SearchAction', target: '/search?q={query}', 'query-input': 'required name=query' } }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <HeroArt className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-forest-950/10 via-transparent to-forest-950/45" />
        <div className="container-page flex min-h-[560px] flex-col justify-center py-16 sm:min-h-[620px]">
          <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-800 backdrop-blur">
            {t('brand.tagline')}
          </p>
          <h1 className="max-w-3xl text-4xl leading-[1.05] text-forest-950 sm:text-6xl">{t('home.heroTitle')}</h1>
          <p className="mt-4 max-w-2xl text-base text-forest-900 sm:text-lg">{t('home.heroSubtitle')}</p>
          <div className="mt-8 max-w-2xl">
            <SearchBar />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-forest-950">{t('home.examples')}</span>
              {EXAMPLES.slice(0, 3).map((ex) => (
                <Link key={ex} to={`/search?q=${encodeURIComponent(ex)}`} className="rounded-full bg-white/75 px-3 py-1 text-forest-900 backdrop-blur hover:bg-white">
                  {ex}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/explore" size="lg">
              <Compass className="size-5" aria-hidden /> {t('home.explore')}
            </Button>
            <Button to="/near-me" size="lg" variant="light">
              <LocateFixed className="size-5" aria-hidden /> {t('home.nearMe')}
            </Button>
            <Button to="/trip-builder" size="lg" variant="accent">
              <Sparkles className="size-5" aria-hidden /> {t('home.buildTrip')}
            </Button>
          </div>
        </div>
      </section>

      <div className="container-page">
        <Trending />

        <Section id="gems" title={t('home.hiddenGems')} subtitle={t('home.hiddenGemsSub')} to="/hidden-gems">
          <Row query={gems} render={(p) => <PlaceCard place={p} />} />
        </Section>

        <Section id="categories" title={t('home.byCategory')} to="/explore">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PLACE_CATEGORIES.map((c) => (
              <CategoryTile key={c} slug={c} />
            ))}
          </div>
        </Section>

        <Section id="districts" title={t('home.byDistrict')} subtitle={t('home.byDistrictSub')} to="/districts">
          {districts.error ? (
            <ErrorState error={districts.error} onRetry={districts.refetch} />
          ) : (
            <div className="scroll-row lg:grid lg:grid-cols-7 lg:overflow-visible">
              {(districts.data || Array.from({ length: 14 }, (_, i) => ({ slug: `s${i}` }))).map((d) =>
                districts.data ? <DistrictTile key={d.slug} district={d} className="w-40 shrink-0 snap-start lg:w-auto" /> : <CardSkeleton key={d.slug} className="w-40 shrink-0 lg:w-auto" />,
              )}
            </div>
          )}
        </Section>

        <Section id="weekend" title={t('home.weekendGetaways')} to="/explore?time=weekend">
          <Row query={weekend} render={(p) => <PlaceCard place={p} />} />
        </Section>

        <Section id="food" title={t('home.keralaFood')} subtitle={t('home.keralaFoodSub')} to="/food">
          <Row query={dishes} render={(d) => <DishCard dish={d} />} />
          <div className="mt-5">
            <Row query={eateries} render={(b) => <BusinessCard business={b} />} />
          </div>
        </Section>

        <Section id="events" title={t('home.eventsThisWeek')} to="/events?when=week">
          <Row query={events} render={(e) => <EventCard event={e} />} />
        </Section>

        <Section id="stays" title={t('home.recommendedStays')} to="/stays">
          <Row query={stays} render={(s) => <StayCard stay={s} />} />
        </Section>

        <Section id="moods" title={t('home.byMood')}>
          <div className="flex flex-wrap gap-2.5">
            {MOODS.map((m) => (
              <MoodChip key={m} mood={m} />
            ))}
          </div>
        </Section>

        <Section id="time" title={t('home.byTime')}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TIME_BUCKETS.map((b) => (
              <Link key={b} to={`/explore?time=${b}`} className="card flex items-center gap-3 p-4 transition hover:ring-forest-300">
                <span className="grid size-10 place-items-center rounded-full bg-forest-50 text-forest-700">
                  <Clock className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-forest-950">{t(`time.${b}`)}</span>
              </Link>
            ))}
          </div>
        </Section>

        <section className="my-10 overflow-hidden rounded-[1.75rem] bg-forest-900 p-6 text-white sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-laterite-500">
                <Siren className="size-6" aria-hidden />
              </span>
              <div>
                <h2 className="text-2xl text-white">{t('home.touristHelp')}</h2>
                <p className="mt-2 max-w-2xl text-sm text-forest-100">{t('home.touristHelpSub')}</p>
              </div>
            </div>
            <Button to="/help" variant="light" size="lg">
              {t('home.openHelp')} <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
