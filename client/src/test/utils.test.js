import { describe, it, expect } from 'vitest';
import { districtName, localized, formatDuration, inr, hrefFor, mapsLink, DISTRICT_SLUGS } from '../utils/format';
import { sceneFor } from '../components/ui/SceneArt';
import { safeNext } from '../pages/Login';
import { toSavePayload } from '../features/trips/TripItinerary';

describe('format utilities', () => {
  it('knows all 14 districts in both languages', () => {
    expect(DISTRICT_SLUGS).toHaveLength(14);
    expect(districtName('kozhikode', 'ml')).toBe('കോഴിക്കോട്');
    expect(districtName('kozhikode', 'en')).toBe('Kozhikode');
  });
  it('falls back to English when a Malayalam field is missing', () => {
    expect(localized({ name: 'Bekal Fort', nameMl: 'ബേക്കൽ കോട്ട' }, 'name', 'ml')).toBe('ബേക്കൽ കോട്ട');
    expect(localized({ name: 'Bekal Fort' }, 'name', 'ml')).toBe('Bekal Fort');
  });
  it('formats durations and rupees', () => {
    expect(formatDuration(135)).toBe('2 h 15 min');
    expect(formatDuration(45)).toBe('45 min');
    expect(inr(125000)).toBe('₹1,25,000');
  });
  it('builds links', () => {
    expect(hrefFor('business', { slug: 'x' })).toBe('/listings/x');
    expect(mapsLink({ location: { coordinates: [76.1, 10.2] } })).toContain('destination=10.2,76.1');
    expect(mapsLink({})).toBeNull();
  });
});

describe('scene art', () => {
  it('picks a scene from categories and kinds', () => {
    expect(sceneFor(['waterfalls', 'forests'])).toBe('waterfall');
    expect(sceneFor(['beaches'])).toBe('beach');
    expect(sceneFor([], 'houseboat')).toBe('backwater');
    expect(sceneFor([], 'cafe')).toBe('food');
  });
});

describe('auth redirect safety', () => {
  it('only allows same-site relative paths', () => {
    expect(safeNext('/saved?tab=trips')).toBe('/saved?tab=trips');
    expect(safeNext('https://evil.example')).toBe('/');
    expect(safeNext('//evil.example')).toBe('/');
    expect(safeNext(null)).toBe('/');
  });
});

describe('trip save payload', () => {
  it('keeps only fields the API accepts', () => {
    const trip = {
      title: 'Day trip',
      generator: 'demo',
      summary: { totalDistanceKm: 10 },
      inputs: { duration: 'one-day' },
      days: [{ day: 1, items: [{ kind: 'place', title: 'A', targetType: 'place', targetId: 'abc', costEstimate: { confidence: 'unavailable' }, warnings: ['x'], coordinates: [76, 10], notes: ['n', null] }] }],
    };
    const p = toSavePayload(trip);
    expect(p.days[0].items[0]).not.toHaveProperty('costEstimate');
    expect(p.days[0].items[0]).not.toHaveProperty('warnings');
    expect(p.days[0].items[0].notes).toEqual(['n']);
    expect(p.title).toBe('Day trip');
  });
});

import { monthsLabel } from '../pages/PlaceDetail';
describe('best months label', () => {
  it('handles seasons that wrap the year end', () => {
    expect(monthsLabel([10, 11, 12, 1, 2, 3])).toBe('Oct – Mar');
    expect(monthsLabel([3, 4, 5])).toBe('Mar – May');
    expect(monthsLabel([1, 5])).toBe('Jan, May');
    expect(monthsLabel([])).toBeNull();
  });
});
