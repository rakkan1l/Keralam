import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Star, CalendarDays, Ticket, IndianRupee, Clock, Utensils, BedDouble } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import SaveButton from '../SaveButton';
import { TrustBadges } from '../ui/Badge';
import Badge from '../ui/Badge';
import { districtName, localized, formatDateRange, inr, cx } from '../../utils/format';

function CardShell({ to, image, alt, categories, kind, seed, overlay, children, className = '' }) {
  return (
    <article className={cx('card group relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]', className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-200">
        <SmartImage image={image} alt={alt} categories={categories} kind={kind} seed={seed} className="transition duration-500 group-hover:scale-[1.03]" />
        {overlay}
      </div>
      <div className="flex flex-1 flex-col p-4">{children}</div>
      {/* Whole-card link; interactive children sit above it with relative z-index. */}
      <Link to={to} className="absolute inset-0 z-0" aria-label={alt}>
        <span className="sr-only">{alt}</span>
      </Link>
    </article>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Icon className="size-3.5" aria-hidden />
      {children}
    </span>
  );
}

export function PlaceCard({ place, className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = localized(place, 'name', lang);
  const fee = place.entryFee || {};
  return (
    <CardShell
      to={`/places/${place.slug}`}
      image={place.images?.[0]}
      alt={name}
      categories={place.categories}
      seed={place.name}
      className={className}
      overlay={
        <>
          <div className="absolute left-3 top-3 z-10">
            <TrustBadges doc={place} compact onImage />
          </div>
          <SaveButton type="place" doc={place} className="absolute right-3 top-3 z-10" />
        </>
      }
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-sans text-base font-semibold leading-snug text-forest-950">{name}</h3>
        {place.rating?.count > 0 && (
          <span className="inline-flex items-center gap-0.5 text-sm font-medium">
            <Star className="size-4 fill-turmeric-400 text-turmeric-400" aria-hidden />
            {place.rating.average.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Meta icon={MapPin}>{districtName(place.district, lang)}</Meta>
        {place.distanceKm != null && <Meta icon={MapPin}>{t('common.kmAway', { km: place.distanceKm })}</Meta>}
        {place.categories?.[0] && <span className="text-xs text-muted">· {t(`categories.${place.categories[0]}`)}</span>}
      </div>
      {place.shortDescription && <p className="mt-2 line-clamp-2 text-sm text-muted">{localized(place, 'shortDescription', lang)}</p>}
      <div className="mt-auto flex items-center justify-between pt-3 text-xs">
        <span className="text-forest-800">
          {fee.isFree ? t('common.free') : typeof fee.amount === 'number' ? `${t('common.entryFee')}: ${inr(fee.amount)}` : ''}
          {fee.isFree || typeof fee.amount === 'number' ? (fee.verified ? '' : ` (${t('common.estimated').toLowerCase()})`) : ''}
        </span>
        <span className="relative z-10 font-medium text-forest-700 group-hover:underline">{t('common.viewDetails')}</span>
      </div>
    </CardShell>
  );
}

export function BusinessCard({ business, className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <CardShell
      to={`/listings/${business.slug}`}
      image={business.images?.[0]}
      alt={localized(business, 'name', lang)}
      kind={business.kind}
      seed={business.name}
      className={className}
      overlay={
        <>
          <div className="absolute left-3 top-3 z-10"><TrustBadges doc={business} compact onImage /></div>
          <SaveButton type="business" doc={business} className="absolute right-3 top-3 z-10" />
        </>
      }
    >
      <h3 className="font-sans text-base font-semibold leading-snug">{localized(business, 'name', lang)}</h3>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        <Meta icon={Utensils}>{t(`businessKinds.${business.kind}`)}</Meta>
        <Meta icon={MapPin}>{districtName(business.district, lang)}</Meta>
        {business.distanceKm != null && <Meta icon={MapPin}>{t('common.kmAway', { km: business.distanceKm })}</Meta>}
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {business.priceRange && business.priceRange !== 'unknown' && <Badge tone="green" icon={IndianRupee}>{t(`price.${business.priceRange}`)}</Badge>}
        {business.food?.categories?.slice(0, 2).map((c) => (
          <Badge key={c}>{t(`foodCategories.${c}`)}</Badge>
        ))}
        {business.food?.lateNight && <Badge tone="blue" icon={Clock}>{t('foodCategories.late-night')}</Badge>}
      </div>
    </CardShell>
  );
}

export function StayCard({ stay, className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <CardShell
      to={`/stays/${stay.slug}`}
      image={stay.images?.[0]}
      alt={localized(stay, 'name', lang)}
      kind={stay.type}
      seed={stay.name}
      className={className}
      overlay={
        <>
          <div className="absolute left-3 top-3 z-10"><TrustBadges doc={stay} compact onImage /></div>
          <SaveButton type="stay" doc={stay} className="absolute right-3 top-3 z-10" />
        </>
      }
    >
      <h3 className="font-sans text-base font-semibold leading-snug">{localized(stay, 'name', lang)}</h3>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        <Meta icon={BedDouble}>{t(`stayTypes.${stay.type}`)}</Meta>
        <Meta icon={MapPin}>{districtName(stay.district, lang)}</Meta>
        {stay.distanceKm != null && <Meta icon={MapPin}>{t('common.kmAway', { km: stay.distanceKm })}</Meta>}
      </div>
      <p className="mt-auto pt-3 text-sm font-medium text-forest-800">
        {stay.priceVerified && stay.priceFrom ? t('stays.priceFrom', { amount: stay.priceFrom.toLocaleString('en-IN') }) : t(`price.${stay.priceBand || 'unknown'}`)}
      </p>
    </CardShell>
  );
}

export function EventCard({ event, className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <CardShell
      to={`/events/${event.slug}`}
      image={event.images?.[0]}
      alt={localized(event, 'title', lang)}
      kind="event"
      seed={event.title}
      className={className}
      overlay={
        <>
          <div className="absolute left-3 top-3 z-10"><TrustBadges doc={event} compact onImage /></div>
          <SaveButton type="event" doc={event} className="absolute right-3 top-3 z-10" />
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-forest-900">{t(`eventCategories.${event.category}`)}</span>
        </>
      }
    >
      <h3 className="font-sans text-base font-semibold leading-snug">{localized(event, 'title', lang)}</h3>
      <div className="mt-1.5 flex flex-col gap-1">
        <Meta icon={CalendarDays}>{formatDateRange(event.startDate, event.endDate, lang)}</Meta>
        <Meta icon={MapPin}>
          {event.venue ? `${event.venue}, ` : ''}
          {districtName(event.district, lang)}
        </Meta>
      </div>
      <div className="mt-auto pt-3">
        <Badge tone={event.ticketStatus === 'free' ? 'green' : 'neutral'} icon={Ticket}>{t(`events.ticket.${event.ticketStatus || 'unknown'}`)}</Badge>
      </div>
    </CardShell>
  );
}

export function DishCard({ dish, className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <CardShell to={`/food/dishes/${dish.slug}`} image={dish.images?.[0]} alt={localized(dish, 'name', lang)} kind="dish" seed={dish.name} className={className} overlay={<SaveButton type="dish" doc={dish} className="absolute right-3 top-3 z-10" />}>
      <h3 className="font-sans text-base font-semibold leading-snug">{localized(dish, 'name', lang)}</h3>
      {lang !== 'ml' && dish.nameMl && <p className="text-sm text-muted">{dish.nameMl}</p>}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
        {dish.region && <Badge tone="blue">{dish.region}</Badge>}
        {dish.dietary?.includes('vegetarian') && <Badge tone="green">{t('foodCategories.vegetarian')}</Badge>}
      </div>
    </CardShell>
  );
}

/** Pick the right card for a {targetType, item} pair (saved lists, search). */
export function AnyCard({ type, item }) {
  if (!item) return null;
  if (type === 'place') return <PlaceCard place={item} />;
  if (type === 'business') return <BusinessCard business={item} />;
  if (type === 'stay') return <StayCard stay={item} />;
  if (type === 'event') return <EventCard event={item} />;
  if (type === 'dish') return <DishCard dish={item} />;
  return null;
}
