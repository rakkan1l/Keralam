const R = 6371; // km

const toRad = (d) => (d * Math.PI) / 180;

/** Great-circle distance in km between [lng, lat] pairs. */
export function haversineKm([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Kerala roads are rarely straight: a 1.35 factor turns crow-flies distance into a
// rough road-distance estimate. Always label results derived from this as estimates.
export const ROAD_FACTOR = 1.35;
export const AVG_SPEED_KMH = 35;

export function estimateRoad(fromLngLat, toLngLat) {
  const km = haversineKm(fromLngLat, toLngLat) * ROAD_FACTOR;
  return { distanceKm: round1(km), durationMin: Math.round((km / AVG_SPEED_KMH) * 60) };
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

/** Distance in km from point p to segment a-b (all [lng, lat]); equirectangular approximation. */
export function pointToSegmentKm(p, a, b) {
  const lat0 = toRad((a[1] + b[1]) / 2);
  const proj = ([lng, lat]) => [toRad(lng) * Math.cos(lat0) * R, toRad(lat) * R];
  const [px, py] = proj(p);
  const [ax, ay] = proj(a);
  const [bx, by] = proj(b);
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

export function distanceToPolylineKm(point, line) {
  if (line.length === 1) return haversineKm(point, line[0]);
  let min = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    min = Math.min(min, pointToSegmentKm(point, line[i], line[i + 1]));
  }
  return min;
}

/** Bounding box [[minLng, minLat], [maxLng, maxLat]] expanded by bufferKm. */
export function bboxWithBuffer(line, bufferKm) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of line) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  const dLat = bufferKm / 111;
  const dLng = bufferKm / (111 * Math.cos(toRad((minLat + maxLat) / 2)));
  return [
    [minLng - dLng, minLat - dLat],
    [maxLng + dLng, maxLat + dLat],
  ];
}

/** Reduce a long polyline to at most maxPoints by even sampling (keeps endpoints). */
export function samplePolyline(line, maxPoints = 200) {
  if (line.length <= maxPoints) return line;
  const step = (line.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => line[Math.round(i * step)]);
}

export function isValidLngLat(lng, lat) {
  return Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90;
}
