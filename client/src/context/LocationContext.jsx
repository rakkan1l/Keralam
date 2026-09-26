import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const LocationContext = createContext(null);
const KEY = 'kt_manual_location';

/**
 * Location is requested only when a feature needs it (never on page load).
 * Users can instead set a manual location (district centre or place), which is kept
 * for the session.
 */
export function LocationProvider({ children }) {
  const [position, setPosition] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [status, setStatus] = useState('idle'); // idle | locating | granted | denied | unsupported

  const setManual = useCallback((loc) => {
    const next = loc ? { ...loc, source: 'manual' } : null;
    setPosition(next);
    try {
      if (next) sessionStorage.setItem(KEY, JSON.stringify(next));
      else sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const request = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          setStatus('unsupported');
          reject(new Error('unsupported'));
          return;
        }
        setStatus('locating');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const next = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, label: 'Your location', source: 'gps' };
            setPosition(next);
            setStatus('granted');
            resolve(next);
          },
          (err) => {
            setStatus(err.code === 1 ? 'denied' : 'idle');
            reject(err);
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 },
        );
      }),
    [],
  );

  const value = useMemo(() => ({ position, status, request, setManual }), [position, status, request, setManual]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useUserLocation must be used inside LocationProvider');
  return ctx;
}
