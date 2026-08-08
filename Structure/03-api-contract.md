# 03 — API Contract (Frontend ↔ Backend)

> The exact contract between the Next.js frontend and the backend. Both teams agree on this before either writes integration code.

---

## Auth Decision (LOCKED)

**Decision (2026-08-08):** Primary auth is **email + password**. Phone + OTP is a **secondary, optional** 2FA step used after login.

**Required `User` model fields (frontend depends on these):**
- `email` — `String @unique`, NOT NULL
- `passwordHash` — `String`, NOT NULL (bcrypt, 10 rounds)
- `name` — `String`, NOT NULL
- `phone` — `String @unique`, NULL allowed

**Phone-OTP endpoints (`/api/auth/otp/*`) below are optional — frontend won't depend on them for the first integration slice.** Backend should still implement them per the contract for the "verify phone for 2FA" use case, but signup/login don't require them.

**If the backend schema currently has phone-only User (no email/password), add the missing fields before wiring auth routes.** See `04-schema-reconciliation.md` for the full field-mapping list.

---

## Base URL

| Environment | URL |
|---|---|
| Development | `http://localhost:4000` |
| Staging | `https://api-staging.yourdomain.com` |
| Production | `https://api.yourdomain.com` |

## WebSocket URL

| Environment | URL |
|---|---|
| Development | `ws://localhost:4000` |
| Production | `wss://api.yourdomain.com` |

## Standard Response Envelope

Every REST response uses this shape:

```json
{
  "data": <payload> | null,
  "error": <ApiError> | null
}
```

```typescript
interface ApiError {
  code: string;          // machine-readable, e.g. "SEAT_TAKEN"
  message: string;       // human-readable
  details?: object;      // optional context
}
```

## Standard HTTP Status Codes

| HTTP | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (no/invalid JWT) |
| 403 | Forbidden (not allowed) |
| 404 | Not found |
| 409 | Conflict (e.g. seat taken) |
| 410 | Gone (resource expired) |
| 422 | Unprocessable (e.g. payment failed) |
| 500 | Server error |

---

## REST Endpoints

### Auth

#### `POST /api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "name": "John Doe",
  "phone": "+919876543210"
}
```

**Response 200:**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe", "phone": "+91..." },
    "token": "eyJhbGc..."
  },
  "error": null
}
```

**Errors:**
- `400 VALIDATION_ERROR` — invalid email, weak password
- `409 EMAIL_TAKEN` — email already registered

---

#### `POST /api/auth/login`
Authenticate user.

**Request:**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Response 200:**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe" },
    "token": "eyJhbGc..."
  },
  "error": null
}
```

**Errors:**
- `401 INVALID_CREDENTIALS` — wrong email/password

---

#### `POST /api/auth/logout` (auth required)
Invalidate the current JWT (optional with stateless JWTs).

**Response 200:**
```json
{ "data": { "ok": true }, "error": null }
```

---

#### `GET /api/auth/me` (auth required)
Get current user profile.

**Response 200:**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "name": "John Doe", "phone": "+91..." }
  },
  "error": null
}
```

---

#### `POST /api/auth/otp/send` (auth required)
Send OTP to phone number.

**Request:**
```json
{ "phone": "+919876543210" }
```

**Response 200:**
```json
{ "data": { "sessionId": "otp_session_abc" }, "error": null }
```

---

#### `POST /api/auth/otp/verify` (auth required)
Verify OTP code.

**Request:**
```json
{ "sessionId": "otp_session_abc", "code": "123456" }
```

**Response 200:**
```json
{ "data": { "verified": true }, "error": null }
```

---

### Movies & Showtimes

#### `GET /api/movies`
List all movies, with optional filters.

**Query params:**
- `genre` (optional) — e.g. "Sci-Fi"
- `date` (optional) — ISO date, filters by showtime availability

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Dune Part Three",
      "description": "...",
      "posterUrl": "https://...",
      "durationMin": 165,
      "rating": 9.1,
      "genre": "Sci-Fi",
      "releaseDate": "2026-08-15"
    }
  ],
  "error": null
}
```

---

#### `GET /api/movies/:id`
Get movie detail with its showtimes.

**Response 200:**
```json
{
  "data": {
    "movie": { "id": 1, "title": "Dune Part Three", "...": "..." },
    "showtimes": [
      {
        "id": 101,
        "movieId": 1,
        "screenId": 4,
        "theatreName": "PVR Phoenix",
        "startsAt": "2026-08-15T19:30:00Z",
        "basePrice": 35000,
        "availableSeats": 42,
        "totalSeats": 150
      }
    ]
  },
  "error": null
}
```

---

#### `GET /api/showtimes/:id`
Get a single showtime.

---

#### `GET /api/showtimes/:id/seats`
Get the current seat map for a showtime (real-time).

**Response 200:**
```json
{
  "data": {
    "showtimeId": 101,
    "rows": 10,
    "cols": 15,
    "basePrice": 35000,
    "viewerCount": 12,
    "seats": [
      { "id": "A1", "row": "A", "col": 1, "seatType": "regular", "priceModifier": 1.0, "status": "available" },
      { "id": "A2", "row": "A", "col": 2, "seatType": "regular", "priceModifier": 1.0, "status": "held", "heldUntil": "2026-08-15T19:00:00Z" },
      { "id": "A3", "row": "A", "col": 3, "seatType": "regular", "priceModifier": 1.0, "status": "booked" },
      { "id": "B5", "row": "B", "col": 5, "seatType": "premium", "priceModifier": 1.4, "status": "available" }
    ]
  },
  "error": null
}
```

---

### Bookings

#### `POST /api/bookings/hold` (auth required) ⭐
Atomically hold 1+ seats. **This is the critical endpoint.**

**Request:**
```json
{
  "showtimeId": 101,
  "seatIds": ["A5", "A6"]
}
```

**Response 200 (success):**
```json
{
  "data": {
    "bookingId": "bk_abc123",
    "heldUntil": "2026-08-15T19:00:00Z",
    "totalAmount": 98000
  },
  "error": null
}
```

**Response 409 (conflict):**
```json
{
  "data": null,
  "error": {
    "code": "SEAT_TAKEN",
    "message": "Some seats are no longer available",
    "details": { "conflictingSeats": ["A5"] }
  }
}
```

**Other errors:**
- `401 UNAUTHORIZED`
- `404 SHOWTIME_NOT_FOUND`
- `409 SHOWTIME_STARTED` — showtime has begun

**Concurrency contract:** Either ALL requested seats are held or NONE. Partial holds are impossible.

---

#### `GET /api/bookings/:id` (auth required)
Get a single booking. Must be owned by current user.

**Response 200:**
```json
{
  "data": {
    "id": "bk_abc123",
    "userId": "uuid",
    "showtimeId": 101,
    "movie": { "id": 1, "title": "Dune Part Three", "posterUrl": "...", "durationMin": 165, "rating": 9.1 },
    "theatre": { "id": 1, "name": "PVR Phoenix" },
    "screen": { "id": 4, "name": "Screen 4" },
    "seats": [
      { "id": "A5", "row": "A", "col": 5, "seatType": "premium", "priceModifier": 1.4, "status": "held" }
    ],
    "startsAt": "2026-08-15T19:30:00Z",
    "status": "held",
    "heldUntil": "2026-08-15T19:00:00Z",
    "totalAmount": 49000,
    "createdAt": "2026-08-10T10:00:00Z"
  },
  "error": null
}
```

**Errors:**
- `404 NOT_FOUND`
- `403 FORBIDDEN` — not your booking

---

#### `GET /api/bookings` (auth required)
List current user's bookings.

**Query params:**
- `status` (optional) — filter by `held` / `paid` / `expired`

**Response 200:**
```json
{
  "data": [ /* Booking[] */ ],
  "error": null
}
```

---

### Payment

#### `POST /api/payment/initiate` (auth required)
Start a payment. Returns gateway URL to redirect user.

**Request:**
```json
{ "bookingId": "bk_abc123" }
```

**Response 200:**
```json
{
  "data": {
    "paymentId": "pay_xyz789",
    "paymentUrl": "https://gateway.example.com/pay/pay_xyz789"
  },
  "error": null
}
```

**Errors:**
- `404 BOOKING_NOT_FOUND`
- `403 FORBIDDEN`
- `410 HOLD_EXPIRED` — hold has timed out
- `422 BOOKING_ALREADY_PAID`

---

#### `POST /api/webhooks/payment` (gateway signature required)
Payment gateway calls this to confirm payment. **The frontend never calls this.**

**Request headers:**
- `X-Signature: <HMAC-SHA256 of body using webhook secret>`

**Request body (gateway-specific):**
```json
{
  "eventId": "evt_abc",
  "paymentId": "pay_xyz789",
  "status": "paid",
  "amount": 49000
}
```

**Response 200:**
```json
{ "data": { "ok": true }, "error": null }
```

**Behavior on success:**
1. Verify HMAC signature
2. Check `webhook_events` table for duplicate eventId
3. Insert into `webhook_events` (idempotency)
4. Update `payments` table
5. Update `bookings.status = 'paid'`
6. Emit `seat:update` with `status: 'booked'` to Socket.io room
7. Cancel any pending release-expired BullMQ job

---

## WebSocket Events (Socket.io)

### Connection
```javascript
const socket = io('http://localhost:4000', {
  auth: { token: 'eyJhbGc...' }
});
```

### Client → Server

#### `join:showtime`
Subscribe to seat updates for a showtime.

```json
{ "showtimeId": 101 }
```

#### `leave:showtime`
Unsubscribe.

```json
{ "showtimeId": 101 }
```

### Server → Client

#### `seat:update`
A single seat changed status.

```json
{
  "showtimeId": 101,
  "seatId": "A5",
  "status": "held",
  "heldUntil": "2026-08-15T19:00:00Z",
  "userId": "uuid-of-holder"  // optional
}
```

#### `seat:bulk-update`
Multiple seats changed (used on initial join, etc).

```json
{
  "showtimeId": 101,
  "updates": [
    { "seatId": "A5", "status": "held", "heldUntil": "..." },
    { "seatId": "A6", "status": "held", "heldUntil": "..." }
  ]
}
```

#### `viewer:count`
How many users are viewing this showtime.

```json
{ "showtimeId": 101, "count": 12 }
```

---

## Shared TypeScript Types

These types are duplicated in both frontend (`src/lib/types.ts`) and backend — keep them in sync.

```typescript
type SeatStatus = 'available' | 'held' | 'booked';
type BookingStatus = 'held' | 'paid' | 'expired';
type SeatType = 'regular' | 'premium' | 'recliner' | 'couple';
type PaymentMethod = 'upi' | 'card' | 'wallet';

interface Seat {
  id: string;             // e.g. "A5"
  row: string;            // e.g. "A"
  col: number;            // e.g. 5
  seatType: SeatType;
  priceModifier: number;  // 1.0, 1.4, etc.
  status: SeatStatus;
  heldUntil?: string;     // ISO timestamp
  heldBy?: string;        // userId
}

interface Movie {
  id: number;
  title: string;
  description?: string;
  posterUrl?: string;
  durationMin: number;
  rating: number;
  genre?: string;
  releaseDate?: string;
}

interface Showtime {
  id: number;
  movieId: number;
  screenId: number;
  theatreName: string;
  startsAt: string;       // ISO timestamp
  basePrice: number;      // in paise
  availableSeats: number;
  totalSeats: number;
}

interface SeatMapResponse {
  showtimeId: number;
  rows: number;
  cols: number;
  basePrice: number;
  viewerCount: number;
  seats: Seat[];
}

interface Booking {
  id: string;
  userId: string;
  showtimeId: number;
  movie: Pick<Movie, 'id' | 'title' | 'posterUrl' | 'durationMin' | 'rating'>;
  theatre: { id: number; name: string };
  screen: { id: number; name: string };
  seats: Seat[];
  startsAt: string;
  status: BookingStatus;
  heldUntil?: string;
  totalAmount: number;
  paymentId?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

---

## Authentication

- **JWT** in `Authorization: Bearer <token>` header for all `/api/*` endpoints (except `/signup`, `/login`)
- For Socket.io: pass token in `auth.token` at connection time
- JWT expiry: 7 days
- Stored on frontend in `httpOnly` cookie (preferred) or memory

---

## Error Codes Reference

| Code | HTTP | When |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `UNAUTHORIZED` | 401 | Missing/invalid JWT |
| `FORBIDDEN` | 403 | Not allowed (e.g. viewing another's booking) |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `EMAIL_TAKEN` | 409 | Signup with existing email |
| `SEAT_TAKEN` | 409 | One or more seats already held/booked |
| `SHOWTIME_STARTED` | 409 | Showtime has begun |
| `BOOKING_ALREADY_PAID` | 409 | Trying to pay a paid booking |
| `HOLD_EXPIRED` | 410 | Tried to pay after hold expired |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `PAYMENT_FAILED` | 422 | Gateway rejected payment |
| `WEBHOOK_INVALID_SIGNATURE` | 401 | HMAC mismatch on webhook |
| `OTP_INVALID` | 422 | Wrong OTP code |
| `INTERNAL_ERROR` | 500 | Server bug |
| `NETWORK_ERROR` | – | Frontend: fetch failed |

---

## Money & Time Conventions

| Concept | Convention |
|---|---|
| **Currency** | All amounts in **paise** (₹1 = 100 paise) |
| **Timestamps** | Always ISO 8601 UTC with `Z` suffix |
| **Date math** | Backend in UTC, frontend formats in local TZ |
| **Hold duration** | 600 seconds (10 minutes) — configurable via env |

---

## Rate Limiting

| Endpoint | Limit |
|---|---|
| `/api/auth/login` | 5 per minute per IP |
| `/api/auth/signup` | 3 per hour per IP |
| `/api/auth/otp/*` | 3 per 10 minutes per phone |
| `/api/bookings/hold` | 10 per minute per user |
| All others | 100 per minute per user |

---

## Versioning

- API is versioned via URL prefix: `/api/v1/...`
- Breaking changes require `/api/v2/...`
- Current version: **v1** (no prefix yet — prefix added when breaking change is needed)
