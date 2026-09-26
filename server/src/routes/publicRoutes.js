import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimits.js';
import * as places from '../controllers/placeController.js';
import * as districts from '../controllers/districtController.js';
import * as categories from '../controllers/categoryController.js';
import * as businesses from '../controllers/businessController.js';
import * as stays from '../controllers/stayController.js';
import * as events from '../controllers/eventController.js';
import * as discovery from '../controllers/discoveryController.js';
import * as routes from '../controllers/routeController.js';
import * as trips from '../controllers/tripController.js';
import * as community from '../controllers/communityController.js';
import * as meta from '../controllers/metaController.js';
import { routePlanSchema, alongRouteSchema } from '../validators/route.js';
import { tripInputSchema, tripSaveSchema, tripUpdateSchema, assistantSchema } from '../validators/trip.js';
import { reviewSchema, reportSchema, communityUpdateSchema } from '../validators/user.js';
import { LANGUAGE_CODES } from '../config/constants.js';
import { ApiError } from '../utils/ApiError.js';

const r = Router();
r.use(optionalAuth);

r.get('/meta', meta.meta);
r.get('/translations/:lang', (req, _res, next) => (LANGUAGE_CODES.includes(req.params.lang) ? next() : next(ApiError.notFound())), community.translations);

// Discovery
r.get('/places', places.list);
r.get('/places/map', places.mapPoints);
r.get('/places/:slug', places.detail);
r.get('/districts', districts.list);
r.get('/districts/:slug', districts.detail);
r.get('/categories', categories.list);
r.get('/businesses', businesses.list);
r.get('/businesses/:slug', businesses.detail);
r.get('/food/dishes', businesses.dishes);
r.get('/food/dishes/:slug', businesses.dishDetail);
r.get('/stays', stays.list);
r.get('/stays/:slug', stays.detail);
r.get('/events', events.list);
r.get('/events/:slug', events.detail);
r.post('/events/:id/interest', writeLimiter, events.interest);

r.get('/search', discovery.search);
r.get('/search/suggest', discovery.suggestions);
r.get('/trending', discovery.trending);
r.get('/nearby', discovery.nearby);
r.get('/weather', discovery.weather);

// Maps & routes
r.post('/routes/plan', validate(routePlanSchema), routes.plan);
r.post('/routes/along', validate(alongRouteSchema), routes.along);
r.get('/transport', routes.transport);

// Trips & AI
r.get('/ai/status', trips.aiStatus);
r.post('/trips/generate', writeLimiter, validate(tripInputSchema), trips.generate);
r.post('/assistant/ask', writeLimiter, validate(assistantSchema), trips.assistant);
r.get('/trips/shared/:slug', trips.shared);
r.get('/trips', requireAuth, trips.mine);
r.post('/trips', requireAuth, validate(tripSaveSchema), trips.create);
r.get('/trips/:id', requireAuth, trips.get);
r.patch('/trips/:id', requireAuth, validate(tripUpdateSchema), trips.update);
r.delete('/trips/:id', requireAuth, trips.remove);
r.post('/trips/:id/share', requireAuth, trips.share);

// Community
r.get('/reviews', community.listReviews);
r.post('/reviews', requireAuth, writeLimiter, validate(reviewSchema), community.createReview);
r.get('/updates', community.listUpdates);
r.post('/updates', requireAuth, writeLimiter, validate(communityUpdateSchema), community.createUpdate);
r.post('/reports', writeLimiter, validate(reportSchema), community.createReport);

// Help & safety
r.get('/emergency', community.emergency);

export default r;
