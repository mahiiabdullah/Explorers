# Cinema Booking Platform — Backend README

> The API server, database, real-time engine, and payment/OTP integration for the cinema seat-booking platform.

---

## What This Part Does

This is the **backend** of a cinema seat-booking platform. It handles:

- REST API for movies, showtimes, bookings
- **Real-time seat updates** via WebSocket
- **Concurrency-safe seat booking** (no double-booking under heavy load)
- **Auto-release of expired holds** (background job)
- Integration with **provided payment gateway**
- Integration with **provided OTP gateway**
- Pre-populated database with movies, theatres, showtimes, seat layouts

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | **Node.js 20 LTS** |
| Language | **TypeScript (strict mode)** |
| Framework | **Express.js** |
| DB | **PostgreSQL 16** |
| ORM | **Prisma** (or raw SQL + `pg` — your call) |
| Cache / PubSub | **Redis 7** |
| Job Queue | **BullMQ** (for hold-release worker) |
| Real-time | **Socket.io** |
| Auth | **JWT** in httpOnly cookies + bcrypt for passwords |
| Validation | **Zod** |
| Logging | **Pino** (structured JSON logs) |
| Error tracking | **Sentry** |
| Testing | **Vitest** + **Supertest** |
| Load testing | **k6** (optional, for proving concurrency) |

---

## Folder Structure

```
backend/
├── prisma/                     # if using Prisma
│   ├── schema.prisma
│   └── migrations/
│
├── db/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_indexes.sql
│   │   └── 003_constraints.sql
│   ├── seed.sql                # pre-populated movies, theatres, seats
│   └── functions/
│       └── release_expired_holds.sql   # optional pg_cron function
│
├── src/
│   ├── server.ts               # entry point: Express + Socket.io bootstrap
│   ├── worker.ts               # BullMQ worker entry point
│   │
│   ├── config/
│   │   ├── env.ts              # zod-validated env loader
│   │   ├── db.ts               # postgres pool
│   │   ├── redis.ts            # redis client
│   │   └── logger.ts           # pino instance
│   │
│   ├── routes/
│   │   ├── index.ts            # mounts all route modules
│   │   ├── auth.routes.ts      # /signup /login /logout /me
│   │   ├── movies.routes.ts    # GET /movies, /movies/:id
│   │   ├── showtimes.routes.ts # GET /showtimes/:id, /showtimes/:id/seats
│   │   ├── bookings.routes.ts  # hold / confirm / get / list
│   │   ├── payment.routes.ts   # initiate payment
│   │   └── webhooks.routes.ts  # payment + OTP webhooks
│   │
│   ├── controllers/            # thin handlers, delegate to services
│   │   ├── auth.controller.ts
│   │   ├── movies.controller.ts
│   │   ├── showtimes.controller.ts
│   │   ├── bookings.controller.ts
│   │   └── payment.controller.ts
│   │
│   ├── services/               # business logic (the meat)
│   │   ├── auth.service.ts
│   │   ├── booking.service.ts  # ⭐ the concurrency-safe core
│   │   ├── hold.service.ts
│   │   ├── payment.service.ts  # wraps PaymentGateway interface
│   │   ├── otp.service.ts      # wraps OtpGateway interface
│   │   └── showtime.service.ts
│   │
│   ├── gateways/               # external integrations
│   │   ├── payment-gateway.interface.ts   # contract
│   │   ├── payment-gateway.impl.ts        # real impl (fill from spec)
│   │   ├── otp-gateway.interface.ts
│   │   └── otp-gateway.impl.ts
│   │
│   ├── realtime/
│   │   ├── socket.server.ts    # Socket.io init + auth middleware
│   │   ├── seat.events.ts      # emit seat:update, viewer:count
│   │   └── rooms.ts            # showtime room management
│   │
│   ├── jobs/
│   │   ├── queues.ts           # BullMQ queue definitions
│   │   ├── release-holds.job.ts # ⭐ runs every 30s
│   │   └── webhook-retry.job.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification
│   │   ├── error.middleware.ts # global error handler
│   │   ├── request-id.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── validate.middleware.ts # zod schema validator
│   │
│   ├── schemas/                # zod schemas (request/response)
│   │   ├── auth.schema.ts
│   │   ├── booking.schema.ts
│   │   └── payment.schema.ts
│   │
│   ├── utils/
│   │   ├── errors.ts           # AppError, ConflictError, etc.
│   │   ├── idempotency.ts
│   │   └── crypto.ts
│   │
│   └── types/
│       └── index.ts
│
├── tests/
│   ├── unit/
│   │   ├── booking.service.test.ts
│   │   ├── hold.service.test.ts
│   │   └── payment.service.test.ts
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── booking-flow.test.ts
│   │   ├── concurrency.test.ts # ⭐ the critical test
│   │   └── webhooks.test.ts
│   └── load/
│       └── seat-booking.k6.js  # proves "heavy concurrent demand"
│
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── Dockerfile
├── .dockerignore
├── docker-compose.yml          # postgres + redis + api + worker
├── package.json
└── README.md
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill values
cp .env.example .env

# 3. Start postgres + redis
docker compose up -d postgres redis

# 4. Run migrations
npm run db:migrate

# 5. Seed database
npm run db:seed

# 6. Start dev (api + worker concurrently)
npm run dev

# API → http://localhost:4000
# Worker → background process
```

### Required `.env` variables

```bash
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://cinema:cinema@localhost:5432/cinema

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=change-me-32-chars-min
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Hold timeout (seconds)
HOLD_DURATION_SECONDS=600

# Payment gateway (fill when spec is shared)
PAYMENT_GATEWAY_BASE_URL=
PAYMENT_GATEWAY_API_KEY=
PAYMENT_GATEWAY_WEBHOOK_SECRET=

# OTP gateway
OTP_GATEWAY_BASE_URL=
OTP_GATEWAY_API_KEY=

# Logging
LOG_LEVEL=info
SENTRY_DSN=
```

---

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev mode with hot reload (api + worker) |
| `npm run dev:api` | API only |
| `npm run dev:worker` | Worker only |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled output |
| `npm run lint` | ESLint |
| `npm run typecheck` | tsc --noEmit |
| `npm run test` | Vitest unit + integration |
| `npm run test:watch` | Watch mode |
| `npm run test:concurrency` | Critical concurrency test |
| `npm run test:load` | k6 load test |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load seed data |
| `npm run db:reset` | Drop + migrate + seed |

---

## Database Schema (key tables)

```sql
-- Pre-populated reference data
theatres(id, name, address, created_at)
screens(id, theatre_id, name, rows, cols)
seats(id, screen_id, row_label, col_number, seat_type, price_modifier)
movies(id, title, description, poster_url, duration_min, rating, genre)
showtimes(id, movie_id, screen_id, starts_at, base_price)

-- User data
users(id, email, phone, password_hash, name, created_at)

-- Bookings (the hot table)
bookings(
  id, user_id, showtime_id, seat_id,
  status,            -- 'held' | 'paid' | 'expired'
  held_until,        -- timestamp
  payment_id,        -- from payment gateway
  amount,
  created_at, updated_at
)
```

### Critical constraints (prevents double-booking)

```sql
-- Only ONE active (held or paid) booking per seat per showtime
create unique index idx_one_active_booking_per_seat
  on bookings(showtime_id, seat_id)
  where status in ('held', 'paid');

-- Speed up hot queries
create index idx_bookings_user on bookings(user_id);
create index idx_bookings_held_until on bookings(held_until) where status = 'held';
create index idx_showtimes_movie on showtimes(movie_id, starts_at);
```

---

## API Contract

| Endpoint | Method | Auth | Body / Query | Response |
|---|---|---|---|---|
| `/api/auth/signup` | POST | – | `{ email, password, name, phone }` | `{ user, token }` |
| `/api/auth/login` | POST | – | `{ email, password }` | `{ user, token }` |
| `/api/auth/logout` | POST | ✓ | – | `{ ok: true }` |
| `/api/auth/me` | GET | ✓ | – | `{ user }` |
| `/api/movies` | GET | – | `?genre=&date=` | `Movie[]` |
| `/api/movies/:id` | GET | – | – | `Movie + showtimes[]` |
| `/api/showtimes/:id/seats` | GET | – | – | `Seat[] with status` |
| `/api/bookings/hold` | POST | ✓ | `{ showtimeId, seatIds[] }` | `{ holdId, heldUntil, totalAmount }` or `409` |
| `/api/bookings/:id` | GET | ✓ | – | `Booking` |
| `/api/bookings` | GET | ✓ | – | `Booking[]` (user's) |
| `/api/payment/initiate` | POST | ✓ | `{ bookingId }` | `{ paymentUrl, paymentId }` |
| `/api/webhooks/payment` | POST | signature | gateway payload | `{ ok: true }` |
| `/api/otp/send` | POST | ✓ | `{ phone }` | `{ ok: true }` |
| `/api/otp/verify` | POST | ✓ | `{ phone, code }` | `{ ok: true }` |

All responses follow:
```json
{ "data": {...}, "error": null }
// or
{ "data": null, "error": { "code": "SEAT_TAKEN", "message": "..." } }
```

---

## WebSocket Events (Socket.io)

### Client → Server
- `join:showtime` `{ showtimeId }` — subscribe to seat updates for a showtime
- `leave:showtime` `{ showtimeId }`

### Server → Client
- `seat:update` `{ showtimeId, seatId, status, heldUntil }`
- `seat:bulk-update` `[SeatUpdate, ...]`
- `viewer:count` `{ showtimeId, count }`

Auth: pass JWT in `auth` payload at connection time.

---

## The Critical Concurrency Story

**Booking a seat must be atomic.** Two users clicking the same seat at the same millisecond must result in exactly **one** success and **one** conflict.

### Implementation

```ts
// services/booking.service.ts (sketch)

async function holdSeats(userId: string, showtimeId: string, seatIds: string[]) {
  return db.transaction(async (tx) => {
    // 1. Lock the seat rows (prevents race)
    await tx.query(
      `SELECT id FROM bookings
       WHERE showtime_id = $1 AND seat_id = ANY($2)
         AND status IN ('held', 'paid')
       FOR UPDATE`,
      [showtimeId, seatIds]
    );

    // 2. Check none are already booked/held
    const conflicts = await tx.query(/* ... */);
    if (conflicts.length > 0) {
      throw new ConflictError('SEAT_TAKEN', conflicts);
    }

    // 3. Insert holds atomically
    const heldUntil = new Date(Date.now() + HOLD_DURATION_MS);
    await tx.query(
      `INSERT INTO bookings (user_id, showtime_id, seat_id, status, held_until)
       VALUES ($1, $2, $3, 'held', $4)`,
      [userId, showtimeId, seatIds, heldUntil]
    );

    // 4. Broadcast to room (outside transaction ideally, but acceptable here)
    socket.to(`showtime:${showtimeId}`).emit('seat:update', /* ... */);

    return { holdId, heldUntil, totalAmount };
  });
}
```

### Why this is safe
- **`FOR UPDATE`** locks the rows — second concurrent request waits
- **`UNIQUE INDEX`** is a second line of defense — even if app logic has a bug, the DB refuses the duplicate
- **`held_until`** enables auto-release

### Auto-release job

```ts
// jobs/release-holds.job.ts
// Runs every 30s via BullMQ repeatable job

async function releaseExpiredHolds() {
  const expired = await db.bookings.findMany({
    where: { status: 'held', held_until: { lt: new Date() } },
  });

  for (const booking of expired) {
    await db.bookings.update({
      where: { id: booking.id },
      data: { status: 'expired' },
    });
    socket.to(`showtime:${booking.showtime_id}`).emit('seat:update', {
      seatId: booking.seat_id,
      status: 'available',
    });
  }
}
```

### Concurrency test (Vitest)

```ts
// tests/integration/concurrency.test.ts
it('100 concurrent holds for the same seat → exactly 1 succeeds', async () => {
  const promises = Array.from({ length: 100 }, () =>
    request(app).post('/api/bookings/hold').send({ showtimeId, seatIds: ['A1'] })
  );
  const results = await Promise.all(promises);
  const successes = results.filter(r => r.status === 200);
  expect(successes).toHaveLength(1);
  expect(results.filter(r => r.status === 409)).toHaveLength(99);
});
```

---

## Payment Gateway Integration

### Interface (write first, fill in real impl when spec is shared)

```ts
// gateways/payment-gateway.interface.ts
export interface PaymentGateway {
  initiate(input: {
    bookingId: string;
    amount: number;        // in paise
    currency: string;
    userId: string;
    metadata?: Record<string, string>;
  }): Promise<{ paymentId: string; paymentUrl: string }>;

  verifyWebhookSignature(payload: string, signature: string): boolean;

  getStatus(paymentId: string): Promise<'pending' | 'paid' | 'failed' | 'refunded'>;
}
```

```ts
// gateways/payment-gateway.impl.ts
// TODO: Fill in once the gateway spec is provided
export class HttpPaymentGateway implements PaymentGateway {
  // Implement by calling the provided gateway's REST API
}
```

### Webhook handling

```ts
// routes/webhooks.routes.ts
router.post('/payment', async (req, res) => {
  // 1. Verify signature
  const valid = paymentGateway.verifyWebhookSignature(
    req.rawBody,
    req.headers['x-signature']
  );
  if (!valid) return res.status(401).json({ error: 'INVALID_SIGNATURE' });

  // 2. Idempotency check (use event ID)
  // 3. Update booking status to 'paid'
  // 4. Broadcast seat:update with status='booked'
  // 5. Return 200 within 5s
});
```

---

## OTP Gateway Integration

Same pattern as payment — interface first, real impl when spec is shared.

```ts
export interface OtpGateway {
  send(phone: string): Promise<{ sessionId: string }>;
  verify(sessionId: string, code: string): Promise<boolean>;
}
```

---

## Docker Setup

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cinema
      POSTGRES_PASSWORD: cinema
      POSTGRES_DB: cinema
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/seed.sql:/docker-entrypoint-initdb.d/seed.sql
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cinema"]
      interval: 5s

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s

  api:
    build: .
    command: node dist/server.js
    ports: ["4000:4000"]
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    env_file: .env

  worker:
    build: .
    command: node dist/worker.js
    depends_on:
      postgres: { condition: service_healthy }
      redis:    { condition: service_healthy }
    env_file: .env

volumes:
  pgdata:
```

---

## Testing Strategy

| Test | What it proves |
|---|---|
| `booking.service.test.ts` | Hold creates booking, returns held_until |
| `hold.service.test.ts` | Can't hold already-held seat |
| `payment.service.test.ts` | Initiate returns payment URL, signature verification works |
| `auth.test.ts` | Signup, login, JWT validation |
| `booking-flow.test.ts` | Hold → pay (mock webhook) → confirm |
| **`concurrency.test.ts`** | **100 concurrent holds for same seat → 1 success, 99 conflicts** |
| `webhooks.test.ts` | Webhook signature + idempotency |
| `seat-booking.k6.js` | Sustained 100 RPS for 30s, no double-booking |

---

## Logging & Observability

Every request gets a `requestId` (UUID). It's logged at start and end, included in all log lines, and returned in the `x-request-id` response header.

```json
{
  "level": "info",
  "time": "2026-08-08T18:30:00.000Z",
  "requestId": "abc-123",
  "userId": "user_42",
  "msg": "hold created",
  "bookingId": "bk_xyz",
  "showtimeId": 7,
  "seatIds": ["A1", "A2"],
  "durationMs": 23
}
```

---

## Definition of Done — Backend

- [ ] All endpoints implemented + documented
- [ ] Database schema migrated + seeded
- [ ] Concurrency test passes (100 simultaneous requests → 1 success)
- [ ] Load test passes (100 RPS, no double-booking)
- [ ] Hold-release job releases expired holds within 30s
- [ ] Real-time events broadcast on hold/confirm/expire
- [ ] Webhook signature verification works
- [ ] Idempotency on webhooks (replays don't double-confirm)
- [ ] Docker compose brings up entire stack with one command
- [ ] Vitest coverage >70% on services
- [ ] Structured logs with request IDs
- [ ] Sentry captures errors (if DSN provided)
- [ ] Graceful shutdown (drains in-flight requests)

---

## Communication With Frontend Teammate

- Share the **API contract table** above — agree before either side starts
- Share **WebSocket event names + payload shapes** early
- Provide **sample seat-map response** so they can build the UI:
  ```json
  {
    "showtimeId": 7,
    "seats": [
      { "id": "A1", "row": "A", "col": 1, "status": "available", "priceModifier": 1.0 },
      { "id": "A2", "row": "A", "col": 2, "status": "held", "heldUntil": "2026-08-08T18:40:00Z" },
      { "id": "A3", "row": "A", "col": 3, "status": "booked" }
    ]
  }
  ```
- Share **types** (TypeScript interfaces) in a shared format — or duplicate with a comment
- Coordinate on **JWT format** (claims, expiry, cookie name)
