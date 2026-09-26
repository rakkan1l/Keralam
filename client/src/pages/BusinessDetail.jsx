import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Phone, Globe, Siren, Film } from 'lucide-react';
import Seo from '../components/Seo';
import DetailHero, { Gallery } from '../components/detail/DetailHero';
import { InfoBlock, KeyFacts, OpeningHours, hasHours, AccessibilityPanel, NoticeList } from '../components/detail/Facts';
import { ActionBar, DirectionsButton, ShareButton, ReportButton } from '../components/detail/Actions';
import { ReviewsSection, CommunityUpdates } from '../components/detail/Community';
import SaveButton from '../components/SaveButton';
import Button from '../components/ui/Button';
import Section from '../components/ui/Section';
import { BusinessCard, CARD_GRID } from '../components/cards/Cards';
import LazyMap, { toMarker } from '../components/map/LazyMap';
import { DetailFallback } from '../components/ui/PageLoader';
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
  if (isLoading || error) return <DetailFallback error={error} onRetry={refetch} ErrorComponent={ErrorState} />;
  const { business: b, notices, updates, reviews, nearby } = data;
  const name = localized(b, 'name', lang);
  const isFood = FOOD.includes(b.kind);
  const isService = SERVICES.includes(b.kind);
  const section = isFood ? ['/food?tab=places', t('nav.food')] : b.kind === 'theatre' ? ['/theatres', t('nav.theatres')] : isService ? ['/near-me', t('nav.nearMe')] : SECTIONS_FOR(b.kind, t);
  const [lng, lat] = b.location.coordinates;
  const district = districtName(b.district, lang);

  const facts = [
    { label: t('common.category'), value: t(`businessKinds.${b.kind}`) },
    { label: t('food.priceRange'), value: b.priceRange && b.priceRange !== 'unknown' ? t(`price.${b.priceRange}`) : null },
    { label: t('common.openingHours'), value: b.openingHours?.open24h ? t('place.open24') : hasHours(b.openingHours) ? t('place.seeBelow') : null, verified: hasHours(b.openingHours) ? Boolean(b.openingHours.verified) : undefined },
    isFood ? { label: t('food.cuisines'), value: b.food?.cuisines?.join(', ') || null } : { label: t('common.district'), value: district },
  ];

  return (
    <article>
      <Seo
        title={name}
        description={b.description}
        jsonLd={{ '@context': 'https://schema.org', '@type': isFood ? 'Restaurant' : 'LocalBusiness', name: b.name, geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }, address: { '@type': 'PostalAddress', addressLocality: districtName(b.district), addressRegion: 'Kerala', addressCountry: 'IN' }, ...(b.food?.cuisines?.length ? { servesCuisine: b.food.cuisines } : {}) }}
      />
      <DetailHero size="md" doc={b} title={name} eyebrow={`${t(`businessKinds.${b.kind}`)} · ${[b.locality, district].filter(Boolean).join(', ')}`} kind={b.kind} crumbs={[{ to: section[0], label: section[1] }, { label: name }]} />
      <ActionBar>
        <DirectionsButton doc={b} />
        <SaveButton type="business" doc={b} variant="button" />
        <ShareButton title={name} />
        {b.contact?.phone && <Button variant="secondary" href={`tel:${b.contact.phone}`}><Phone className="size-4" aria-hidden />{b.contact.phone}</Button>}
      </ActionBar>

      <div className="container-page">
        {isService && (
          <p className="mt-8 flex items-center gap-2 rounded-2xl bg-laterite-50 px-4 py-3 text-sm text-laterite-700">
            <Siren className="size-4 shrink-0" aria-hidden /> {t('nearby.demoServicesNote')} <Link to="/help" className="font-semibold underline">{t('nav.emergencyAssistance')}</Link>
          </p>
        )}
        <div className="py-10"><KeyFacts items={facts} /></div>
        <Gallery images={b.images} title={name} />
        <div className="grid gap-12 pt-4 pb-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div className="min-w-0 space-y-10">
            <InfoBlock title={t('place.about')}>
              {notices.length > 0 && <NoticeList notices={notices} />}
              <p className="text-[17px] leading-[1.75] text-ink-soft">{localized(b, 'description', lang) || t('common.notAvailable')}</p>
              {isFood && b.food?.categories?.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">{b.food.categories.map((c) => <li key={c}><Link to={`/food?tab=places&category=${c}`} className="chip h-8 text-[13px]">{t(`foodCategories.${c}`)}</Link></li>)}</ul>
              )}
              {b.food?.signatureDishes?.length > 0 && (
                <p className="mt-4 text-sm text-muted">{t('food.signature')}: {b.food.signatureDishes.map((d, i) => <span key={d._id}>{i > 0 && ', '}<Link to={`/food/dishes/${d.slug}`} className="link">{d.name}</Link></span>)}</p>
              )}
            </InfoBlock>
            {hasHours(b.openingHours) && <InfoBlock title={t('common.openingHours')}><OpeningHours hours={b.openingHours} /></InfoBlock>}
            {b.kind === 'theatre' && (
              <InfoBlock title={t('sections.theatres.showtimes')}>
                <p className="text-[15px] text-ink-soft">
                  {[b.theatre?.languages?.join(', '), b.theatre?.screens && `${b.theatre.screens} ${t('sections.theatres.screens').toLowerCase()}`, b.theatre?.parking].filter(Boolean).join(' · ')}
                </p>
                {b.theatre?.showtimesUrl ? <Button href={b.theatre.showtimesUrl} className="mt-4" size="sm"><Film className="size-4" aria-hidden />{t('sections.theatres.showtimes')}</Button> : <p className="mt-3 text-sm text-muted italic">{t('sections.theatres.noShowtimes')}</p>}
              </InfoBlock>
            )}
            {b.facilities?.length > 0 && <InfoBlock title={t('place.facilities')}><ul className="flex flex-wrap gap-2">{b.facilities.map((f) => <li key={f} className="chip h-8 text-[13px]">{f}</li>)}</ul></InfoBlock>}
            <AccessibilityPanel accessibility={b.accessibility} />
            <CommunityUpdates targetType="business" target={b} initial={updates} />
            <ReviewsSection targetType="business" target={b} reviews={reviews} />
            <div className="border-t border-line pt-6"><ReportButton targetType="business" target={b} /></div>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
            <div className="overflow-hidden rounded-[var(--radius-panel)] bg-white">
              <LazyMap className="h-60 rounded-none" markers={[toMarker(b, 'business')].filter(Boolean)} />
              <div className="space-y-2 p-5 text-sm">
                <p className="text-[15px] font-medium">{b.contact?.address || [b.locality, district].filter(Boolean).join(', ')}</p>
                {(b.officialWebsite || b.contact?.website) && <a href={b.officialWebsite || b.contact.website} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5"><Globe className="size-4" aria-hidden />{t('food.website')}</a>}
              </div>
            </div>
          </aside>
        </div>
        {nearby.length > 0 && (
          <Section title={t('place.nearbyPlaces')} className="border-t border-line">
            <div className={CARD_GRID}>{nearby.slice(0, 3).map((n) => <BusinessCard key={n._id} business={n} />)}</div>
          </Section>
        )}
      </div>
    </article>
  );
}

function SECTIONS_FOR(kind, t) {
  const shopping = ['mall', 'market', 'street-shopping', 'handicrafts', 'souvenirs', 'spices', 'clothing', 'tea-coffee', 'local-specialties'];
  return shopping.includes(kind) ? ['/shopping', t('nav.shopping')] : ['/activities', t('nav.activities')];
}
