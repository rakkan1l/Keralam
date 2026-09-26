import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BedDouble, ExternalLink, Phone } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero from '../components/detail/DetailHero';
import { Panel, ValueRow, AccessibilityPanel, NoticeList } from '../components/detail/Facts';
import { DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import { ReviewsSection } from '../components/detail/Community';
import SaveButton from '../components/SaveButton';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import { StayCard } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { PageLoader } from '../components/ui/PageLoader';
import { ErrorState } from '../components/ui/States';
import { endpoints } from '../services/api';
import { districtName, localized, inr } from '../utils/format';

export default function StayDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['stay', slug], queryFn: () => endpoints.stay(slug) });
  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={refetch} /></div>;
  const { stay, notices, reviews, nearby } = data;
  const name = localized(stay, 'name', lang);
  const [lng, lat] = stay.location.coordinates;
  return (
    <article>
      <Seo title={name} description={stay.description} jsonLd={{ '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: stay.name, geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }, address: { '@type': 'PostalAddress', addressLocality: districtName(stay.district), addressRegion: 'Kerala', addressCountry: 'IN' } }} />
      <DetailHero doc={stay} title={name} subtitle={districtName(stay.district, lang)} kind={stay.type} crumbs={[{ to: '/stays', label: t('nav.stays') }, { label: name }]} meta={<Badge tone="light">{t(`stayTypes.${stay.type}`)}</Badge>} />
      <div className="container-page mt-6 flex flex-wrap gap-2">
        {stay.bookingLinks?.[0] && <Button href={stay.bookingLinks[0].url} variant="accent"><ExternalLink className="size-4" aria-hidden />{t('stays.book')}</Button>}
        <DirectionsButton doc={stay} variant={stay.bookingLinks?.[0] ? 'secondary' : 'primary'} />
        <SaveButton type="stay" doc={stay} variant="button" />
        <ShareButton title={name} />
      </div>
      <div className="container-page mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-2 text-xl">{t('place.about')}</h2>
            <p className="leading-relaxed">{localized(stay, 'description', lang) || t('common.notAvailable')}</p>
            {notices.length > 0 && <div className="mt-4"><NoticeList notices={notices} /></div>}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {stay.travellerTypes?.map((x) => <Badge key={x} tone="blue">{x}</Badge>)}
              {stay.experiences?.map((x) => <Badge key={x} tone="green">{x}</Badge>)}
            </div>
          </section>
          <AccessibilityPanel accessibility={stay.accessibility} />
          <ReviewsSection targetType="stay" target={stay} reviews={reviews} />
          <ReportButton targetType="stay" target={stay} />
        </div>
        <aside className="space-y-6">
          <Panel title={t('stays.title')} icon={BedDouble}>
            <dl className="divide-y divide-sand-200">
              <ValueRow label={t('food.priceRange')} value={stay.priceBand && stay.priceBand !== 'unknown' ? t(`price.${stay.priceBand}`) : null} />
              <ValueRow label={t('stays.priceFromLabel')} value={stay.priceVerified && stay.priceFrom ? inr(stay.priceFrom) : null} unknown={t('stays.priceUnverified')} />
            </dl>
            <div className="mt-3">
              <h3 className="mb-2 text-sm font-semibold">{t('stays.facilities')}</h3>
              <div className="flex flex-wrap gap-1.5">{stay.facilities?.length ? stay.facilities.map((f) => <Badge key={f}>{f}</Badge>) : <span className="text-sm italic text-muted">{t('common.notAvailable')}</span>}</div>
            </div>
            <div className="mt-4 space-y-2">
              {stay.bookingLinks?.length ? (
                stay.bookingLinks.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:underline"><ExternalLink className="size-4" aria-hidden />{l.label || t('stays.book')}</a>)
              ) : (
                <p className="text-sm italic text-muted">{t('stays.noBookingLink')}</p>
              )}
              {stay.contact?.phone && <a href={`tel:${stay.contact.phone}`} className="flex items-center gap-1.5 text-sm text-forest-700"><Phone className="size-4" aria-hidden />{stay.contact.phone}</a>}
            </div>
          </Panel>
          <LazyMap className="h-64" markers={[toMarker(stay, 'stay')].filter(Boolean)} />
        </aside>
      </div>
      {nearby.length > 0 && (
        <div className="container-page">
          <Section title={t('place.nearbyStays')}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{nearby.map((s) => <StayCard key={s._id} stay={s} />)}</div>
          </Section>
        </div>
      )}
    </article>
  );
}
