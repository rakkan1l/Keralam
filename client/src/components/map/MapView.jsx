import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const KERALA_CENTER = [10.35, 76.4];

// Custom SVG pin — avoids Leaflet's default image assets, which break under bundlers.
const pin = (color) =>
  L.divIcon({
    className: '',
    iconSize: [30, 40],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 39s13-12.4 13-23A13 13 0 0 0 2 16c0 10.6 13 23 13 23z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="15" cy="16" r="5" fill="#fff"/></svg>`,
  });
const ICONS = {
  place: pin('#1c4532'),
  gem: pin('#2f7f95'),
  business: pin('#c0603a'),
  stay: pin('#a87412'),
  event: pin('#843e24'),
  transport: pin('#5b6660'),
  start: pin('#3c7d5b'),
  end: pin('#a44e2d'),
};

function FitBounds({ points, route }) {
  const map = useMap();
  useEffect(() => {
    const all = [...points.map((p) => [p.lat, p.lng]), ...(route || [])];
    if (all.length === 1) map.setView(all[0], 12);
    else if (all.length > 1) map.fitBounds(L.latLngBounds(all), { padding: [36, 36], maxZoom: 13 });
  }, [map, points, route]);
  return null;
}

/**
 * Reusable map. `markers`: [{ id, lat, lng, title, subtitle, href, kind }]
 * `route`: [[lat, lng], …] polyline. `user`: { lat, lng } current position.
 */
export default function MapView({ markers = [], route, user, className = 'h-80', zoom = 7, onMarkerClick }) {
  const points = useMemo(() => markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng)), [markers]);
  return (
    <div className={`overflow-hidden rounded-[var(--radius-card)] bg-sand-200 ${className}`}>
      <MapContainer center={KERALA_CENTER} zoom={zoom} scrollWheelZoom={false} className="h-full w-full" attributionControl>
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        {points.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={ICONS[m.kind] || ICONS.place} eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m) } : undefined}>
            <Popup>
              <div className="min-w-[10rem]">
                {m.href ? (
                  <Link to={m.href} className="font-semibold text-forest-800 hover:underline">
                    {m.title}
                  </Link>
                ) : (
                  <strong>{m.title}</strong>
                )}
                {m.subtitle && <div className="mt-0.5 text-xs text-gray-600">{m.subtitle}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        {route?.length > 1 && <Polyline positions={route} pathOptions={{ color: '#1c4532', weight: 5, opacity: 0.85 }} />}
        {user && <CircleMarker center={[user.lat, user.lng]} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#2f7f95', fillOpacity: 1 }} />}
        <FitBounds points={user ? [...points, user] : points} route={route} />
      </MapContainer>
    </div>
  );
}
