import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Menu, X, Siren, User, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../../context/AuthContext';
import { cx } from '../../utils/format';

export const PRIMARY_NAV = [
  { to: '/', key: 'home', end: true },
  { to: '/explore', key: 'explore' },
  { to: '/near-me', key: 'nearMe' },
  { to: '/trip-builder', key: 'aiTrip' },
  { to: '/saved', key: 'saved' },
];
export const MORE_NAV = [
  { to: '/food', key: 'food' },
  { to: '/stays', key: 'stays' },
  { to: '/events', key: 'events' },
  { to: '/directions', key: 'travel' },
  { to: '/districts', key: 'districts' },
  { to: '/hidden-gems', key: 'hiddenGems' },
  { to: '/shopping', key: 'shopping' },
  { to: '/theatres', key: 'theatres' },
  { to: '/activities', key: 'activities' },
  { to: '/help', key: 'help' },
];

function Logo() {
  const { t } = useTranslation();
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Keralam home">
      <img src="/favicon.svg" alt="" className="size-9" />
      <span className="font-display text-xl text-forest-900">{t('brand.name')}</span>
    </Link>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isStaff, logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const moreRef = useRef(null);
  const userRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMoreOpen(false);
    setDrawer(false);
    setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
      if (!userRef.current?.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const linkClass = ({ isActive }) => cx('rounded-full px-3.5 py-2 text-sm font-medium transition', isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-800 hover:bg-sand-200/70');

  return (
    <header className="sticky top-0 z-40 border-b border-sand-300/60 bg-sand-100/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
          {PRIMARY_NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              {t(`nav.${n.key}`)}
            </NavLink>
          ))}
          <div className="relative" ref={moreRef}>
            <button type="button" onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen} className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-forest-800 hover:bg-sand-200/70">
              {t('nav.more')} <ChevronDown className="size-4" aria-hidden />
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-full mt-2 grid w-72 grid-cols-2 gap-1 rounded-2xl bg-white p-2 shadow-[var(--shadow-lift)] ring-1 ring-sand-300">
                {MORE_NAV.map((n) => (
                  <NavLink key={n.to} to={n.to} className="rounded-xl px-3 py-2 text-sm text-forest-900 hover:bg-forest-50">
                    {t(`nav.${n.key}`)}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/help" className="hidden items-center gap-1.5 rounded-full bg-laterite-50 px-3.5 py-2 text-sm font-semibold text-laterite-700 ring-1 ring-laterite-100 hover:bg-laterite-100 sm:inline-flex">
            <Siren className="size-4" aria-hidden /> {t('nav.emergency')}
          </Link>
          <LanguageSwitcher className="hidden sm:inline-flex" />
          {user ? (
            <div className="relative" ref={userRef}>
              <button type="button" onClick={() => setUserOpen((o) => !o)} aria-expanded={userOpen} aria-label={t('nav.account')} className="grid size-10 place-items-center rounded-full bg-forest-800 text-sm font-semibold text-white">
                {user.name?.[0]?.toUpperCase() || <User className="size-4" />}
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white p-2 shadow-[var(--shadow-lift)] ring-1 ring-sand-300">
                  <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
                  <Link to="/account" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-forest-50"><User className="size-4" aria-hidden />{t('nav.account')}</Link>
                  <Link to="/saved" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-forest-50"><Heart className="size-4" aria-hidden />{t('nav.saved')}</Link>
                  {isStaff && <Link to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-forest-50"><LayoutDashboard className="size-4" aria-hidden />{t('nav.admin')}</Link>}
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-laterite-700 hover:bg-laterite-50"
                  >
                    <LogOut className="size-4" aria-hidden />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden rounded-full bg-forest-800 px-4 py-2 text-sm font-medium text-white hover:bg-forest-700 sm:inline-flex">
              {t('nav.login')}
            </Link>
          )}
          <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-sand-200 lg:hidden" onClick={() => setDrawer(true)} aria-label={t('nav.menu')}>
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-forest-950/40" onClick={() => setDrawer(false)} aria-hidden />
          <nav className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col gap-1 overflow-y-auto bg-sand-50 p-4 shadow-xl" aria-label="Menu">
            <div className="mb-3 flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setDrawer(false)} className="grid size-10 place-items-center rounded-full hover:bg-sand-200" aria-label={t('common.close')}>
                <X className="size-5" />
              </button>
            </div>
            <LanguageSwitcher className="mb-3 self-start" />
            {[...PRIMARY_NAV, ...MORE_NAV].map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx('rounded-xl px-3 py-2.5 text-[15px]', isActive ? 'bg-forest-100 font-medium text-forest-900' : 'text-forest-900 hover:bg-sand-200')}>
                {t(`nav.${n.key}`)}
              </NavLink>
            ))}
            <div className="mt-auto border-t border-sand-300 pt-3">
              {user ? (
                <>
                  <NavLink to="/account" className="block rounded-xl px-3 py-2.5">{t('nav.account')}</NavLink>
                  {isStaff && <NavLink to="/admin" className="block rounded-xl px-3 py-2.5">{t('nav.admin')}</NavLink>}
                </>
              ) : (
                <NavLink to="/login" className="block rounded-xl bg-forest-800 px-3 py-2.5 text-center font-medium text-white">{t('nav.login')}</NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
