import { useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { NAV_SECTIONS } from './navConfig';
import { useAuth } from '../../context/AuthContext';
import { cx } from '../../utils/format';

/**
 * Main navigation panel. Full-screen on mobile, right-hand drawer on desktop.
 * Closes on Escape, backdrop click, link selection and route change; focus is
 * trapped inside while open and restored to the trigger afterwards.
 */
export default function NavDrawer({ open, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const panel = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    document.body.style.overflow = 'hidden';
    const focusables = () => [...panel.current.querySelectorAll('a[href], button:not([disabled])')];
    requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const els = focusables();
        const first = els[0];
        const last = els.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  const isActive = (to, end) => {
    const [path, query] = to.split('?');
    if (query) return location.pathname === path && location.search === `?${query}`;
    return end ? location.pathname === path && !location.search.includes('tab=') && !location.search.includes('mode=') : location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <div className={cx('fixed inset-0 z-[60] overflow-hidden', !open && 'pointer-events-none invisible delay-300')} aria-hidden={!open}>
      <div className={cx('absolute inset-0 bg-forest-950/35 backdrop-blur-[2px] transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <nav
        ref={panel}
        id="site-nav"
        aria-label={t('nav.menu')}
        className={cx(
          'absolute inset-y-0 right-0 flex w-full flex-col bg-sand-50 shadow-[var(--shadow-overlay)] transition-transform duration-400 ease-[var(--ease-out-soft)] sm:w-[440px]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        inert={!open}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:px-7">
          <Logo onClick={onClose} />
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full text-ink hover:bg-sand-200" aria-label={t('nav.closeMenu')}>
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 sm:px-7">

          <div className="grid gap-7 sm:grid-cols-2 sm:gap-x-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.key} className={cx(section.key === 'sectionMore' && 'sm:row-span-2')}>
                <p className="eyebrow mb-2 text-muted">{t(`nav.${section.key}`)}</p>
                <ul>
                  {section.items.map(({ to, key, icon: Icon, end, tone }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={end}
                        onClick={onClose}
                        className={() =>
                          cx(
                            'group -mx-2 flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 text-[15px] transition-colors',
                            isActive(to, end) ? 'bg-forest-50 font-medium text-forest-800' : tone === 'alert' ? 'font-medium text-laterite-700 hover:bg-laterite-50' : 'text-ink hover:bg-sand-200/70',
                          )
                        }
                      >
                        <Icon className={cx('size-[18px]', tone === 'alert' ? 'text-laterite-500' : 'text-forest-600')} aria-hidden />
                        {t(`nav.${key}`)}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pb-safe flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line px-5 pt-3 sm:px-7">
          <LanguageSwitcher />
          {user ? (
            <Link to="/account" onClick={onClose} className="flex items-center gap-2 text-sm font-medium text-ink">
              <span className="grid size-8 place-items-center rounded-full bg-forest-800 text-xs text-white">{user.name?.[0]?.toUpperCase()}</span>
              {user.name}
            </Link>
          ) : (
            <Link to="/login" onClick={onClose} className="inline-flex h-10 items-center rounded-full bg-forest-800 px-5 text-sm font-medium text-white hover:bg-forest-900">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
