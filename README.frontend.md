# Cinema Booking Platform — Frontend README

> The user-facing web app for browsing movies, picking seats in real-time, and completing bookings.

---

## What This Part Does

This is the **frontend** of a cinema seat-booking platform. It handles everything the user sees and interacts with:

- Browse movies, showtimes, and theatres
- View a **real-time interactive seat map**
- Hold a seat (starts a 10-min countdown)
- Complete payment via the provided payment gateway
- View booking history and tickets
- **No admin portal** — database is pre-populated

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 14 (App Router)** |
| Language | **TypeScript (strict mode)** |
| Styling | **Tailwind CSS** |
| Components | **shadcn/ui** (base) + **Aceternity UI** + **Magic UI** (animations) |
| Animations | **Framer Motion** |
| State | **Zustand** (client state for seat map) |
| Real-time | **Socket.io client** (connects to backend) |
| Forms | **React Hook Form + Zod** |
| Icons | **Lucide React** |
| Fonts | **Bebas Neue** (display), **Inter** (body) via `next/font` |
| Testing | **Vitest** (unit), **Playwright** (e2e) |

---

## Folder Structure

```
frontend/
├── public/
│   ├── posters/              # movie poster images
│   ├── icons/                # favicon, og images
│   └── textures/
│       └── film-grain.png    # hero overlay texture
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # root layout, fonts, providers
│   │   ├── page.tsx          # landing page
│   │   ├── globals.css       # tailwind + custom CSS
│   │   ├── loading.tsx       # global loading UI
│   │   ├── error.tsx         # global error UI
│   │   ├── not-found.tsx     # 404 page
│   │   │
│   │   ├── (auth)/           # auth route group (no layout chrome)
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── movies/
│   │   │   ├── page.tsx                # list + filters
│   │   │   └── [id]/page.tsx           # detail + showtime picker
│   │   │
│   │   ├── showtimes/
│   │   │   └── [id]/
│   │   │       └── seat-map/
│   │   │           └── page.tsx        # ⭐ THE CENTERPIECE
│   │   │
│   │   ├── booking/
│   │   │   └── [id]/
│   │   │       ├── pay/page.tsx        # payment page
│   │   │       └── confirmed/page.tsx  # confirmation + confetti
│   │   │
│   │   └── bookings/page.tsx           # user booking history
│   │
│   ├── components/
│   │   ├── ui/              # shadcn primitives (button, card, dialog, etc.)
│   │   │
│   │   ├── aceternity/      # Aceternity UI components (copied source)
│   │   │   ├── background-gradient.tsx
│   │   │   ├── card-spotlight.tsx
│   │   │   ├── moving-border.tsx
│   │   │   └── text-generate-effect.tsx
│   │   │
│   │   ├── magicui/         # Magic UI components (copied source)
│   │   │   ├── marquee.tsx
│   │   │   ├── animated-number.tsx
│   │   │   ├── shimmer-button.tsx
│   │   │   ├── bento-grid.tsx
│   │   │   └── confetti.tsx
│   │   │
│   │   ├── seat-map/        # ⭐ the visual centerpiece
│   │   │   ├── SeatMap.tsx           # orchestrator + WebSocket
│   │   │   ├── Seat.tsx              # single seat (4 states + animations)
│   │   │   ├── Screen.tsx            # glowing curved arc
│   │   │   ├── Legend.tsx            # color legend
│   │   │   ├── HoldTimer.tsx         # 10-min countdown
│   │   │   └── SelectionSummary.tsx  # selected seats + price
│   │   │
│   │   ├── movies/
│   │   │   ├── MovieCard.tsx
│   │   │   ├── MovieGrid.tsx
│   │   │   ├── MovieFilters.tsx
│   │   │   ├── ShowtimePicker.tsx
│   │   │   └── DatePicker.tsx
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingSummary.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── PaymentMethods.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ThemeProvider.tsx     # dark mode toggle
│   │   │
│   │   └── shared/
│   │       ├── LoadingSkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── Toast.tsx
│   │
│   ├── hooks/
│   │   ├── useSeatMap.ts        # real-time seat state + WebSocket
│   │   ├── useHoldTimer.ts      # 10-min countdown logic
│   │   ├── useBooking.ts        # hold / confirm / cancel actions
│   │   ├── useMovies.ts         # SWR for movie data
│   │   └── useAuth.ts           # session helpers
│   │
│   ├── lib/
│   │   ├── utils.ts             # cn() helper, formatters
│   │   ├── socket.ts            # socket.io client singleton
│   │   ├── api.ts               # fetch wrapper with auth
│   │   ├── constants.ts         # colors, timings, seat states
│   │   └── types.ts             # shared types from backend
│   │
│   ├── stores/
│   │   └── seat-map-store.ts    # Zustand store for seat selections
│   │
│   └── styles/
│       ├── film-grain.css       # texture overlay
│       └── animations.css       # custom keyframes
│
├── tests/
│   ├── components/
│   │   ├── SeatMap.test.tsx
│   │   ├── HoldTimer.test.tsx
│   │   └── MovieCard.test.tsx
│   └── utils.test.ts
│
├── e2e/
│   ├── booking-flow.spec.ts     # full e2e: browse → seat → pay → confirm
│   ├── auth.spec.ts
│   └── seat-map-realtime.spec.ts # opens 2 tabs, verifies sync
│
├── .env.example
├── .env.local                   # gitignored
├── .eslintrc.json
├── .prettierrc
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── components.json              # shadcn config
├── playwright.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill values
cp .env.example .env.local

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

### Required `.env.local` variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000          # backend base URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000       # backend WebSocket URL
NEXT_PUBLIC_PAYMENT_GATEWAY_PUBLIC_KEY=pk_test_xxx # from payment gateway doc
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier format |
| `npm run test` | Vitest unit tests |
| `npm run test:watch` | Vitest watch mode |
| `npm run e2e` | Playwright e2e tests |
| `npm run e2e:ui` | Playwright with UI |

---

## Pages & Responsibilities

### `/` — Landing
- Hero with animated gradient + tagline
- "Now Showing" marquee
- Featured movies in BentoGrid
- Animated stats (tickets sold, screens, rating)
- Footer

### `/movies` — Movie list
- Filter pills (genre, date)
- Responsive grid of `MovieCard` with hover spotlight
- Skeleton loaders

### `/movies/[id]` — Detail + showtime picker
- Poster, title, rating, synopsis, trailer
- Horizontal date picker
- Theatre + showtime buttons grouped by venue

### `/showtimes/[id]/seat-map` — ⭐ THE CENTERPIECE
- Glowing curved screen at top
- Seat grid (rows A–J, cols 1–15)
- 4 seat states: available / held-by-others / booked / yours
- Real-time updates via Socket.io
- HoldTimer (10:00 → 00:00 with color shifts)
- SelectionSummary (seats + subtotal)
- "Continue to Payment" CTA

### `/booking/[id]/pay` — Payment
- Booking summary
- Payment method tabs (UPI / Card / Wallet — adapt to gateway)
- Shimmer "Pay ₹X" button
- Redirect to payment gateway

### `/booking/[id]/confirmed` — Confirmation
- Animated checkmark + confetti
- Booking details
- "Add to calendar" + "Download ticket" actions

### `/bookings` — History
- Upcoming / Past tabs
- Status badges (CONFIRMED, COMPLETED, EXPIRED)

---

## API Contract (consumed from backend)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/movies` | GET | List movies with filters |
| `/api/movies/:id` | GET | Movie detail + showtimes |
| `/api/showtimes/:id/seats` | GET | Current seat map state |
| `/api/bookings/hold` | POST | Create a hold `{ showtimeId, seatIds[] }` |
| `/api/bookings/:id/confirm` | POST | Confirm after payment webhook |
| `/api/bookings/:id` | GET | Booking detail |
| `/api/bookings` | GET | User's booking history |
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Login → JWT cookie |
| `/api/auth/me` | GET | Current user |
| `/api/payment/initiate` | POST | Start payment, returns gateway URL |
| `/api/webhooks/payment` | POST | (backend-only, not called by frontend) |

**WebSocket events (from backend):**
- `seat:update` → `{ showtimeId, seatId, status, heldUntil }`
- `seat:bulk-update` → array of seat updates
- `viewer:count` → `{ showtimeId, count }`

---

## Design System

| Token | Value |
|---|---|
| Background | `#0A0A0A` |
| Surface | `#171717` |
| Border | `#262626` |
| Muted text | `#A1A1AA` |
| Primary accent (amber) | `#F5A524` |
| Reserved/booked (crimson) | `#DC2626` |
| Premium (gold) | `#EAB308` |
| Display font | Bebas Neue |
| Body font | Inter |

Full tokens in `tailwind.config.ts`.

---

## Component Sources

You'll copy these component sources directly from their registries:

| Library | URL | Components used |
|---|---|---|
| shadcn/ui | https://ui.shadcn.com | Button, Card, Dialog, Input, Tabs, Toast, Skeleton |
| Aceternity UI | https://ui.aceternity.com | BackgroundGradient, CardSpotlight, MovingBorder, TextGenerateEffect |
| Magic UI | https://magicui.design | Marquee, AnimatedNumber, ShimmerButton, BentoGrid, Confetti |

Setup commands:
```bash
# shadcn
npx shadcn@latest init
npx shadcn@latest add button card dialog input tabs skeleton toast

# Magic UI
npx magicui-cli add marquee animated-number shimmer-button bento-grid confetti

# Aceternity — manual copy from website into src/components/aceternity/
```

---

## Testing Strategy

### Unit (Vitest)
- `SeatMap` selection logic
- `HoldTimer` countdown behavior
- `useSeatMap` WebSocket message handling
- Price calculation

### E2E (Playwright)
1. **Browse → select seat → hold** — verify hold created, timer appears
2. **Real-time sync** — open 2 tabs, click seat in tab A, verify tab B shows it as held
3. **Hold expiry** — wait 10 min (or mock), verify seat returns to available
4. **Payment → confirmation** — mock gateway, verify booking confirmed
5. **Auth flow** — signup → login → access `/bookings`

---

## Definition of Done — Frontend

- [ ] All 7 pages render with real data
- [ ] Seat map updates in real-time across 2 tabs
- [ ] Hold timer counts down + auto-releases on expiry
- [ ] Mobile-responsive at 360 / 768 / 1280
- [ ] Lighthouse: Performance 90+, A11y 95+, Best Practices 95+
- [ ] Dark mode default, light mode toggle works
- [ ] All animations 60fps
- [ ] Loading skeletons everywhere (no spinners)
- [ ] Empty states + error states designed
- [ ] Playwright e2e tests pass
- [ ] Vitest unit tests pass with >70% coverage

---

## Communication With Backend Teammate

- API contract above is **shared** — agree before either side starts
- Use `src/lib/types.ts` to import shared types from backend (or duplicate them with a comment)
- WebSocket event names must match exactly
- Ask for a sample WebSocket message shape early so you can build `useSeatMap` correctly
