import { z } from 'zod';
import {
  DISTRICT_SLUGS,
  PLACE_CATEGORIES,
  MOODS,
  BUDGET_LEVELS,
  CROWD_LEVELS,
  DIFFICULTY_LEVELS,
  ROAD_CONDITIONS,
  NETWORK_LEVELS,
  BUSINESS_KINDS,
  PRICE_BANDS,
  FOOD_CATEGORIES,
  DIETARY_TAGS,
  STAY_TYPES,
  TRAVELLER_TYPES,
  STAY_EXPERIENCES,
  EVENT_CATEGORIES,
  TICKET_STATUSES,
  TRANSPORT_KINDS,
  ROUTE_STOP_KINDS,
  SAFETY_NOTICE_TYPES,
  EMERGENCY_CATEGORIES,
  TARGET_TYPES,
  LANGUAGE_CODES,
  CONTENT_STATUSES,
} from '../config/constants.js';
import {
  objectId,
  httpUrl,
  optionalUrl,
  tri,
  str,
  optStr,
  strList,
  point,
  image,
  source,
  openingHours,
  contact,
  accessibility,
  link,
} from './common.js';

const district = z.enum(DISTRICT_SLUGS);
const workflow = {
  isDemo: z.boolean().optional(),
  sources: z.array(source).max(20).optional(),
  featured: z.boolean().optional(),
  editorialRank: z.number().int().min(0).max(1000).optional(),
};

export const placeSchema = z.object({
  name: str(120).min(2),
  nameMl: optStr(120),
  alternateNames: strList(80),
  slug: optStr(80),
  shortDescription: optStr(280),
  shortDescriptionMl: optStr(600),
  description: optStr(10000),
  descriptionMl: optStr(20000),
  location: point,
  district,
  locality: optStr(120),
  categories: z.array(z.enum(PLACE_CATEGORIES)).max(10).optional(),
  tags: strList(40),
  moods: z.array(z.enum(MOODS)).max(10).optional(),
  images: z.array(image).max(20).optional(),
  visitDurationHours: z.number().min(0).max(240).optional(),
  weekendGetaway: z.boolean().optional(),
  budgetLevel: z.enum(BUDGET_LEVELS).optional(),
  bestMonths: z.array(z.number().int().min(1).max(12)).max(12).optional(),
  indoor: z.boolean().optional(),
  familyFriendly: tri,
  crowdLevel: z.enum(CROWD_LEVELS).optional(),
  openingHours: openingHours.optional(),
  entryFee: z
    .object({
      amount: z.number().min(0).nullable().optional(),
      isFree: z.boolean().optional(),
      notes: optStr(300),
      verified: z.boolean().optional(),
    })
    .optional(),
  contact: contact.optional(),
  officialLinks: z.array(link).max(10).optional(),
  facilities: strList(60),
  accessibility: accessibility.optional(),
  safety: z
    .object({
      swimmingRestricted: tri,
      strongCurrents: tri,
      slipperyTerrain: tri,
      wildlifeRisk: tri,
      restrictedAreas: tri,
      nightAccessRestricted: tri,
      monsoonClosure: tri,
      notes: optStr(2000),
      verified: z.boolean().optional(),
      lastReviewedAt: z.coerce.date().optional(),
    })
    .optional(),
  hiddenGem: z.boolean().optional(),
  gemDetails: z
    .object({
      accessDifficulty: z.enum(DIFFICULTY_LEVELS).optional(),
      roadCondition: z.enum(ROAD_CONDITIONS).optional(),
      parking: tri,
      mobileNetwork: z.enum(NETWORK_LEVELS).optional(),
      monsoonSuitable: tri,
      bestTimeToVisit: optStr(200),
    })
    .optional(),
  ...workflow,
});

export const businessSchema = z.object({
  name: str(120).min(2),
  nameMl: optStr(120),
  alternateNames: strList(80),
  slug: optStr(80),
  kind: z.enum(BUSINESS_KINDS),
  description: optStr(5000),
  descriptionMl: optStr(10000),
  location: point,
  district,
  locality: optStr(120),
  images: z.array(image).max(20).optional(),
  priceRange: z.enum(PRICE_BANDS).optional(),
  openingHours: openingHours.optional(),
  facilities: strList(60),
  contact: contact.optional(),
  officialWebsite: optionalUrl,
  accessibility: accessibility.optional(),
  tags: strList(40),
  food: z
    .object({
      categories: z.array(z.enum(FOOD_CATEGORIES)).optional(),
      cuisines: strList(40),
      dietary: z.array(z.enum(DIETARY_TAGS)).optional(),
      signatureDishes: z.array(objectId).optional(),
      lateNight: z.boolean().optional(),
    })
    .optional(),
  theatre: z
    .object({
      languages: strList(30),
      screens: z.number().int().min(0).max(50).optional(),
      showtimesUrl: optionalUrl,
      parking: optStr(200),
    })
    .optional(),
  shopping: z.object({ productTypes: strList(60) }).optional(),
  ...workflow,
});

export const dishSchema = z.object({
  name: str(120).min(2),
  nameMl: optStr(120),
  alternateNames: strList(80),
  slug: optStr(80),
  description: optStr(5000),
  descriptionMl: optStr(10000),
  images: z.array(image).max(20).optional(),
  region: optStr(80),
  categories: z.array(z.enum(FOOD_CATEGORIES)).optional(),
  dietary: z.array(z.enum(DIETARY_TAGS)).optional(),
  typicalPrice: z
    .object({ band: z.enum(PRICE_BANDS).optional(), note: optStr(200), estimated: z.boolean().optional() })
    .optional(),
  recommendedPlaces: z.array(objectId).max(30).optional(),
  ...workflow,
});

export const staySchema = z.object({
  name: str(120).min(2),
  nameMl: optStr(120),
  slug: optStr(80),
  type: z.enum(STAY_TYPES),
  description: optStr(5000),
  descriptionMl: optStr(10000),
  images: z.array(image).max(20).optional(),
  location: point,
  district,
  locality: optStr(120),
  priceBand: z.enum(PRICE_BANDS).optional(),
  priceFrom: z.number().min(0).nullable().optional(),
  priceVerified: z.boolean().optional(),
  facilities: strList(60),
  travellerTypes: z.array(z.enum(TRAVELLER_TYPES)).optional(),
  experiences: z.array(z.enum(STAY_EXPERIENCES)).optional(),
  accessibility: accessibility.optional(),
  contact: contact.optional(),
  bookingLinks: z.array(link).max(10).optional(),
  tags: strList(40),
  ...workflow,
});

export const eventSchema = z.object({
    title: str(160).min(2),
    titleMl: optStr(160),
    slug: optStr(80),
    description: optStr(5000),
    descriptionMl: optStr(10000),
    category: z.enum(EVENT_CATEGORIES),
    organizer: optStr(160),
    venue: optStr(200),
    location: point.optional(),
    district,
    place: objectId.optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    images: z.array(image).max(20).optional(),
    entryFee: z
      .object({ amount: z.number().min(0).nullable().optional(), isFree: z.boolean().optional(), notes: optStr(300) })
      .optional(),
    ticketStatus: z.enum(TICKET_STATUSES).optional(),
    ticketUrl: optionalUrl,
    ageRestriction: optStr(100),
    parking: optStr(300),
    publicTransport: optStr(300),
    languages: strList(30),
    officialSourceUrl: optionalUrl,
    lastVerifiedAt: z.coerce.date().optional(),
    ...workflow,
});

/** Cross-field check applied after merging an update onto the stored document. */
export function checkEventDates(doc) {
  if (doc.startDate && doc.endDate && doc.endDate < doc.startDate) {
    return [{ path: 'endDate', message: 'endDate must be on or after startDate' }];
  }
  return null;
}

export const districtSchema = z.object({
  name: str(80),
  nameMl: optStr(80),
  alternateNames: strList(80),
  headquarters: optStr(80),
  tagline: optStr(200),
  taglineMl: optStr(400),
  intro: optStr(5000),
  introMl: optStr(10000),
  location: point.optional(),
  heroImage: image.optional(),
  highlights: strList(120),
  neighbours: z.array(z.enum(DISTRICT_SLUGS)).optional(),
  transport: z
    .object({
      summary: optStr(1000),
      railway: optStr(500),
      airport: optStr(500),
      bus: optStr(500),
      notes: optStr(1000),
    })
    .optional(),
  essentials: z.object({ summary: optStr(1000), notes: optStr(1000) }).optional(),
  isDemo: z.boolean().optional(),
  sources: z.array(source).max(20).optional(),
});

export const transportSchema = z.object({
  name: str(120).min(2),
  nameMl: optStr(120),
  slug: optStr(80),
  kind: z.enum(TRANSPORT_KINDS),
  code: optStr(20),
  location: point,
  district,
  description: optStr(2000),
  contact: contact.optional(),
  officialUrl: optionalUrl,
  scheduleUrl: optionalUrl,
  isDemo: z.boolean().optional(),
  sources: z.array(source).max(20).optional(),
});

export const routeStopSchema = z.object({
  name: str(120).min(2),
  slug: optStr(80),
  kind: z.enum(ROUTE_STOP_KINDS),
  description: optStr(2000),
  location: point,
  district,
  highway: optStr(40),
  toilets: tri,
  parking: tri,
  isDemo: z.boolean().optional(),
  sources: z.array(source).max(20).optional(),
});

export const safetyNoticeSchema = z.object({
  title: str(160).min(2),
  titleMl: optStr(300),
  message: str(2000).min(2),
  messageMl: optStr(4000),
  mlReviewed: z.boolean().optional(),
  type: z.enum(SAFETY_NOTICE_TYPES).optional(),
  severity: z.enum(['info', 'caution', 'warning', 'danger']).optional(),
  district: district.optional(),
  targetType: z.enum(TARGET_TYPES).optional(),
  targetId: objectId.optional(),
  source: str(200).min(2),
  sourceUrl: optionalUrl,
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  active: z.boolean().optional(),
  isDemo: z.boolean().optional(),
});

export const emergencyContactSchema = z.object({
  name: str(120).min(2),
  nameMl: optStr(200),
  mlReviewed: z.boolean().optional(),
  number: str(40).min(2),
  category: z.enum(EMERGENCY_CATEGORIES).optional(),
  description: optStr(500),
  scope: z.enum(['national', 'state', 'district']).optional(),
  district: district.optional(),
  source: optStr(200),
  sourceUrl: optionalUrl,
  verified: z.boolean().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const translationSchema = z.object({
  lang: z.enum(LANGUAGE_CODES),
  namespace: optStr(40),
  key: str(200).min(1),
  value: str(5000).min(1),
  reviewed: z.boolean().optional(),
});

export const knowledgeNoteSchema = z.object({
  title: str(200).min(2),
  body: str(4000).min(2),
  district: district.optional(),
  targetType: z.enum(TARGET_TYPES).optional(),
  targetId: objectId.optional(),
  topics: strList(40),
  confidence: z.enum(['verified', 'estimated']).optional(),
  source: optStr(200),
  sourceUrl: optionalUrl,
  approved: z.boolean().optional(),
});

export const statusChangeSchema = z.object({
  status: z.enum(CONTENT_STATUSES),
  note: optStr(1000),
  markVerified: z.boolean().optional(),
});

export { httpUrl };
