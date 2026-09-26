import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Phone } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero, { Gallery } from '../components/detail/DetailHero';
import { InfoBlock, KeyFacts, AccessibilityPanel, NoticeList } from '../components/detail/Facts';
import { ActionBar, DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import { ReviewsSection } from '../components/detail/Community';
import SaveButton from '../components/SaveButton';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import { StayCard, CARD_GRID } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { DetailFallback } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { districtName, localized, inr } from '../utils/format';

export default function StayDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['stay', slug], queryFn: () => endpoints.stay(slug) });
  if (isLoading || error) return <DetailFallback error={error} onRetry={refetch} ErrorComponent={ErrorState} />;
  const { stay, notices, reviews, nearby } = data;
  const name = localized(stay, 'name', lang);
  const [lng, lat] = stay.location.coordinates;
  const district = districtName(stay.district, lang);
  const booking = stay.bookingLinks?.[0];
  const facts = [
    { label: t('common.category'), value: t(`stayTypes.${stay.type}`) },
    { label: t('food.priceRange'), value: stay.priceBand && stay.priceBand !== 'unknown' ? t(`price.${stay.priceBand}`) : null },
    { label: t('stays.priceFromLabel'), value: stay.priceFrom ? inr(stay.priceFrom) : null, verified: stay.priceFrom ? Boolean(stay.priceVerified) : undefined },
    { label: t('stays.traveller'), value: stay.travellerTypes?.map((x) => t(`stays.travellers.${x}`)).join(', ') || null },
  ];
  return (
    <article>
      <Seo title={name} description={stay.description} jsonLd={{ '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: stay.name, geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }, address: { '@type': 'PostalAddress', addressLocality: districtName(stay.district), addressRegion: 'Kerala', addressCountry: 'IN' } }} />
      <DetailHero size="md" doc={stay} title={name} eyebrow={`${t(`stayTypes.${stay.type}`)} · ${district}`} kind={stay.type} crumbs={[{ to: '/stays', label: t('nav.stays') }, { label: name }]} />
      <ActionBar>
        {booking ? <Button href={booking.url}><ExternalLink className="size-4" aria-hidden />{t('stays.book')}</Button> : <DirectionsButton doc={stay} />}
        <SaveButton type="stay" doc={stay} variant="button" />
        <ShareButton title={name} />
        {booking && <DirectionsButton doc={stay} variant="secondary" />}
      </ActionBar>
      <div className="container-page">
        <div className="py-10"><KeyFacts items={facts} /></div>
        <Gallery images={stay.images} title={name} />
        <div className="grid gap-12 pt-4 pb-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="min-w-0 space-y-10">
            <InfoBlock title={t('place.about')}>
              {notices.length > 0 && <NoticeList notices={notices} />}
              <p className="text-[17px] leading-[1.75] text-ink-soft">{localized(stay, 'description', lang) || t('common.notAvailable')}</p>
              {stay.experiences?.length > 0 && <ul className="mt-5 flex flex-wrap gap-2">{stay.experiences.map((x) => <li key={x} className="chip h-8 text-[13px]">{t(`stays.experiences.${x}`)}</li>)}</ul>}
            </InfoBlock>
            <InfoBlock title={t('stays.facilities')}>
              {stay.facilities?.length ? <ul className="flex flex-wrap gap-2">{stay.facilities.map((f) => <li key={f} className="chip h-8 text-[13px]">{t(`stays.facilityNames.${f}`, { defaultValue: f })}</li>)}</ul> : <p className="text-muted italic">{t('common.notAvailable')}</p>}
            </InfoBlock>
            <AccessibilityPanel accessibility={stay.accessibility} />
            <ReviewsSection targetType="stay" target={stay} reviews={reviews} />
            <div className="border-t border-line pt-6"><ReportButton targetType="stay" target={stay} /></div>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
            <div className="rounded-[var(--radius-panel)] bg-white p-6">
              <h2 className="mb-3 text-[15px] font-semibold">{t('stays.bookingTitle')}</h2>
              {stay.bookingLinks?.length ? (
                <ul className="space-y-2">{stay.bookingLinks.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5 text-sm"><ExternalLink className="size-4" aria-hidden />{l.label || t('stays.book')}</a></li>)}</ul>
              ) : (
                <p className="text-sm text-muted">{t('stays.noBookingLink')}</p>
              )}
              {stay.contact?.phone && <a href={`tel:${stay.contact.phone}`} className="link mt-3 inline-flex items-center gap-1.5 text-sm"><Phone className="size-4" aria-hidden />{stay.contact.phone}</a>}
            </div>
            <LazyMap className="h-60" markers={[toMarker(stay, 'stay')].filter(Boolean)} />
          </aside>
        </div>
        {nearby.length > 0 && (
          <Section title={t('place.nearbyStays')} className="border-t border-line">
            <div className={CARD_GRID}>{nearby.slice(0, 3).map((s) => <StayCard key={s._id} stay={s} />)}</div>
          </Section>
        )}
      </div>
    </article>
  );
}
