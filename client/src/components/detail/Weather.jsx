import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { CloudSun, CloudRain } from 'lucide-react';
import { endpoints } from '../../services/api';
import { Panel } from './Facts';

/** Weather for a location — shown only when a weather provider is configured on the server. */
export default function WeatherWidget({ lat, lng }) {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ['weather', lat?.toFixed(2), lng?.toFixed(2)],
    queryFn: () => endpoints.weather({ lat, lng }),
    enabled: Number.isFinite(lat) && Number.isFinite(lng),
    staleTime: 30 * 60 * 1000,
  });
  if (!data?.available) return null;
  const Icon = data.current.rainy ? CloudRain : CloudSun;
  return (
    <Panel title={t('weather.title')} icon={Icon} footer={`${t('common.source')}: ${data.source}`}>
      <p className="text-2xl font-semibold">{Math.round(data.current.temperatureC)}°C <span className="text-sm font-normal text-muted">{data.current.summary}</span></p>
      {data.current.rainy && <p className="mt-1 text-sm text-lagoon-700">{t('weather.rainy')}</p>}
      <ul className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        {data.daily.map((d) => (
          <li key={d.date} className="rounded-xl bg-sand-100 p-2">
            <p className="font-medium">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</p>
            <p>{Math.round(d.minC)}°–{Math.round(d.maxC)}°</p>
            {d.rainChance != null && <p className="text-lagoon-700">{d.rainChance}% 🌧</p>}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
