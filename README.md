# Keralam — Kerala Travel & Local Discovery Platform

> **Kerala, Discovered Your Way.**

A location-first MERN travel companion for Kerala: destination discovery across all 14 districts, hidden gems, food, stays, events, Near Me, maps & route planning, a database-grounded AI Trip Builder, emergency help, English + Malayalam, user accounts, community features, and a role-based admin CMS with a verification workflow.

The app is built so that **nothing unverified is presented as verified**: every record carries a content status and verification metadata, unknown facts (opening hours, fees, safety, accessibility) are stored and displayed as *unknown*, and sample records are flagged as demo content in the UI.

- Architecture, data model, roadmap and design decisions → [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- REST API reference → [`docs/API.md`](docs/API.md)

---

## Features (MVP — implemented)

| Area | What works |
|---|---|
| **Home** | Hero with smart search + suggestions, Explore / Near Me / Build-my-trip actions, trending (places, cafés, events, in-season), hidden gems, categories, 14 districts, weekend getaways, Kerala food, events this week, stays, explore by mood and by time, tourist-help banner |
| **Explore** | Filters by district, category, mood, time available, budget, season, hidden gems, family, wheelchair access, low crowds, rainy-day; sort by popularity/rating/name/newest/distance; list ⇄ map view; URL-backed (shareable) filters; pagination |
| **Destination pages** | Description, plan-your-visit (duration, fee, best months, hours), safety panel with tri-state facts + official notices (source + last updated), accessibility panel (confirmed vs unknown), hidden-gem access details, weather (when configured), map, directions, save/share, community updates, reviews, report incorrect info, nearby places/food/stays, schema.org JSON-LD |
| **Districts** | 14 district pages from one template: intro, popular attractions, hidden gems, local dishes, restaurants, upcoming events, stays, transport hubs, essential services, neighbouring districts, district map |
| **Hidden Gems** | Dedicated explorer with access difficulty, road condition, parking, mobile network, monsoon suitability, night access — all supporting "unknown" |
| **Trending** | Score from recent views, saves, searches, event interest and editorial boost (featured + editorial rank) — no social-media inputs; admin-managed |
| **Food** | Dishes (region, dietary, typical price band marked as estimate, where to try) and restaurant/café listings with 13 food categories, price and district filters |
| **Shopping / Theatres / Parks & activities** | Data-driven section pages; theatre pages link to official showtimes when available and say clearly when live showtimes are unavailable |
| **Stays** | Hotels, resorts, homestays, hostels, villas, tree houses, camping, houseboats…; filters for price, facilities, traveller type, experience, accessibility; external booking links only (no payments) |
| **Events** | Today / this weekend / this week / this month / upcoming / past; district, category, free filters; expired events excluded from upcoming; "I'm interested" counter; official source + last-verified timestamp |
| **Near Me** | GPS on request only, or manual location (district / place search); 16 categories incl. hospitals, pharmacies, police, ATMs, fuel, EV, toilets, bus, rail, airports, taxi; radius; map; Google Maps fallback search |
| **Smart search** | Rule-based natural-language parsing ("peaceful beach near Kozhikode", "places under 100 km from Malappuram", "cheap food near me", "what can I do for four hours?"), Malayalam/English spelling-variant folding (Kozhikode/Kozikode/Calicut/കോഴിക്കോട്), typeahead suggestions, zero-result logging |
| **Directions** | Start/destination (search or GPS), route distance & time (OSRM when configured, clearly labelled straight-line estimate otherwise — no fabricated traffic), along-the-way stops (viewpoints, food, tea, fuel, EV, toilets, hospitals, attractions, rest areas), add stops and re-plan, open in Google Maps / OpenStreetMap |
| **AI Trip Builder** | All inputs from the brief; itinerary with day timeline, route order, meals, stays, travel distance/time, known costs vs unavailable costs, opening-hour conflicts, rainy-day alternatives, seasonal & safety notes; edit (reorder/remove), save, share. Works **without an AI key** (labelled demo planner). With `ANTHROPIC_API_KEY`, Claude only selects and orders database records by id — facts always come from the DB |
| **Travel assistant (preview)** | RAG-ready service: retrieval from the DB with verified/estimated/unavailable labels; AI phrasing only when configured |
| **Help & emergency** | One-tap emergency call, admin-managed helpline numbers with verification badges and sources, nearby hospitals/pharmacies/police, share-my-location (native share / WhatsApp / SMS / trusted contacts), active advisories, safety tips; SOS button always visible on mobile |
| **Accounts** | Register, login, logout (httpOnly JWT cookie), profile & settings, language preference, trusted contacts, change password; guest browsing with device-local saves that sync on sign-in |
| **Saved** | Saved places/listings/stays/events/dishes, custom lists (public share links), saved trips, recently viewed |
| **Community** | Reviews (moderated), live crowd/parking/road/condition updates (labelled unverified, auto-expire in 24 h), reports (incorrect info, duplicate, closure, safety) |
| **Languages** | English + Malayalam across the UI and content fields; switch without losing page/trip state; architecture ready for hi/ta/kn/ar(RTL)/fr/de/ru; admin translation overrides; Malayalam safety text only shown when marked human-reviewed |
| **Admin CMS** | Overview (live counts), places, food & businesses, dishes, stays, events, districts, transport hubs, route stops, trending, reports, community moderation, safety notices, emergency contacts, languages, AI knowledge, analytics, users. Workflow: Draft → Needs Verification → Verified → Published / Needs Update / Temporarily Closed / Archived. Editors create/edit; **only admins** verify, publish, feature, manage users, emergency info, translations and AI knowledge |
| **Security** | bcrypt password hashing, JWT (httpOnly SameSite cookie or Bearer), RBAC, zod validation on every write, Mongo operator sanitising, Helmet headers, CORS allow-list, rate limits (global/auth/writes), 1 MB body limit, safe error messages, secrets only on the server |
| **SEO & a11y** | Per-page titles/descriptions/OG/canonical, JSON-LD (TouristAttraction, Event, Restaurant, LodgingBusiness), `/sitemap.xml`, robots.txt, semantic landmarks, skip link, labelled forms, keyboard-operable combobox/dialogs/chips, focus styles, reduced-motion support, alt text |
| **Performance** | Route-level code splitting, Leaflet in its own lazily loaded chunk, lazy images, React Query caching, geospatial + compound indexes, paginated APIs, projection of card fields, in-memory trending/weather caches, gzip compression |

---

## Technology stack

**Client:** React 19, Vite, React Router 7, Tailwind CSS 4, TanStack Query 5, Axios, React Hook Form + Zod, i18next, Leaflet/React-Leaflet (OpenStreetMap), Lucide icons.
**Server:** Node.js ≥ 20.12, Express 5, MongoDB + Mongoose 9, JWT, bcryptjs, zod, Helmet, express-rate-limit, Multer + Cloudinary (optional), Anthropic SDK (optional).
**Tests:** Vitest, Supertest, mongodb-memory-server, Testing Library.

Dependency notes:
- **Express 5** handles rejected promises in async handlers natively, so no `asyncHandler` wrapper is needed.
- **bcryptjs** implements the same bcrypt algorithm in pure JS — no native build step on Windows/Alpine/CI.
- **No dotenv:** Node ≥ 20.12 loads `.env` natively (`process.loadEnvFile`).
- **express-mongo-sanitize** is incompatible with Express 5's read-only `req.query`, so a small equivalent lives in `server/src/middleware/sanitize.js`.
- **OpenStreetMap + Leaflet** need no API key; tile URL is configurable for a commercial provider.

---

## Project structure

```
.
├── package.json              # npm workspaces: server, client
├── docs/                     # ARCHITECTURE.md, API.md
├── server/
│   ├── .env.example
│   ├── src/
│   │   ├── app.js            # Express app (middleware, routes, errors)
│   │   ├── server.js         # DB connect + listen + graceful shutdown
│   │   ├── config/           # env, db, constants (enums shared across layers)
│   │   ├── models/           # 17 Mongoose models
│   │   ├── validators/       # zod schemas for every write
│   │   ├── middleware/       # auth/RBAC, validation, sanitising, rate limits, errors
│   │   ├── controllers/      # request handlers (+ generic admin CRUD factory)
│   │   ├── routes/           # /auth, /admin, public & user routes
│   │   ├── services/         # search, trending, geo, routing, weather, uploads, ai/*
│   │   ├── utils/            # ApiError, responses, geo math, slugs, spelling keys
│   │   └── seeds/            # seed.js, createAdmin.js, data/*
│   └── tests/                # Vitest + Supertest suites
└── client/
    ├── .env.example
    └── src/
        ├── components/       # ui/, cards/, layout/, detail/, map/, SearchBar, …
        ├── pages/            # route pages (lazy loaded)
        ├── features/         # admin/ (CMS), trips/ (itinerary, assistant)
        ├── layouts/  routes/  context/  hooks/  services/  utils/
        ├── i18n/             # i18next setup + en.json, ml.json
        ├── styles/           # Tailwind 4 theme tokens
        └── test/
```

---

## Getting started

### Prerequisites
- Node.js **20.12+** (22 LTS recommended) and npm 10+
- MongoDB 6+ — local install, Docker, or MongoDB Atlas

### 1. Install
```bash
git clone <repo> && cd Keralam
npm install            # installs server + client workspaces
```

### 2. MongoDB
Any of:
```bash
# Docker
docker run -d --name kerala-mongo -p 27017:27017 mongo:7
# or a local mongod, or an Atlas connection string in MONGODB_URI
```

### 3. Environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env      # optional in development
```
Edit `server/.env` — at minimum set `JWT_SECRET` (e.g. `openssl rand -hex 48`) and the admin credentials. See [Environment variables](#environment-variables).

### 4. Seed data & admin account
```bash
npm run seed            # 14 districts, 65 destinations, 16 dishes, demo listings/stays/events, transport hubs, emergency contacts (unverified)
npm run create-admin    # creates/promotes ADMIN_EMAIL with role "admin"
```
`npm run seed` **clears all content collections** (not users) before inserting.

### 5. Run
```bash
npm run dev             # API on http://localhost:5000, web on http://localhost:5173
```
Vite proxies `/api` to the server in development, so the auth cookie is same-origin. Sign in at `/login` with the admin account and open `/admin`.

### Development commands
| Command | What it does |
|---|---|
| `npm run dev` | Server (`node --watch`) + Vite dev server |
| `npm run seed` / `npm run create-admin` | Seed data / bootstrap admin |
| `npm test` | Server + client test suites |
| `npm run build` | Production build of the client (`client/dist`) |
| `npm start` | Production server (also serves `client/dist` if built) |
| `npm run lint` | ESLint (client) |
| `npm run test:watch -w server` | Server tests in watch mode |

---

## About the seed data

- **Destinations** are real, well-known places, but every record is **unverified**: coordinates are approximate (`location.approximate: true`), descriptions are general editorial text, and opening hours, fees, safety and accessibility are left **unknown** unless genuinely generic (e.g. public beaches marked "free — not yet verified"). Two places are deliberately left in *Draft* / *Needs verification* to demonstrate the workflow.
- **Restaurants, cafés, shops, theatres, parks, essential services, stays, events and route stops are fictional** ("Sample … — District") and flagged `isDemo: true`, which the UI shows as a *Demo content* badge. Sample service pins carry no phone numbers.
- **Emergency numbers** are widely published national numbers stored with `verified: false`. An admin must confirm each against the official source and tick *verified* (Admin → Emergency contacts); until then the UI shows *Pending verification*.
- **District intros** are marked demo/unverified text.
- No photos are bundled; listings without images render illustrated scene art. Add images in the CMS by URL or via Cloudinary upload.

Replace demo content with verified records before any public launch.

---

## Environment variables

### Server (`server/.env`)
| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NODE_ENV` | | `development` | `production` enables secure cookies, CSP, static client serving |
| `PORT` | | `5000` | API port |
| `MONGODB_URI` | prod | `mongodb://127.0.0.1:27017/kerala_travel` | MongoDB connection string |
| `JWT_SECRET` | **prod** | dev-only fallback | ≥ 32 random chars in production (startup fails otherwise) |
| `JWT_EXPIRES_IN` | | `7d` | Token lifetime |
| `CLIENT_URL` | | `http://localhost:5173` | Comma-separated CORS allow-list; first entry used in sitemap |
| `RATE_LIMIT_MAX` | | `600` | Requests / 15 min / IP for the API |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | for `create-admin` | | Admin bootstrap (password ≥ 10 chars) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | optional | | Enables image uploads |
| `ROUTING_PROVIDER` | optional | `estimate` | `osrm` for road routing, `estimate` for labelled straight-line estimates |
| `OSRM_URL` | optional | public demo server | Self-host OSRM for production (the demo server has a strict fair-use policy) |
| `WEATHER_PROVIDER` | optional | `none` | `open-meteo` (free, no key) |
| `OPEN_METEO_URL` | optional | Open-Meteo forecast API | |
| `AI_PROVIDER` | optional | *(empty)* | `anthropic` to enable AI planning/assistant |
| `ANTHROPIC_API_KEY` | optional | | Server-side only |
| `ANTHROPIC_MODEL` | optional | `claude-opus-5` | Model id |

### Client (`client/.env`)
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API origin when not same-origin (leave empty with the dev proxy or when the server serves the client) |
| `VITE_SITE_URL` | Canonical/OG base URL |
| `VITE_MAP_TILE_URL`, `VITE_MAP_ATTRIBUTION` | Map tile provider (respect the OSM tile usage policy in production) |

Only `VITE_*` values reach the browser — never put secrets there.

---

## Optional integrations

| Integration | Without it | To enable |
|---|---|---|
| **Cloudinary** | Upload buttons are disabled with an explanation; admins paste image URLs | Set the three `CLOUDINARY_*` variables |
| **OSRM routing** | Routes are straight-line × 1.35 estimates at 35 km/h, labelled *Estimate* | `ROUTING_PROVIDER=osrm` (+ `OSRM_URL`). Falls back to the estimate with a notice if OSRM fails |
| **Open-Meteo weather** | Weather panels are hidden | `WEATHER_PROVIDER=open-meteo` |
| **Anthropic (Claude)** | Trip Builder uses the rule-based **demo planner** from real DB records; assistant runs in retrieval "preview" mode | `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY=…`. The model receives only DB candidates with confidence-labelled facts, returns ids via structured output, and ids not in the candidate set are discarded. On any error or refusal the demo planner is used |

These integrations were implemented against their documented APIs but could not be exercised end-to-end from the development sandbox (outbound access was restricted), so verify them in your environment before relying on them.

---

## Testing

```bash
npm test                          # everything
npm run test -w server            # API tests (Vitest + Supertest)
npm run test -w client            # client unit/component tests
```
Server tests start an in-memory MongoDB via **mongodb-memory-server** (downloads a `mongod` binary on first run). Alternatives:
- `MONGOMS_SYSTEM_BINARY=/path/to/mongod npm test` — reuse a local binary
- `MONGODB_URI_TEST=mongodb://127.0.0.1:27017 npm test` — use a running server (each suite uses and drops its own database)

Covered: registration, login, cookie/Bearer auth, protected routes, admin authorisation & RBAC (editor vs admin), destination creation/validation/editing/archiving, verification & publishing workflow, destination search incl. spelling variants and structured queries, district filtering, nearby search, saving/unsaving and guest-save sync, recently viewed, trip generation (DB-grounded), saving & sharing trips, routing & along-route stops, event filtering (today/weekend/past/expired), reviews moderation, reports, the query parser; client: translation key parity, utilities, redirect safety, guest saving.

---

## Deployment

**Single service (simplest):** build the client and let Express serve it.
```bash
npm ci && npm run build
NODE_ENV=production MONGODB_URI=… JWT_SECRET=… CLIENT_URL=https://your.domain npm start
```
In production the server serves `client/dist` with SPA fallback, enables a CSP, `secure` cookies and `trust proxy` (run behind HTTPS).

**Split hosting:** deploy `client/dist` to a static host/CDN and the API to a Node host. Set `VITE_API_URL` at client build time and `CLIENT_URL` on the server. For cross-site deployments the auth cookie's `SameSite=Lax` must become `None` (with `secure`) — or, preferably, serve the API from a subdomain of the same site.

Also: create MongoDB Atlas indexes automatically on first boot (Mongoose `autoIndex`), set up backups, run `npm run create-admin` once, rotate the seeded admin password, and verify/replace all demo content.

**SEO note:** the client is an SPA; metadata and JSON-LD are rendered client-side and `/sitemap.xml` is served by the API. For best crawlability add prerendering/SSR (Phase 3).

---

## Admin guide (short)

1. Sign in as admin → **/admin**.
2. **Places → New destination**: fill basics, coordinates, categories, hours (per day `09:00-17:00`, `closed`, or blank = unknown), fees, safety/accessibility (leave *unknown* unless confirmed), sources. New items start as **Draft**.
3. In the right-hand **Verification & publishing** panel, admins set the status or click **Verify & publish** (records `verifiedAt`/`verifiedBy`). Editor edits to published content automatically return it to *Needs verification*.
4. **Trending**: feature items and set editorial rank. **Reports / Community moderation**: resolve reports, approve reviews, hide community updates.
5. **Emergency contacts**: only tick *verified* after confirming the number with the cited official source.
6. **Languages**: override any UI string per language (`home.heroTitle` style keys). **AI knowledge**: curate approved notes for retrieval.
