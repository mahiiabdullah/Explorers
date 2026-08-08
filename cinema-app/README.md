# Cinema Booking Platform — Frontend

The user-facing web app for the cinema seat-booking platform. Real-time seat selection, hold with auto-release, payment, and booking confirmation.

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your backend URL

# 3. Run
npm run dev
# → http://localhost:3000
```

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI Primitives | shadcn/ui (Button, Card, Dialog, Input, Tabs, Skeleton) |
| Animations | Aceternity UI + Magic UI + Framer Motion |
| State | Zustand |
| Real-time | Socket.io client |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Playwright |

---

## What's Built

✅ **Pages** (all 7 + 404)
- `/` — landing with hero, marquee, bento grid, animated stats
- `/movies` — filterable movie list
- `/movies/[id]` — detail + date picker + showtime picker
- `/showtimes/[id]/seat-map` — ⭐ real-time seat map (centerpiece)
- `/booking/[id]/pay` — payment form
- `/booking/[id]/confirmed` — celebration + confetti
- `/bookings` — upcoming + past bookings
- `/login`, `/signup` — auth

✅ **Components**
- `SeatMap`, `Seat`, `Screen` (glowing arc), `Legend`, `HoldTimer`, `SelectionSummary`
- `MovieCard`, `MovieGrid`, `MovieFilters`, `DatePicker`, `ShowtimePicker`
- `BookingSummary`, `PaymentForm`
- `Navbar`, `Footer`, `ThemeProvider`, `Toaster`
- Aceternity: `BackgroundGradient`, `CardSpotlight`, `MovingBorder`, `TextGenerateEffect`
- Magic UI: `Marquee`, `AnimatedNumber`, `ShimmerButton`, `BentoGrid`, `Confetti`

✅ **State**
- Zustand store for seat map (`src/stores/seat-map-store.ts`)
- Socket.io singleton (`src/lib/socket.ts`)
- API client (`src/lib/api.ts`)

✅ **Hooks**
- `useSeatMap(showtimeId)` — loads seats, joins Socket.io room, handles real-time updates
- `useHoldTimer(heldUntil)` — 10-min countdown with color shifts

✅ **Tests**
- Vitest unit tests (`tests/`)
- Playwright e2e tests (`e2e/`)

---

## Mock Data

Until the backend is integrated, the app runs with mocked data:
- 10 movies
- 5 showtimes
- 150 seats per showtime (random available/held/booked)

The mock data is clearly marked in components — search for `MOCK_` to find and replace with real API calls when backend is ready.

---

## Folder Map

```
src/
├── app/            # routes (App Router)
├── components/     # UI components
│   ├── ui/         # shadcn primitives
│   ├── aceternity/ # animation components
│   ├── magicui/    # animation components
│   ├── seat-map/   # ⭐ centerpiece
│   ├── movies/
│   ├── booking/
│   ├── layout/
│   └── shared/
├── hooks/          # custom React hooks
├── lib/            # api, socket, utils, types, constants
├── stores/         # Zustand stores
└── styles/         # film grain, animations
```

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run format` | Prettier |
| `npm run test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch |
| `npm run e2e` | Playwright e2e |
| `npm run e2e:ui` | Playwright with UI |

---

## Connecting to Backend

The frontend is wired to talk to a backend at `NEXT_PUBLIC_API_URL`. Endpoints and WebSocket events are documented in `README.backend.md` (shared with backend teammate).

**Currently mocked**: replace `MOCK_*` constants in each page with `api.get(...)` calls and SWR for data fetching.

**To integrate:**
1. Update `.env.local` with backend URL
2. Find/replace `MOCK_` data with API calls
3. Wire `useSeatMap` to real WebSocket (already done — just uncomment the connection)
4. Replace `api.post('/api/bookings/hold', ...)` mock with real endpoint
5. Add payment redirect to real gateway URL

---

## Design System

Tokens defined in `tailwind.config.ts` and `src/app/globals.css`:

| Token | Value | Use |
|---|---|---|
| `cinema-bg` | `#0A0A0A` | Page background |
| `cinema-surface` | `#171717` | Cards |
| `cinema-amber` | `#F5A524` | Primary accent |
| `cinema-crimson` | `#DC2626` | Booked / danger |
| `cinema-gold` | `#EAB308` | Premium seats |
| `cinema-success` | `#22C55E` | Confirmed |

**Fonts**: Bebas Neue (display) + Inter (body), loaded via `next/font`.

---

## What's Left to Do

- [ ] Replace all mock data with real API calls
- [ ] Add authentication context (currently mocked `isLoggedIn` in Navbar)
- [ ] Wire payment to real gateway (currently stubbed)
- [ ] Add ticket download with QR code (library already installed: `qrcode`)
- [ ] Add "Add to Calendar" (.ics generation)
- [ ] Final UI polish: keyboard nav on seat map, ARIA labels, Lighthouse 90+
- [ ] Real responsive testing (360 / 768 / 1280)
- [ ] Loading skeletons for all data fetches
- [ ] Error boundaries around critical components

---

## See Also

- `README.frontend.md` — detailed frontend docs (share with backend teammate)
- `README.backend.md` — backend contract + API spec (share with backend teammate)
