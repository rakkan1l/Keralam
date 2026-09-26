import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ArrowUpRight } from 'lucide-react';
import SearchBar from '../SearchBar';
import { cx } from '../../utils/format';

export const SEARCH_EXAMPLES = ['Places to visit in Wayanad', 'Hidden beaches near Kozhikode', 'Best food in Kochi', 'Weekend trips in Kerala'];

/** Global search panel opened from the header search button. */
export default function SearchOverlay({ open, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={t('common.search')}>
      <div className="absolute inset-0 bg-forest-950/35 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="animate-fade-up relative bg-sand-50 shadow-[var(--shadow-overlay)]">
        <div className="container-page py-5 sm:py-8">
          <div className="flex items-center gap-3">
            <SearchBar autoFocus className="flex-1" />
            <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-sand-200" aria-label={t('common.close')}>
              <X className="size-5" />
            </button>
          </div>
          <p className="eyebrow mt-6 mb-2 text-muted">{t('home.examples')}</p>
          <ul className={cx('flex flex-wrap gap-2')}>
            {SEARCH_EXAMPLES.map((q) => (
              <li key={q}>
                <Link to={`/search?q=${encodeURIComponent(q)}`} className="chip">
                  {q} <ArrowUpRight className="size-3.5 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
