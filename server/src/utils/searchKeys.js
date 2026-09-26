import { DISTRICTS } from '../config/constants.js';

/**
 * Phonetic-ish folding for Malayalam place names written in English.
 * "Kozhikode", "Kozikode" and "Kozhikkode" all fold to the same key, as do
 * "Athirappilly" / "Athirapally", "Vagamon" / "Wagamon", "Alleppey" / "Aleppey".
 */
export function foldKey(input = '') {
  return String(input)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ഀ-ൿ]+/g, '')
    .replace(/zh?/g, 'l') // ഴ is written zh, z or l
    .replace(/([bcdgkpt])h/g, '$1')
    .replace(/w/g, 'v')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/y/g, 'i')
    .replace(/(.)\1+/g, '$1');
}

/** Build the searchKeys array stored on documents from their names and aliases. */
export function buildSearchKeys(...values) {
  const keys = new Set();
  for (const v of values.flat()) {
    if (!v) continue;
    const s = String(v);
    keys.add(foldKey(s));
    // Also index individual words so "fort" matches "Bekal Fort".
    for (const word of s.split(/[\s,/-]+/)) {
      if (word.length > 2) keys.add(foldKey(word));
    }
  }
  keys.delete('');
  return [...keys];
}

const districtIndex = new Map();
for (const d of DISTRICTS) {
  for (const v of [d.slug, d.name, d.nameMl, ...d.aliases]) districtIndex.set(foldKey(v), d.slug);
}

/** Resolve free text ("calicut", "കോഴിക്കോട്") to a district slug, or null. */
export function resolveDistrict(text) {
  if (!text) return null;
  return districtIndex.get(foldKey(text)) || null;
}
