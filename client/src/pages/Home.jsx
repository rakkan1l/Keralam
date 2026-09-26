import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Phone } from 'lucide-react';
import HeroArt from '../components/HeroArt';
import SearchBar from '../components/SearchBar';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import Carousel from '../components/ui/Carousel';
import Seo from '../components/Seo';
import { PlaceCard, EventCard, DishCard, CARD_GRID_4 } from '../components/cards/Cards';
import { CategoryTile, DistrictTile, HOME_CATEGORIES } from '../components/cards/TileCards';
import { CardSkeleton, Skeleton } from '../components/ui/Skeleton';
import { ErrorState, EmptyState } from '../components/ui/States';
import { SEARCH_EXAMPLES } from '../components/layout/SearchOverlay';
import { endpoints } from '../services/api';

// Optional hero photograph (e.g. a licensed image on your CDN). Falls back to illustrated art.
const HERO_IMAGE = import.meta.env.VITE_HERO_IMAGE;

function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-forest-900 sm:min-h-[88vh]">
      {HERO_IMAGE ? (
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" fetchPriority="high" />
      ) : (
        <HeroArt className="absolute inset-0 -z-10 h-full w-full" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/80 via-forest-950/25 to-forest-950/30" />
      <div className="container-page pt-28 pb-14 sm:pb-20">
        <div className="animate-fade-up max-w-3xl">
          <h1 className="display text-white">{t('home.heroTitle')}</h1>
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">{t('home.heroSubtitle')}</p>
          <div className="mt-8 max-w-2xl">
            <SearchBar />
            <p className="mt-3 hidden flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/75 sm:flex">
              {SEARCH_EXAMPLES.map((q) => (
                <Link key={q} to={`/search?q=${encodeURIComponent(q)}`} className="underline-offset-4 hover:text-white hover:underline">{q}</Link>
              ))}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/explore" variant="light" size="lg">{t('home.exploreCta')} <ArrowRight className="size-4" aria-hidden /></Button>
            <Button to="/trip-builder" variant="glass" size="lg"><Sparkles className="size-4" aria-hidden /> {t('home.planCta')}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ['places', 'featured-home'], queryFn: () => endpoints.places({ featured: 'true', limit: 3 }) });
  const items = q.data?.data || [];
  return (
    <Section id="featured" eyebrow={t('home.featuredEyebrow')} title={t('home.featuredTitle')} subtitle={t('home.featuredSub')} to="/explore">
      {q.error ? (
        <ErrorState error={q.error} onRetry={q.refetch} />
      ) : q.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-12"><Skeleton className="h-[30rem] rounded-[var(--radius-panel)] lg:col-span-7" /><Skeleton className="h-[30rem] rounded-[var(--radius-panel)] lg:col-span-5" /></div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
          {items[0] && <PlaceCard place={items[0]} variant="feature" className="lg:col-span-7 lg:row-span-2 lg:min-h-[34rem] [&>div:last-child]:lg:min-h-[34rem]" />}
          {items.slice(1).map((p) => <PlaceCard key={p._id} place={p} variant="feature" showDescription={false} className="lg:col-span-5 [&>div:last-child]:min-h-[16rem]" />)}
        </div>
      )}
    </Section>
  );
}

function HiddenGems() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ['places', 'gems-home'], queryFn: () => endpoints.places({ hiddenGem: 'true', limit: 8 }) });
  return (
    <section className="bg-forest-950 py-16 text-white sm:py-24" aria-labelledby="gems-title">
      <div className="container-page">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow mb-2 text-forest-300">{t('home.gemsEyebrow')}</p>
            <h2 id="gems-title" className="h2 text-white">{t('home.gemsTitle')}</h2>
            <p className="mt-2 text-[15px] text-white/70">{t('home.gemsSub')}</p>
          </div>
          <Link to="/hidden-gems" className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-white/85 hover:text-white sm:inline-flex">
            {t('home.viewAll')} <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {q.error ? (
          <ErrorState error={q.error} onRetry={q.refetch} />
        ) : (
          <Carousel dark label={t('home.gemsTitle')} itemClass="w-[80%] sm:w-[44%] lg:w-[30%]">
            {(q.data?.data || Array.from({ length: 3 }, (_, i) => ({ _id: `s${i}`, skeleton: true }))).map((p) =>
              p.skeleton ? <Skeleton key={p._id} className="h-[26rem] rounded-[var(--radius-panel)] bg-white/10" /> : <PlaceCard key={p._id} place={p} variant="feature" className="[&>div:last-child]:min-h-[26rem]" />,
            )}
          </Carousel>
        )}
      </div>
    </section>
  );
}

function Trending() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ['trending', 'places', 8], queryFn: () => endpoints.trending({ type: 'places', limit: 8 }) });
  return (
    <Section id="trending" title={t('home.trendingTitle')} subtitle={t('home.trendingSub')} to="/trending">
      {q.error ? (
        <ErrorState error={q.error} onRetry={q.refetch} />
      ) : (
        <Carousel label={t('home.trendingTitle')} itemClass="w-[72%] sm:w-[40%] lg:w-[23.5%]">
          {(q.data || Array.from({ length: 4 }, (_, i) => ({ _id: `s${i}`, skeleton: true }))).map((p) => (p.skeleton ? <CardSkeleton key={p._id} /> : <PlaceCard key={p._id} place={p} showDescription={false} />))}
        </Carousel>
      )}
    </Section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const districts = useQuery({ queryKey: ['districts'], queryFn: endpoints.districts });
  const dishes = useQuery({ queryKey: ['dishes', 'home'], queryFn: () => endpoints.dishes({ limit: 4 }) });
  const events = useQuery({ queryKey: ['events', 'upcoming-home'], queryFn: () => endpoints.events({ when: 'month', limit: 6 }) });

  return (
    <>
      <Seo
        title={t('home.heroTitle')}
        description={t('home.heroSubtitle')}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Keralam', potentialAction: { '@type': 'SearchAction', target: '/search?q={query}', 'query-input': 'required name=query' } }}
      />
      <Hero />

      <div className="container-page">
        <Featured />

        <section className="pb-4" aria-labelledby="cat-title">
          <h2 id="cat-title" className="h3 mb-5 text-lg">{t('home.categoryTitle')}</h2>
          <div className="scroll-row gap-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
            {HOME_CATEGORIES.map((c) => <CategoryTile key={c.key} item={c} />)}
          </div>
        </section>
      </div>

      <div className="mt-12 sm:mt-16"><HiddenGems /></div>

      <div className="container-page">
        <Trending />

        <Section id="districts" eyebrow={t('home.districtEyebrow')} title={t('home.districtTitle')} to="/districts">
          {districts.error ? (
            <ErrorState error={districts.error} onRetry={districts.refetch} />
          ) : (
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {(districts.data || Array.from({ length: 8 }, (_, i) => ({ slug: `s${i}`, skeleton: true }))).map((d) =>
                d.skeleton ? <Skeleton key={d.slug} className="h-16" /> : <DistrictTile key={d.slug} district={d} />,
              )}
            </div>
          )}
        </Section>

        <Section id="food" eyebrow={t('home.foodEyebrow')} title={t('home.foodTitle')} subtitle={t('home.foodSub')} to="/food">
          <div className={CARD_GRID_4.replace('sm:grid-cols-2', 'grid-cols-2')}>
            {(dishes.data?.data || Array.from({ length: 4 }, (_, i) => ({ _id: `s${i}`, skeleton: true }))).map((d) => (d.skeleton ? <CardSkeleton key={d._id} /> : <DishCard key={d._id} dish={d} />))}
          </div>
        </Section>

        <Section id="events" title={t('home.eventsTitle')} to="/events">
          {events.data?.data?.length ? (
            <div className="grid divide-y divide-line border-y border-line md:grid-cols-2 md:gap-x-10 md:divide-y-0 [&>*]:border-line md:[&>*]:border-b">
              {events.data.data.map((e) => <EventCard key={e._id} event={e} variant="compact" />)}
            </div>
          ) : events.isLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <EmptyState />
          )}
        </Section>

        <section className="my-8 grid overflow-hidden rounded-[var(--radius-panel)] bg-white md:grid-cols-2" aria-labelledby="plan-title">
          <div className="p-8 sm:p-12">
            <p className="eyebrow mb-3">{t('home.planEyebrow')}</p>
            <h2 id="plan-title" className="h2">{t('home.planTitle')}</h2>
            <p className="mt-3 text-[15px] text-ink-soft">{t('home.planBody')}</p>
            <Button to="/trip-builder" className="mt-7"><Sparkles className="size-4" aria-hidden /> {t('home.planCta')}</Button>
          </div>
          <div className="relative min-h-56 bg-sand-200">
            <HeroArt className="absolute inset-0 h-full w-full" />
          </div>
        </section>

        <Link to="/help" className="mb-16 flex items-center gap-4 rounded-[var(--radius-panel)] border border-line px-5 py-4 transition hover:border-laterite-100 hover:bg-laterite-50 sm:px-7">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-laterite-500 text-white"><Phone className="size-4" aria-hidden /></span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold">{t('home.helpTitle')}</span>
            <span className="block text-sm text-muted">{t('home.helpBody')}</span>
          </span>
          <ArrowRight className="size-4 text-muted" aria-hidden />
        </Link>
      </div>
    </>
  );
}
