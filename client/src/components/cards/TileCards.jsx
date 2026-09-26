import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import SceneArt, { sceneFor } from '../ui/SceneArt';
import { districtName, cx } from '../../utils/format';

/** Home "explore by category" shortcuts (label key → destination). */
export const HOME_CATEGORIES = [
  { key: 'beaches', to: '/explore?category=beaches', scene: 'beach' },
  { key: 'waterfalls', to: '/explore?category=waterfalls', scene: 'waterfall' },
  { key: 'mountains', to: '/explore?category=hill-stations,viewpoints,treks', scene: 'hills' },
  { key: 'nature', to: '/explore?category=forests,wildlife,nature-walks,backwaters', scene: 'forest' },
  { key: 'heritage', to: '/explore?category=heritage,museums,religious', scene: 'heritage' },
  { key: 'food', to: '/food', scene: 'food' },
  { key: 'adventure', to: '/explore?category=adventure,treks', scene: 'backwater' },
];

export function CategoryTile({ item }) {
  const { t } = useTranslation();
  return (
    <Link to={item.to} className="group w-28 shrink-0 snap-start text-center sm:w-auto">
      <div className="aspect-square overflow-hidden rounded-[var(--radius-card)] bg-sand-200">
        <SceneArt scene={item.scene} seed={item.key} className="img-zoom h-full w-full" />
      </div>
      <p className="mt-2.5 text-sm font-medium text-ink group-hover:text-forest-700">{t(`categoriesHome.${item.key}`)}</p>
    </Link>
  );
}

const DISTRICT_SCENE = {
  thiruvananthapuram: 'beach', kollam: 'backwater', pathanamthitta: 'forest', alappuzha: 'backwater', kottayam: 'backwater',
  idukki: 'hills', ernakulam: 'heritage', thrissur: 'waterfall', palakkad: 'hills', malappuram: 'forest',
  kozhikode: 'beach', wayanad: 'hills', kannur: 'beach', kasaragod: 'heritage',
};

/** Compact district entry: small image, name, one-line tagline. */
export function DistrictTile({ district, className }) {
  const { t, i18n } = useTranslation();
  const tagline = i18n.language === 'ml' && district.taglineMl ? district.taglineMl : district.tagline;
  return (
    <Link to={`/districts/${district.slug}`} className={cx('group flex items-center gap-3.5 rounded-[var(--radius-card)] p-2 -m-2 transition-colors hover:bg-white', className)}>
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-sand-200">
        {district.heroImage?.url ? (
          <img src={district.heroImage.url} alt="" loading="lazy" className="img-zoom h-full w-full object-cover" />
        ) : (
          <SceneArt scene={DISTRICT_SCENE[district.slug] || 'hills'} seed={district.slug} className="img-zoom h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">{districtName(district.slug, i18n.language)}</p>
        <p className="truncate text-[13px] text-muted">{tagline || (district.placeCount != null && t('districts.places', { count: district.placeCount }))}</p>
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
    </Link>
  );
}

export { sceneFor, DISTRICT_SCENE };
