import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { House, Compass, LocateFixed, Sparkles, Heart } from 'lucide-react';
import { cx } from '../../utils/format';

const ITEMS = [
  { to: '/', key: 'home', icon: House, end: true },
  { to: '/explore', key: 'explore', icon: Compass },
  { to: '/near-me', key: 'nearMe', icon: LocateFixed },
  { to: '/trip-builder', key: 'aiTrip', icon: Sparkles },
  { to: '/saved', key: 'saved', icon: Heart },
];

/** Mobile bottom navigation — the five primary destinations within thumb reach. */
export default function BottomNav() {
  const { t } = useTranslation();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-sand-300/70 bg-white/95 backdrop-blur-md lg:hidden" aria-label="Primary">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map(({ to, key, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => cx('flex flex-col items-center gap-0.5 pb-1 pt-2 text-[11px] font-medium', isActive ? 'text-forest-800' : 'text-muted')}>
              {({ isActive }) => (
                <>
                  <span className={cx('grid h-7 w-12 place-items-center rounded-full transition', isActive && 'bg-forest-100')}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {t(`nav.${key}`)}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
