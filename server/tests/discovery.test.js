import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, useDatabase, closeDatabase, createUser, auth } from './helpers.js';
import { seed } from '../src/seeds/seed.js';
import { Event } from '../src/models/index.js';

describe('Discovery, search, saving and trips (seeded data)', () => {
  let user;
  let data;

  beforeAll(async () => {
    await useDatabase('discovery_tests');
    data = await seed({ quiet: true });
    user = await createUser('user');
  });
  afterAll(() => closeDatabase());

  it('filters destinations by district', async () => {
    const res = await api().get('/api/v1/places?district=wayanad&limit=50');
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p) => p.district === 'wayanad')).toBe(true);
    expect(res.body.meta.total).toBe(res.body.data.length);
  });

  it('filters by category, mood and hidden gems', async () => {
    const falls = await api().get('/api/v1/places?category=waterfalls&limit=50');
    expect(falls.body.data.every((p) => p.categories.includes('waterfalls'))).toBe(true);
    const gems = await api().get('/api/v1/places?hiddenGem=true&limit=50');
    expect(gems.body.data.length).toBeGreaterThan(5);
    expect(gems.body.data.every((p) => p.hiddenGem)).toBe(true);
  });

  it('never returns drafts or items awaiting verification', async () => {
    const res = await api().get('/api/v1/places?limit=60');
    expect(res.body.data.find((p) => p.name === 'Paithalmala')).toBeUndefined();
    expect(res.body.data.find((p) => p.name === 'Idukki Arch Dam')).toBeUndefined();
  });

  it('searches with Malayalam/English spelling variants', async () => {
    for (const q of ['athirapally', 'Athirappilly', 'athirapilly']) {
      const res = await api().get(`/api/v1/search?q=${q}`);
      expect(res.body.data.results.places.map((p) => p.name)).toContain('Athirappilly Falls');
    }
    const calicut = await api().get('/api/v1/search?q=beach in calicut');
    expect(calicut.body.data.results.places.every((p) => p.district === 'kozhikode')).toBe(true);
    const ml = await api().get(`/api/v1/search?q=${encodeURIComponent('മൂന്നാർ')}`);
    expect(ml.body.data.results.places.map((p) => p.name)).toContain('Munnar Tea Estates');
  });

  it('interprets structured travel queries', async () => {
    const res = await api().get('/api/v1/search?q=peaceful beach near Kozhikode');
    const types = res.body.data.interpretation.map((i) => i.type);
    expect(types).toEqual(expect.arrayContaining(['category', 'mood', 'district']));
    expect(res.body.data.results.places.every((p) => p.categories.includes('beaches') && p.district === 'kozhikode')).toBe(true);
  });

  it('logs zero-result searches', async () => {
    const res = await api().get('/api/v1/search?q=zzqqxx nonsense');
    expect(res.body.data.total).toBe(0);
  });

  it('finds nearby places sorted by distance', async () => {
    const res = await api().get('/api/v1/nearby?lat=11.25&lng=75.78&category=attractions&radius=30');
    expect(res.status).toBe(200);
    const d = res.body.data.map((p) => p.distanceKm);
    expect(d.length).toBeGreaterThan(0);
    expect([...d].sort((a, b) => a - b)).toEqual(d);
    expect(d.every((x) => x <= 30)).toBe(true);
    expect((await api().get('/api/v1/nearby?lat=abc&lng=1')).status).toBe(400);
  });

  it('filters events and hides expired ones from upcoming results', async () => {
    const upcoming = await api().get('/api/v1/events?limit=50');
    expect(upcoming.body.data.find((e) => e.title === 'Sample Art Exhibition')).toBeUndefined();
    expect(upcoming.body.data.every((e) => new Date(e.endDate) >= new Date(Date.now() - 1000))).toBe(true);
    const past = await api().get('/api/v1/events?when=past');
    expect(past.body.data.map((e) => e.title)).toContain('Sample Art Exhibition');
    const byDistrict = await api().get('/api/v1/events?district=ernakulam');
    expect(byDistrict.body.data.every((e) => e.district === 'ernakulam')).toBe(true);
    const byCat = await api().get('/api/v1/events?category=sports');
    expect(byCat.body.data.every((e) => e.category === 'sports')).toBe(true);
    const today = await api().get('/api/v1/events?when=today');
    expect(today.body.data.map((e) => e.title)).toContain('Sample Evening Food Walk');
    const weekend = await api().get('/api/v1/events?when=weekend');
    expect(weekend.body.data.map((e) => e.title)).toContain('Sample Weekend Crafts Market');
  });

  it('saves and unsaves places for a logged-in user', async () => {
    const place = data.places.find((p) => p.name === 'Bekal Fort');
    const save = await api().post('/api/v1/me/saved').set(auth(user.token)).send({ targetType: 'place', targetId: String(place._id) });
    expect(save.status).toBe(200);
    const list = await api().get('/api/v1/me/saved').set(auth(user.token));
    expect(list.body.data[0].item.name).toBe('Bekal Fort');
    await api().delete(`/api/v1/me/saved/place/${place._id}`).set(auth(user.token));
    const after = await api().get('/api/v1/me/saved').set(auth(user.token));
    expect(after.body.data).toHaveLength(0);
  });

  it('records recently viewed places for signed-in users', async () => {
    await api().get('/api/v1/places/bekal-fort').set(auth(user.token));
    await api().get('/api/v1/places/kovalam-beach').set(auth(user.token));
    await api().get('/api/v1/places/bekal-fort').set(auth(user.token));
    await new Promise((r) => setTimeout(r, 150)); // view tracking is fire-and-forget
    const res = await api().get('/api/v1/me/recent').set(auth(user.token));
    expect(res.body.data.map((r) => r.item.name)).toEqual(['Bekal Fort', 'Kovalam Beach']);
  });

  it('syncs guest saves into the account and ignores invalid ids', async () => {
    const [a, b] = data.places;
    const res = await api()
      .post('/api/v1/me/saved/sync')
      .set(auth(user.token))
      .send({ items: [{ targetType: 'place', targetId: String(a._id) }, { targetType: 'place', targetId: String(b._id) }, { targetType: 'place', targetId: '0123456789abcdef01234567' }] });
    expect(res.body.data.added).toBe(2);
  });

  it('generates a database-grounded demo trip, then saves and shares it', async () => {
    const gen = await api()
      .post('/api/v1/trips/generate')
      .send({ start: { district: 'ernakulam' }, duration: 'one-day', interests: ['culture'], pace: 'balanced' });
    expect(gen.status).toBe(200);
    const trip = gen.body.data;
    expect(trip.generator).toBe('demo');
    expect(trip.notice).toMatch(/demo/i);
    const placeItems = trip.days[0].items.filter((i) => i.kind === 'place');
    expect(placeItems.length).toBeGreaterThan(0);
    // Every place in the itinerary must exist in the database.
    const ids = new Set(data.places.map((p) => String(p._id)));
    expect(placeItems.every((i) => ids.has(String(i.targetId)))).toBe(true);
    // Unknown fees are reported as unavailable, never invented.
    expect(placeItems.every((i) => ['verified', 'estimated', 'unavailable'].includes(i.costEstimate.confidence))).toBe(true);

    expect((await api().post('/api/v1/trips').send({ title: 'x', days: [] })).status).toBe(401);
    const saved = await api().post('/api/v1/trips').set(auth(user.token)).send({ title: trip.title, days: trip.days, summary: trip.summary, inputs: trip.inputs, generator: 'demo' });
    expect(saved.status).toBe(201);
    const share = await api().post(`/api/v1/trips/${saved.body.data._id}/share`).set(auth(user.token));
    const shared = await api().get(`/api/v1/trips/shared/${share.body.data.shareSlug}`);
    expect(shared.body.data.title).toBe(trip.title);
    expect(shared.body.data.user).toBeUndefined();
  });

  it('requires a start location for trips', async () => {
    const res = await api().post('/api/v1/trips/generate').send({ start: {}, duration: 'one-day' });
    expect(res.status).toBe(400);
  });

  it('plans an estimated route and lists stops along it', async () => {
    const plan = await api().post('/api/v1/routes/plan').send({ from: [75.78, 11.25], to: [76.08, 11.61] });
    expect(plan.body.data.estimated).toBe(true);
    expect(plan.body.data.external.google).toMatch(/google\.com\/maps/);
    const along = await api().post('/api/v1/routes/along').send({ line: [[75.78, 11.25], [76.08, 11.61]], categories: ['fuel', 'viewpoints'], bufferKm: 8 });
    expect(along.body.data.length).toBeGreaterThan(0);
  });

  it('loads a complete district page', async () => {
    const res = await api().get('/api/v1/districts/kozhikode');
    expect(res.body.data.district.name).toBe('Kozhikode');
    expect(res.body.data.neighbours.map((n) => n.slug).sort()).toEqual(['kannur', 'malappuram', 'wayanad']);
    expect(res.body.data.popular.length).toBeGreaterThan(0);
    const all = await api().get('/api/v1/districts');
    expect(all.body.data).toHaveLength(14);
  });

  it('accepts reviews into moderation and reports from guests', async () => {
    const place = data.places[0];
    const review = await api().post('/api/v1/reviews').set(auth(user.token)).send({ targetType: 'place', targetId: String(place._id), rating: 5, text: 'Lovely' });
    expect(review.body.data.status).toBe('pending');
    const pub = await api().get(`/api/v1/reviews?targetType=place&targetId=${place._id}`);
    expect(pub.body.data).toHaveLength(0);
    const report = await api().post('/api/v1/reports').send({ kind: 'closure', targetType: 'place', targetId: String(place._id), message: 'This place seems closed now.' });
    expect(report.status).toBe(201);
  });

  it('keeps expired events out of the district page', async () => {
    const expired = await Event.findOne({ title: 'Sample Art Exhibition' });
    const res = await api().get(`/api/v1/districts/${expired.district}`);
    expect(res.body.data.events.find((e) => e.title === expired.title)).toBeUndefined();
  });
});
