import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocateFixed, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from './ui/Button';
import { useUserLocation } from '../context/LocationContext';
import { endpoints } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { districtName } from '../utils/format';

/**
 * Asks for GPS only when the user taps the button; otherwise lets them pick a district
 * or search for a place to use as the reference point.
 */
export default function LocationPicker({ onChange, compact = false }) {
  const { t, i18n } = useTranslation();
  const { position, status, request, setManual } = useUserLocation();
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
      const loc = await request();
      onChange?.(loc);
    } catch {
      /* status shows denied */
    }
  };
  const placeSuggestions = suggestions.filter((s) => s.type === 'place' || s.type === 'district');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={useGps} loading={status === 'locating'}>
          <LocateFixed className="size-4" aria-hidden /> {t('nearby.askLocation')}
        </Button>
        {position && (
          <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1.5 text-sm text-forest-800">
            <MapPin className="size-4" aria-hidden /> {position.label}
          </span>
        )}
      </div>
      {!compact && <p className="text-xs text-muted">{t('nearby.locationWhy')}</p>}
      {status === 'denied' && <p role="alert" className="text-sm text-laterite-700">{t('nearby.denied')}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="loc-district">{t('nearby.manual')}</label>
          <select
            id="loc-district"
            className="input"
            value=""
            onChange={(e) => {
              const d = districts.find((x) => x.slug === e.target.value);
              if (d?.location) choose({ lat: d.location.coordinates[1], lng: d.location.coordinates[0], label: districtName(d.slug, i18n.language) });
            }}
          >
            <option value="">{t('common.district')}…</option>
            {districts.map((d) => <option key={d.slug} value={d.slug}>{districtName(d.slug, i18n.language)}</option>)}
          </select>
        </div>
        <div className="relative">
          <label className="label" htmlFor="loc-place">{t('directions.choosePlace')}</label>
          <input id="loc-place" className="input" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
          {placeSuggestions.length > 0 && text && (
            <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl bg-white py-1 shadow-[var(--shadow-lift)] ring-1 ring-sand-300">
              {placeSuggestions.map((s) => (
                <li key={`${s.type}${s.slug}`}>
                  <PlaceOption s={s} onPick={choose} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaceOption({ s, onPick }) {
  const { i18n } = useTranslation();
  const pick = async () => {
    if (s.type === 'district') {
      const d = await endpoints.district(s.slug);
      const c = d.district.location.coordinates;
      onPick({ lat: c[1], lng: c[0], label: districtName(s.slug, i18n.language) });
    } else {
      const { place } = await endpoints.place(s.slug);
      const c = place.location.coordinates;
      onPick({ lat: c[1], lng: c[0], label: place.name });
    }
  };
  return (
    <button type="button" onClick={pick} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-forest-50">
      <span>{s.type === 'district' ? districtName(s.slug, i18n.language) : s.label}</span>
      {s.district && <span className="text-xs text-muted">{districtName(s.district, i18n.language)}</span>}
    </button>
  );
}
