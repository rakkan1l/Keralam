import { env } from '../config/env.js';

const cache = new Map();
const TTL = 30 * 60 * 1000;

const CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};

/** Returns current weather + 3-day outlook, or { available: false } when not configured. */
export async function getWeather(lat, lng) {
  if (env.weather.provider !== 'open-meteo') {
    return { available: false, reason: 'Weather provider not configured (set WEATHER_PROVIDER=open-meteo).' };
  }
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;

  const url = `${env.weather.openMeteoUrl}?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=3&timezone=Asia%2FKolkata`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const data = {
      available: true,
      source: 'Open-Meteo',
      current: {
        temperatureC: body.current?.temperature_2m,
        precipitationMm: body.current?.precipitation,
        windKmh: body.current?.wind_speed_10m,
        summary: CODES[body.current?.weather_code] || 'Unknown',
        rainy: [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(body.current?.weather_code),
      },
      daily: (body.daily?.time || []).map((date, i) => ({
        date,
        summary: CODES[body.daily.weather_code[i]] || 'Unknown',
        maxC: body.daily.temperature_2m_max[i],
        minC: body.daily.temperature_2m_min[i],
        rainChance: body.daily.precipitation_probability_max?.[i],
      })),
      fetchedAt: new Date().toISOString(),
    };
    cache.set(key, { data, expires: Date.now() + TTL });
    return data;
  } catch (err) {
    return { available: false, reason: `Weather service unreachable: ${err.message}` };
  }
}
