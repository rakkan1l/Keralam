import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api/v1`,
  withCredentials: true, // httpOnly auth cookie
  timeout: 20000,
});

/** Normalise API errors to a readable message plus field details. */
export function errorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || 'Something went wrong';
}
export function errorDetails(err) {
  return err?.response?.data?.error?.details || [];
}

const unwrap = (res) => res.data;
const get = (url, params) => api.get(url, { params }).then(unwrap);
const post = (url, body) => api.post(url, body).then(unwrap);
const patch = (url, body) => api.patch(url, body).then(unwrap);
const del = (url) => api.delete(url).then(unwrap);

// Returns { data, meta } for list endpoints and data for everything else.
export const endpoints = {
  meta: () => get('/meta').then((r) => r.data),
  translations: (lng) => get(`/translations/${lng}`).then((r) => r.data),

  places: (params) => get('/places', params),
  placeMap: (params) => get('/places/map', params).then((r) => r.data),
  place: (slug) => get(`/places/${slug}`).then((r) => r.data),
  districts: () => get('/districts').then((r) => r.data),
  district: (slug) => get(`/districts/${slug}`).then((r) => r.data),
  businesses: (params) => get('/businesses', params),
  business: (slug) => get(`/businesses/${slug}`).then((r) => r.data),
  dishes: (params) => get('/food/dishes', params),
  dish: (slug) => get(`/food/dishes/${slug}`).then((r) => r.data),
  stays: (params) => get('/stays', params),
  stay: (slug) => get(`/stays/${slug}`).then((r) => r.data),
  events: (params) => get('/events', params),
  event: (slug) => get(`/events/${slug}`).then((r) => r.data),
  eventInterest: (id) => post(`/events/${id}/interest`).then((r) => r.data),

  search: (params) => get('/search', params).then((r) => r.data),
  suggest: (q) => get('/search/suggest', { q }).then((r) => r.data),
  trending: (params) => get('/trending', params).then((r) => r.data),
  nearby: (params) => get('/nearby', params),
  weather: (params) => get('/weather', params).then((r) => r.data),
  transport: (params) => get('/transport', params).then((r) => r.data),
  planRoute: (body) => post('/routes/plan', body).then((r) => r.data),
  alongRoute: (body) => post('/routes/along', body).then((r) => r.data),

  aiStatus: () => get('/ai/status').then((r) => r.data),
  generateTrip: (body) => post('/trips/generate', body).then((r) => r.data),
  ask: (body) => post('/assistant/ask', body).then((r) => r.data),
  trips: () => get('/trips').then((r) => r.data),
  trip: (id) => get(`/trips/${id}`).then((r) => r.data),
  saveTrip: (body) => post('/trips', body).then((r) => r.data),
  updateTrip: (id, body) => patch(`/trips/${id}`, body).then((r) => r.data),
  deleteTrip: (id) => del(`/trips/${id}`),
  shareTrip: (id, isPublic = true) => post(`/trips/${id}/share`, { isPublic }).then((r) => r.data),
  sharedTrip: (slug) => get(`/trips/shared/${slug}`).then((r) => r.data),

  reviews: (params) => get('/reviews', params),
  createReview: (body) => post('/reviews', body).then((r) => r.data),
  updates: (params) => get('/updates', params).then((r) => r.data),
  createUpdate: (body) => post('/updates', body).then((r) => r.data),
  createReport: (body) => post('/reports', body).then((r) => r.data),
  emergency: (params) => get('/emergency', params).then((r) => r.data),

  // Auth & account
  me: () => get('/auth/me').then((r) => r.data.user),
  login: (body) => post('/auth/login', body).then((r) => r.data),
  register: (body) => post('/auth/register', body).then((r) => r.data),
  logout: () => post('/auth/logout'),
  profile: () => get('/me').then((r) => r.data),
  updateProfile: (body) => patch('/me', body).then((r) => r.data),
  changePassword: (body) => post('/me/password', body).then((r) => r.data),
  saved: () => get('/me/saved').then((r) => r.data),
  savedIds: () => get('/me/saved/ids').then((r) => r.data),
  save: (body) => post('/me/saved', body),
  unsave: (type, id) => del(`/me/saved/${type}/${id}`),
  syncSaved: (items) => post('/me/saved/sync', { items }).then((r) => r.data),
  recent: () => get('/me/recent').then((r) => r.data),
  myReviews: () => get('/me/reviews').then((r) => r.data),
  lists: () => get('/lists').then((r) => r.data),
  list: (id) => get(`/lists/${id}`).then((r) => r.data),
  createList: (body) => post('/lists', body).then((r) => r.data),
  updateList: (id, body) => patch(`/lists/${id}`, body).then((r) => r.data),
  deleteList: (id) => del(`/lists/${id}`),
  addListItem: (id, body) => post(`/lists/${id}/items`, body).then((r) => r.data),
  removeListItem: (id, type, targetId) => del(`/lists/${id}/items/${type}/${targetId}`),
  sharedList: (slug) => get(`/lists/shared/${slug}`).then((r) => r.data),
  upload: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/uploads', fd).then((r) => r.data.data);
  },
};

// Admin endpoints (generic resource CRUD + dashboards)
export const adminApi = {
  overview: () => get('/admin/overview').then((r) => r.data),
  analytics: (days) => get('/admin/analytics', { days }).then((r) => r.data),
  ai: () => get('/admin/ai').then((r) => r.data),
  list: (resource, params) => get(`/admin/${resource}`, params),
  get: (resource, id) => get(`/admin/${resource}/${id}`).then((r) => r.data),
  create: (resource, body) => post(`/admin/${resource}`, body).then((r) => r.data),
  update: (resource, id, body) => patch(`/admin/${resource}/${id}`, body).then((r) => r.data),
  remove: (resource, id, hard = false) => api.delete(`/admin/${resource}/${id}`, { params: hard ? { hard: 'true' } : {} }).then(unwrap),
  setStatus: (resource, id, body) => patch(`/admin/${resource}/${id}/status`, body).then((r) => r.data),
  feature: (resource, id, body) => patch(`/admin/${resource}/${id}/feature`, body).then((r) => r.data),
  moderate: (kind, id, body) => patch(`/admin/${kind}/${id}`, body).then((r) => r.data),
};
