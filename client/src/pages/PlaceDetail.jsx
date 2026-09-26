import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Sparkles, Route, Link as LinkIcon, Phone, Info } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero, { Gallery } from '../components/detail/DetailHero';
import { InfoBlock, KeyFacts, SafetyPanel, AccessibilityPanel, OpeningHours, hasHours, ValueRow } from '../components/detail/Facts';
import { ActionBar, DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import { ReviewsSection, CommunityUpdates } from '../components/detail/Community';
import WeatherWidget from '../components/detail/Weather';
import SaveButton from '../components/SaveButton';
import Button from '../components/ui/Button';
import Carousel from '../components/ui/Carousel';
import Section from '../components/ui/Section';
import { PlaceCard, BusinessCard, StayCard } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { DetailFallback } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { districtName, localized, inr, formatDate, mapsLink } from '../utils/format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Human label for best months, handling seasons that wrap the year end (e.g. Oct – Mar). */
export function monthsLabel(months = []) {
  const set = new Set(months);
  if (!set.size) return null;
  if (set.size === 12) return 'Jan – Dec';
  const starts = [...set].filter((m) => !set.has(m === 1 ? 12 : m - 1));
  if (starts.length === 1) {
    let end = starts[0];
    while (set.has(end === 12 ? 1 : end + 1)) end = end === 12 ? 1 : end + 1;
    return starts[0] === end ? MONTHS[end - 1] : `${MONTHS[starts[0] - 1]} – ${MONTHS[end - 1]}`;
  }
  return [...set].sort((a, b) => a - b).map((m) => MONTHS[m - 1]).join(', ');
}

export default function PlaceDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['place', slug], queryFn: () => endpoints.place(slug) });

  if (isLoading || error) return <DetailFallback error={error} onRetry={refetch} ErrorComponent={ErrorState} />;

  const { place, notices, updates, reviews, nearby } = data;
  const name = localized(place, 'name', lang);
  const intro = localized(place, 'shortDescription', lang);
  const description = localized(place, 'description', lang);
  const [lng, lat] = place.location.coordinates;
  const fee = place.entryFee || {};
  const gem = place.gemDetails || {};
  const district = districtName(place.district, lang);

  const feeValue = fee.isFree ? t('common.free') : typeof fee.amount === 'number' ? inr(fee.amount) : null;
  const facts = [
    { label: t('place.typicalVisit'), value: place.visitDurationHours ? t('common.hours', { count: place.visitDurationHours }) : null },
    { label: t('common.entryFee'), value: feeValue, verified: feeValue ? Boolean(fee.verified) : undefined },
    { label: t('common.bestTime'), value: monthsLabel(place.bestMonths) || gem.bestTimeToVisit || null },
    { label: t('common.openingHours'), value: place.openingHours?.open24h ? t('place.open24') : hasHours(place.openingHours) ? t('place.seeBelow') : null, verified: hasHours(place.openingHours) ? Boolean(place.openingHours.verified) : undefined },
  ];
  const gemRows = [
    [t('place.accessDifficulty'), gem.accessDifficulty !== 'unknown' && gem.accessDifficulty && t(`levels.${gem.accessDifficulty}`)],
    [t('place.roadCondition'), gem.roadCondition !== 'unknown' && gem.roadCondition && t(`levels.${gem.roadCondition}`)],
    [t('place.parking'), gem.parking && gem.parking !== 'unknown' && t(`tri.${gem.parking}`)],
    [t('place.mobileNetwork'), gem.mobileNetwork !== 'unknown' && gem.mobileNetwork && t(`levels.${gem.mobileNetwork}`)],
    [t('place.monsoonSuitable'), gem.monsoonSuitable && gem.monsoonSuitable !== 'unknown' && t(`tri.${gem.monsoonSuitable}`)],
  ].filter(([, v]) => v);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.name,
    description: place.shortDescription,
    geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng },
    address: { '@type': 'PostalAddress', addressRegion: 'Kerala', addressLocality: place.locality || districtName(place.district), addressCountry: 'IN' },
    ...(place.images?.[0] ? { image: place.images[0].url } : {}),
    ...(place.rating?.count ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: place.rating.average, reviewCount: place.rating.count } } : {}),
  };

  return (
    <article>
      <Seo title={name} description={place.shortDescription} image={place.images?.[0]?.url} type="article" jsonLd={jsonLd} />
      <DetailHero
        doc={place}
        title={name}
        eyebrow={[place.locality, district].filter(Boolean).join(' · ')}
        intro={intro}
        categories={place.categories}
        crumbs={[{ to: '/explore', label: t('nav.discover') }, { to: `/districts/${place.district}`, label: district }, { label: name }]}
      />

      <ActionBar>
        <DirectionsButton doc={place} />
        <SaveButton type="place" doc={place} variant="button" />
        <ShareButton title={name} text={place.shortDescription} />
        <Button variant="ghost" to={`/trip-builder?district=${place.district}`}>
          <Sparkles className="size-4" aria-hidden /> {t('place.addToTrip')}
        </Button>
      </ActionBar>

      <div className="container-page">
        <div className="py-10 sm:py-12">
          <KeyFacts items={facts} />
          {fee.notes && <p className="caption mt-5">{fee.notes}</p>}
        </div>

        <Gallery images={place.images} title={name} />

        <div className="grid gap-12 pt-4 pb-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="min-w-0 space-y-10">
            <InfoBlock title={t('place.about')}>
              {description || intro ? <p className="text-[17px] leading-[1.75] whitespace-pre-line text-ink-soft">{description || intro}</p> : <p className="text-muted italic">{t('common.notAvailable')}</p>}
              {lang === 'ml' && !place.descriptionMl && !place.shortDescriptionMl && <p className="caption mt-2">({t('common.inEnglish')})</p>}
              {place.moods?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {place.moods.map((m) => <Link key={m} to={`/explore?mood=${m}`} className="chip h-8 text-[13px]">{t(`moods.${m}`)}</Link>)}
                </div>
              )}
            </InfoBlock>

            {hasHours(place.openingHours) && (
              <InfoBlock title={t('common.openingHours')}>
                <OpeningHours hours={place.openingHours} />
              </InfoBlock>
            )}

            {place.facilities?.length > 0 && (
              <InfoBlock title={t('place.facilities')}>
                <ul className="flex flex-wrap gap-2">{place.facilities.map((f) => <li key={f} className="chip h-8 text-[13px]">{f}</li>)}</ul>
              </InfoBlock>
            )}

            {place.hiddenGem && gemRows.length > 0 && (
              <InfoBlock title={t('place.gemDetails')}>
                <dl className="divide-y divide-line">{gemRows.map(([label, value]) => <ValueRow key={label} label={label} value={value} />)}</dl>
              </InfoBlock>
            )}

            <SafetyPanel safety={place.safety} notices={notices} />
            <AccessibilityPanel accessibility={place.accessibility} />
            <CommunityUpdates targetType="place" target={place} initial={updates} />
            <ReviewsSection targetType="place" target={place} reviews={reviews} />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
              <span>
                {place.verification?.verifiedAt ? `${t('common.verified')} ${formatDate(place.verification.verifiedAt, lang)} · ` : ''}
                {t('common.lastUpdated', { date: formatDate(place.updatedAt, lang) })}
              </span>
              <ReportButton targetType="place" target={place} />
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
            <div className="overflow-hidden rounded-[var(--radius-panel)] bg-white">
              <LazyMap className="h-64 rounded-none" markers={[toMarker(place, 'place')].filter(Boolean)} />
              <div className="space-y-3 p-5">
                <p className="text-[15px] font-medium">{[place.locality, district].filter(Boolean).join(', ')}</p>
                {place.location.approximate && <p className="flex items-center gap-1.5 text-xs text-muted"><Info className="size-3.5" aria-hidden />{t('common.approximateLocation')}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" href={mapsLink(place)}>{t('common.directions')}</Button>
                  <Button size="sm" variant="secondary" to={`/directions?to=${lng},${lat}&toLabel=${encodeURIComponent(place.name)}&mode=plan`}>
                    <Route className="size-4" aria-hidden /> {t('place.routePlanner')}
                  </Button>
                </div>
              </div>
            </div>
            <WeatherWidget lat={lat} lng={lng} />
            {(place.contact?.phone || place.contact?.website || place.officialLinks?.length > 0) && (
              <div className="rounded-[var(--radius-panel)] bg-white p-6">
                <h2 className="mb-3 text-[15px] font-semibold">{t('place.contact')}</h2>
                <ul className="space-y-2 text-sm">
                  {place.contact?.phone && <li><a href={`tel:${place.contact.phone}`} className="link inline-flex items-center gap-1.5"><Phone className="size-3.5" aria-hidden />{place.contact.phone}</a></li>}
                  {place.contact?.website && <li><a href={place.contact.website} target="_blank" rel="noopener noreferrer" className="link break-all">{place.contact.website}</a></li>}
                  {place.officialLinks?.map((l) => (
                    <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5"><LinkIcon className="size-3.5" aria-hidden />{l.label || l.url}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {nearby.places.length > 0 && (
          <Section title={t('place.nearbyPlaces')} className="border-t border-line">
            <Carousel label={t('place.nearbyPlaces')} itemClass="w-[72%] sm:w-[40%] lg:w-[23.5%]">
              {nearby.places.map((p) => <PlaceCard key={p._id} place={p} showDescription={false} />)}
            </Carousel>
          </Section>
        )}
        {(nearby.food.length > 0 || nearby.stays.length > 0) && (
          <div className="grid gap-10 border-t border-line py-12 md:grid-cols-2 md:gap-16">
            {nearby.food.length > 0 && (
              <div>
                <h2 className="h3 mb-2 text-lg">{t('place.nearbyFood')}</h2>
                <div className="divide-y divide-line">{nearby.food.map((b) => <BusinessCard key={b._id} business={b} variant="compact" />)}</div>
              </div>
            )}
            {nearby.stays.length > 0 && (
              <div>
                <h2 className="h3 mb-2 text-lg">{t('place.nearbyStays')}</h2>
                <div className="divide-y divide-line">{nearby.stays.map((s) => <StayCard key={s._id} stay={s} variant="compact" />)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
