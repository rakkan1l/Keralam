import { env } from '../config/env.js';
import { estimateRoad, haversineKm, ROAD_FACTOR, round1, distanceToPolylineKm, bboxWithBuffer, samplePolyline } from '../utils/geo.js';
import { Place, Business, RouteStop } from '../models/index.js';
import { PUBLIC_STATUSES } from '../config/constants.js';

/**
 * Plans a route through `from → waypoints → to`.
 * - provider "osrm": real road geometry from an OSRM server (configurable, optional).
 * - otherwise / on failure: a straight-line estimate, explicitly flagged `estimated: true`.
 * No live traffic data is used or implied.
 */
export async function planRoute({ from, to, waypoints = [], profile = 'driving' }) {
  const points = [from, ...waypoints, to];
  if (env.routing.provider === 'osrm') {
    try {
      return await osrmRoute(points, profile);
    } catch (err) {
      const fallback = estimateRoute(points);
      fallback.notice = `Live routing unavailable (${err.message}); showing a straight-line estimate.`;
      return fallback;
    }
  }
  return estimateRoute(points);
}

function estimateRoute(points) {
  const legs = [];
  for (let i = 0; i < points.length - 1; i++) {
    legs.push(estimateRoad(points[i], points[i + 1]));
  }
  const distanceKm = round1(legs.reduce((s, l) => s + l.distanceKm, 0));
  const durationMin = legs.reduce((s, l) => s + l.durationMin, 0);
  return {
    provider: 'estimate',
    estimated: true,
    notice: `Estimated from straight-line distance × ${ROAD_FACTOR} at an average ${35} km/h. Actual road distance and time will differ; no traffic data is included.`,
    distanceKm,
    durationMin,
    legs,
    geometry: { type: 'LineString', coordinates: points },
  };
}

async function osrmRoute(points, profile) {
  const coords = points.map(([lng, lat]) => `${lng},${lat}`).join(';');
  const url = `${env.routing.osrmUrl.replace(/\/$/, '')}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&alternatives=${points.length === 2 ? 'true' : 'false'}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'KeralaTravelPlatform/0.1' } });
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const body = await res.json();
    if (body.code !== 'Ok' || !body.routes?.length) throw new Error(body.message || 'no route found');
    const toRoute = (r) => ({
      distanceKm: round1(r.distance / 1000),
      durationMin: Math.round(r.duration / 60),
      legs: r.legs.map((l) => ({ distanceKm: round1(l.distance / 1000), durationMin: Math.round(l.duration / 60) })),
      geometry: r.geometry,
    });
    const [main, ...alternatives] = body.routes.map(toRoute);
    return {
      provider: 'osrm',
      estimated: false,
      notice: 'Road route from OpenStreetMap data via OSRM. Durations are typical free-flow times and do not include live traffic.',
      ...main,
      alternatives,
    };
  } finally {
    clearTimeout(timer);
  }
}

const ALONG_SOURCES = {
  viewpoints: [{ Model: Place, filter: { categories: 'viewpoints' }, type: 'place' }, { Model: RouteStop, filter: { kind: 'viewpoint' }, type: 'routestop' }],
  attractions: [{ Model: Place, filter: {}, type: 'place' }],
  food: [
    { Model: Business, filter: { kind: { $in: ['restaurant', 'street-food', 'bakery'] } }, type: 'business' },
    { Model: RouteStop, filter: { kind: 'food-stop' }, type: 'routestop' },
  ],
  'tea-coffee': [
    { Model: Business, filter: { kind: 'cafe' }, type: 'business' },
    { Model: RouteStop, filter: { kind: 'tea-coffee' }, type: 'routestop' },
  ],
  fuel: [
    { Model: Business, filter: { kind: 'fuel' }, type: 'business' },
    { Model: RouteStop, filter: { kind: 'fuel' }, type: 'routestop' },
  ],
  'ev-charging': [
    { Model: Business, filter: { kind: 'ev-charging' }, type: 'business' },
    { Model: RouteStop, filter: { kind: 'ev-charging' }, type: 'routestop' },
  ],
  toilets: [
    { Model: Business, filter: { kind: 'public-toilet' }, type: 'business' },
    { Model: RouteStop, filter: { kind: 'public-toilet' }, type: 'routestop' },
  ],
  hospitals: [{ Model: Business, filter: { kind: 'hospital' }, type: 'business' }],
  'rest-areas': [{ Model: RouteStop, filter: { kind: 'rest-area' }, type: 'routestop' }],
};

/** Finds useful stops within bufferKm of a route polyline. */
export async function findAlongRoute({ line, categories, bufferKm = 5, limit = 40 }) {
  const sampled = samplePolyline(line, 300);
  const [[minLng, minLat], [maxLng, maxLat]] = bboxWithBuffer(sampled, bufferKm);
  const box = {
    $geoWithin: {
      $geometry: {
        type: 'Polygon',
        coordinates: [[[minLng, minLat], [maxLng, minLat], [maxLng, maxLat], [minLng, maxLat], [minLng, minLat]]],
      },
    },
  };
  const start = sampled[0];
  const results = [];
  const seen = new Set();
  await Promise.all(
    categories.flatMap((cat) =>
      (ALONG_SOURCES[cat] || []).map(async ({ Model, filter, type }) => {
        const docs = await Model.find(
          { status: { $in: PUBLIC_STATUSES }, ...filter, location: box },
          { name: 1, slug: 1, kind: 1, categories: 1, district: 1, location: 1, isDemo: 1, images: { $slice: 1 } },
        )
          .limit(300)
          .lean();
        for (const d of docs) {
          const id = String(d._id);
          if (seen.has(id)) continue;
          const offRouteKm = distanceToPolylineKm(d.location.coordinates, sampled);
          if (offRouteKm > bufferKm) continue;
          seen.add(id);
          results.push({
            ...d,
            category: cat,
            targetType: type,
            offRouteKm: round1(offRouteKm),
            fromStartKm: round1(haversineKm(start, d.location.coordinates) * ROAD_FACTOR),
          });
        }
      }),
    ),
  );
  results.sort((a, b) => a.fromStartKm - b.fromStartKm);
  return results.slice(0, limit);
}

export function externalMapsLinks(from, to) {
  const dest = `${to[1]},${to[0]}`;
  const origin = from ? `${from[1]},${from[0]}` : '';
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${dest}${origin ? `&origin=${origin}` : ''}`,
    osm: `https://www.openstreetmap.org/directions?${origin ? `from=${origin}&` : ''}to=${dest}`,
    apple: `https://maps.apple.com/?daddr=${dest}${origin ? `&saddr=${origin}` : ''}`,
  };
}
