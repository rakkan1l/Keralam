import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Clock, Utensils, Film, Phone, Globe, Siren } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero from '../components/detail/DetailHero';
import { Panel, ValueRow, OpeningHours, AccessibilityPanel, NoticeList } from '../components/detail/Facts';
import { DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import { ReviewsSection, CommunityUpdates } from '../components/detail/Community';
import SaveButton from '../components/SaveButton';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import { BusinessCard } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { districtName, localized } from '../utils/format';

const FOOD = ['restaurant', 'cafe', 'street-food', 'bakery'];
const SERVICES = ['hospital', 'pharmacy', 'police', 'atm', 'fuel', 'ev-charging', 'public-toilet'];

export default function BusinessDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['business', slug], queryFn: () => endpoints.business(slug) });
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  const { business: b, notices, updates, reviews, nearby } = data;
  const name = localized(b, 'name', lang);
  const isFood = FOOD.includes(b.kind);
  const section = isFood ? ['/food?tab=places', t('nav.food')] : b.kind === 'theatre' ? ['/theatres', t('nav.theatres')] : SERVICES.includes(b.kind) ? ['/near-me', t('nav.nearMe')] : ['/activities', t('nav.activities')];
  const [lng, lat] = b.location.coordinates;

  return (
    <article>
      <Seo
        title={name}
        description={b.description}
        jsonLd={{ '@context': 'https://schema.org', '@type': isFood ? 'Restaurant' : 'LocalBusiness', name: b.name, geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }, address: { '@type': 'PostalAddress', addressLocality: districtName(b.district), addressRegion: 'Kerala', addressCountry: 'IN' }, ...(b.food?.cuisines?.length ? { servesCuisine: b.food.cuisines } : {}) }}
      />
      <DetailHero doc={b} title={name} subtitle={`${b.locality ? `${b.locality}, ` : ''}${districtName(b.district, lang)}`} kind={b.kind} crumbs={[{ to: section[0], label: section[1] }, { label: name }]} meta={<Badge tone="light">{t(`businessKinds.${b.kind}`)}</Badge>} />
      {SERVICES.includes(b.kind) && (
        <div className="container-page mt-4">
          <p className="flex items-center gap-2 rounded-2xl bg-laterite-50 p-3 text-sm text-laterite-700 ring-1 ring-laterite-100">
            <Siren className="size-4 shrink-0" aria-hidden /> {t('nearby.demoServicesNote')} <Link to="/help" className="font-semibold underline">{t('nav.help')}</Link>
          </p>
        </div>
      )}
      <div className="container-page mt-6 flex flex-wrap gap-2">
        <DirectionsButton doc={b} />
        <SaveButton type="business" doc={b} variant="button" />
        <ShareButton title={name} />
        {b.contact?.phone && <Button variant="secondary" href={`tel:${b.contact.phone}`}><Phone className="size-4" aria-hidden />{b.contact.phone}</Button>}
      </div>

      <div className="container-page mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-2 text-xl">{t('place.about')}</h2>
            <p className="leading-relaxed">{localized(b, 'description', lang) || t('common.notAvailable')}</p>
            {notices.length > 0 && <div className="mt-4"><NoticeList notices={notices} /></div>}
          </section>
          {isFood && (
            <Panel title={t('food.title')} icon={Utensils}>
              <dl className="divide-y divide-sand-200">
                <ValueRow label={t('food.priceRange')} value={b.priceRange !== 'unknown' ? t(`price.${b.priceRange}`) : null} />
                <ValueRow label={t('food.cuisines')} value={b.food?.cuisines?.join(', ')} />
                <ValueRow label={t('food.dietary')} value={b.food?.dietary?.join(', ')} />
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">{b.food?.categories?.map((c) => <Badge key={c} tone="green">{t(`foodCategories.${c}`)}</Badge>)}</div>
              {b.food?.signatureDishes?.length > 0 && (
                <p className="mt-3 text-sm">
                  {b.food.signatureDishes.map((d) => <Link key={d._id} to={`/food/dishes/${d.slug}`} className="mr-2 font-medium text-forest-700 hover:underline">{d.name}</Link>)}
                </p>
              )}
            </Panel>
          )}
          {b.kind === 'theatre' && (
            <Panel title={t('sections.theatres.showtimes')} icon={Film}>
              <dl className="divide-y divide-sand-200">
                <ValueRow label={t('sections.theatres.languages')} value={b.theatre?.languages?.join(', ')} />
                <ValueRow label={t('sections.theatres.screens')} value={b.theatre?.screens} />
                <ValueRow label={t('events.parking')} value={b.theatre?.parking} />
              </dl>
              {b.theatre?.showtimesUrl ? (
                <Button href={b.theatre.showtimesUrl} className="mt-3" size="sm">{t('sections.theatres.showtimes')}</Button>
              ) : (
                <p className="mt-3 text-sm italic text-muted">{t('sections.theatres.noShowtimes')}</p>
              )}
            </Panel>
          )}
          <AccessibilityPanel accessibility={b.accessibility} />
          <CommunityUpdates targetType="business" target={b} initial={updates} />
          <ReviewsSection targetType="business" target={b} reviews={reviews} />
          <ReportButton targetType="business" target={b} />
        </div>
        <aside className="space-y-6">
          <Panel title={t('common.openingHours')} icon={Clock}>
            <OpeningHours hours={b.openingHours} />
          </Panel>
          <LazyMap className="h-64" markers={[toMarker(b, 'business')].filter(Boolean)} />
          {(b.officialWebsite || b.contact?.website || b.contact?.address) && (
            <Panel title={t('place.contact')} icon={Globe}>
              {b.contact?.address && <p className="text-sm">{b.contact.address}</p>}
              {(b.officialWebsite || b.contact?.website) && <a href={b.officialWebsite || b.contact.website} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm text-forest-700 hover:underline">{t('food.website')}</a>}
            </Panel>
          )}
          {b.facilities?.length > 0 && <Panel title={t('place.facilities')}><div className="flex flex-wrap gap-1.5">{b.facilities.map((f) => <Badge key={f}>{f}</Badge>)}</div></Panel>}
        </aside>
      </div>
      {nearby.length > 0 && (
        <div className="container-page">
          <Section title={t('place.nearbyPlaces')}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{nearby.map((n) => <BusinessCard key={n._id} business={n} />)}</div>
          </Section>
        </div>
      )}
    </article>
  );
}
