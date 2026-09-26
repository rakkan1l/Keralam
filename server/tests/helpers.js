import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';

export const app = createApp();
export const api = () => request(app);

/** Connect to an isolated database per test file and start from empty. */
export async function useDatabase(name) {
  const base = process.env.MONGODB_URI.replace(/\/?(\?.*)?$/, '');
  await mongoose.connect(`${base}/${name}`);
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}

export async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}

let counter = 0;
export async function createUser(role = 'user', overrides = {}) {
  counter += 1;
  const email = overrides.email || `${role}${counter}-${Date.now()}@test.dev`;
  const password = 'Passw0rd!123';
  await User.create({ name: `${role} ${counter}`, email, password, role, ...overrides });
  const res = await api().post('/api/v1/auth/login').send({ email, password });
  return { token: res.body.data.token, user: res.body.data.user, email, password };
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const samplePlace = (overrides = {}) => ({
  name: 'Test Waterfall',
  district: 'thrissur',
  location: { type: 'Point', coordinates: [76.57, 10.28] },
  categories: ['waterfalls'],
  moods: ['family'],
  shortDescription: 'A test waterfall.',
  visitDurationHours: 2,
  ...overrides,
});
