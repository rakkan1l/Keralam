import { Trip } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { ok, created } from '../utils/response.js';
import { randomToken } from '../utils/slugify.js';
import { generateTrip } from '../services/ai/tripService.js';
import { ask } from '../services/ai/assistantService.js';
import { track } from '../services/analyticsService.js';
import { features } from '../config/env.js';

export async function generate(req, res) {
  const trip = await generateTrip(req.body);
  track('trip_created', { user: req.user?._id, meta: { generator: trip.generator, duration: req.body.duration, saved: false } });
  return ok(res, trip);
}

export async function mine(req, res) {
  const trips = await Trip.find({ user: req.user._id }, { title: 1, inputs: 1, summary: 1, generator: 1, isPublic: 1, shareSlug: 1, createdAt: 1, updatedAt: 1, 'days.day': 1 })
    .sort({ updatedAt: -1 })
    .lean();
  return ok(res, trips);
}

export async function create(req, res) {
  const trip = await Trip.create({ ...req.body, user: req.user._id, shareSlug: req.body.isPublic ? randomToken(12) : undefined });
  track('trip_created', { user: req.user._id, meta: { generator: trip.generator, saved: true } });
  return created(res, trip);
}

async function ownTrip(req) {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) throw ApiError.notFound('Trip not found');
  return trip;
}

export async function get(req, res) {
  return ok(res, await ownTrip(req));
}

export async function update(req, res) {
  const trip = await ownTrip(req);
  trip.set(req.body);
  await trip.save();
  return ok(res, trip);
}

export async function remove(req, res) {
  const trip = await ownTrip(req);
  await trip.deleteOne();
  return ok(res, { deleted: true });
}

export async function share(req, res) {
  const trip = await ownTrip(req);
  const enable = req.body?.isPublic !== false;
  trip.isPublic = enable;
  if (enable && !trip.shareSlug) trip.shareSlug = randomToken(12);
  await trip.save();
  return ok(res, { isPublic: trip.isPublic, shareSlug: trip.shareSlug });
}

export async function shared(req, res) {
  const trip = await Trip.findOne({ shareSlug: req.params.slug, isPublic: true }, { user: 0 }).lean();
  if (!trip) throw ApiError.notFound('This trip is private or no longer exists');
  return ok(res, trip);
}

export async function assistant(req, res) {
  return ok(res, await ask(req.body));
}

export async function aiStatus(_req, res) {
  return ok(res, { configured: features.ai, mode: features.ai ? 'ai' : 'demo' });
}
