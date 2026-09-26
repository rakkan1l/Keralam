import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LocateFixed, X } from 'lucide-react';
import { endpoints } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useUserLocation } from '../context/LocationContext';
import { districtName, cx } from '../utils/format';

/** Choose a point by searching places/districts or using the device location. */
export default function PointInput({ id, label, value, onChange, allowGps = false, dot }) {
  const { t, i18n } = useTranslation();
  const { request, status } = useUserLocation();
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), 250);
  const { data: suggestions = [] } = useQuery({ queryKey: ['suggest', q], queryFn: () => endpoints.suggest(q), enabled: q.length >= 2 });
  const options = suggestions.filter((s) => ['place', 'district', 'business'].includes(s.type));

  const pick = async (s) => {
    setText('');
    if (s.type === 'district') {
      const { district } = await endpoints.district(s.slug);
      const [lng, lat] = district.location.coordinates;
      onChange({ lng, lat, label: districtName(s.slug, i18n.language) });
    } else if (s.type === 'business') {
      const { business } = await endpoints.business(s.slug);
      const [lng, lat] = business.location.coordinates;
      onChange({ lng, lat, label: business.name });
    } else {
      const { place } = await endpoints.place(s.slug);
      const [lng, lat] = place.location.coordinates;
      onChange({ lng, lat, label: place.name });
    }
  };

  return (
    <div className="relative">
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        {dot && <span className={cx('absolute top-1/2 left-3.5 z-10 size-2.5 -translate-y-1/2 rounded-full', dot)} aria-hidden />}
        {value ? (
          <div className={cx('flex h-11 items-center justify-between rounded-[10px] border border-forest-200 bg-forest-50 pr-2 text-[15px]', dot ? 'pl-9' : 'pl-3.5')}>
            <span className="truncate font-medium text-ink">{value.label}</span>
            <button type="button" onClick={() => onChange(null)} className="grid size-8 place-items-center rounded-full hover:bg-white" aria-label={`${t('common.clear')} ${label}`}>
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input id={id} className={cx('input', dot && 'pl-9')} placeholder={t('directions.choosePlace')} value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
            {allowGps && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const p = await request();
                    onChange({ lat: p.lat, lng: p.lng, label: t('directions.useLocation') });
                  } catch {
                    /* denied — handled by caller */
                  }
                }}
                className="grid size-11 shrink-0 place-items-center rounded-[10px] border border-line bg-white hover:border-forest-300"
                aria-label={t('directions.useLocation')}
                title={t('directions.useLocation')}
              >
                <LocateFixed className={cx('size-4', status === 'locating' && 'animate-pulse')} />
              </button>
            )}
          </div>
        )}
      </div>
      {!value && options.length > 0 && text && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-[var(--shadow-overlay)]">
          {options.map((s) => (
            <li key={`${s.type}${s.slug}`}>
              <button type="button" onClick={() => pick(s)} className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-sand-100">
                <span>{s.type === 'district' ? districtName(s.slug, i18n.language) : s.label}</span>
                {s.district && <span className="text-xs text-muted">{districtName(s.district, i18n.language)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
