// Shared enumerations. The client mirrors the public-facing ones in
// client/src/utils/constants.js — keep both in sync when adding values.

export const ROLES = ['user', 'contributor', 'editor', 'admin'];
// Editors can create and edit content; only admins change verification/publishing status.
export const CONTENT_ROLES = ['editor', 'admin'];

export const CONTENT_STATUSES = [
  'draft',
  'needs_verification',
  'verified',
  'published',
  'needs_update',
  'temporarily_closed',
  'archived',
];
// Statuses visible to the public (with badges for needs_update / temporarily_closed).
export const PUBLIC_STATUSES = ['published', 'needs_update', 'temporarily_closed'];

// Tri-state values used for facts that may be unknown or unverified.
export const TRI_STATE = ['yes', 'no', 'partial', 'unknown'];

export const DISTRICTS = [
  { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', nameMl: 'തിരുവനന്തപുരം', aliases: ['trivandrum', 'tvm', 'trivandram'] },
  { slug: 'kollam', name: 'Kollam', nameMl: 'കൊല്ലം', aliases: ['quilon'] },
  { slug: 'pathanamthitta', name: 'Pathanamthitta', nameMl: 'പത്തനംതിട്ട', aliases: ['pta'] },
  { slug: 'alappuzha', name: 'Alappuzha', nameMl: 'ആലപ്പുഴ', aliases: ['alleppey', 'aleppey', 'alapuzha'] },
  { slug: 'kottayam', name: 'Kottayam', nameMl: 'കോട്ടയം', aliases: ['ktm'] },
  { slug: 'idukki', name: 'Idukki', nameMl: 'ഇടുക്കി', aliases: ['munnar region'] },
  { slug: 'ernakulam', name: 'Ernakulam', nameMl: 'എറണാകുളം', aliases: ['kochi', 'cochin', 'ekm'] },
  { slug: 'thrissur', name: 'Thrissur', nameMl: 'തൃശ്ശൂർ', aliases: ['trichur', 'thrisur', 'tcr'] },
  { slug: 'palakkad', name: 'Palakkad', nameMl: 'പാലക്കാട്', aliases: ['palghat', 'palakad'] },
  { slug: 'malappuram', name: 'Malappuram', nameMl: 'മലപ്പുറം', aliases: ['malapuram', 'mlp'] },
  { slug: 'kozhikode', name: 'Kozhikode', nameMl: 'കോഴിക്കോട്', aliases: ['calicut', 'kozikode', 'clt'] },
  { slug: 'wayanad', name: 'Wayanad', nameMl: 'വയനാട്', aliases: ['wynad', 'wayanadu'] },
  { slug: 'kannur', name: 'Kannur', nameMl: 'കണ്ണൂർ', aliases: ['cannanore'] },
  { slug: 'kasaragod', name: 'Kasaragod', nameMl: 'കാസർഗോഡ്', aliases: ['kasargod', 'kasaragode'] },
];
export const DISTRICT_SLUGS = DISTRICTS.map((d) => d.slug);

export const PLACE_CATEGORIES = [
  'beaches',
  'waterfalls',
  'hill-stations',
  'forests',
  'wildlife',
  'backwaters',
  'heritage',
  'museums',
  'adventure',
  'photography',
  'family',
  'religious',
  'viewpoints',
  'lakes-dams',
  'villages',
  'treks',
  'nature-walks',
  'parks',
];

export const MOODS = [
  'peaceful',
  'adventure',
  'family',
  'photography',
  'food',
  'romantic',
  'shopping',
  'rainy-day',
  'sunrise-sunset',
  'local-culture',
];

// Explore-by-time buckets → maximum typical visit duration in hours.
export const TIME_BUCKETS = {
  '1h': 1,
  '3h': 3,
  'half-day': 5,
  '1-day': 10,
  weekend: 48,
  '3-days-plus': 999,
};

export const BUDGET_LEVELS = ['free', 'budget', 'moderate', 'premium', 'unknown'];
export const PRICE_BANDS = ['budget', 'mid', 'premium', 'luxury', 'unknown'];
export const CROWD_LEVELS = ['low', 'moderate', 'high', 'unknown'];
export const DIFFICULTY_LEVELS = ['easy', 'moderate', 'difficult', 'unknown'];
export const ROAD_CONDITIONS = ['good', 'fair', 'poor', 'offroad', 'unknown'];
export const NETWORK_LEVELS = ['good', 'patchy', 'none', 'unknown'];

export const FOOD_KINDS = ['restaurant', 'cafe', 'street-food', 'bakery'];
export const SHOPPING_KINDS = [
  'mall',
  'market',
  'street-shopping',
  'handicrafts',
  'souvenirs',
  'spices',
  'clothing',
  'tea-coffee',
  'local-specialties',
];
export const THEATRE_KINDS = ['theatre'];
export const ACTIVITY_KINDS = [
  'park',
  'childrens-park',
  'theme-park',
  'water-park',
  'zoo',
  'aquarium',
  'indoor-entertainment',
  'gaming-zone',
];
export const SERVICE_KINDS = ['hospital', 'pharmacy', 'police', 'atm', 'fuel', 'ev-charging', 'public-toilet'];
export const BUSINESS_KINDS = [
  ...FOOD_KINDS,
  ...SHOPPING_KINDS,
  ...THEATRE_KINDS,
  ...ACTIVITY_KINDS,
  ...SERVICE_KINDS,
];
export const BUSINESS_SECTIONS = {
  food: FOOD_KINDS,
  shopping: SHOPPING_KINDS,
  theatres: THEATRE_KINDS,
  activities: ACTIVITY_KINDS,
  services: SERVICE_KINDS,
};

export const FOOD_CATEGORIES = [
  'kerala',
  'malabar',
  'seafood',
  'biriyani',
  'mandhi',
  'cafes',
  'street-food',
  'breakfast',
  'desserts',
  'vegetarian',
  'budget',
  'premium',
  'late-night',
];
export const DIETARY_TAGS = ['vegetarian', 'vegan', 'non-vegetarian', 'seafood', 'contains-nuts', 'gluten-free', 'halal'];

export const STAY_TYPES = [
  'hotel',
  'resort',
  'homestay',
  'hostel',
  'villa',
  'treehouse',
  'camping',
  'houseboat',
  'budget-room',
  'luxury',
];
export const TRAVELLER_TYPES = ['solo', 'couple', 'family', 'group', 'business', 'backpacker'];
export const STAY_EXPERIENCES = ['beach', 'hills', 'backwater', 'forest', 'city', 'heritage', 'plantation', 'ayurveda'];

export const EVENT_CATEGORIES = [
  'festival',
  'temple-cultural',
  'concert',
  'food-festival',
  'exhibition',
  'car-show',
  'sports',
  'esports',
  'college',
  'tourism',
  'workshop',
  'market-fair',
];
export const TICKET_STATUSES = ['free', 'available', 'limited', 'sold-out', 'at-venue', 'unknown'];

export const TRANSPORT_KINDS = [
  'bus-stand',
  'bus-stop',
  'railway-station',
  'metro-station',
  'water-metro',
  'airport',
  'taxi-stand',
  'auto-stand',
  'bike-rental',
  'car-rental',
  'parking',
  'boat-jetty',
];

export const ROUTE_STOP_KINDS = [
  'viewpoint',
  'food-stop',
  'tea-coffee',
  'rest-area',
  'fuel',
  'ev-charging',
  'public-toilet',
  'hospital',
  'attraction',
];

export const SAFETY_NOTICE_TYPES = [
  'swimming-restriction',
  'strong-currents',
  'slippery-terrain',
  'wildlife-risk',
  'restricted-area',
  'road-condition',
  'night-restriction',
  'monsoon-closure',
  'official-advisory',
  'other',
];

export const EMERGENCY_CATEGORIES = [
  'general',
  'police',
  'ambulance',
  'fire',
  'women',
  'child',
  'tourist',
  'disaster',
  'other',
];

export const REPORT_KINDS = ['incorrect-info', 'duplicate', 'closure', 'safety', 'other'];
export const REPORT_STATUSES = ['open', 'in_review', 'resolved', 'dismissed'];
export const MODERATION_STATUSES = ['pending', 'approved', 'rejected'];
export const UPDATE_KINDS = ['crowd', 'parking', 'road', 'condition'];

// Entities that users can save, review, report on and add to lists.
export const TARGET_TYPES = ['place', 'business', 'stay', 'event', 'dish'];

export const ANALYTICS_TYPES = [
  'search',
  'view',
  'save',
  'unsave',
  'route_request',
  'trip_created',
  'event_interest',
  'zero_result_search',
];

export const LANGUAGES = [
  { code: 'en', name: 'English', enabled: true, dir: 'ltr' },
  { code: 'ml', name: 'മലയാളം', enabled: true, dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', enabled: false, dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', enabled: false, dir: 'ltr' },
  { code: 'kn', name: 'ಕನ್ನಡ', enabled: false, dir: 'ltr' },
  { code: 'ar', name: 'العربية', enabled: false, dir: 'rtl' },
  { code: 'fr', name: 'Français', enabled: false, dir: 'ltr' },
  { code: 'de', name: 'Deutsch', enabled: false, dir: 'ltr' },
  { code: 'ru', name: 'Русский', enabled: false, dir: 'ltr' },
];
export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);

// Near Me categories → which collection and filter satisfies them.
export const NEARBY_CATEGORIES = {
  attractions: { collection: 'place' },
  'hidden-gems': { collection: 'place', filter: { hiddenGem: true } },
  restaurants: { collection: 'business', filter: { kind: { $in: ['restaurant', 'street-food', 'bakery'] } } },
  cafes: { collection: 'business', filter: { kind: 'cafe' } },
  stays: { collection: 'stay' },
  hospitals: { collection: 'business', filter: { kind: 'hospital' } },
  pharmacies: { collection: 'business', filter: { kind: 'pharmacy' } },
  police: { collection: 'business', filter: { kind: 'police' } },
  atms: { collection: 'business', filter: { kind: 'atm' } },
  fuel: { collection: 'business', filter: { kind: 'fuel' } },
  'ev-charging': { collection: 'business', filter: { kind: 'ev-charging' } },
  toilets: { collection: 'business', filter: { kind: 'public-toilet' } },
  'bus-stops': { collection: 'transport', filter: { kind: { $in: ['bus-stop', 'bus-stand'] } } },
  'railway-stations': { collection: 'transport', filter: { kind: 'railway-station' } },
  airports: { collection: 'transport', filter: { kind: 'airport' } },
  taxi: { collection: 'transport', filter: { kind: { $in: ['taxi-stand', 'auto-stand'] } } },
};
