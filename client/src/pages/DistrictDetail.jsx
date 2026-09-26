import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TrainFront, Plane, Bus, TramFront, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import Seo from '../components/Seo';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Carousel from '../components/ui/Carousel';
import DetailHero from '../components/detail/DetailHero';
import { PlaceCard, BusinessCard, EventCard, StayCard, DishCard, CARD_GRID } from '../components/cards/Cards';
import { DistrictTile, DISTRICT_SCENE } from '../components/cards/TileCards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { DetailFallback } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { districtName, localized } from '../utils/format';

const TRANSPORT_ICON = { 'railway-station': TrainFront, airport: Plane, 'bus-stand': Bus, 'bus-stop': Bus, 'metro-station': TramFront };

export default function DistrictDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['district', slug], queryFn: () => endpoints.district(slug) });
  if (isLoading || error) return <DetailFallback error={error} onRetry={refetch} ErrorComponent={ErrorState} />;
  const { district, popular, hiddenGems, restaurants, events, stays, transport, services, neighbours, dishes } = data;
  const name = districtName(district.slug, lang);
  const markers = [...popular, ...hiddenGems].map((p) => toMarker(p, 'place', `/places/${p.slug}`)).concat(transport.map((n) => toMarker(n, 'transport'))).filter(Boolean);

  return (
    <article>
      <Seo title={name} description={district.intro} jsonLd={{ '@context': 'https://schema.org', '@type': 'AdministrativeArea', name: district.name, containedInPlace: { '@type': 'State', name: 'Kerala' } }} />
      <DetailHero
        size="md"
        doc={{ ...district, images: district.heroImage?.url ? [district.heroImage] : [] }}
        title={name}
        eyebrow={`${t('common.district')} · ${district.headquarters}`}
        intro={localized(district, 'tagline', lang)}
        scene={DISTRICT_SCENE[district.slug]}
        crumbs={[{ to: '/districts', label: t('nav.districts') }, { label: name }]}
      />

      <div className="container-page">
        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">{t('districts.intro')}</p>
            <p className="text-[18px] leading-[1.7] text-ink-soft">{localized(district, 'intro', lang)}</p>
            {district.highlights?.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">{district.highlights.map((h) => <li key={h} className="chip h-8 text-[13px]">{h}</li>)}</ul>
            )}
            <div className="mt-7 flex flex-wrap gap-2">
              <Button to={`/explore?district=${slug}`}>{t('districts.explorePlaces', { name })} <ArrowRight className="size-4" aria-hidden /></Button>
              <Button to={`/trip-builder?district=${slug}`} variant="secondary"><Sparkles className="size-4" aria-hidden />{t('home.planCta')}</Button>
            </div>
          </div>
          <LazyMap className="h-72 lg:h-auto lg:min-h-80" markers={markers} />
        </div>

        {popular.length > 0 && (
          <Section title={t('districts.popular')} to={`/explore?district=${slug}`} className="border-t border-line">
            <div className={CARD_GRID}>{popular.slice(0, 6).map((p) => <PlaceCard key={p._id} place={p} />)}</div>
          </Section>
        )}
      </div>

      {hiddenGems.length > 0 && (
        <section className="bg-forest-950 py-16 text-white" aria-labelledby="dg-title">
          <div className="container-page">
            <p className="eyebrow mb-2 text-forest-300">{t('home.gemsEyebrow')}</p>
            <h2 id="dg-title" className="h2 mb-8 text-white">{t('districts.hiddenGems')}</h2>
            <Carousel dark label={t('districts.hiddenGems')} itemClass="w-[80%] sm:w-[44%] lg:w-[31%]">
              {hiddenGems.map((p) => <PlaceCard key={p._id} place={p} variant="feature" className="[&>div:last-child]:min-h-[22rem]" />)}
            </Carousel>
          </div>
        </section>
      )}

      <div className="container-page">
        {(dishes.length > 0 || restaurants.length > 0) && (
          <Section title={t('districts.food')} to={`/food?tab=places&district=${slug}`}>
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">{dishes.slice(0, 3).map((d) => <DishCard key={d._id} dish={d} />)}</div>
              {restaurants.length > 0 && (
                <div>
                  <h3 className="caption mb-1 font-semibold tracking-wider uppercase">{t('districts.restaurants')}</h3>
                  <div className="divide-y divide-line">{restaurants.slice(0, 4).map((b) => <BusinessCard key={b._id} business={b} variant="compact" />)}</div>
                </div>
              )}
            </div>
          </Section>
        )}

        {(events.length > 0 || stays.length > 0) && (
          <div className="grid gap-12 border-t border-line py-14 lg:grid-cols-2 lg:gap-16">
            {events.length > 0 && (
              <div>
                <div className="mb-3 flex items-baseline justify-between"><h2 className="h2 text-2xl">{t('districts.events')}</h2><Link to={`/events?district=${slug}`} className="link text-sm">{t('home.viewAll')}</Link></div>
                <div className="divide-y divide-line">{events.map((e) => <EventCard key={e._id} event={e} variant="compact" />)}</div>
              </div>
            )}
            {stays.length > 0 && (
              <div>
                <div className="mb-3 flex items-baseline justify-between"><h2 className="h2 text-2xl">{t('districts.stays')}</h2><Link to={`/stays?district=${slug}`} className="link text-sm">{t('home.viewAll')}</Link></div>
                <div className="divide-y divide-line">{stays.map((s) => <StayCard key={s._id} stay={s} variant="compact" />)}</div>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-12 border-t border-line py-14 lg:grid-cols-2 lg:gap-16">
          <section>
            <h2 className="h2 mb-2 text-2xl">{t('districts.transport')}</h2>
            {district.transport?.summary && <p className="mb-4 text-[15px] text-ink-soft">{district.transport.summary}</p>}
            <ul className="divide-y divide-line">
              {transport.map((n) => {
                const Icon = TRANSPORT_ICON[n.kind] || Bus;
                return (
                  <li key={n._id} className="flex items-center gap-3 py-3 text-[15px]">
                    <Icon className="size-4 text-forest-600" aria-hidden />
                    <span className="flex-1">{n.name}{n.code ? <span className="text-muted"> · {n.code}</span> : ''}</span>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${n.location.coordinates[1]},${n.location.coordinates[0]}`} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-sm">{t('common.directions')}<ExternalLink className="size-3.5" aria-hidden /></a>
                  </li>
                );
              })}
            </ul>
          </section>
          <section>
            <h2 className="h2 mb-2 text-2xl">{t('districts.essentials')}</h2>
            <p className="mb-4 text-[15px] text-ink-soft">{district.essentials?.summary}</p>
            <div className="divide-y divide-line">{services.slice(0, 5).map((s) => <BusinessCard key={s._id} business={s} variant="compact" />)}</div>
            <Button to="/help" variant="secondary" size="sm" className="mt-4">{t('nav.emergencyAssistance')}</Button>
          </section>
        </div>

        {neighbours.length > 0 && (
          <Section title={t('districts.neighbours')} className="border-t border-line">
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">{neighbours.map((n) => <DistrictTile key={n.slug} district={n} />)}</div>
          </Section>
        )}
      </div>
    </article>
  );
}
