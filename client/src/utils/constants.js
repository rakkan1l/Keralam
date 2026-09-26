// Mirrors server/src/config/constants.js for client-side UI (filters, chips).
export const PLACE_CATEGORIES = ['beaches', 'waterfalls', 'hill-stations', 'forests', 'wildlife', 'backwaters', 'heritage', 'museums', 'adventure', 'photography', 'family', 'religious'];
export const EXTRA_CATEGORIES = ['viewpoints', 'lakes-dams', 'villages', 'treks', 'nature-walks', 'parks'];
export const MOODS = ['peaceful', 'adventure', 'family', 'photography', 'food', 'romantic', 'shopping', 'rainy-day', 'sunrise-sunset', 'local-culture'];
export const TIME_BUCKETS = ['1h', '3h', 'half-day', '1-day', 'weekend', '3-days-plus'];
export const BUDGETS = ['free', 'budget', 'moderate', 'premium'];
export const FOOD_CATEGORIES = ['kerala', 'malabar', 'seafood', 'biriyani', 'mandhi', 'cafes', 'street-food', 'breakfast', 'desserts', 'vegetarian', 'budget', 'premium', 'late-night'];
export const STAY_TYPES = ['hotel', 'resort', 'homestay', 'hostel', 'villa', 'treehouse', 'camping', 'houseboat', 'budget-room', 'luxury'];
export const TRAVELLER_TYPES = ['solo', 'couple', 'family', 'group', 'business', 'backpacker'];
export const STAY_EXPERIENCES = ['beach', 'hills', 'backwater', 'forest', 'city', 'heritage', 'plantation', 'ayurveda'];
export const PRICE_BANDS = ['budget', 'mid', 'premium', 'luxury'];
export const EVENT_CATEGORIES = ['festival', 'temple-cultural', 'concert', 'food-festival', 'exhibition', 'car-show', 'sports', 'esports', 'college', 'tourism', 'workshop', 'market-fair'];
export const EVENT_WINDOWS = ['today', 'weekend', 'week', 'month', 'upcoming', 'past'];
export const SECTIONS = {
  shopping: ['mall', 'market', 'street-shopping', 'handicrafts', 'souvenirs', 'spices', 'clothing', 'tea-coffee', 'local-specialties'],
  theatres: ['theatre'],
  activities: ['park', 'childrens-park', 'theme-park', 'water-park', 'zoo', 'aquarium', 'indoor-entertainment', 'gaming-zone'],
};
export const NEARBY_CATEGORIES = ['attractions', 'hidden-gems', 'restaurants', 'cafes', 'stays', 'hospitals', 'pharmacies', 'police', 'atms', 'fuel', 'ev-charging', 'toilets', 'bus-stops', 'railway-stations', 'airports', 'taxi'];
export const ALONG_CATEGORIES = ['attractions', 'viewpoints', 'food', 'tea-coffee', 'fuel', 'ev-charging', 'toilets', 'hospitals', 'rest-areas'];
export const REPORT_KINDS = ['incorrect-info', 'duplicate', 'closure', 'safety', 'other'];
export const CONTENT_STATUSES = ['draft', 'needs_verification', 'verified', 'published', 'needs_update', 'temporarily_closed', 'archived'];

// Google Maps search terms for the external fallback on Near Me.
export const NEARBY_SEARCH_TERMS = {
  attractions: 'tourist attractions',
  'hidden-gems': 'viewpoints',
  restaurants: 'restaurants',
  cafes: 'cafes',
  stays: 'hotels',
  hospitals: 'hospitals',
  pharmacies: 'pharmacy',
  police: 'police station',
  atms: 'ATM',
  fuel: 'petrol pump',
  'ev-charging': 'EV charging station',
  toilets: 'public toilet',
  'bus-stops': 'bus stop',
  'railway-stations': 'railway station',
  airports: 'airport',
  taxi: 'taxi stand',
};
