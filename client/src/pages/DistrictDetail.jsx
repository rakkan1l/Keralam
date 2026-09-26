import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Train, Plane, Bus, Hospital, ArrowRight, Info } from 'lucide-react';
import Seo from '../components/Seo';
import Section from '../components/ui/Section';
import SceneArt from '../components/ui/SceneArt';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PlaceCard, BusinessCard, EventCard, StayCard, DishCard } from '../components/cards/Cards';
import { DistrictTile } from '../components/cards/TileCards';
import { Panel } from '../components/detail/Facts';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState, EmptyState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { districtName, localized } from '../utils/format';

const TRANSPORT_ICON = { 'railway-station': Train, airport: Plane, 'bus-stand': Bus, 'bus-stop': Bus, 'metro-station': Train };

function Grid({ items, render, cols = 'lg:grid-cols-4' }) {
  if (!items?.length) return <EmptyState />;
  return <div className={`grid gap-5 sm:grid-cols-2 ${cols}`}>{items.map(render)}</div>;
}

export default function DistrictDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['district', slug], queryFn: () => endpoints.district(slug) });
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  const { district, popular, hiddenGems, restaurants, events, stays, transport, services, neighbours, dishes } = data;
  const name = districtName(district.slug, lang);
  const markers = [
    ...popular.map((p) => toMarker(p, 'place', `/places/${p.slug}`)),
    ...hiddenGems.map((p) => toMarker(p, 'place', `/places/${p.slug}`)),
    ...transport.map((n) => toMarker(n, 'transport')),
  ].filter(Boolean);

  return (
    <article>
      <Seo title={`${name} — ${district.tagline || ''}`} description={district.intro} jsonLd={{ '@context': 'https://schema.org', '@type': 'AdministrativeArea', name: district.name, containedInPlace: { '@type': 'State', name: 'Kerala' } }} />
      <header className="relative h-72 overflow-hidden sm:h-80">
        {district.heroImage?.url ? <img src={district.heroImage.url} alt={district.heroImage.alt || name} className="h-full w-full object-cover" /> : <SceneArt scene="hills" seed={district.slug} className="h-full w-full" />}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 pb-7 text-white">
          <Link to="/districts" className="text-xs text-white/80 hover:underline">{t('nav.districts')}</Link>
          <h1 className="mt-1 text-4xl text-white sm:text-5xl">{name}</h1>
          {lang !== 'ml' && <p className="text-lg text-white/85">{district.nameMl}</p>}
          <p className="mt-1 text-white/90">{localized(district, 'tagline', lang)}</p>
        </div>
      </header>

      <div className="container-page">
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="card p-6">
            <h2 className="mb-2 text-xl">{t('districts.intro')}</h2>
            <p className="leading-relaxed text-forest-900">{localized(district, 'intro', lang)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {district.highlights?.map((h) => <Badge key={h} tone="green">{h}</Badge>)}
              {district.isDemo && <Badge tone="amber" icon={Info}>{t('common.unverified')}</Badge>}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button to={`/explore?district=${slug}`} size="sm">{t('nav.explore')} {name} <ArrowRight className="size-4" aria-hidden /></Button>
              <Button to={`/trip-builder?district=${slug}`} size="sm" variant="secondary">{t('home.buildTrip')}</Button>
            </div>
          </section>
          <LazyMap className="h-72 lg:h-auto" markers={markers} />
        </div>

        <Section title={t('districts.popular')} to={`/explore?district=${slug}`}>
          <Grid items={popular} render={(p) => <PlaceCard key={p._id} place={p} />} />
        </Section>
        {hiddenGems.length > 0 && (
          <Section title={t('districts.hiddenGems')} to={`/hidden-gems?district=${slug}`}>
            <Grid items={hiddenGems} render={(p) => <PlaceCard key={p._id} place={p} />} cols="lg:grid-cols-3" />
          </Section>
        )}
        <Section title={t('districts.food')} to="/food">
          <Grid items={dishes} render={(d) => <DishCard key={d._id} dish={d} />} cols="lg:grid-cols-6" />
        </Section>
        <Section title={t('districts.restaurants')} to={`/food?tab=places&district=${slug}`}>
          <Grid items={restaurants} render={(b) => <BusinessCard key={b._id} business={b} />} cols="lg:grid-cols-3" />
        </Section>
        <Section title={t('districts.events')} to={`/events?district=${slug}`}>
          <Grid items={events} render={(e) => <EventCard key={e._id} event={e} />} cols="lg:grid-cols-3" />
        </Section>
        <Section title={t('districts.stays')} to={`/stays?district=${slug}`}>
          <Grid items={stays} render={(s) => <StayCard key={s._id} stay={s} />} cols="lg:grid-cols-3" />
        </Section>

        <div className="grid gap-6 py-8 md:grid-cols-2">
          <Panel title={t('districts.transport')} icon={Train} footer={district.transport?.summary}>
            <ul className="divide-y divide-sand-200">
              {transport.map((n) => {
                const Icon = TRANSPORT_ICON[n.kind] || Bus;
                return (
                  <li key={n._id} className="flex items-center gap-3 py-2 text-sm">
                    <Icon className="size-4 text-forest-600" aria-hidden />
                    <span className="flex-1">{n.name}{n.code ? ` (${n.code})` : ''}</span>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${n.location.coordinates[1]},${n.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-forest-700 hover:underline">{t('common.directions')}</a>
                  </li>
                );
              })}
              {!transport.length && <li className="py-2 text-sm text-muted">{t('common.notAvailable')}</li>}
            </ul>
          </Panel>
          <Panel title={t('districts.essentials')} icon={Hospital} footer={district.essentials?.summary}>
            <ul className="divide-y divide-sand-200">
              {services.map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <Link to={`/listings/${s.slug}`} className="hover:underline">{s.name}</Link>
                  {s.isDemo && <Badge tone="amber">{t('common.demo')}</Badge>}
                </li>
              ))}
            </ul>
            <Button to="/help" variant="secondary" size="sm" className="mt-3">{t('nav.help')}</Button>
          </Panel>
        </div>

        <Section title={t('districts.neighbours')}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{neighbours.map((n) => <DistrictTile key={n.slug} district={n} />)}</div>
        </Section>
      </div>
    </article>
  );
}
