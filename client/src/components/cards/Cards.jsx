import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowRight, MapPin } from 'lucide-react';
import SmartImage from '../ui/SmartImage';
import SaveButton from '../SaveButton';
import { TrustBadges } from '../ui/Badge';
import { districtName, localized, formatDate, cx } from '../../utils/format';

/**
 * Card family. Image-first and borderless: the photo carries the card, text sits
 * below it. Variants:
 *   standard — grid card (default)
 *   feature  — tall image with overlaid text (editorial highlights)
 *   compact  — horizontal row for dense lists
 */

function Media({ image, alt, categories, kind, seed, ratio = 'aspect-[4/3]', children, rounded = 'rounded-[var(--radius-card)]' }) {
  return (
    <div className={cx('relative overflow-hidden bg-sand-200', ratio, rounded)}>
      <SmartImage image={image} alt={alt} categories={categories} kind={kind} seed={seed} className="img-zoom" />
      {children}
    </div>
  );
}

function Meta({ children }) {
  return <p className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">{children}</p>;
}
const Dot = () => <span aria-hidden>·</span>;

function Rating({ rating }) {
  if (!rating?.count) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[13px] font-medium text-ink">
      <Star className="size-3.5 fill-turmeric-400 text-turmeric-400" aria-hidden />
      {rating.average.toFixed(1)}
    </span>
  );
}

function Overlays({ doc, type }) {
  return (
    <>
      <div className="absolute top-3 left-3 z-10">
        <TrustBadges doc={doc} compact onImage />
      </div>
      <SaveButton type={type} doc={doc} className="absolute top-3 right-3 z-10" />
    </>
  );
}

/** Generic compact row used by any entity. */
function CompactRow({ to, title, meta, image, categories, kind, seed, doc, type }) {
  return (
    <article className="group relative flex min-w-0 items-center gap-4 py-3">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand-200">
        <SmartImage image={image} alt={title} categories={categories} kind={kind} seed={seed} className="img-zoom" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold">
          <Link to={to} className="after:absolute after:inset-0">{title}</Link>
        </h3>
        <Meta>{meta}</Meta>
      </div>
      {doc && <SaveButton type={type} doc={doc} className="relative z-10 shrink-0 bg-sand-100 shadow-none" />}
    </article>
  );
}

export function PlaceCard({ place, variant = 'standard', showDescription = true, className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = localized(place, 'name', lang);
  const to = `/places/${place.slug}`;
  const district = districtName(place.district, lang);
  const category = place.categories?.[0] ? t(`categories.${place.categories[0]}`) : null;
  const desc = localized(place, 'shortDescription', lang);

  if (variant === 'compact') {
    return (
      <CompactRow
        to={to}
        title={name}
        image={place.images?.[0]}
        categories={place.categories}
        seed={place.name}
        doc={place}
        type="place"
        meta={<>{district}{category && <><Dot />{category}</>}{place.distanceKm != null && <><Dot />{t('common.kmAway', { km: place.distanceKm })}</>}</>}
      />
    );
  }

  if (variant === 'feature') {
    return (
      <article className={cx('group relative isolate overflow-hidden rounded-[var(--radius-panel)] bg-forest-900', className)}>
        <div className="absolute inset-0 -z-10">
          <SmartImage image={place.images?.[0]} alt={name} categories={place.categories} seed={place.name} className="img-zoom" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/25 to-transparent" />
        </div>
        <Overlays doc={place} type="place" />
        <div className="flex h-full min-h-[22rem] flex-col justify-end p-5 text-white sm:p-7">
          <p className="text-xs font-medium tracking-wide text-white/80 uppercase">{district}</p>
          <h3 className="mt-1 font-display text-2xl leading-tight font-normal text-white sm:text-[1.75rem]">
            <Link to={to} className="after:absolute after:inset-0">{name}</Link>
          </h3>
          {showDescription && desc && <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/85">{desc}</p>}
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
            {t('common.viewDetails')} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className={cx('group relative', className)}>
      <Media image={place.images?.[0]} alt={name} categories={place.categories} seed={place.name}>
        <Overlays doc={place} type="place" />
      </Media>
      <div className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="h3">
            <Link to={to} className="after:absolute after:inset-0">{name}</Link>
          </h3>
          <Rating rating={place.rating} />
        </div>
        <Meta>
          {district}
          {category && <><Dot />{category}</>}
          {place.distanceKm != null && <><Dot /><MapPin className="size-3" aria-hidden />{t('common.kmAway', { km: place.distanceKm })}</>}
        </Meta>
        {showDescription && desc && <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{desc}</p>}
      </div>
    </article>
  );
}

export function BusinessCard({ business, variant = 'standard', className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = localized(business, 'name', lang);
  const to = `/listings/${business.slug}`;
  const meta = (
    <>
      {t(`businessKinds.${business.kind}`)}
      <Dot />
      {districtName(business.district, lang)}
      {business.priceRange && business.priceRange !== 'unknown' && <><Dot />{t(`price.${business.priceRange}`)}</>}
      {business.distanceKm != null && <><Dot />{t('common.kmAway', { km: business.distanceKm })}</>}
    </>
  );
  if (variant === 'compact') return <CompactRow to={to} title={name} meta={meta} image={business.images?.[0]} kind={business.kind} seed={business.name} doc={business} type="business" />;
  return (
    <article className={cx('group relative', className)}>
      <Media image={business.images?.[0]} alt={name} kind={business.kind} seed={business.name}>
        <Overlays doc={business} type="business" />
      </Media>
      <div className="mt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="h3"><Link to={to} className="after:absolute after:inset-0">{name}</Link></h3>
          <Rating rating={business.rating} />
        </div>
        <Meta>{meta}</Meta>
      </div>
    </article>
  );
}

export function StayCard({ stay, variant = 'standard', className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = localized(stay, 'name', lang);
  const to = `/stays/${stay.slug}`;
  const price = stay.priceVerified && stay.priceFrom ? t('stays.priceFrom', { amount: stay.priceFrom.toLocaleString('en-IN') }) : stay.priceBand && stay.priceBand !== 'unknown' ? t(`price.${stay.priceBand}`) : null;
  const meta = <>{t(`stayTypes.${stay.type}`)}<Dot />{districtName(stay.district, lang)}{stay.distanceKm != null && <><Dot />{t('common.kmAway', { km: stay.distanceKm })}</>}</>;
  if (variant === 'compact') return <CompactRow to={to} title={name} meta={meta} image={stay.images?.[0]} kind={stay.type} seed={stay.name} doc={stay} type="stay" />;
  return (
    <article className={cx('group relative', className)}>
      <Media image={stay.images?.[0]} alt={name} kind={stay.type} seed={stay.name} ratio="aspect-[3/2]">
        <Overlays doc={stay} type="stay" />
      </Media>
      <div className="mt-3">
        <h3 className="h3"><Link to={to} className="after:absolute after:inset-0">{name}</Link></h3>
        <Meta>{meta}</Meta>
        {price && <p className="mt-1 text-sm font-medium text-ink">{price}</p>}
      </div>
    </article>
  );
}

function DateTile({ date, lang }) {
  const d = new Date(date);
  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-white py-1.5 text-center shadow-[var(--shadow-soft)]">
      <span className="text-[10px] font-semibold tracking-wider text-laterite-600 uppercase">{formatDate(d, lang, { month: 'short' })}</span>
      <span className="font-display text-xl leading-none text-ink">{formatDate(d, lang, { day: 'numeric' })}</span>
    </div>
  );
}

export function EventCard({ event, variant = 'standard', className }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const title = localized(event, 'title', lang);
  const to = `/events/${event.slug}`;
  const when = formatDate(event.startDate, lang, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  const where = `${event.venue ? `${event.venue}, ` : ''}${districtName(event.district, lang)}`;

  if (variant === 'compact') {
    return (
      <article className="group relative flex min-w-0 items-center gap-4 py-3.5">
        <DateTile date={event.startDate} lang={lang} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold"><Link to={to} className="after:absolute after:inset-0">{title}</Link></h3>
          <Meta>{when}<Dot />{where}</Meta>
        </div>
        <div className="hidden shrink-0 sm:block"><TrustBadges doc={event} compact /></div>
      </article>
    );
  }
  return (
    <article className={cx('group relative', className)}>
      <Media image={event.images?.[0]} alt={title} kind="event" seed={event.title} ratio="aspect-[16/10]">
        <div className="absolute bottom-3 left-3 z-10"><DateTile date={event.startDate} lang={lang} /></div>
        <Overlays doc={event} type="event" />
      </Media>
      <div className="mt-3">
        <p className="eyebrow mb-1 text-muted">{t(`eventCategories.${event.category}`)}</p>
        <h3 className="h3"><Link to={to} className="after:absolute after:inset-0">{title}</Link></h3>
        <Meta>{when}<Dot />{where}</Meta>
      </div>
    </article>
  );
}

export function DishCard({ dish, className }) {
  const { i18n } = useTranslation();
  const name = localized(dish, 'name', i18n.language);
  return (
    <article className={cx('group relative', className)}>
      <Media image={dish.images?.[0]} alt={name} kind="dish" seed={dish.name} ratio="aspect-square">
        <SaveButton type="dish" doc={dish} className="absolute top-3 right-3 z-10" />
      </Media>
      <div className="mt-3">
        <h3 className="h3"><Link to={`/food/dishes/${dish.slug}`} className="after:absolute after:inset-0">{name}</Link></h3>
        <Meta>
          {dish.region}
          {i18n.language !== 'ml' && dish.nameMl && <><Dot /><span lang="ml">{dish.nameMl}</span></>}
        </Meta>
      </div>
    </article>
  );
}

/** Pick the right card for a {targetType, item} pair (saved lists, search). */
export function AnyCard({ type, item, variant }) {
  if (!item) return null;
  if (type === 'place') return <PlaceCard place={item} variant={variant} />;
  if (type === 'business') return <BusinessCard business={item} variant={variant} />;
  if (type === 'stay') return <StayCard stay={item} variant={variant} />;
  if (type === 'event') return <EventCard event={item} variant={variant} />;
  if (type === 'dish') return <DishCard dish={item} />;
  return null;
}

export const CARD_GRID = 'grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3';
export const CARD_GRID_4 = 'grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4';
