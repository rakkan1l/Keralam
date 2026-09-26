import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Menu, Siren, User } from 'lucide-react';
import Logo from './Logo';
import NavDrawer from './NavDrawer';
import SearchOverlay from './SearchOverlay';
import { useAuth } from '../../context/AuthContext';
import { cx } from '../../utils/format';

/**
 * Compact top bar: logo left; search, emergency, account and the menu button right.
 * `overlay` renders it transparent over a hero image until the page is scrolled.
 */
export default function Header({ overlay = false }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const clear = overlay && !scrolled;
  const iconBtn = cx('grid size-11 place-items-center rounded-full transition-colors', clear ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-sand-200/80');

  return (
    <>
      <header
        className={cx(
          'top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300',
          overlay ? 'fixed' : 'sticky',
          clear ? 'border-b border-transparent bg-transparent' : 'border-b border-line/80 bg-sand-100/85 backdrop-blur-md',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Logo light={clear} />
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button type="button" onClick={() => setSearch(true)} className={iconBtn} aria-label={t('nav.searchOpen')}>
              <Search className="size-5" />
            </button>
            <Link to="/help" className={cx(iconBtn, !clear && 'text-laterite-600 hover:text-laterite-700')} aria-label={t('nav.emergencyAssistance')} title={t('nav.emergencyAssistance')}>
              <Siren className="size-5" />
            </Link>
            {user ? (
              <Link to="/account" className="mx-1 grid size-9 place-items-center rounded-full bg-forest-800 text-sm font-medium text-white ring-2 ring-white/60" aria-label={t('nav.myAccount')}>
                {user.name?.[0]?.toUpperCase() || <User className="size-4" />}
              </Link>
            ) : (
              <>
                <Link to="/login" className={cx('mx-1 hidden h-10 items-center rounded-full px-4 text-sm font-medium transition sm:inline-flex', clear ? 'text-white hover:bg-white/15' : 'text-ink hover:bg-sand-200/80')}>
                  {t('nav.login')}
                </Link>
                <Link to="/login" className={cx(iconBtn, 'sm:hidden')} aria-label={t('nav.login')}>
                  <User className="size-5" />
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-expanded={menu}
              aria-controls="site-nav"
              className={cx('ml-1 inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-3.5 text-sm font-medium transition-colors', clear ? 'bg-white/15 text-white backdrop-blur-md hover:bg-white/25' : 'bg-forest-800 text-white hover:bg-forest-900')}
            >
              <Menu className="size-5" aria-hidden />
              <span className="hidden sm:inline">{t('nav.menu')}</span>
              <span className="sr-only sm:hidden">{t('nav.openMenu')}</span>
            </button>
          </div>
        </div>
      </header>
      <NavDrawer open={menu} onClose={() => setMenu(false)} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}
