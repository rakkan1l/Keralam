import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, CalendarDays, Utensils, Map as MapIcon } from 'lucide-react';
import { endpoints } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { districtName, cx } from '../utils/format';

const TYPE_ICON = { place: MapPin, district: MapIcon, business: Utensils, event: CalendarDays };

/** Global smart search with typeahead suggestions (keyboard accessible combobox). */
export default function SearchBar({ size = 'lg', initial = '', autoFocus = false, className = '' }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(q.trim(), 200);
  const listId = useId();
  const boxRef = useRef(null);

  useEffect(() => setQ(initial), [initial]);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['suggest', debounced],
    queryFn: () => endpoints.suggest(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    const close = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const go = (s) => {
    setOpen(false);
    if (!s) {
      if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      return;
    }
    const routes = { place: `/places/${s.slug}`, district: `/districts/${s.slug}`, business: `/listings/${s.slug}`, event: `/events/${s.slug}` };
    navigate(routes[s.type]);
  };

  const onKeyDown = (e) => {
    if (!open || !suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      go(suggestions[active]);
    }
  };

  const big = size === 'lg';
  return (
    <div ref={boxRef} className={cx('relative w-full', className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(null);
        }}
        className={cx('flex items-center rounded-full bg-white shadow-[var(--shadow-lift)] ring-1 ring-sand-300/70 focus-within:ring-2 focus-within:ring-forest-400', big ? 'h-14 pl-5 pr-1.5' : 'h-11 pl-4 pr-1')}
      >
        <Search className="size-5 shrink-0 text-forest-600" aria-hidden />
        <label htmlFor={`${listId}-input`} className="sr-only">{t('common.search')}</label>
        <input
          id={`${listId}-input`}
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t('home.searchPlaceholder')}
          className={cx('min-w-0 flex-1 bg-transparent px-3 text-ink placeholder:text-muted/70 focus:outline-none', big ? 'text-base' : 'text-sm')}
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
        />
        <button type="submit" className={cx('rounded-full bg-forest-800 font-medium text-white transition hover:bg-forest-700', big ? 'h-11 px-5 text-sm' : 'h-9 px-4 text-sm')}>
          {t('common.search')}
        </button>
      </form>
      {open && suggestions.length > 0 && (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl bg-white py-2 shadow-[var(--shadow-lift)] ring-1 ring-sand-300">
          {suggestions.map((s, i) => {
            const Icon = TYPE_ICON[s.type] || MapPin;
            return (
              <li
                key={`${s.type}-${s.slug}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={active === i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(s)}
                className={cx('flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm', active === i ? 'bg-forest-50' : 'hover:bg-sand-100')}
              >
                <Icon className="size-4 text-forest-600" aria-hidden />
                <span className="flex-1 truncate font-medium text-ink">{s.type === 'district' ? districtName(s.slug, i18n.language) : s.label}</span>
                {s.district && <span className="text-xs text-muted">{districtName(s.district, i18n.language)}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
