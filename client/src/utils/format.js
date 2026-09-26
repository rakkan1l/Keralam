export const DISTRICT_NAMES = {
  thiruvananthapuram: { en: 'Thiruvananthapuram', ml: 'തിരുവനന്തപുരം' },
  kollam: { en: 'Kollam', ml: 'കൊല്ലം' },
  pathanamthitta: { en: 'Pathanamthitta', ml: 'പത്തനംതിട്ട' },
  alappuzha: { en: 'Alappuzha', ml: 'ആലപ്പുഴ' },
  kottayam: { en: 'Kottayam', ml: 'കോട്ടയം' },
  idukki: { en: 'Idukki', ml: 'ഇടുക്കി' },
  ernakulam: { en: 'Ernakulam', ml: 'എറണാകുളം' },
  thrissur: { en: 'Thrissur', ml: 'തൃശ്ശൂർ' },
  palakkad: { en: 'Palakkad', ml: 'പാലക്കാട്' },
  malappuram: { en: 'Malappuram', ml: 'മലപ്പുറം' },
  kozhikode: { en: 'Kozhikode', ml: 'കോഴിക്കോട്' },
  wayanad: { en: 'Wayanad', ml: 'വയനാട്' },
  kannur: { en: 'Kannur', ml: 'കണ്ണൂർ' },
  kasaragod: { en: 'Kasaragod', ml: 'കാസർഗോഡ്' },
};
export const DISTRICT_SLUGS = Object.keys(DISTRICT_NAMES);

export function districtName(slug, lang = 'en') {
  const d = DISTRICT_NAMES[slug];
  return d ? d[lang] || d.en : slug;
}

/** Pick the Malayalam field when available and the UI is in Malayalam. */
export function localized(doc, field, lang) {
  if (!doc) return '';
  if (lang === 'ml' && doc[`${field}Ml`]) return doc[`${field}Ml`];
  return doc[field] || '';
}

export function formatDate(value, lang = 'en', opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  return new Intl.DateTimeFormat(lang === 'ml' ? 'ml-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', ...opts }).format(new Date(value));
}

export function formatDateRange(start, end, lang = 'en') {
  const s = new Date(start);
  const e = new Date(end);
  const sameDay = s.toDateString() === e.toDateString();
  const time = { hour: 'numeric', minute: '2-digit' };
  if (sameDay) {
    return `${formatDate(s, lang, { weekday: 'short', day: 'numeric', month: 'short' })}, ${formatDate(s, lang, time)} – ${formatDate(e, lang, time)}`;
  }
  return `${formatDate(s, lang, { day: 'numeric', month: 'short' })} – ${formatDate(e, lang, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export function formatDuration(min) {
  if (min == null) return '';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}

export const inr = (n) => (n == null ? '' : `₹${Number(n).toLocaleString('en-IN')}`);

export function coordsOf(doc) {
  const c = doc?.location?.coordinates;
  return Array.isArray(c) && c.length === 2 ? { lng: c[0], lat: c[1] } : null;
}

export function mapsLink(doc) {
  const c = coordsOf(doc);
  if (!c) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
}

/** Route path for any target type. */
export function hrefFor(type, doc) {
  const slug = doc?.slug;
  switch (type) {
    case 'place':
      return `/places/${slug}`;
    case 'business':
      return `/listings/${slug}`;
    case 'stay':
      return `/stays/${slug}`;
    case 'event':
      return `/events/${slug}`;
    case 'dish':
      return `/food/dishes/${slug}`;
    default:
      return '/';
  }
}

export const cx = (...parts) => parts.filter(Boolean).join(' ');
