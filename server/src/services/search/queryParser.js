import { PLACE_CATEGORIES, MOODS } from '../../config/constants.js';
import { resolveDistrict, foldKey } from '../../utils/searchKeys.js';

/**
 * Rule-based interpreter for travel-style queries such as
 *   "peaceful beach near Kozhikode", "waterfall suitable for families",
 *   "places under 100 km from Malappuram", "cheap food near me",
 *   "what can I do for four hours?"
 *
 * It is deliberately deterministic (no AI): it extracts structured filters and leaves
 * the remaining words for keyword matching. An AI-backed parser can later implement the
 * same output contract ({ filters, keywords, interpretation }).
 */

const CATEGORY_SYNONYMS = {
  beaches: ['beach', 'beaches', 'sea', 'seaside', 'shore', 'kadappuram', 'കടപ്പുറം', 'ബീച്ച്'],
  waterfalls: ['waterfall', 'waterfalls', 'falls', 'cascade', 'വെള്ളച്ചാട്ടം'],
  'hill-stations': ['hill', 'hills', 'hillstation', 'mountain', 'mountains', 'peak', 'മല'],
  forests: ['forest', 'forests', 'jungle', 'woods', 'കാട്'],
  wildlife: ['wildlife', 'sanctuary', 'safari', 'animals', 'birds', 'birding', 'elephant', 'tiger'],
  backwaters: ['backwater', 'backwaters', 'houseboat', 'kayal', 'കായൽ', 'canal', 'canals'],
  heritage: ['heritage', 'fort', 'palace', 'history', 'historic', 'historical', 'colonial'],
  museums: ['museum', 'museums', 'gallery', 'art'],
  adventure: ['adventure', 'rafting', 'zipline', 'paragliding', 'kayaking', 'climbing'],
  photography: ['photo', 'photography', 'photogenic', 'instagram', 'scenic'],
  family: ['family', 'families', 'kids', 'children', 'child'],
  religious: ['temple', 'temples', 'church', 'churches', 'mosque', 'masjid', 'religious', 'pilgrimage', 'ക്ഷേത്രം'],
  viewpoints: ['viewpoint', 'viewpoints', 'view', 'sunset point', 'lookout'],
  'lakes-dams': ['lake', 'lakes', 'dam', 'dams', 'reservoir'],
  villages: ['village', 'villages', 'rural', 'countryside'],
  treks: ['trek', 'treks', 'trekking', 'hike', 'hiking'],
  'nature-walks': ['walk', 'walks', 'trail', 'trails', 'nature walk'],
  parks: ['park', 'parks', 'garden', 'gardens'],
};

const MOOD_SYNONYMS = {
  peaceful: ['peaceful', 'quiet', 'calm', 'serene', 'relaxing', 'offbeat', 'secluded', 'less crowded', 'uncrowded'],
  adventure: ['thrilling', 'adventurous'],
  family: ['family friendly', 'family-friendly'],
  photography: ['photogenic'],
  food: ['food', 'eat', 'eating', 'foodie'],
  romantic: ['romantic', 'couple', 'couples', 'honeymoon'],
  shopping: ['shopping', 'shop', 'souvenir', 'souvenirs'],
  'rainy-day': ['rainy', 'rain', 'monsoon', 'indoor'],
  'sunrise-sunset': ['sunrise', 'sunset'],
  'local-culture': ['culture', 'cultural', 'local', 'traditional', 'theyyam', 'kathakali'],
};

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5 };

const STOPWORDS = new Set(
  'a an the in at on of to for with and or near me by around from within under less than places place spots spot best good nice top things thing do can i what where which is are some any suitable visit visiting see km kms kilometers kilometres hours hour hrs hr minutes day days trip my find show'.split(
    ' ',
  ),
);

const INTENTS = {
  food: ['food', 'eat', 'restaurant', 'restaurants', 'cafe', 'cafes', 'coffee', 'biriyani', 'biryani', 'mandhi', 'breakfast', 'lunch', 'dinner', 'snacks', 'seafood', 'dessert'],
  stay: ['stay', 'stays', 'hotel', 'hotels', 'resort', 'resorts', 'homestay', 'homestays', 'hostel', 'hostels', 'villa', 'camping', 'treehouse'],
  event: ['event', 'events', 'festival', 'festivals', 'concert', 'concerts', 'exhibition', 'match'],
};

function numberFrom(token) {
  if (token == null) return null;
  const n = Number(token);
  if (Number.isFinite(n)) return n;
  return NUMBER_WORDS[token] ?? null;
}

export function parseQuery(raw = '') {
  const original = String(raw).trim();
  let text = ` ${original.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ')} `;
  const filters = { categories: [], moods: [] };
  const interpretation = [];

  // "near me"
  if (/\bnear(by)? me\b|\baround me\b|\bnearby\b/.test(text)) {
    filters.nearMe = true;
    interpretation.push({ type: 'nearMe', label: 'Near you' });
    text = text.replace(/\bnear(by)? me\b|\baround me\b|\bnearby\b/g, ' ');
  }

  // "under 100 km from X" / "within 50 km of X"
  const distMatch = text.match(/\b(?:under|within|less than|below)\s+(\d+)\s*(?:km|kms|kilometers|kilometres)\b(?:\s+(?:from|of|around)\s+([a-zഀ-ൿ]+))?/);
  if (distMatch) {
    filters.maxDistanceKm = Number(distMatch[1]);
    interpretation.push({ type: 'distance', label: `Within ${distMatch[1]} km` });
    if (distMatch[2]) {
      const d = resolveDistrict(distMatch[2]);
      if (d) filters.originDistrict = d;
    }
    text = text.replace(distMatch[0], ' ');
  }

  // "for four hours", "3 hours", "half day", "weekend"
  const hourMatch = text.match(/\b(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:hours?|hrs?)\b/);
  if (hourMatch) {
    filters.maxHours = numberFrom(hourMatch[1]);
    interpretation.push({ type: 'time', label: `${filters.maxHours} hour${filters.maxHours === 1 ? '' : 's'} or less` });
    text = text.replace(hourMatch[0], ' ');
  } else if (/\bhalf[- ]day\b/.test(text)) {
    filters.maxHours = 5;
    interpretation.push({ type: 'time', label: 'Half day' });
    text = text.replace(/\bhalf[- ]day\b/, ' ');
  } else if (/\bweekend\b/.test(text)) {
    filters.weekend = true;
    interpretation.push({ type: 'time', label: 'Weekend getaway' });
    text = text.replace(/\bweekend\b/, ' ');
  }

  // Budget
  if (/\b(cheap|budget|affordable|low cost|inexpensive)\b/.test(text)) {
    filters.budget = 'budget';
    interpretation.push({ type: 'budget', label: 'Budget-friendly' });
    text = text.replace(/\b(cheap|budget|affordable|low cost|inexpensive)\b/g, ' ');
  } else if (/\bfree\b/.test(text)) {
    filters.budget = 'free';
    interpretation.push({ type: 'budget', label: 'Free entry' });
    text = text.replace(/\bfree\b/g, ' ');
  } else if (/\b(luxury|premium|fine dining)\b/.test(text)) {
    filters.budget = 'premium';
    interpretation.push({ type: 'budget', label: 'Premium' });
    text = text.replace(/\b(luxury|premium|fine dining)\b/g, ' ');
  }

  // Accessibility
  if (/\b(wheelchair|accessible|minimal walking|less walking|elderly)\b/.test(text)) {
    filters.accessible = true;
    interpretation.push({ type: 'accessibility', label: 'Accessibility-friendly' });
    text = text.replace(/\b(wheelchair|accessible|minimal walking|less walking|elderly)\b/g, ' ');
  }

  // Intent (food / stay / event)
  const intentTerms = [];
  for (const [intent, words] of Object.entries(INTENTS)) {
    for (const w of words) {
      if (text.includes(` ${w} `)) {
        filters.intent = filters.intent || intent;
        intentTerms.push(w);
      }
    }
  }

  // Moods (multi-word first)
  for (const [mood, words] of Object.entries(MOOD_SYNONYMS)) {
    for (const w of words.sort((a, b) => b.length - a.length)) {
      if (text.includes(` ${w} `)) {
        if (!filters.moods.includes(mood) && !(mood === 'food' && filters.intent === 'food')) filters.moods.push(mood);
        text = text.replace(` ${w} `, ' ');
      }
    }
  }

  // Categories
  for (const [cat, words] of Object.entries(CATEGORY_SYNONYMS)) {
    for (const w of words.sort((a, b) => b.length - a.length)) {
      if (text.includes(` ${w} `)) {
        if (!filters.categories.includes(cat)) filters.categories.push(cat);
        text = text.replace(` ${w} `, ' ');
      }
    }
  }
  // "family" is both a mood and a category — prefer the familyFriendly filter.
  if (filters.categories.includes('family')) {
    filters.categories = filters.categories.filter((c) => c !== 'family');
    filters.familyFriendly = true;
    interpretation.push({ type: 'family', label: 'Family-friendly' });
  }

  // District (possibly after "near" / "in")
  const words = text.split(' ').filter(Boolean);
  const remaining = [];
  for (let i = 0; i < words.length; i++) {
    const two = i < words.length - 1 ? `${words[i]} ${words[i + 1]}` : null;
    const d2 = two && resolveDistrict(two);
    const d1 = resolveDistrict(words[i]);
    if (d2 && !filters.district) {
      filters.district = d2;
      i++;
      continue;
    }
    if (d1 && !filters.district && !filters.originDistrict) {
      filters.district = d1;
      continue;
    }
    if (d1 && filters.originDistrict === d1) continue;
    if (!STOPWORDS.has(words[i])) remaining.push(words[i]);
  }

  for (const c of filters.categories) interpretation.push({ type: 'category', value: c, label: c.replace(/-/g, ' ') });
  for (const m of filters.moods) interpretation.push({ type: 'mood', value: m, label: m.replace(/-/g, ' ') });
  if (filters.district) interpretation.push({ type: 'district', value: filters.district, label: filters.district });
  if (filters.originDistrict) interpretation.push({ type: 'origin', value: filters.originDistrict, label: `From ${filters.originDistrict}` });
  if (filters.intent) interpretation.push({ type: 'intent', value: filters.intent, label: filters.intent });

  const keywords = remaining.filter((w) => w.length > 1 && !INTENTS.food.includes(w) && !INTENTS.stay.includes(w) && !INTENTS.event.includes(w));

  return {
    original,
    filters,
    keywords,
    keywordKeys: keywords.map(foldKey).filter((k) => k.length > 1),
    intentTerms,
    interpretation,
    engine: 'structured',
  };
}

export { PLACE_CATEGORIES, MOODS };
