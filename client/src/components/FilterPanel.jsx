import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X } from 'lucide-react';
import Button from './ui/Button';
import { cx, DISTRICT_SLUGS, districtName } from '../utils/format';

/** Sidebar on desktop, bottom sheet on mobile. `activeCount` shows on the mobile trigger. */
export default function FilterPanel({ children, activeCount = 0, onClear }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const body = (
    <div className="space-y-6">
      {children}
      {onClear && activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          {t('common.clear')}
        </Button>
      )}
    </div>
  );
  return (
    <>
      <Button variant="secondary" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-4" aria-hidden /> {t('common.filters')}
        {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-forest-800 text-[11px] text-white">{activeCount}</span>}
      </Button>
      <aside className="hidden lg:block" aria-label={t('common.filters')}>
        <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">{body}</div>
      </aside>
      <div className={cx('fixed inset-0 z-50 lg:hidden', !open && 'pointer-events-none')} aria-hidden={!open}>
        <div className={cx('absolute inset-0 bg-forest-950/40 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={() => setOpen(false)} />
        <div role="dialog" aria-modal="true" aria-label={t('common.filters')} className={cx('absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 transition-transform duration-300', open ? 'translate-y-0' : 'translate-y-full')}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">{t('common.filters')}</h2>
            <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-sand-100" aria-label={t('common.close')}>
              <X className="size-5" />
            </button>
          </div>
          {body}
          <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
            {t('common.apply')}
          </Button>
        </div>
      </div>
    </>
  );
}

export function FilterGroup({ label, children }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-forest-950">{label}</legend>
      {children}
    </fieldset>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1 text-sm text-forest-900">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-6 w-10 shrink-0 rounded-full bg-sand-300 transition peer-checked:bg-forest-700 peer-focus-visible:ring-2 peer-focus-visible:ring-forest-300 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
    </label>
  );
}

export function DistrictSelect({ value, onChange, id = 'district-select', includeAll = true }) {
  const { t, i18n } = useTranslation();
  return (
    <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className="input">
      {includeAll && <option value="">{t('common.all')}</option>}
      {DISTRICT_SLUGS.map((d) => (
        <option key={d} value={d}>
          {districtName(d, i18n.language)}
        </option>
      ))}
    </select>
  );
}
