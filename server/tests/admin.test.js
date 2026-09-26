import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, useDatabase, closeDatabase, createUser, auth, samplePlace } from './helpers.js';

describe('Admin authorization and content workflow', () => {
  let user;
  let editor;
  let admin;
  let placeId;

  beforeAll(async () => {
    await useDatabase('admin_tests');
    user = await createUser('user');
    editor = await createUser('editor');
    admin = await createUser('admin');
  });
  afterAll(() => closeDatabase());

  it('blocks guests and regular users from the admin API', async () => {
    expect((await api().get('/api/v1/admin/overview')).status).toBe(401);
    expect((await api().get('/api/v1/admin/overview').set(auth(user.token))).status).toBe(403);
    expect((await api().post('/api/v1/admin/places').set(auth(user.token)).send(samplePlace())).status).toBe(403);
  });

  it('lets an editor create a destination, which starts as a draft', async () => {
    const res = await api().post('/api/v1/admin/places').set(auth(editor.token)).send(samplePlace({ status: 'published' }));
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('draft');
    expect(res.body.data.slug).toBe('test-waterfall');
    placeId = res.body.data._id;
  });

  it('validates destination input', async () => {
    const res = await api()
      .post('/api/v1/admin/places')
      .set(auth(editor.token))
      .send({ name: 'X', district: 'atlantis', location: { coordinates: [500, 0] } });
    expect(res.status).toBe(400);
  });

  it('does not show drafts publicly', async () => {
    expect((await api().get('/api/v1/places/test-waterfall')).status).toBe(404);
  });

  it('forbids editors from changing publishing status', async () => {
    const res = await api().patch(`/api/v1/admin/places/${placeId}/status`).set(auth(editor.token)).send({ status: 'published' });
    expect(res.status).toBe(403);
  });

  it('lets an admin verify and publish', async () => {
    const verify = await api().patch(`/api/v1/admin/places/${placeId}/status`).set(auth(admin.token)).send({ status: 'verified', note: 'Checked on site' });
    expect(verify.body.data.verification.verifiedAt).toBeTruthy();
    const pub = await api().patch(`/api/v1/admin/places/${placeId}/status`).set(auth(admin.token)).send({ status: 'published' });
    expect(pub.body.data.status).toBe('published');
    const res = await api().get('/api/v1/places/test-waterfall');
    expect(res.status).toBe(200);
    expect(res.body.data.place.name).toBe('Test Waterfall');
  });

  it('edits a destination and sends editor edits of published content back to verification', async () => {
    const res = await api()
      .patch(`/api/v1/admin/places/${placeId}`)
      .set(auth(editor.token))
      .send({ shortDescription: 'Updated description', alternateNames: ['Test Falls'] });
    expect(res.status).toBe(200);
    expect(res.body.data.shortDescription).toBe('Updated description');
    expect(res.body.data.status).toBe('needs_verification');
    expect(res.body.data.searchKeys).toContain('testfals');
  });

  it('lets an admin edit without resetting status', async () => {
    await api().patch(`/api/v1/admin/places/${placeId}/status`).set(auth(admin.token)).send({ status: 'published' });
    const res = await api().patch(`/api/v1/admin/places/${placeId}`).set(auth(admin.token)).send({ entryFee: { amount: 50, verified: true } });
    expect(res.body.data.status).toBe('published');
    expect(res.body.data.entryFee.amount).toBe(50);
  });

  it('archives instead of hard-deleting by default', async () => {
    const res = await api().delete(`/api/v1/admin/places/${placeId}`).set(auth(editor.token));
    expect(res.body.data.archived).toBe(true);
    expect((await api().get('/api/v1/places/test-waterfall')).status).toBe(404);
  });

  it('restricts emergency contacts and user management to admins', async () => {
    const contact = { name: 'Test line', number: '000', category: 'general' };
    expect((await api().post('/api/v1/admin/emergency-contacts').set(auth(editor.token)).send(contact)).status).toBe(403);
    expect((await api().post('/api/v1/admin/emergency-contacts').set(auth(admin.token)).send(contact)).status).toBe(201);
    expect((await api().get('/api/v1/admin/users').set(auth(editor.token))).status).toBe(403);
    const users = await api().get('/api/v1/admin/users').set(auth(admin.token));
    expect(users.body.data.length).toBe(3);
  });

  it('prevents an admin from demoting themselves', async () => {
    const res = await api().patch(`/api/v1/admin/users/${admin.user.id}`).set(auth(admin.token)).send({ role: 'user' });
    expect(res.status).toBe(400);
  });

  it('reports real counts on the dashboard overview', async () => {
    const res = await api().get('/api/v1/admin/overview').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.totals.users).toBe(3);
    expect(res.body.data.totals.totalPlaces).toBe(1);
  });

  it('rejects events whose end date is before the start date', async () => {
    const res = await api()
      .post('/api/v1/admin/events')
      .set(auth(editor.token))
      .send({ title: 'Bad dates', category: 'concert', district: 'kollam', startDate: '2030-01-02', endDate: '2030-01-01' });
    expect(res.status).toBe(400);
  });
});
