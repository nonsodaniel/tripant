# Tripant — Smart Travel Guide

A production-grade travel assistant that helps you discover places, plan trips, and explore cities — all powered by open data, with no API keys required.

**Live:** [tripant.vercel.app](https://tripant.vercel.app) &nbsp;|&nbsp; **GitHub:** [github.com/nonsodaniel/tripant](https://github.com/nonsodaniel/tripant)

---

## Features

**Location-Based Discovery**
Detect your position and instantly surface nearby restaurants, attractions, parks, museums, landmarks, nightlife, hidden gems, and more — ranked by distance and relevance.

**Interactive Map Explorer**
Leaflet-powered map with category filtering, marker clustering, radius visualization, and a desktop split-view (map + results panel). Tap any marker to open the place card.

**Trip Planner**
Search any destination, create a trip, and build a day-by-day itinerary. Reorder places within each day, add notes, and share your plan via a copyable link.

**Place Detail Pages**
Every place includes photos (via Wikipedia), description, address, opening hours, ratings, OSM-enriched tags (cuisine, wheelchair access, WiFi, entry fee, outdoor seating), distance from you, an inline map, and nearby suggestions.

**City Guides**
Any searchable city gets a mini guide: top attractions, food, museums, parks, landmarks, and hidden gems — all sourced from OpenStreetMap.

**Events Discovery**
Browse local events and venues near you, sourced from Overpass.

**Saved Places & Lists**
Bookmark places into custom lists ("Food Spots", "Hidden Gems", etc.) and access them any time, even offline.

**Activity History**
Tracks viewed places, searches, saves, and trips to surface personalized recommendations.

**Offline Support (PWA)**
Installable app with a service worker that caches map tiles and static assets. Previously saved places and trips are accessible without a connection.

**Location Changer**
Switch your location any time — search a city by name, pick from popular destinations, or use your GPS. Useful for planning trips to unfamiliar places.

**Dark Mode**
Full light/dark theme support with zero flash on load.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS 3 |
| Maps | Leaflet + react-leaflet + leaflet.markercluster |
| State | Zustand 5 (persisted to localStorage) |
| Data Fetching | SWR |
| POI Data | [Overpass API](https://overpass-api.de) (OpenStreetMap) |
| Geocoding | [Nominatim](https://nominatim.openstreetmap.org) |
| Weather | [Open-Meteo](https://open-meteo.com) |
| Photos | Wikipedia API |
| Icons | Lucide React |
| Testing | Jest + Testing Library |
| Deployment | Vercel |

All external APIs are **free and require no authentication keys.**

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/nonsodaniel/tripant.git
cd tripant
npm install --legacy-peer-deps
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build          # Production build (cleans .next first)
npm start              # Run production server
npm run dev:webpack    # Dev server without Turbopack
npm run lint           # ESLint
npm run test           # Jest test suite
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run clean          # Remove .next directory
```

> **Note:** `--legacy-peer-deps` is required due to a peer dependency conflict between react-leaflet and React 19. A `.npmrc` file is included so Vercel and CI environments handle this automatically.

---

## Project Structure

```
src/
├── app/
│   ├── explore/          # Home — location discovery
│   ├── map/              # Interactive map explorer
│   ├── place/[id]/       # Place detail page
│   ├── trips/            # Trip list, new trip, trip detail
│   ├── search/           # Global search
│   ├── saved/            # Saved places & lists
│   ├── history/          # Activity history
│   ├── city/[name]/      # City guide
│   ├── events/           # Local events
│   └── api/              # API routes (places, search, weather, photos, events)
├── components/
│   ├── layout/           # AppShell, TopBar, BottomNav
│   ├── ui/               # Button, Card, Badge, SearchBar, Skeleton, etc.
│   ├── places/           # PlaceCard, PlaceGrid, NearbySection, CategoryFilter
│   ├── explore/          # HeroSearch, CategoryGrid
│   ├── map/              # MapView, MapViewInner
│   └── trips/            # TripCard, DayPlan, AddToTripModal
├── lib/
│   ├── api/              # Overpass + Nominatim integration
│   ├── hooks/            # useGeolocation, useNearbyPlaces, useSearch, useTheme
│   ├── store/            # Zustand stores (trips, saved, location)
│   └── utils/            # Haversine distance, formatters, storage
└── types/
    ├── place.ts
    └── trip.ts

public/
├── sw.js                 # Service worker
├── manifest.json         # PWA manifest
├── icons/                # App icons
└── leaflet/              # Leaflet CSS (served statically)
```

---

## API Routes

| Route | Description |
|-------|-------------|
| `GET /api/places` | Nearby places by `lat`, `lon`, `radius`, `category` (Overpass) |
| `GET /api/places/[id]` | Single place by OSM or Nominatim ID |
| `GET /api/search` | Search by query string or category+location |
| `GET /api/weather` | Current weather by `lat`, `lon` (Open-Meteo) |
| `GET /api/photos` | Place photo by name (Wikipedia API) |
| `GET /api/events` | Local events near `lat`, `lon` (Overpass) |

All routes include `Cache-Control` headers — `s-maxage=300` for places, up to `s-maxage=86400` for photos. The service worker does **not** cache API responses; HTTP-layer caching handles it.

---

## Data Sources

Tripant is built entirely on open, freely-available data:

- **[OpenStreetMap](https://www.openstreetmap.org)** — All place, POI, and map data via the Overpass API
- **[Nominatim](https://nominatim.openstreetmap.org)** — Geocoding and reverse geocoding
- **[Open-Meteo](https://open-meteo.com)** — Weather forecasts
- **[Wikipedia](https://www.wikipedia.org)** — Place photos

Map tiles are served by OpenStreetMap and are cached by the service worker for offline use.

---

## PWA & Offline

Tripant is a fully installable Progressive Web App:

- Add to home screen on iOS and Android
- Offline map tile browsing (previously viewed areas)
- Saved places and trips accessible without a connection
- Service worker versioned per deploy — stale caches are purged on activation

---

## Design Principles

- **No gradients, no glow, no glassmorphism.** Clean neutral surfaces only.
- **Mobile-first.** Bottom navigation, large tap targets, gesture-friendly layouts.
- **Desktop split-view.** Map panel + results panel, sidebar trip editor.
- **Subtle animations.** 150–200ms transitions, no excessive motion.
- **Inspiration:** Apple Maps, Airbnb, Notion, Stripe Dashboard.

---

## License

MIT

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.
