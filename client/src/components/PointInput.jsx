import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { LocateFixed, X } from 'lucide-react';
import { endpoints } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useUserLocation } from '../context/LocationContext';
import { districtName } from '../utils/format';

/** Choose a point by searching places/districts or using the device location. */
export default function PointInput({ id, label, value, onChange, allowGps = false }) {
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
      {value ? (
        <div className="flex h-11 items-center justify-between rounded-xl bg-forest-50 px-3.5 text-sm ring-1 ring-forest-200">
          <span className="truncate font-medium text-forest-900">{value.label}</span>
          <button type="button" onClick={() => onChange(null)} className="rounded-full p-1 hover:bg-white" aria-label={t('common.clear')}>
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input id={id} className="input" placeholder={t('directions.choosePlace')} value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
          {allowGps && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const p = await request();
                  onChange({ lat: p.lat, lng: p.lng, label: t('directions.useLocation') });
                } catch {
                  /* denied — status shown by caller */
                }
              }}
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-sand-300 hover:ring-forest-300"
              aria-label={t('directions.useLocation')}
              title={t('directions.useLocation')}
            >
              <LocateFixed className={status === 'locating' ? 'size-4 animate-pulse' : 'size-4'} />
            </button>
          )}
        </div>
      )}
      {!value && options.length > 0 && text && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl bg-white py-1 shadow-[var(--shadow-lift)] ring-1 ring-sand-300">
          {options.map((s) => (
            <li key={`${s.type}${s.slug}`}>
              <button type="button" onClick={() => pick(s)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-forest-50">
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
