import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Waves, Droplets, Mountain, Trees, Bird, Sailboat, Landmark, Building2, Tent, Camera, Users, Sparkles, Binoculars, House,
  Footprints, Leaf, TreePine, Feather, Zap, Utensils, Heart, ShoppingBag, CloudRain, Sunrise, Drum, MapPin,
} from 'lucide-react';
import SceneArt, { sceneFor } from '../ui/SceneArt';
import { districtName, cx } from '../../utils/format';

const CATEGORY_ICONS = {
  beaches: Waves, waterfalls: Droplets, 'hill-stations': Mountain, forests: Trees, wildlife: Bird, backwaters: Sailboat,
  heritage: Landmark, museums: Building2, adventure: Tent, photography: Camera, family: Users, religious: Sparkles,
  viewpoints: Binoculars, 'lakes-dams': Waves, villages: House, treks: Footprints, 'nature-walks': Leaf, parks: TreePine,
};
const MOOD_ICONS = {
  peaceful: Feather, adventure: Zap, family: Users, photography: Camera, food: Utensils, romantic: Heart,
  shopping: ShoppingBag, 'rainy-day': CloudRain, 'sunrise-sunset': Sunrise, 'local-culture': Drum,
};

function Icon({ name: C = MapPin, className }) {
  return <C className={className} aria-hidden />;
}

export function CategoryTile({ slug, to }) {
  const { t } = useTranslation();
  return (
    <Link to={to || `/explore?category=${slug}`} className="group relative flex h-28 overflow-hidden rounded-2xl ring-1 ring-sand-300/60 transition hover:shadow-[var(--shadow-lift)] sm:h-32">
      <SceneArt scene={sceneFor([slug])} seed={slug} className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-forest-950/20 to-transparent" />
      <div className="relative mt-auto flex items-center gap-2 p-3 text-white">
        <Icon name={CATEGORY_ICONS[slug]} className="size-4" />
        <span className="text-sm font-semibold">{t(`categories.${slug}`)}</span>
      </div>
    </Link>
  );
}

export function MoodChip({ mood }) {
  const { t } = useTranslation();
  return (
    <Link to={`/explore?mood=${mood}`} className="chip py-2.5">
      <Icon name={MOOD_ICONS[mood]} className="size-4 text-forest-600" />
      {t(`moods.${mood}`)}
    </Link>
  );
}

export function DistrictTile({ district, className }) {
  const { t, i18n } = useTranslation();
  const scene = ['alappuzha', 'kottayam', 'kollam'].includes(district.slug)
    ? 'backwater'
    : ['idukki', 'wayanad', 'pathanamthitta', 'palakkad'].includes(district.slug)
      ? 'hills'
      : ['thiruvananthapuram', 'kozhikode', 'kannur'].includes(district.slug)
        ? 'beach'
        : ['thrissur'].includes(district.slug)
          ? 'waterfall'
          : 'heritage';
  return (
    <Link to={`/districts/${district.slug}`} className={cx('group relative flex aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-sand-300/60 transition hover:shadow-[var(--shadow-lift)]', className)}>
      {district.heroImage?.url ? (
        <img src={district.heroImage.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <SceneArt scene={scene} seed={district.slug} className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" />
      <div className="relative mt-auto p-3.5 text-white">
        <p className="font-display text-lg leading-tight">{districtName(district.slug, i18n.language)}</p>
        {district.tagline && <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{i18n.language === 'ml' && district.taglineMl ? district.taglineMl : district.tagline}</p>}
        {district.placeCount != null && <p className="mt-1 text-[11px] font-medium text-turmeric-100">{t('districts.places', { count: district.placeCount })}</p>}
      </div>
    </Link>
  );
}

export { CATEGORY_ICONS, MOOD_ICONS };
