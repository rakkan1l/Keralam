import { describe, it, expect } from 'vitest';
import { parseQuery } from '../src/services/search/queryParser.js';
import { foldKey, resolveDistrict } from '../src/utils/searchKeys.js';

describe('structured query parser', () => {
  it('extracts category, mood and district', () => {
    const { filters } = parseQuery('Peaceful beach near Kozhikode');
    expect(filters.categories).toEqual(['beaches']);
    expect(filters.moods).toEqual(['peaceful']);
    expect(filters.district).toBe('kozhikode');
  });
  it('understands distance from a district', () => {
    const { filters } = parseQuery('Places under 100 km from Malappuram');
    expect(filters.maxDistanceKm).toBe(100);
    expect(filters.originDistrict).toBe('malappuram');
  });
  it('understands budget, intent and near me', () => {
    const { filters } = parseQuery('Cheap food near me');
    expect(filters).toMatchObject({ budget: 'budget', intent: 'food', nearMe: true });
  });
  it('understands time available in words', () => {
    expect(parseQuery('What can I do for four hours?').filters.maxHours).toBe(4);
  });
  it('maps family suitability', () => {
    expect(parseQuery('Waterfall suitable for families').filters).toMatchObject({ categories: ['waterfalls'], familyFriendly: true });
  });
  it('folds spelling variants to the same key', () => {
    expect(foldKey('Kozhikode')).toBe(foldKey('Kozikode'));
    expect(foldKey('Athirappilly')).toBe(foldKey('Athirapilly'));
    expect(foldKey('Vagamon')).toBe(foldKey('Wagamon'));
    expect(resolveDistrict('Calicut')).toBe('kozhikode');
    expect(resolveDistrict('ആലപ്പുഴ')).toBe('alappuzha');
  });
});
