# 04 — Schema Reconciliation (Prisma ↔ Contract)

> Single source of truth for the gaps between the backend's current Prisma schema and the API contract. Every item here is a **blocker for integration** until resolved.

**Last updated:** 2026-08-08
**Backend repo:** `D:\Explorer\CinemaTicket-backend` (local clone, do not push)
**Backend schema file:** `prisma/schema.prisma`
**Reference docs:** `01-entities-and-relationships.md`, `03-api-contract.md`

---

## TL;DR — Blockers Before Frontend Integration

These three changes must land in `prisma/schema.prisma` before the frontend can talk to the backend:

1. **`User` model** — add `email` (unique, NOT NULL), `passwordHash` (NOT NULL); make `name` NOT NULL.
2. **`Movie` model** — `rating` is `Float` ✅ but `description` is non-null in schema while contract says optional. Make nullable.
3. **`Seat` model** — add `priceModifier Decimal(3,2) @default(1.00)`.

Without these, login fails, signup fails, and every seat shows the same price.

---

## Field-by-Field Reconciliation

### `User`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | UUID (cuid ok) | `String @id @default(cuid())` | OK | — |
| `email` | required, unique | **missing** | BLOCKER | Add `String @unique` |
| `passwordHash` | required | **missing** | BLOCKER | Add `String` (bcrypt) |
| `name` | required | `String?` (nullable) | BLOCKER | Make NOT NULL |
| `phone` | optional, unique | `String @unique` | OK | Keep |
| `createdAt` | required | `DateTime @default(now())` | OK | — |

**Suggested final shape:**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  phone         String?   @unique
  createdAt     DateTime  @default(now())
  bookings      Booking[]
}
```

---

### `Movie`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | int (cuid ok) | `String @id @default(cuid())` | OK | — |
| `title` | required | `String` | OK | — |
| `description` | optional | `String` (required) | MISMATCH | Make `String?` |
| `posterUrl` | optional | `String?` | OK | — |
| `durationMin` | required | `durationMins Int` | RENAME OK | Map on response |
| `rating` | `0.0–10.0` | `Float` | OK | Validate range in code |
| `genre` | string | `enum Genre { ACTION, COMEDY, DRAMA }` | ENUM NARROW | **Add more values** (Sci-Fi, Horror, Romance, Thriller, etc.) |
| `releaseDate` | DATE | **missing** | BLOCKER | Add `DateTime?` |

**Action items:**
- Make `description` nullable
- Add `releaseDate DateTime?`
- Expand `enum Genre` — current values cover only 3 of the genres the frontend will display

---

### `Theatre`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | int (cuid ok) | `String @id @default(cuid())` | OK | — |
| `name` | required | `String` | OK | — |
| `address` | optional | **missing** | NICE | Add `String?` |
| `city` | optional | `String` | OK | — |

---

### `Screen`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | int (cuid ok) | `String @id @default(cuid())` | OK | — |
| `theatreId` | required | `String` | OK | — |
| `name` | required | `String` | OK | — |
| `rows` | required | **missing** | BLOCKER | Add `Int` |
| `cols` | required | **missing** | BLOCKER | Add `Int` |

Without `rows`/`cols`, the seat-map grid cannot render its bounds.

---

### `Seat`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | `"A5"` string OR cuid | `String @id @default(cuid())` | DECIDE | See API mapping rules below |
| `screenId` | required | `String` | OK | — |
| `row` | required | `String` | OK | — |
| `col` | required | `number Int` | OK | Map `number → col` |
| `seatType` | enum string | `type String @default("REGULAR")` | CASE | Map `REGULAR → regular`, etc. |
| `priceModifier` | required | **missing** | BLOCKER | Add `Decimal(3,2) @default(1.00)` |

---

### `Showtime`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | int (cuid ok) | `String @id @default(cuid())` | OK | — |
| `movieId` | required | `String` | OK | — |
| `screenId` | required | `String` | OK | — |
| `startsAt` | required | `DateTime` | OK | — |
| `basePrice` | required (paise) | `Int` | OK | — |

The API response must **join and expose**: `theatreName`, `availableSeats`, `totalSeats`. These come from joins/computation, not the row.

---

### `ShowSeat` (join model — replaces per-seat row in `bookings`)

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | cuid ok | `String @id @default(cuid())` | OK | — |
| `showtimeId` | required | `String` | OK | — |
| `seatId` | required | `String` | OK | — |
| `status` | enum | `SeatStatus @default(AVAILABLE)` | OK | — |
| `bookingId` | optional | `String?` | OK | — |
| `holdExpiresAt` | optional | `DateTime?` | OK | Maps to API `heldUntil` |

Constraint `@@unique([showtimeId, seatId])` correctly prevents double-booking ✅.

---

### `Booking`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | UUID | `String @id @default(cuid())` | OK | Prefix `bk_` on API |
| `userId` | required | `String` | OK | — |
| `showtimeId` | required | `String` | OK | — |
| `status` | enum | `BookingStatus @default(HELD)` | OK | See enum mapping below |
| `amount` | required (paise) | `Int` | OK | — |
| `heldUntil` | optional | `expiresAt DateTime?` | RENAME OK | Map on response |
| `paymentId` | optional | (via `Payment.gatewayPaymentId`) | OK | — |
| `createdAt` | required | `DateTime @default(now())` | OK | — |

**API ↔ internal `BookingStatus` mapping:**

| API value | Internal value | Notes |
|---|---|---|
| `held` | `HELD` | Active hold, awaiting payment |
| `held` | `AWAITING_PAYMENT` | Payment URL issued, still holding |
| `paid` | `CONFIRMED` | Payment webhook succeeded |
| `expired` | `EXPIRED` | Hold timed out |
| `expired` | `CANCELLED` | User cancelled or system aborted |
| `expired` | `FAILED` | Payment failed |

(Internal states are richer; collapse to 3 externally.)

---

### `Payment`

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | UUID | `String @id @default(cuid())` | OK | — |
| `bookingId` | required, unique | `String @unique` | OK | — |
| `gatewayPaymentId` | unique | `String? @unique` | OK | — |
| `amount` | required | `Int` | OK | — |
| `status` | enum | `PaymentStatus @default(PENDING)` | OK | — |
| `method` | upi/card/wallet | **missing** | NICE | Add `String?` |
| `createdAt` | required | `DateTime @default(now())` | OK | — |
| `paidAt` | optional | **missing** | NICE | Add `DateTime?` |

---

### `PaymentEvent` (idempotency)

| Field | Contract | Current schema | Status | Action |
|---|---|---|---|---|
| `id` | gateway event id | `eventId String @unique` (separate from `id`) | OK | — |
| `paymentId` | required | `String` | OK | — |
| `status` | required | `String` | OK | — |
| `amount` | required | `Int` | OK | — |
| `receivedAt` | required | `DateTime @default(now())` | OK | — |

Note: `id` is internal PK, `eventId` is the dedupe key. Frontend never sees this table.

---

## API Mapping Rules (for backend response shaping)

These are the exact field renames the backend must perform when serializing responses:

```
Prisma field              →  API field              Where
─────────────────────────────────────────────────────────────
User.id                   →  user.id                /auth/*
User.email                →  user.email             /auth/*
User.name                 →  user.name              /auth/*
User.phone                →  user.phone             /auth/me

Movie.id                  →  movie.id
Movie.title               →  movie.title
Movie.description         →  movie.description
Movie.posterUrl           →  movie.posterUrl
Movie.durationMins        →  movie.durationMin
Movie.rating              →  movie.rating
Movie.genre (enum)        →  movie.genre (string, lowercase)
Movie.releaseDate         →  movie.releaseDate (ISO date)

Seat.id                   →  (cuid — frontend never uses Seat.id directly)
Seat.row + Seat.number    →  seat.id (e.g. "A5")     ★ critical
Seat.type (REGULAR)       →  seat.seatType (lowercase)
Seat.priceModifier        →  seat.priceModifier

Showtime.id               →  showtime.id / movie.id
Showtime.startsAt         →  startsAt
Showtime.basePrice        →  basePrice
Theatre.name (via Screen) →  theatreName             (computed join)
ShowSeat count            →  availableSeats          (computed)
Screen.rows × Screen.cols →  totalSeats              (computed)

Booking.id                →  booking.id (prefix "bk_" + cuid)
Booking.amount            →  totalAmount
Booking.expiresAt         →  heldUntil
Booking.status            →  status (mapped via table above)
Booking.createdAt         →  createdAt
```

---

## Summary Checklist for Backend Teammate

```
☐  User: add email, passwordHash; make name NOT NULL
☐  Movie: make description nullable; add releaseDate; expand Genre enum
☐  Screen: add rows, cols
☐  Seat: add priceModifier
☐  Theatre: add address (optional, nice-to-have)
☐  Payment: add method, paidAt (optional, nice-to-have)
☐  Run: npx prisma migrate dev --name add_missing_fields
☐  Run: npx prisma generate
☐  Update response serializers to map field names per table above
☐  Decide: expose Seat.id as "A5" derived string? (recommended yes)
```

When all checkboxes are ticked, frontend integration can begin.

---

## Update Log

### 2026-08-08 — Booking endpoints shipped

Backend teammate shipped `booking.routes.ts`, `booking.controller.ts`, `booking.service.ts`.
Mounted at `/api/v1/bookings`. Endpoints now live:

| Endpoint | Behavior |
|---|---|
| `POST /api/v1/bookings/hold` | Body `{ userId, showtimeId, seatIds }`. Returns `{ booking, seats }` where `booking` has `{ id, userId, showtimeId, status, amount, expiresAt }` and `seats` are `ShowSeat` rows. |
| `POST /api/v1/bookings/:bookingId/confirm` | Flips `HELD → CONFIRMED`, marks seats `BOOKED`. Returns `{ booking }`. |

**Frontend changes made:**
- `HoldResponse` type rewritten to `{ booking, seats }` shape.
- `HoldRequest` now includes `userId` (sourced from new `useAuthStore`).
- `PaymentForm` now calls `/confirm` after (mock) payment → routes to `/booking/:id/confirmed`.
- `HOLD_DURATION_SECONDS` synced to 300 (backend hard-codes 5 min).
- New `confirmBooking(id)` endpoint helper in `api.ts`.
- New `useAuthStore` with stub user (real auth ships later).

**Backend bugs filed for teammate — DO NOT ship without fixing:**

1. **Race condition in `holdSeats`.** The `updateMany({ where: { status: 'AVAILABLE' } })` does not lock the seat rows. Two concurrent requests with overlapping seats both pass the check, both succeed. Add `SELECT ... FOR UPDATE` inside the transaction on the ShowSeat rows, or replace `updateMany` with a sentinel insert that violates `@@unique([showtimeId, seatId])`.

2. **Pricing ignores `priceModifier`.** `amount = basePrice * seatIds.length`. Premium/recliner seats cost the same as regular. Either add `priceModifier` to `Seat` and sum per-seat, or document that pricing is flat.

3. **No auth check on `createSeatHold`.** Controller reads `userId` from body — any client can hold seats in another user's name. Extract `userId` from JWT (req.user.id) once auth middleware exists.

4. **No bookings listing endpoint.** Frontend `endpoints.bookings()` (`GET /bookings`) still has no route. Need `GET /api/v1/bookings` (current user's bookings) and `GET /api/v1/bookings/:id`.

5. **Payment flow gap.** Frontend no longer uses `/payment/initiate` + webhook. If you agree the simpler model is "client calls `/confirm` directly," then `/payment/initiate` and the webhook route are dead code and can be removed. If you want a real gateway integration, ship `POST /api/v1/payment/initiate` and the webhook handler.

6. **Schema gaps remain.** `User.email`/`passwordHash`, `Movie.releaseDate`, `Screen.rows`/`cols`, `Seat.priceModifier`, expanded `Genre` enum — still missing. No auth, no seat-map grid, flat pricing.
