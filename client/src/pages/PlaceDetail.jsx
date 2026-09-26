import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Clock, IndianRupee, CalendarRange, Gem, Info, Link as LinkIcon, Phone, Sparkles, Route } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero from '../components/detail/DetailHero';
import { Panel, SafetyPanel, AccessibilityPanel, OpeningHours, ValueRow, TriRow } from '../components/detail/Facts';
import { DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import { ReviewsSection, CommunityUpdates } from '../components/detail/Community';
import WeatherWidget from '../components/detail/Weather';
import SaveButton from '../components/SaveButton';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { PlaceCard, BusinessCard, StayCard } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import Section from '../components/ui/Section';
import { endpoints } from '../services/api';
import { districtName, localized, inr, formatDate } from '../utils/format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PlaceDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['place', slug], queryFn: () => endpoints.place(slug) });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;

  const { place, notices, updates, reviews, nearby } = data;
  const name = localized(place, 'name', lang);
  const description = localized(place, 'description', lang) || localized(place, 'shortDescription', lang);
  const [lng, lat] = place.location.coordinates;
  const fee = place.entryFee || {};
  const gem = place.gemDetails || {};

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.name,
    description: place.shortDescription,
    geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng },
    address: { '@type': 'PostalAddress', addressRegion: 'Kerala', addressLocality: place.locality || districtName(place.district), addressCountry: 'IN' },
    ...(place.images?.[0] ? { image: place.images[0].url } : {}),
    ...(place.rating?.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: place.rating.average, reviewCount: place.rating.count } } : {}),
    isAccessibleForFree: fee.isFree && fee.verified ? true : undefined,
  };

  return (
    <article>
      <Seo title={name} description={place.shortDescription} image={place.images?.[0]?.url} type="article" jsonLd={jsonLd} />
      <DetailHero
        doc={place}
        title={name}
        subtitle={`${place.locality ? `${place.locality}, ` : ''}${districtName(place.district, lang)}`}
        categories={place.categories}
        crumbs={[{ to: '/explore', label: t('nav.explore') }, { to: `/districts/${place.district}`, label: districtName(place.district, lang) }, { label: name }]}
        meta={place.categories?.map((c) => <Badge key={c} tone="light">{t(`categories.${c}`)}</Badge>)}
      />

      <div className="container-page mt-6 flex flex-wrap items-center gap-2">
        <DirectionsButton doc={place} />
        <SaveButton type="place" doc={place} variant="button" />
        <ShareButton title={name} text={place.shortDescription} />
        <Button variant="secondary" to={`/directions?to=${lng},${lat}&toLabel=${encodeURIComponent(place.name)}`}>
          <Route className="size-4" aria-hidden /> {t('place.routePlanner')}
        </Button>
        <Button variant="ghost" to={`/trip-builder?district=${place.district}`}>
          <Sparkles className="size-4" aria-hidden /> {t('place.addToTrip')}
        </Button>
      </div>

      <div className="container-page mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-3 text-xl">{t('place.about')}</h2>
            {description ? <p className="whitespace-pre-line leading-relaxed text-forest-900">{description}</p> : <p className="text-muted">{t('common.notAvailable')}</p>}
            {lang === 'ml' && !place.descriptionMl && !place.shortDescriptionMl && <p className="mt-2 text-xs text-muted">(English)</p>}
            {place.moods?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {place.moods.map((m) => (
                  <Link key={m} to={`/explore?mood=${m}`} className="chip py-1 text-xs">{t(`moods.${m}`)}</Link>
                ))}
              </div>
            )}
            {place.location.approximate && <p className="mt-4 flex items-center gap-1.5 text-xs text-muted"><Info className="size-3.5" aria-hidden />{t('common.approximateLocation')}</p>}
          </section>

          {place.hiddenGem && (
            <Panel title={t('place.gemDetails')} icon={Gem}>
              <dl className="divide-y divide-sand-200">
                <ValueRow label={t('place.accessDifficulty')} value={gem.accessDifficulty !== 'unknown' ? t(`levels.${gem.accessDifficulty}`) : null} />
                <ValueRow label={t('place.roadCondition')} value={gem.roadCondition && gem.roadCondition !== 'unknown' ? t(`levels.${gem.roadCondition}`) : null} />
                <TriRow label={t('place.parking')} value={gem.parking} />
                <ValueRow label={t('place.mobileNetwork')} value={gem.mobileNetwork && gem.mobileNetwork !== 'unknown' ? t(`levels.${gem.mobileNetwork}`) : null} />
                <TriRow label={t('place.monsoonSuitable')} value={gem.monsoonSuitable} />
                <TriRow label={t('place.nightAccessRestricted')} value={place.safety?.nightAccessRestricted} invert />
                <ValueRow label={t('common.bestTime')} value={gem.bestTimeToVisit} />
              </dl>
            </Panel>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <SafetyPanel safety={place.safety} notices={notices} />
            <AccessibilityPanel accessibility={place.accessibility} />
          </div>

          <CommunityUpdates targetType="place" target={place} initial={updates} />
          <ReviewsSection targetType="place" target={place} reviews={reviews} />
          <ReportButton targetType="place" target={place} />
        </div>

        <aside className="space-y-6">
          <Panel title={t('place.plan')} icon={Clock}>
            <dl className="divide-y divide-sand-200">
              <ValueRow label={t('place.typicalVisit')} value={place.visitDurationHours ? t('common.hours', { count: place.visitDurationHours }) : null} />
              <ValueRow
                label={t('common.entryFee')}
                value={fee.isFree ? `${t('common.free')}${fee.verified ? '' : ` (${t('common.unverified').toLowerCase()})`}` : typeof fee.amount === 'number' ? `${inr(fee.amount)}${fee.verified ? '' : ` (${t('common.unverified').toLowerCase()})`}` : null}
                unknown={t('place.noFee')}
              />
              <ValueRow label={t('common.bestTime')} value={place.bestMonths?.length ? place.bestMonths.map((m) => MONTHS[m - 1]).join(', ') : null} />
              <ValueRow label={t('common.budget')} value={place.budgetLevel && place.budgetLevel !== 'unknown' ? t(`budget.${place.budgetLevel}`) : null} />
            </dl>
            {fee.notes && <p className="mt-2 flex gap-1.5 text-xs text-muted"><IndianRupee className="size-3.5 shrink-0" aria-hidden />{fee.notes}</p>}
            <div className="mt-4">
              <h3 className="mb-2 flex items-center gap-1.5 font-sans text-sm font-semibold"><CalendarRange className="size-4" aria-hidden />{t('common.openingHours')}</h3>
              <OpeningHours hours={place.openingHours} />
            </div>
          </Panel>

          <LazyMap className="h-64" markers={[toMarker(place, 'place')].filter(Boolean)} />
          <WeatherWidget lat={lat} lng={lng} />

          {(place.contact?.phone || place.contact?.website || place.officialLinks?.length > 0) && (
            <Panel title={t('place.contact')} icon={Phone}>
              <ul className="space-y-2 text-sm">
                {place.contact?.phone && <li><a href={`tel:${place.contact.phone}`} className="text-forest-700 hover:underline">{place.contact.phone}</a></li>}
                {place.contact?.website && <li><a href={place.contact.website} target="_blank" rel="noopener noreferrer" className="text-forest-700 hover:underline">{place.contact.website}</a></li>}
                {place.officialLinks?.map((l) => (
                  <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-forest-700 hover:underline"><LinkIcon className="size-3.5" aria-hidden />{l.label || l.url}</a></li>
                ))}
              </ul>
            </Panel>
          )}
          {place.facilities?.length > 0 && (
            <Panel title={t('place.facilities')}>
              <div className="flex flex-wrap gap-1.5">{place.facilities.map((f) => <Badge key={f}>{f}</Badge>)}</div>
            </Panel>
          )}
          {place.verification?.verifiedAt && <p className="text-xs text-muted">{t('common.verified')} · {formatDate(place.verification.verifiedAt, lang)}</p>}
          <p className="text-xs text-muted">{t('common.lastUpdated', { date: formatDate(place.updatedAt, lang) })}</p>
        </aside>
      </div>

      <div className="container-page">
        {nearby.places.length > 0 && (
          <Section title={t('place.nearbyPlaces')}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{nearby.places.map((p) => <PlaceCard key={p._id} place={p} />)}</div>
          </Section>
        )}
        {nearby.food.length > 0 && (
          <Section title={t('place.nearbyFood')}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{nearby.food.map((b) => <BusinessCard key={b._id} business={b} />)}</div>
          </Section>
        )}
        {nearby.stays.length > 0 && (
          <Section title={t('place.nearbyStays')}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{nearby.stays.map((s) => <StayCard key={s._id} stay={s} />)}</div>
          </Section>
        )}
      </div>
    </article>
  );
}
