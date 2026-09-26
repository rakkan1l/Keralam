// Food, demo listings, transport, emergency and category seed data.
// Anything that would require real-world verification (restaurants, stays, events,
// services, prices, phone numbers) is either clearly fictional demo content
// (isDemo: true, "Sample" in the name) or stored as unverified pending admin review.

import { DISTRICTS } from '../../config/constants.js';

const pt = (lat, lng) => ({ type: 'Point', coordinates: [lng, lat], approximate: true });

export const dishes = [
  { name: 'Puttu and Kadala Curry', nameMl: 'പുട്ടും കടലയും', region: 'Statewide', categories: ['kerala', 'breakfast', 'vegetarian', 'budget'], dietary: ['vegetarian'], description: 'Steamed cylinders of rice flour and grated coconut, served with a spiced black-chickpea curry.' },
  { name: 'Appam and Stew', nameMl: 'അപ്പവും സ്റ്റൂവും', region: 'Central Kerala', categories: ['kerala', 'breakfast'], dietary: [], description: 'Lacy fermented rice pancakes with soft centres, served with a mild coconut-milk stew of vegetables or meat.' },
  { name: 'Kerala Sadya', nameMl: 'സദ്യ', region: 'Statewide', categories: ['kerala', 'vegetarian'], dietary: ['vegetarian'], description: 'A vegetarian feast served on a banana leaf with rice and many curries, pickles and payasam — especially associated with Onam and weddings.' },
  { name: 'Thalassery Biriyani', nameMl: 'തലശ്ശേരി ബിരിയാണി', alternateNames: ['Malabar Biriyani', 'Biryani'], region: 'Malabar', categories: ['malabar', 'biriyani'], dietary: ['non-vegetarian'], description: 'A fragrant Malabar biriyani made with short-grain kaima rice, fried onions and spices.' },
  { name: 'Kozhikodan Biriyani', alternateNames: ['Calicut Biriyani'], region: 'Malabar', categories: ['malabar', 'biriyani'], dietary: ['non-vegetarian'], description: 'Kozhikode’s take on dum biriyani, rich with ghee and whole spices.' },
  { name: 'Mandhi', nameMl: 'മന്തി', alternateNames: ['Kuzhi Mandhi', 'Mandi'], region: 'Malabar', categories: ['mandhi', 'malabar'], dietary: ['non-vegetarian'], description: 'An Arabian-style dish of slow-cooked meat and lightly spiced rice that has become hugely popular across Malabar.' },
  { name: 'Karimeen Pollichathu', nameMl: 'കരിമീൻ പൊള്ളിച്ചത്', alternateNames: ['Pearl spot fry'], region: 'Central Kerala', categories: ['seafood', 'kerala'], dietary: ['seafood'], description: 'Pearl-spot fish marinated in spices, wrapped in banana leaf and pan-roasted — a backwater classic.' },
  { name: 'Kappa and Meen Curry', nameMl: 'കപ്പയും മീൻ കറിയും', alternateNames: ['Tapioca and fish curry'], region: 'Statewide', categories: ['kerala', 'seafood', 'budget'], dietary: ['seafood'], description: 'Boiled and mashed tapioca served with a fiery red fish curry.' },
  { name: 'Parotta and Beef Fry', alternateNames: ['Porotta'], region: 'Statewide', categories: ['kerala', 'late-night', 'budget'], dietary: ['non-vegetarian'], description: 'Flaky layered flatbread paired with dry-roasted spiced beef — a staple of evening eateries.' },
  { name: 'Pazhampori', nameMl: 'പഴംപൊരി', alternateNames: ['Banana fritters', 'Ethakka appam'], region: 'Statewide', categories: ['street-food', 'budget', 'vegetarian'], dietary: ['vegetarian'], description: 'Ripe plantain slices dipped in batter and fried — the classic tea-time snack.' },
  { name: 'Kozhikodan Halwa', alternateNames: ['Calicut Halwa'], region: 'Malabar', categories: ['desserts', 'malabar'], dietary: ['vegetarian'], description: 'Glossy, chewy halwa sold in many colours and flavours along Kozhikode’s old sweet street.' },
  { name: 'Unniyappam', nameMl: 'ഉണ്ണിയപ്പം', region: 'Statewide', categories: ['desserts', 'vegetarian'], dietary: ['vegetarian'], description: 'Small sweet dumplings of rice, jaggery and banana fried in a special pan.' },
  { name: 'Payasam', nameMl: 'പായസം', region: 'Statewide', categories: ['desserts', 'vegetarian'], dietary: ['vegetarian'], description: 'Sweet pudding made with rice or lentils, jaggery or milk — a fixture of every sadya.' },
  { name: 'Idiyappam', nameMl: 'ഇടിയപ്പം', alternateNames: ['String hoppers'], region: 'Statewide', categories: ['breakfast', 'kerala'], dietary: ['vegetarian'], description: 'Steamed nests of rice noodles, usually eaten with curry or coconut milk.' },
  { name: 'Sulaimani', alternateNames: ['Sulaimani chai'], region: 'Malabar', categories: ['malabar', 'cafes', 'budget'], dietary: ['vegetarian', 'vegan'], description: 'Light black tea with lemon and spices, served after a heavy Malabar meal.' },
  { name: 'Erachi Pathiri', alternateNames: ['Meat pathiri'], region: 'Malabar', categories: ['malabar', 'street-food'], dietary: ['non-vegetarian'], description: 'Layered pastry parcels stuffed with spiced minced meat — a Ramadan and evening snack favourite.' },
].map((dish) => ({ ...dish, typicalPrice: { band: 'unknown', note: 'Prices vary by place', estimated: true }, status: 'published' }));

// ---- Demo businesses (fictional) ----
const districtCentre = Object.fromEntries(
  [
    ['thiruvananthapuram', 8.5241, 76.9366],
    ['kollam', 8.8932, 76.6141],
    ['pathanamthitta', 9.2648, 76.787],
    ['alappuzha', 9.4981, 76.3388],
    ['kottayam', 9.5916, 76.5222],
    ['idukki', 10.0889, 77.0595],
    ['ernakulam', 9.9816, 76.2999],
    ['thrissur', 10.5276, 76.2144],
    ['palakkad', 10.7867, 76.6548],
    ['malappuram', 11.051, 76.0711],
    ['kozhikode', 11.2588, 75.7804],
    ['wayanad', 11.6085, 76.083],
    ['kannur', 11.8745, 75.3704],
    ['kasaragod', 12.4996, 74.9869],
  ].map(([slug, lat, lng]) => [slug, { lat, lng }]),
);
export { districtCentre };

// Deterministic small offsets so demo pins don't overlap.
const near = (slug, i, spread = 0.02) => {
  const c = districtCentre[slug];
  const angle = (i * 137.5 * Math.PI) / 180;
  const r = spread * (0.4 + (i % 5) * 0.15);
  return pt(c.lat + r * Math.sin(angle), c.lng + r * Math.cos(angle));
};

const nameOf = (slug) => DISTRICTS.find((d) => d.slug === slug).name;
const MALABAR = ['malappuram', 'kozhikode', 'wayanad', 'kannur', 'kasaragod'];

export function buildDemoBusinesses() {
  const out = [];
  const demo = { isDemo: true, status: 'published', description: 'Sample listing for development. Details are placeholders and not verified.' };
  DISTRICTS.forEach(({ slug }, di) => {
    const n = nameOf(slug);
    const malabar = MALABAR.includes(slug);
    out.push(
      { ...demo, name: `Sample ${malabar ? 'Malabar Biriyani House' : 'Kerala Meals Kitchen'} — ${n}`, kind: 'restaurant', district: slug, location: near(slug, 1), priceRange: 'budget', food: { categories: malabar ? ['malabar', 'biriyani', 'budget'] : ['kerala', 'breakfast', 'budget'], cuisines: ['Kerala'], dietary: malabar ? ['non-vegetarian', 'halal'] : ['vegetarian', 'non-vegetarian'] }, facilities: ['family seating'] },
      { ...demo, name: `Sample Seafood Grill — ${n}`, kind: 'restaurant', district: slug, location: near(slug, 2), priceRange: di % 3 === 0 ? 'premium' : 'mid', food: { categories: ['seafood', di % 3 === 0 ? 'premium' : 'kerala'], cuisines: ['Kerala', 'Seafood'], dietary: ['seafood'] } },
      { ...demo, name: `Sample Filter Coffee Café — ${n}`, kind: 'cafe', district: slug, location: near(slug, 3), priceRange: 'mid', food: { categories: ['cafes', 'desserts'], cuisines: ['Café'], dietary: ['vegetarian'] }, facilities: ['wifi'] },
      { ...demo, name: `Sample Thattukada Street Stall — ${n}`, kind: 'street-food', district: slug, location: near(slug, 4), priceRange: 'budget', food: { categories: ['street-food', 'late-night', 'budget'], cuisines: ['Kerala'], dietary: ['non-vegetarian'], lateNight: true } },
    );
    if (malabar) out.push({ ...demo, name: `Sample Kuzhi Mandhi — ${n}`, kind: 'restaurant', district: slug, location: near(slug, 5), priceRange: 'mid', food: { categories: ['mandhi', 'malabar'], cuisines: ['Arabian', 'Malabar'], dietary: ['non-vegetarian', 'halal'] } });

    // Shopping, theatres, activities
    out.push(
      { ...demo, name: `Sample Spice Market — ${n}`, kind: 'spices', district: slug, location: near(slug, 6), priceRange: 'budget', shopping: { productTypes: ['spices', 'tea', 'coffee'] } },
      { ...demo, name: `Sample Handicrafts Emporium — ${n}`, kind: 'handicrafts', district: slug, location: near(slug, 7), shopping: { productTypes: ['coir', 'wood carving', 'handloom'] } },
      { ...demo, name: `Sample Cinemas — ${n}`, kind: 'theatre', district: slug, location: near(slug, 8), theatre: { languages: ['Malayalam', 'English', 'Tamil'], screens: 2 + (di % 3), parking: 'Parking details not verified' } },
      { ...demo, name: `Sample Children's Park — ${n}`, kind: 'childrens-park', district: slug, location: near(slug, 9) },
    );
    if (['ernakulam', 'thiruvananthapuram', 'kozhikode'].includes(slug)) {
      out.push(
        { ...demo, name: `Sample City Mall — ${n}`, kind: 'mall', district: slug, location: near(slug, 10), facilities: ['parking', 'food court', 'lift'], accessibility: { wheelchair: 'unknown', lift: 'yes', confirmed: false } },
        { ...demo, name: `Sample Gaming Zone — ${n}`, kind: 'gaming-zone', district: slug, location: near(slug, 11) },
        { ...demo, name: `Sample Water Park — ${n}`, kind: 'water-park', district: slug, location: near(slug, 12, 0.08) },
      );
    }
    // Essential services — sample pins only, no phone numbers.
    const svc = { ...demo, description: 'SAMPLE location for development — not a real facility. In an emergency call 112.' };
    out.push(
      { ...svc, name: `Sample Hospital (demo) — ${n}`, kind: 'hospital', district: slug, location: near(slug, 13, 0.03), open24h: true },
      { ...svc, name: `Sample Pharmacy (demo) — ${n}`, kind: 'pharmacy', district: slug, location: near(slug, 14) },
      { ...svc, name: `Sample Police Station (demo) — ${n}`, kind: 'police', district: slug, location: near(slug, 15, 0.025) },
      { ...svc, name: `Sample ATM (demo) — ${n}`, kind: 'atm', district: slug, location: near(slug, 16) },
      { ...svc, name: `Sample Fuel Station (demo) — ${n}`, kind: 'fuel', district: slug, location: near(slug, 17, 0.04) },
      { ...svc, name: `Sample EV Charging Point (demo) — ${n}`, kind: 'ev-charging', district: slug, location: near(slug, 18, 0.04) },
      { ...svc, name: `Sample Public Toilet (demo) — ${n}`, kind: 'public-toilet', district: slug, location: near(slug, 19) },
    );
  });
  return out.map(({ open24h, ...b }) => b);
}

// ---- Demo stays (fictional) ----
export function buildDemoStays() {
  const types = [
    ['homestay', 'budget', ['family', 'couple', 'solo'], ['city']],
    ['resort', 'premium', ['couple', 'family'], ['hills']],
    ['hostel', 'budget', ['solo', 'backpacker'], ['city']],
    ['hotel', 'mid', ['business', 'family', 'couple'], ['city']],
  ];
  const special = {
    alappuzha: ['houseboat', 'premium', ['couple', 'family'], ['backwater']],
    kottayam: ['houseboat', 'premium', ['couple', 'family'], ['backwater']],
    idukki: ['treehouse', 'premium', ['couple'], ['forest', 'plantation']],
    wayanad: ['treehouse', 'luxury', ['couple'], ['forest', 'plantation']],
    thiruvananthapuram: ['villa', 'luxury', ['family', 'group'], ['beach']],
    pathanamthitta: ['camping', 'budget', ['group', 'solo'], ['forest']],
    kasaragod: ['villa', 'premium', ['family', 'group'], ['beach', 'heritage']],
  };
  const out = [];
  DISTRICTS.forEach(({ slug }, di) => {
    const n = nameOf(slug);
    const list = [types[di % 4], types[(di + 1) % 4]];
    if (special[slug]) list.push(special[slug]);
    list.forEach(([type, priceBand, travellerTypes, experiences], i) => {
      out.push({
        name: `Sample ${type.charAt(0).toUpperCase() + type.slice(1)} — ${n}`,
        type,
        priceBand,
        travellerTypes,
        experiences,
        district: slug,
        location: near(slug, 30 + i, 0.05),
        facilities: ['wifi', 'parking', ...(priceBand === 'premium' || priceBand === 'luxury' ? ['pool', 'restaurant'] : [])],
        accessibility: { wheelchair: 'unknown', elderlyFriendly: 'unknown' },
        description: 'Sample accommodation listing for development. Prices, facilities and availability are placeholders and not verified.',
        bookingLinks: [],
        isDemo: true,
        status: 'published',
      });
    });
  });
  return out;
}

// ---- Demo events (fictional, dated relative to the seed run) ----
export function buildDemoEvents(now = new Date()) {
  const day = 24 * 3600 * 1000;
  const at = (offsetDays, hour = 10) => {
    const d = new Date(now.getTime() + offsetDays * day);
    d.setUTCHours(hour - 5, 30, 0, 0); // hour in IST
    return d;
  };
  const dow = new Date(now.getTime() + 5.5 * 3600 * 1000).getUTCDay();
  const toSat = (6 - dow + 7) % 7;
  const e = (title, category, district, start, end, extra = {}) => ({
    title,
    category,
    district,
    startDate: start,
    endDate: end,
    location: near(district, 40, 0.01),
    venue: 'Sample venue (demo)',
    organizer: 'Demo organiser',
    description: 'Sample event for development. Dates, venue and ticket details are placeholders — not a real event.',
    ticketStatus: 'unknown',
    languages: ['Malayalam', 'English'],
    isDemo: true,
    status: 'published',
    lastVerifiedAt: null,
    ...extra,
  });
  return [
    e('Sample Evening Food Walk', 'food-festival', 'kozhikode', at(0, 17), at(0, 21), { entryFee: { isFree: true }, ticketStatus: 'free' }),
    e('Sample Kathakali Evening', 'temple-cultural', 'thrissur', at(0, 18), at(0, 21), { ticketStatus: 'at-venue' }),
    e('Sample Weekend Crafts Market', 'market-fair', 'ernakulam', at(toSat, 9), at(toSat + 1, 20), { entryFee: { isFree: true }, ticketStatus: 'free', parking: 'Parking details not verified' }),
    e('Sample Beach Music Night', 'concert', 'thiruvananthapuram', at(toSat, 18), at(toSat, 23), { ticketStatus: 'available', ageRestriction: '18+ (sample)' }),
    e('Sample Backwater Boat Race Viewing', 'festival', 'alappuzha', at(toSat + 1, 14), at(toSat + 1, 18), { ticketStatus: 'unknown' }),
    e('Sample Football League Match', 'sports', 'malappuram', at(3, 19), at(3, 21), { ticketStatus: 'limited' }),
    e('Sample Photography Workshop', 'workshop', 'wayanad', at(5, 7), at(5, 12), { ticketStatus: 'limited', entryFee: { amount: null, notes: 'Fee not verified' } }),
    e('Sample Classic Car Show', 'car-show', 'kannur', at(9, 10), at(10, 18), { ticketStatus: 'unknown' }),
    e('Sample College Tech Fest', 'college', 'kottayam', at(12, 9), at(14, 18), { ticketStatus: 'free', entryFee: { isFree: true } }),
    e('Sample Esports Tournament', 'esports', 'ernakulam', at(16, 11), at(17, 20), { ticketStatus: 'available' }),
    e('Sample Tourism Expo', 'tourism', 'kollam', at(20, 10), at(22, 18), { ticketStatus: 'free' }),
    e('Sample Art Exhibition', 'exhibition', 'kasaragod', at(-10, 10), at(-3, 18), { ticketStatus: 'free' }), // expired
  ];
}

// ---- Transport nodes (real facilities, approximate coordinates, unverified) ----
const T = (name, kind, district, lat, lng, code) => ({ name, kind, district, code, location: pt(lat, lng), status: 'published', description: 'Location is approximate. Check the operator for schedules and fares.' });
export const transport = [
  T('Trivandrum International Airport', 'airport', 'thiruvananthapuram', 8.4821, 76.9201, 'TRV'),
  T('Cochin International Airport', 'airport', 'ernakulam', 10.152, 76.4019, 'COK'),
  T('Calicut International Airport', 'airport', 'malappuram', 11.1368, 75.9553, 'CCJ'),
  T('Kannur International Airport', 'airport', 'kannur', 11.9186, 75.5472, 'CNN'),
  T('Thiruvananthapuram Central Railway Station', 'railway-station', 'thiruvananthapuram', 8.4875, 76.9525, 'TVC'),
  T('Kollam Junction Railway Station', 'railway-station', 'kollam', 8.886, 76.595, 'QLN'),
  T('Alappuzha Railway Station', 'railway-station', 'alappuzha', 9.4905, 76.3197, 'ALLP'),
  T('Kottayam Railway Station', 'railway-station', 'kottayam', 9.5945, 76.5311, 'KTYM'),
  T('Tiruvalla Railway Station', 'railway-station', 'pathanamthitta', 9.3833, 76.5775, 'TRVL'),
  T('Ernakulam Junction Railway Station', 'railway-station', 'ernakulam', 9.969, 76.2912, 'ERS'),
  T('Aluva Railway Station', 'railway-station', 'ernakulam', 10.1085, 76.3527, 'AWY'),
  T('Thrissur Railway Station', 'railway-station', 'thrissur', 10.5155, 76.2072, 'TCR'),
  T('Palakkad Junction Railway Station', 'railway-station', 'palakkad', 10.8, 76.6394, 'PGT'),
  T('Shoranur Junction Railway Station', 'railway-station', 'palakkad', 10.7631, 76.2741, 'SRR'),
  T('Tirur Railway Station', 'railway-station', 'malappuram', 10.9159, 75.9214, 'TIR'),
  T('Kozhikode Railway Station', 'railway-station', 'kozhikode', 11.2485, 75.7837, 'CLT'),
  T('Kannur Railway Station', 'railway-station', 'kannur', 11.8687, 75.3653, 'CAN'),
  T('Kasaragod Railway Station', 'railway-station', 'kasaragod', 12.4886, 74.9899, 'KGQ'),
  T('Aluva Metro Station', 'metro-station', 'ernakulam', 10.1097, 76.3494),
  T('Vyttila Metro Station', 'metro-station', 'ernakulam', 9.9676, 76.3207),
  T('Thampanoor Central Bus Station', 'bus-stand', 'thiruvananthapuram', 8.4868, 76.952),
  T('Ernakulam KSRTC Bus Station', 'bus-stand', 'ernakulam', 9.9725, 76.2869),
  T('Kozhikode Mofussil Bus Stand', 'bus-stand', 'kozhikode', 11.258, 75.7847),
  T('Kalpetta Bus Stand', 'bus-stand', 'wayanad', 11.6085, 76.0826),
  T('Kumily Bus Stand', 'bus-stand', 'idukki', 9.609, 77.169),
];

// ---- Demo roadside stops (fictional) ----
export const routeStops = [
  { name: 'Sample NH66 Rest Area — Kollam', kind: 'rest-area', district: 'kollam', location: pt(8.95, 76.56), highway: 'NH66', toilets: 'unknown', parking: 'unknown' },
  { name: 'Sample Highway Tea Stop — Alappuzha', kind: 'tea-coffee', district: 'alappuzha', location: pt(9.4, 76.36), highway: 'NH66' },
  { name: 'Sample Ghat Road Viewpoint — Idukki', kind: 'viewpoint', district: 'idukki', location: pt(10.02, 76.95) },
  { name: 'Sample Rest Area — Thrissur', kind: 'rest-area', district: 'thrissur', location: pt(10.35, 76.3), highway: 'NH544' },
  { name: 'Sample Thamarassery Ghat Viewpoint', kind: 'viewpoint', district: 'kozhikode', location: pt(11.48, 76.02) },
  { name: 'Sample Coastal Food Stop — Kannur', kind: 'food-stop', district: 'kannur', location: pt(11.7, 75.53), highway: 'NH66' },
].map((s) => ({ ...s, isDemo: true, status: 'published', description: 'Sample roadside stop for development — not a real facility.' }));

// ---- Emergency contacts ----
// Widely published national numbers, stored UNVERIFIED. An admin must confirm each
// against the official source (e.g. the ERSS / state police / NIC websites) and tick
// "verified" before the app shows it as verified.
export const emergencyContacts = [
  { name: 'Emergency Response Support System (all emergencies)', number: '112', category: 'general', scope: 'national', order: 1, description: 'Single emergency number for police, fire and ambulance.' },
  { name: 'Police', number: '100', category: 'police', scope: 'national', order: 2 },
  { name: 'Fire and Rescue', number: '101', category: 'fire', scope: 'national', order: 3 },
  { name: 'Ambulance', number: '108', category: 'ambulance', scope: 'state', order: 4 },
  { name: 'Women Helpline', number: '1091', category: 'women', scope: 'national', order: 5 },
  { name: 'Childline', number: '1098', category: 'child', scope: 'national', order: 6 },
  { name: 'Tourist Helpline (India)', number: '1363', category: 'tourist', scope: 'national', order: 7 },
].map((c) => ({ ...c, verified: false, source: 'Pending verification — confirm with the official government source before marking verified', active: true }));

export const safetyNotices = [
  {
    title: 'Sample monsoon advisory (demo)',
    message: 'Demo notice: during heavy rain, avoid waterfalls, beaches and ghat roads, and follow district administration alerts.',
    type: 'official-advisory',
    severity: 'caution',
    source: 'Demo content — replace with an official advisory and link',
    isDemo: true,
    active: true,
  },
];

export const knowledgeNotes = [
  {
    title: 'Sample note: planning hill-station trips',
    body: 'Demo knowledge note. Hill roads in Idukki and Wayanad have many hairpin bends; plan extra travel time. Replace with verified, sourced guidance before approving.',
    topics: ['hills', 'driving'],
    confidence: 'estimated',
    approved: false,
  },
];

// ---- Categories ----
export const categories = [
  ...[
    ['beaches', 'Beaches', 'ബീച്ചുകൾ', 'Waves'],
    ['waterfalls', 'Waterfalls', 'വെള്ളച്ചാട്ടങ്ങൾ', 'Droplets'],
    ['hill-stations', 'Hill stations', 'മലയോരങ്ങൾ', 'Mountain'],
    ['forests', 'Forests', 'വനങ്ങൾ', 'Trees'],
    ['wildlife', 'Wildlife', 'വന്യജീവി', 'Bird'],
    ['backwaters', 'Backwaters', 'കായലുകൾ', 'Sailboat'],
    ['heritage', 'Heritage', 'പൈതൃകം', 'Landmark'],
    ['museums', 'Museums', 'മ്യൂസിയങ്ങൾ', 'Building2'],
    ['adventure', 'Adventure', 'സാഹസികത', 'Tent'],
    ['photography', 'Photography', 'ഫോട്ടോഗ്രഫി', 'Camera'],
    ['family', 'Family activities', 'കുടുംബ യാത്ര', 'Users'],
    ['religious', 'Religious places', 'ആരാധനാലയങ്ങൾ', 'Sparkles'],
    ['viewpoints', 'Viewpoints', 'വ്യൂ പോയിന്റുകൾ', 'Binoculars'],
    ['lakes-dams', 'Lakes & dams', 'തടാകങ്ങളും ഡാമുകളും', 'Waves'],
    ['villages', 'Villages', 'ഗ്രാമങ്ങൾ', 'Home'],
    ['treks', 'Treks', 'ട്രെക്കിംഗ്', 'Footprints'],
    ['nature-walks', 'Nature walks', 'പ്രകൃതി നടത്തം', 'Leaf'],
    ['parks', 'Parks', 'പാർക്കുകൾ', 'TreePine'],
  ].map(([slug, name, nameMl, icon], order) => ({ slug, name, nameMl, icon, order, type: 'place' })),
];
