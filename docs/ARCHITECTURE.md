# Architecture, data model & roadmap

## 1. Product summary

Keralam is a location-first travel companion for Kerala. It combines destination discovery (by district, category, mood, time, budget, season and distance), hidden gems, food, stays, events, Near Me, route planning with along-the-way stops, a database-grounded trip builder, and emergency help — for first-time tourists, residents, families, budget/solo/road travellers, international visitors and photographers. Its defining rule is **trust**: every fact is either verified (with source and date), estimated (labelled), or shown as unavailable — never invented.

## 2. MVP feature list (Phase 1 — implemented)

Project setup · React frontend · Express backend · MongoDB · responsive homepage · smart structured search (Malayalam/English spelling variants) · district browsing (14 pages) · category browsing · destination detail pages · Hidden Gems · food discovery (dishes + restaurants) · shopping/theatres/parks pages · stays discovery with external booking links · events with today/weekend/district/category filters and expiry · Near Me (16 categories) · maps & directions with along-route stops and external-maps fallback · saved places (guest + account) · English & Malayalam · admin CMS for every content type · verification/publishing workflow · emergency & help section.

Delivered early from Phase 2 because they were cheap on top of the MVP data model: AI Trip Builder (demo planner + optional Claude), user accounts & settings, custom lists, reviews with moderation, crowd/parking/road updates, community reports, accessibility fields, an estimated-cost summary, analytics dashboard, assistant preview (RAG interfaces).

## 3. Frontend architecture

```
main.jsx → App (QueryClientProvider → BrowserRouter → Toast → Auth → Saved → Location)
         → AppRoutes (lazy pages) → MainLayout (Header + NavDrawer + SearchOverlay, Footer) | AdminApp
```

- **Routing:** React Router 7; every page except Home is `lazy()` loaded; the admin CMS is its own chunk; Leaflet is a separate `maps` chunk loaded only when a map renders.
- **Server state:** TanStack Query (caching, `keepPreviousData` for filter changes, targeted invalidation). No global client store is needed.
- **Context:** `AuthContext` (session via `/auth/me`; JWT lives in an httpOnly cookie, never in JS), `SavedContext` (guest saves in localStorage → merged on sign-in), `LocationContext` (GPS only on explicit request; manual location fallback), `ToastContext`.
- **URL as state:** Explore/Food/Stays/Events filters live in the query string (`useQueryParams`) so filtered views are shareable and survive refresh and language switches.
- **Design system:** Tailwind 4 `@theme` tokens (forest green, sand off-white, laterite accent, turmeric highlight, lagoon info), `Button/Badge/Chips/Modal/Skeleton/States/Section/Pagination`, cards (`PlaceCard, BusinessCard, StayCard, EventCard, DishCard`, tiles), detail building blocks (`DetailHero, SafetyPanel, AccessibilityPanel, OpeningHours, NoticeList, ReviewsSection, CommunityUpdates, ReportButton, WeatherWidget`), `SearchBar` (ARIA combobox), `FilterPanel` (sidebar / mobile bottom sheet), `MapView`, `SceneArt` (illustrated fallback imagery).
- **i18n:** i18next with bundled `en`/`ml` resources, admin overrides fetched from `/translations/:lang`, `<html lang/dir>` kept in sync (RTL-ready). Content has parallel `*Ml` fields; `localized()` falls back to English with a visible "(English)" hint.
- **Forms:** React Hook Form + Zod on the client, authoritative zod validation on the server; server field errors are mapped back onto inputs.
- **Admin CMS:** declarative resource configs (`features/admin/resources.js`) drive a generic list + form renderer (text, tags, multi-select chips, tri-state, point, hours, images with Cloudinary upload, links, sources…), plus bespoke dashboard, moderation, reports, trending, users, analytics and AI-knowledge screens.

## 4. Backend architecture

```
server.js → connectDB → createApp()
app.js: helmet → cors(allow-list) → compression → json(1mb) → cookies → sanitize → morgan
        → /sitemap.xml → /api/v1 (rate limit) → routes → 404 → errorHandler
routes → middleware (optionalAuth / requireAuth / requireRole, validate(zod), limiters)
       → controllers (thin) → services (search, trending, geo, routing, weather, uploads, ai/*) → models
```

- **Consistent responses** (`utils/response.js`) and **centralised errors** (`middleware/error.js` maps Mongoose validation/cast/duplicate errors, hides stack traces in production).
- **Generic admin CRUD factory** (`controllers/adminCrudFactory.js`) gives every content model list/get/create/update/archive/status/feature with the same workflow rules; resources are registered in `routes/adminRoutes.js`.
- **Search:** `services/search/queryParser.js` turns free text into structured filters (category, mood, district, origin + max distance, time available, budget, family, accessibility, intent) plus residual keywords; `utils/searchKeys.js` folds transliteration variants (`zh/z→l`, aspirates, `w→v`, doubled letters…) into `searchKeys` stored on each document; `searchService` fans out to places/food/stays/events/dishes in parallel, using `$geoNear` when a reference point exists. The parser's output contract (`{filters, keywords, interpretation, engine}`) is what an AI parser would implement later.
- **Geo:** 2dsphere indexes on every located collection; `geoList()` switches between `find` and `$geoNear` (+ `$facet` for totals) so any list can be distance-sorted; along-route search = bbox `$geoWithin` + exact point-to-polyline distance in JS.
- **Trending:** weighted recent analytics (views ×1, saves ×3, event interest ×2) + search hits on names + editorial boost, cached 5 minutes, cleared on content edits.
- **AI module (`services/ai`)**: `retrievalService` (candidates + confidence-labelled facts), `itineraryBuilder` (scoring, demo planner, timing, meals, stays, opening-hour checks, costs, weather alternatives, safety/seasonal notes), `anthropicProvider` (structured-output calls; only ids come back), `tripService` and `assistantService` (orchestration + graceful fallback).

## 5. MongoDB schema

| Model | Purpose / key fields | Indexes |
|---|---|---|
| **User** | name, email, password (bcrypt, `select:false`), role, preferences.language, saved[{targetType,targetId}], recentlyViewed (30), trustedContacts, contributor{level,districts} (Phase 3), isActive | email unique, role |
| **Place** | name, nameMl, alternateNames, slug, short/description (+Ml), location (Point, approximate flag), district, locality, categories, tags, moods, images, visitDurationHours, weekendGetaway, budgetLevel, bestMonths, indoor, familyFriendly, crowdLevel, openingHours{day ranges, open24h, verified}, entryFee{amount,isFree,verified}, contact, officialLinks, facilities, accessibility{tri-states, distances, confirmed}, safety{tri-states, notes, verified, lastReviewedAt}, hiddenGem, gemDetails{access, road, parking, network, monsoon, bestTime}, searchKeys, rating, stats, featured, editorialRank, **status**, isDemo, verification{verifiedAt,by,notes}, sources[] | 2dsphere, text (weighted), searchKeys, status+district+categories, status+moods, hiddenGem, featured, slug unique |
| **District** | 14 fixed slugs, names, intro(+Ml), tagline, location, heroImage, highlights, neighbours, transport, essentials | slug unique |
| **Category** | slug, type, name(+Ml), icon, order | type+slug unique |
| **Business** | restaurants, cafés, shops, theatres, parks and essential services in one collection (`kind`), with `food{categories,cuisines,dietary,signatureDishes,lateNight}`, `theatre{languages,screens,showtimesUrl}`, `shopping{productTypes}`, priceRange, hours, contact, accessibility, claimedBy (Phase 3) | 2dsphere, status+kind+district, food.categories, text |
| **Dish** | name(+Ml), region, categories, dietary, typicalPrice{band,note,estimated}, recommendedPlaces | slug, searchKeys |
| **Stay** | type, priceBand, priceFrom + priceVerified, facilities, travellerTypes, experiences, bookingLinks, accessibility | 2dsphere, status+type+district+priceBand |
| **Event** | title(+Ml), category, organizer, venue, location, district, place ref, start/endDate, entryFee, ticketStatus/url, ageRestriction, parking, publicTransport, languages, officialSourceUrl, lastVerifiedAt, interestCount | status+endDate+startDate, 2dsphere |
| **TransportNode** | kind (bus, rail, metro, water metro, airport, taxi, auto, rentals, parking, jetty), code, location, officialUrl, scheduleUrl (no schedules stored) | 2dsphere |
| **RouteStop** | curated roadside stops (viewpoint, food, tea, rest area…) | 2dsphere |
| **SafetyNotice** | title/message (+Ml, mlReviewed), type, severity, district or target, **source required**, sourceUrl, validFrom/Until, active | active+district+validUntil, target |
| **EmergencyContact** | name, number, category, scope, district, source, sourceUrl, **verified**, verifiedAt/By | |
| **Review** | user, target, rating, title, text, photos, status (moderation) | target+status, user+target unique |
| **CommunityUpdate** | crowd/parking/road/condition updates, level, note, expiresAt (24 h) | target+expiresAt, TTL |
| **Report** | kind, target, message, evidenceUrl, reporter/email, status, resolution | status+createdAt |
| **UserList** | user, name, items[{targetType,targetId,note}], isPublic, shareSlug | user, shareSlug unique sparse |
| **Trip** + **ItineraryItem** (sub-schema) | inputs, days[{items: kind, target, times, travelFromPrevious, costEstimate{amount, confidence}, openingHoursStatus, notes, warnings}], summary, generator, isPublic, shareSlug | user, shareSlug |
| **Translation** | lang, namespace, key, value, reviewed | lang+namespace+key unique |
| **AnalyticsEvent** | type (search, view, save, unsave, route_request, trip_created, event_interest, zero_result_search), target, query, resultsCount, user, meta | type+createdAt, target, TTL 180 days |
| **KnowledgeNote** | curated RAG notes, confidence, source, approved | text |

Relationships use `{targetType, targetId}` pairs for polymorphic references (saves, lists, reviews, reports, updates) and resolve through `TARGET_MODELS`.

## 6. API plan
See [API.md](API.md). Areas: auth, account/saved/lists, places, districts, categories, businesses/food/dishes, stays, events, search, trending, nearby, weather, routes & transport, trips & assistant, reviews/updates/reports, emergency, meta/translations, uploads, admin.

## 7. Implementation order (as built)
1. Monorepo, config, constants, utilities → 2. Mongoose models & indexes → 3. zod validators → 4. auth/RBAC/sanitise/rate-limit/error middleware → 5. search parser & spelling keys → 6. geo/trending/routing/weather/upload services → 7. AI retrieval + itinerary builder + providers → 8. controllers & routes → 9. seed data & admin bootstrap → 10. API tests → 11. client design system & i18n → 12. layout, cards, search → 13. discovery pages → 14. detail pages & community components → 15. Near Me & directions → 16. trip builder/assistant → 17. saved, help, auth, account → 18. admin CMS → 19. browser verification, client tests, docs.

## 8. External services
| Service | Used for | Key needed | Status |
|---|---|---|---|
| MongoDB | Database | connection string | required |
| OpenStreetMap tiles (Leaflet) | Maps | no (configurable provider) | default on |
| OSRM | Road routing | no (self-host recommended) | optional; labelled estimate fallback |
| Open-Meteo | Weather | no | optional |
| Cloudinary | Image uploads | yes | optional; URL entry fallback |
| Anthropic Claude | Trip planning / assistant | yes (server only) | optional; demo planner fallback |
| Google Maps / OSM / Apple Maps deep links | "Open in maps" fallback | no | on |

## 9. Roadmap

**Phase 1 — MVP:** complete (see §2).

**Phase 2 — status**
- AI Trip Builder — ✅ demo planner + optional Claude planner; edit/save/share.
- Route enrichment — ✅ along-route stops; add stops & re-plan. Next: time-window-aware stop suggestions, fuel range for EVs.
- Stay discovery enhancements — ✅ filters; next: availability via partner APIs.
- User accounts, custom lists, reviews, crowd updates, community reports — ✅.
- Accessibility enhancements — ✅ tri-state fields + confirmed flag + filters; next: accessibility-first itineraries and photo evidence.
- Expense calculator — ✅ trip summary (known vs unavailable costs + transparent travel heuristic); next: per-person split and user-entered costs.
- Additional languages — 🟡 architecture ready (switcher, RTL, overrides); needs translated bundles and human review.
- Review photos — 🟡 model + API accept photo URLs and Cloudinary upload exists; UI photo picker for reviews is next.

**Phase 3 — prepared for**
- Offline trip packs (service worker + cached trip JSON/tiles), local contributor programme (`User.contributor`), live event & transport integrations (`officialSourceUrl`, `scheduleUrl`, ingestion jobs), business claims (`Business.claimedBy`), partner bookings (`Stay.bookingLinks` → partner API), advanced AI assistant (RAG interfaces + `KnowledgeNote`; add embeddings/vector search), mobile app (the REST API accepts Bearer tokens), personalisation (`AnalyticsEvent` + `preferences`), SSR/prerendering for SEO.

## 10. Important decisions
- **Single `Business` collection** instead of separate Restaurant/Shop/Service collections: one geo index serves Near Me and along-route queries; kind-specific fields live in sub-documents. "Restaurant" = a Business with a food kind.
- **Structured search first.** A deterministic parser is testable, fast and honest; the UI labels it "Smart structured search — AI search is not enabled".
- **AI can only choose ids.** The model never writes facts; unknown ids are dropped; failures fall back to the demo planner.
- **Unknown is a first-class value.** Tri-state enums with `unknown` default; `verified` flags on hours, fees, safety, prices; UI renders unknown in muted italics.
- **Status gates visibility.** Only `published`, `needs_update`, `temporarily_closed` are public; editors' changes to published content go back to verification.
- **httpOnly cookie auth** keeps tokens away from JS (XSS); SameSite=Lax mitigates CSRF for state-changing requests; Bearer is supported for tests and future mobile apps.
