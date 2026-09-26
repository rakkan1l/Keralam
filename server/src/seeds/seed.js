/* eslint-disable no-console */
// Seeds the database with development data. Usage: npm run seed [-- --keep-users]
// WARNING: clears all content collections (not users) before inserting.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import {
  District,
  Place,
  Business,
  Dish,
  Stay,
  Event,
  TransportNode,
  RouteStop,
  EmergencyContact,
  SafetyNotice,
  KnowledgeNote,
  Category,
  AnalyticsEvent,
  Review,
  CommunityUpdate,
  Report,
} from '../models/index.js';
import { slugify } from '../utils/slugify.js';
import { districts } from './data/districts.js';
import { places } from './data/places.js';
import {
  dishes,
  buildDemoBusinesses,
  buildDemoStays,
  buildDemoEvents,
  transport,
  routeStops,
  emergencyContacts,
  safetyNotices,
  knowledgeNotes,
  categories,
} from './data/other.js';

async function insertWithSlugs(Model, docs, nameField = 'name') {
  const used = new Set();
  const out = [];
  for (const doc of docs) {
    let slug = slugify(doc[nameField]);
    let n = 2;
    while (used.has(slug)) slug = `${slugify(doc[nameField])}-${n++}`;
    used.add(slug);
    // Model.create runs pre-save hooks (search keys) for each document.
    out.push(await Model.create({ ...doc, slug }));
  }
  return out;
}

export async function seed({ quiet = false } = {}) {
  const log = quiet ? () => {} : console.log;
  const models = [District, Place, Business, Dish, Stay, Event, TransportNode, RouteStop, EmergencyContact, SafetyNotice, KnowledgeNote, Category, AnalyticsEvent, Review, CommunityUpdate, Report];
  await Promise.all(models.map((M) => M.deleteMany({})));
  await Promise.all(models.map((M) => M.syncIndexes()));

  await District.insertMany(districts.map((d) => ({ ...d, status: 'published' })));
  log(`districts:  ${districts.length}`);
  await Category.insertMany(categories);

  const placeDocs = await insertWithSlugs(Place, places);
  log(`places:     ${placeDocs.length}`);

  const dishDocs = await insertWithSlugs(Dish, dishes);
  log(`dishes:     ${dishDocs.length}`);

  const businessDocs = await insertWithSlugs(Business, buildDemoBusinesses());
  // Link signature dishes to demo restaurants for richer food pages.
  const biriyani = dishDocs.find((d) => d.name === 'Thalassery Biriyani');
  const mandhi = dishDocs.find((d) => d.name === 'Mandhi');
  for (const b of businessDocs) {
    if (b.food?.categories?.includes('biriyani') && biriyani) b.food.signatureDishes = [biriyani._id];
    if (b.food?.categories?.includes('mandhi') && mandhi) b.food.signatureDishes = [mandhi._id];
    if (b.isModified()) await b.save();
  }
  log(`businesses: ${businessDocs.length} (demo)`);

  const stayDocs = await insertWithSlugs(Stay, buildDemoStays());
  log(`stays:      ${stayDocs.length} (demo)`);

  const eventDocs = await insertWithSlugs(Event, buildDemoEvents(), 'title');
  log(`events:     ${eventDocs.length} (demo)`);

  await insertWithSlugs(TransportNode, transport);
  await insertWithSlugs(RouteStop, routeStops);
  await EmergencyContact.insertMany(emergencyContacts);
  await SafetyNotice.insertMany(safetyNotices);
  await KnowledgeNote.insertMany(knowledgeNotes);
  log(`transport:  ${transport.length}, route stops: ${routeStops.length}, emergency contacts: ${emergencyContacts.length} (unverified)`);
  return { places: placeDocs, businesses: businessDocs, stays: stayDocs, events: eventDocs, dishes: dishDocs };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  connectDB()
    .then(() => seed())
    .then(() => {
      console.log(`\nSeed complete (${env.mongoUri.replace(/\/\/[^@]*@/, '//***@')}).`);
      console.log('Create an admin account with: npm run create-admin');
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exitCode = 1;
    })
    .finally(() => disconnectDB());
}
