import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, useDatabase, closeDatabase, auth } from './helpers.js';

describe('Authentication', () => {
  beforeAll(() => useDatabase('auth_tests'));
  afterAll(() => closeDatabase());

  const creds = { name: 'Anu', email: 'anu@example.com', password: 'Kerala2024x' };
  let token;

  it('registers a new user and returns a token without the password', async () => {
    const res = await api().post('/api/v1/auth/register').send(creds);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('anu@example.com');
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.headers['set-cookie'][0]).toMatch(/kt_token=.*HttpOnly/i);
    token = res.body.data.token;
  });

  it('rejects duplicate registration', async () => {
    const res = await api().post('/api/v1/auth/register').send(creds);
    expect(res.status).toBe(409);
  });

  it('rejects weak passwords and invalid emails', async () => {
    const res = await api().post('/api/v1/auth/register').send({ name: 'X', email: 'nope', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('cannot register as admin via the role field', async () => {
    const res = await api().post('/api/v1/auth/register').send({ name: 'Eve', email: 'eve@example.com', password: 'Kerala2024x', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('user');
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    const bad = await api().post('/api/v1/auth/login').send({ email: creds.email, password: 'WrongPass123' });
    expect(bad.status).toBe(401);
    const good = await api().post('/api/v1/auth/login').send({ email: creds.email, password: creds.password });
    expect(good.status).toBe(200);
    expect(good.body.data.token).toBeTruthy();
  });

  it('returns the current user for a valid token', async () => {
    const res = await api().get('/api/v1/auth/me').set(auth(token));
    expect(res.body.data.user.email).toBe(creds.email);
  });

  it('accepts the httpOnly cookie as well as a bearer token', async () => {
    const login = await api().post('/api/v1/auth/login').send({ email: creds.email, password: creds.password });
    const cookie = login.headers['set-cookie'];
    const res = await api().get('/api/v1/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });

  it('protects private routes', async () => {
    expect((await api().get('/api/v1/me/saved')).status).toBe(401);
    expect((await api().get('/api/v1/me/saved').set(auth('garbage.token.value'))).status).toBe(401);
    expect((await api().get('/api/v1/me/saved').set(auth(token))).status).toBe(200);
  });

  it('logs out by clearing the cookie', async () => {
    const res = await api().post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/kt_token=;/);
  });
});
