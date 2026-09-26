import { describe, it, expect } from 'vitest';
import en from '../i18n/locales/en.json';
import ml from '../i18n/locales/ml.json';

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
}

describe('translations', () => {
  it('Malayalam covers every English key', () => {
    const missing = keys(en).filter((k) => !keys(ml).includes(k));
    expect(missing).toEqual([]);
  });
  it('has no empty strings', () => {
    const empty = (o) => keys(o).filter((k) => k.split('.').reduce((a, p) => a[p], o) === '');
    expect(empty(en)).toEqual([]);
    expect(empty(ml)).toEqual([]);
  });
});
