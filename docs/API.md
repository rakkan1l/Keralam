# REST API reference

Base URL: `/api/v1`. All responses are JSON.

- Success: `{ "success": true, "data": …, "meta"?: { page, limit, total, pages } }`
- Error: `{ "success": false, "error": { "message": "…", "details"?: [{ "path", "message" }] } }`
- Auth: httpOnly cookie `kt_token` (set on login/register) **or** `Authorization: Bearer <token>`.
- Roles: `user`, `contributor`, `editor`, `admin`. 🔒 = signed in, ✎ = editor or admin, ★ = admin only.
- Pagination: `?page=1&limit=12` (max 50–100 depending on endpoint).
- Coordinates are GeoJSON `[lng, lat]`.
- Rate limits: 600 req/15 min/IP overall (configurable), 30/15 min on auth, 60/h on write endpoints.

## Auth
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | Password ≥ 8 chars with a letter and a number. Returns `{ user, token }` and sets cookie. Role is always `user` |
| POST | `/auth/login` | `{ email, password }` | 401 on bad credentials (same message for unknown email) |
| POST | `/auth/logout` | | Clears cookie |
| GET | `/auth/me` | | `{ user }` or `{ user: null }` |

## Account 🔒
| Method | Path | Notes |
|---|---|---|
| GET / PATCH | `/me` | Profile: `name, avatarUrl, homeDistrict, preferences{language, interests, travellerType}, trustedContacts[≤5]` |
| POST | `/me/password` | `{ currentPassword, newPassword }` |
| GET | `/me/saved` | Saved items hydrated to cards |
| GET | `/me/saved/ids` | `["place:<id>", …]` |
| POST | `/me/saved` | `{ targetType, targetId }` — `targetType ∈ place, business, stay, event, dish` |
| DELETE | `/me/saved/:targetType/:targetId` | |
| POST | `/me/saved/sync` | `{ items: [{targetType, targetId}] }` merge guest saves; invalid ids ignored |
| GET | `/me/recent` | Recently viewed (last 30) |
| GET | `/me/reviews` | Own reviews with moderation status |
| GET / POST | `/lists` | Custom lists `{ name, description?, isPublic? }` |
| GET / PATCH / DELETE | `/lists/:id` | |
| POST | `/lists/:id/items` | `{ targetType, targetId, note? }` |
| DELETE | `/lists/:id/items/:targetType/:targetId` | |
| GET | `/lists/shared/:slug` | Public (no auth) |
| POST | `/uploads` | multipart `image` (≤ 5 MB, jpeg/png/webp/avif). 503 if Cloudinary is not configured |

## Discovery (public)
| Method | Path | Query |
|---|---|---|
| GET | `/places` | `district, category, mood` (comma lists), `time` (`1h,3h,half-day,1-day,weekend,3-days-plus`), `budget` (`free,budget,moderate,premium`), `season` (`now,monsoon`), `month`, `hiddenGem, family, accessible, indoor, featured, verified` (`true`), `crowd=low`, `q`, `sort` (`popular,rating,name,newest,distance`), `lat,lng,radius` (adds `distanceKm`) |
| GET | `/places/map` | Same filters; up to 500 lightweight map points |
| GET | `/places/:slug` | `{ place, notices, updates, reviews, nearby{places,food,stays} }`; records a view |
| GET | `/districts` | All 14 with `placeCount` |
| GET | `/districts/:slug` | `{ district, popular, hiddenGems, restaurants, events, stays, transport, services, neighbours, dishes }` |
| GET | `/categories` | `?type=place` |
| GET | `/businesses` | `section` (`food,shopping,theatres,activities,services`) or `kind`, `district, foodCategory, price, dietary, language` (theatres), `lateNight, accessible, q, sort=rating, lat,lng,radius` |
| GET | `/businesses/:slug` | `{ business, notices, updates, reviews, nearby }` |
| GET | `/food/dishes` | `category, region, dietary, q` |
| GET | `/food/dishes/:slug` | `{ dish, places }` |
| GET | `/stays` | `type, district, price, facility` (all must match), `traveller, experience, accessible, q, lat,lng,radius` |
| GET | `/stays/:slug` | `{ stay, notices, updates, reviews, nearby }` |
| GET | `/events` | `when` (`today,weekend,week,month,upcoming,past` — IST), `district, category, free, q`. Upcoming windows never include ended events |
| GET | `/events/:slug` | `{ event, notices, related, expired }` |
| POST | `/events/:id/interest` | Increments interest (also a trending signal) |
| GET | `/search` | `q, lat, lng, limit` → `{ interpretation[], engine:"structured", needsLocation, total, results{places,food,stays,events,dishes,districts} }` |
| GET | `/search/suggest` | `q` (≥ 2 chars) → typeahead items |
| GET | `/trending` | `type` (`places,cafes,food,events,seasonal`), `limit, district` |
| GET | `/nearby` | `lat, lng` (required), `category` (`attractions, hidden-gems, restaurants, cafes, stays, hospitals, pharmacies, police, atms, fuel, ev-charging, toilets, bus-stops, railway-stations, airports, taxi`), `radius` km (1–100), `limit` |
| GET | `/weather` | `lat, lng` → `{ available:false, reason }` unless configured |
| GET | `/transport` | `kind, district` |
| GET | `/meta` | Enumerations + feature flags (`uploads, ai, liveRouting, weather`) |
| GET | `/translations/:lang` | Admin overrides `{ common: { key: value } }` |
| GET | `/emergency` | `?district=` → `{ contacts, notices }` (contacts include `verified`, `source`) |
| GET | `/health` | Liveness |
| GET | `/sitemap.xml` | (root, not under /api) |

## Maps & routes (public)
| Method | Path | Body |
|---|---|---|
| POST | `/routes/plan` | `{ from:[lng,lat], to:[lng,lat], waypoints?:[[lng,lat]…≤8], profile?:"driving" }` → `{ provider, estimated, notice, distanceKm, durationMin, legs[], geometry, alternatives?, external{google,osm,apple} }` |
| POST | `/routes/along` | `{ line:[[lng,lat]…], categories?:[viewpoints,food,fuel,ev-charging,toilets,hospitals,attractions,tea-coffee,rest-areas], bufferKm?:5, limit?:40 }` → stops with `offRouteKm`, `fromStartKm` |

## Trips & AI
| Method | Path | Notes |
|---|---|---|
| GET | `/ai/status` | `{ configured, mode: "ai" | "demo" }` |
| POST | `/trips/generate` | Body: `start{coordinates?|district?,label?}, duration(few-hours|one-day|weekend|multi-day), days?, budget, groupType, interests[], transport, pace, withChildren, withElderly, accessibilityNeeds[], respectOpeningHours, startDate?, districts?`. Returns an unsaved itinerary with `generator: "demo"|"ai"`, `notice`, per-item `costEstimate.confidence` (`verified|estimated|unavailable`), `openingHoursStatus`, warnings, and `summary` (distance, time, known costs, unknown costs, weather alternatives, seasonal/safety notes) |
| POST | `/assistant/ask` | `{ question, context?{coordinates,district} }` → `{ mode:"preview"|"ai", answer, interpretation, sources{places[],notes[]} }` |
| GET / POST 🔒 | `/trips` | List / save a trip |
| GET / PATCH / DELETE 🔒 | `/trips/:id` | Owner only |
| POST 🔒 | `/trips/:id/share` | `{ isPublic?: true }` → `{ isPublic, shareSlug }` |
| GET | `/trips/shared/:slug` | Public trip (owner id removed) |

## Community
| Method | Path | Notes |
|---|---|---|
| GET | `/reviews?targetType=&targetId=` | Approved reviews only |
| POST 🔒 | `/reviews` | `{ targetType, targetId, rating 1–5, title?, text?, photos?[{url,alt}], visitedOn? }` → `pending`. One review per user per item (re-submitting edits it and re-queues moderation) |
| GET | `/updates?targetType=&targetId=` | Live, unexpired community updates |
| POST 🔒 | `/updates` | `{ targetType, targetId, kind(crowd|parking|road|condition), level, note? }` — expires after 24 h |
| POST | `/reports` | Guests allowed. `{ kind(incorrect-info|duplicate|closure|safety|other), message, targetType?, targetId?, targetName?, evidenceUrl?, reporterEmail? }` |

## Admin (✎ unless marked ★)
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/overview` | Totals, status breakdown, search activity, recent reports |
| GET | `/admin/analytics?days=30` | Totals by type, daily series, top & zero-result searches, most viewed |
| GET | `/admin/ai` | AI/RAG readiness stats |
| GET / PATCH | `/admin/reports[/:id]` | `{ status: open|in_review|resolved|dismissed, note? }` |
| GET / PATCH | `/admin/reviews[/:id]` | `{ status: pending|approved|rejected }` — recalculates ratings |
| GET / PATCH | `/admin/community-updates[/:id]` | Hide/approve |
| GET / PATCH ★ | `/admin/users[/:id]` | `{ role?, isActive? }` (cannot change own role/deactivate self) |

Generic content resources: `places, businesses, dishes, stays, events, transport, route-stops, districts` (no create/delete), `safety-notices`★, `emergency-contacts`★, `translations`★, `knowledge`★, `categories`.

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/:resource` | `page, limit, q, status, district, kind, type, category, lang` |
| GET | `/admin/:resource/:id` | |
| POST | `/admin/:resource` | Validated with the resource's zod schema; workflow resources start as `draft`; slug auto-generated & unique |
| PATCH | `/admin/:resource/:id` | Partial update. A non-admin editing `verified`/`published` content moves it to `needs_verification` |
| DELETE | `/admin/:resource/:id` | Workflow resources are archived; `?hard=true` deletes |
| PATCH ★ | `/admin/:resource/:id/status` | `{ status, note?, markVerified? }` — `verified` or `markVerified` records `verifiedAt/verifiedBy` |
| PATCH ★ | `/admin/:resource/:id/feature` | `{ featured?, editorialRank? }` |

Public endpoints only ever return content with status `published`, `needs_update` (shown as "may be outdated") or `temporarily_closed` (shown with a warning).
