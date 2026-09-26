import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Button from './ui/Button';
import { cx, DISTRICT_SLUGS, districtName } from '../utils/format';

/**
 * "More filters" trigger + panel. Opens as a right-hand sheet on desktop and a bottom
 * sheet on mobile, so filters never take permanent screen space.
 */
export default function FilterPanel({ children, activeCount = 0, onClear, label }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cx('chip', activeCount > 0 && 'border-forest-800 text-forest-800')} aria-haspopup="dialog">
        <SlidersHorizontal className="size-4" aria-hidden />
        {label || t('common.filters')}
        {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-forest-800 text-[11px] text-white">{activeCount}</span>}
      </button>
      <div className={cx('fixed inset-0 z-[65] overflow-hidden', !open && 'pointer-events-none invisible')} aria-hidden={!open}>
        <div className={cx('absolute inset-0 bg-forest-950/35 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} onClick={() => setOpen(false)} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label || t('common.filters')}
          className={cx(
            'absolute flex flex-col bg-sand-50 shadow-[var(--shadow-overlay)] transition-transform duration-300 ease-[var(--ease-out-soft)]',
            'inset-x-0 bottom-0 max-h-[88vh] rounded-t-[var(--radius-panel)] sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[420px] sm:rounded-none',
            open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0',
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="h3">{label || t('common.filters')}</h2>
            <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-sand-200" aria-label={t('common.close')}>
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">{children}</div>
          <div className="pb-safe flex items-center justify-between gap-3 border-t border-line px-6 pt-3">
            {onClear ? <Button variant="ghost" onClick={onClear} disabled={!activeCount}>{t('common.clear')}</Button> : <span />}
            <Button onClick={() => setOpen(false)}>{t('common.apply')}</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function FilterGroup({ label, children }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-ink">{label}</legend>
      {children}
    </fieldset>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-[15px] text-ink">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-10 shrink-0 rounded-full bg-sand-300 transition peer-checked:bg-forest-700 peer-focus-visible:ring-2 peer-focus-visible:ring-forest-300 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
    </label>
  );
}

/** Pill-styled native select for inline filter bars. */
export function SelectChip({ value, onChange, options, placeholder, id, ariaLabel }) {
  return (
    <span className="relative inline-flex">
      <select
        id={id}
        aria-label={ariaLabel || placeholder}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={cx('chip cursor-pointer appearance-none pr-8', value && 'border-forest-800 text-forest-800')}
      >
        <option value="">{placeholder}</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </span>
  );
}

export function DistrictSelect({ value, onChange, id = 'district-select', includeAll = true, chip = false, placeholder }) {
  const { t, i18n } = useTranslation();
  if (chip) {
    return <SelectChip id={id} value={value} onChange={onChange} placeholder={t('common.district')} options={DISTRICT_SLUGS.map((d) => [d, districtName(d, i18n.language)])} />;
  }
  return (
    <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className="input">
      {includeAll && <option value="">{placeholder || t('common.all')}</option>}
      {DISTRICT_SLUGS.map((d) => <option key={d} value={d}>{districtName(d, i18n.language)}</option>)}
    </select>
  );
}

/** Sticky toolbar holding a listing page's filters. */
export function FilterBar({ children, className = '' }) {
  return (
    <div className={cx('sticky top-16 z-20 -mx-4 border-b border-line bg-sand-100/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8', className)}>
      {children}
    </div>
  );
}

/** Result count + grid/empty/error/loading states for listing pages. */
export function ResultsMeta({ total }) {
  const { t } = useTranslation();
  return <p className="py-5 text-sm text-muted" aria-live="polite">{total != null ? t('common.results', { count: total }) : ' '}</p>;
}
