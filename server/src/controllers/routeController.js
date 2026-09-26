import { TransportNode } from '../models/index.js';
import { ok } from '../utils/response.js';
import { toList } from '../utils/pagination.js';
import { planRoute, findAlongRoute, externalMapsLinks } from '../services/routeService.js';
import { track } from '../services/analyticsService.js';
import { publicFilter } from './helpers.js';

export async function plan(req, res) {
  const route = await planRoute(req.body);
  track('route_request', { user: req.user?._id, meta: { provider: route.provider, distanceKm: route.distanceKm, stops: req.body.waypoints.length } });
  return ok(res, { ...route, external: externalMapsLinks(req.body.from, req.body.to) });
}

export async function along(req, res) {
  return ok(res, await findAlongRoute(req.body));
}

export async function transport(req, res) {
  const filter = { ...publicFilter };
  const kinds = toList(req.query.kind);
  if (kinds.length) filter.kind = { $in: kinds };
  const districts = toList(req.query.district);
  if (districts.length) filter.district = { $in: districts };
  const items = await TransportNode.find(filter, { searchKeys: 0 }).sort({ kind: 1, name: 1 }).limit(200).lean();
  return ok(res, items);
}
