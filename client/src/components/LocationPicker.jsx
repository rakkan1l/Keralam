import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocateFixed, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from './ui/Button';
import { useUserLocation } from '../context/LocationContext';
import { endpoints } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { districtName, DISTRICT_SLUGS } from '../utils/format';

/**
 * Explains why location helps, asks for GPS only on tap, and offers a manual
 * alternative (district or place search) — which is also the fallback if permission is denied.
 */
export default function LocationPicker({ onChange }) {
  const { t, i18n } = useTranslation();
  const { status, request, setManual } = useUserLocation();
  const [text, setText] = useState('');
  const q = useDebounce(text.trim(), 250);
  const { data: districts = [] } = useQuery({ queryKey: ['districts'], queryFn: endpoints.districts, staleTime: 3600_000 });
  const { data: suggestions = [] } = useQuery({ queryKey: ['suggest', q], queryFn: () => endpoints.suggest(q), enabled: q.length >= 2 });

  const choose = (loc) => {
    setManual(loc);
    onChange?.(loc);
    setText('');
  };
  const useGps = async () => {
    try {
      onChange?.(await request());
    } catch {
      /* status shows denied */
    }
  };
  const pick = async (s) => {
    if (s.type === 'district') {
      const { district } = await endpoints.district(s.slug);
      const c = district.location.coordinates;
      choose({ lat: c[1], lng: c[0], label: districtName(s.slug, i18n.language) });
    } else {
      const { place } = await endpoints.place(s.slug);
      const c = place.location.coordinates;
      choose({ lat: c[1], lng: c[0], label: place.name });
    }
  };
  const options = suggestions.filter((s) => s.type === 'place' || s.type === 'district');

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <div>
        <span className="grid size-11 place-items-center rounded-full bg-forest-50 text-forest-700"><LocateFixed className="size-5" aria-hidden /></span>
        <h2 className="h3 mt-4 text-lg">{t('nearby.askLocation')}</h2>
        <p className="mt-1.5 text-sm text-muted">{t('nearby.locationWhy')}</p>
        <Button className="mt-5" onClick={useGps} loading={status === 'locating'}>{t('nearby.askLocation')}</Button>
        {status === 'denied' && <p role="alert" className="mt-3 text-sm text-laterite-700">{t('nearby.denied')}</p>}
        {status === 'unsupported' && <p role="alert" className="mt-3 text-sm text-laterite-700">{t('nearby.unsupported')}</p>}
      </div>
      <div className="md:border-l md:border-line md:pl-12">
        <span className="grid size-11 place-items-center rounded-full bg-sand-200 text-ink-soft"><MapPin className="size-5" aria-hidden /></span>
        <h2 className="h3 mt-4 text-lg">{t('nearby.manual')}</h2>
        <div className="relative mt-4">
          <label className="sr-only" htmlFor="loc-place">{t('directions.choosePlace')}</label>
          <input id="loc-place" className="input" placeholder={t('directions.choosePlace')} value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
          {options.length > 0 && text && (
            <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-[var(--shadow-overlay)]">
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
        <label className="sr-only" htmlFor="loc-district">{t('common.district')}</label>
        <select
          id="loc-district"
          className="input mt-3"
          value=""
          onChange={(e) => {
            const d = districts.find((x) => x.slug === e.target.value);
            if (d?.location) choose({ lat: d.location.coordinates[1], lng: d.location.coordinates[0], label: districtName(d.slug, i18n.language) });
          }}
        >
          <option value="">{t('nearby.orDistrict')}</option>
          {DISTRICT_SLUGS.map((d) => <option key={d} value={d}>{districtName(d, i18n.language)}</option>)}
        </select>
      </div>
    </div>
  );
}
