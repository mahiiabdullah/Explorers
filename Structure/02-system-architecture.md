# 02 — System Architecture

> How the pieces fit together: services, databases, APIs, real-time engine, and background workers.

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │           Next.js Frontend (this repo)                        │      │
│  │  - Pages: landing, movies, seat-map, pay, confirmed           │      │
│  │  - State: Zustand (seat selections, hold timer)               │      │
│  │  - Real-time: Socket.io client                                │      │
│  └────────────┬─────────────────────────┬────────────────────────┘      │
└───────────────┼─────────────────────────┼───────────────────────────────┘
                │ HTTPS                  │ WebSocket (Socket.io)
                │ REST                   │ wss://
                ↓                         ↓
┌────────────────────────────────────────────────────────────────────────┐
│                          API LAYER (Backend)                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Express.js Server                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │   Auth   │  │  Movies  │  │ Showtimes│  │ Bookings │         │   │
│  │  │ Routes   │  │  Routes  │  │  Routes  │  │  Routes  │         │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │ Payment  │  │ OTP      │  │ Webhooks │  │  Health  │         │   │
│  │  │ Routes   │  │ Routes   │  │ Routes   │  │  Routes  │         │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────┐         ┌─────────────────────┐                │
│  │  Socket.io Server   │         │  BullMQ Worker      │                │
│  │  - join:showtime    │         │  - release-holds    │                │
│  │  - seat:update      │         │  - webhook-retry    │                │
│  │  - viewer:count     │         │  - clean-expired    │                │
│  └─────────────────────┘         └─────────────────────┘                │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                                │   │
│  │  BookingService  HoldService  PaymentService  OtpService         │   │
│  │  AuthService     ShowtimeService  UserService                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────┬──────────────────┬──────────────────────────┬─────────────────┘
          │                  │                          │
          ↓ SQL              ↓ Redis                    ↓ HTTPS
┌──────────────────┐  ┌──────────────────┐   ┌────────────────────┐
│   PostgreSQL     │  │      Redis       │   │  External Services │
│   ┌──────────┐   │  │  - pub/sub       │   │  - Payment Gateway │
│   │ theatres │   │  │  - BullMQ queue  │   │  - OTP Gateway     │
│   │ screens  │   │  │  - cache         │   │                    │
│   │ seats    │   │  │  - sessions      │   │                    │
│   │ movies   │   │  └──────────────────┘   └────────────────────┘
│   │ showtimes│   │
│   │ users    │   │
│   │ bookings │   │
│   │ payments │   │
│   └──────────┘   │
└──────────────────┘
```

---

## Process Topology (Docker Compose)

| Service | Image | Port | Purpose |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | Primary data store |
| `redis` | redis:7-alpine | 6379 | Pub/sub, BullMQ queues, cache |
| `api` | (custom) | 4000 | Express REST + Socket.io server |
| `worker` | (custom) | – | BullMQ background jobs |

Both `api` and `worker` share the same Docker image but run different commands.

---

## Service Responsibilities

### `AuthService`
- Sign up with email/password
- Login → issue JWT
- Verify JWT on every request
- Password hashing (bcrypt, 10 rounds)

**Key methods:**
```typescript
signup(input: { email, password, name, phone }): Promise<{ user, token }>
login(input: { email, password }): Promise<{ user, token }>
verifyToken(token: string): Promise<User>
```

### `BookingService` ⭐ (the critical one)
- Atomic seat holding with row-level locking
- Transaction-based INSERT
- Emits Socket.io events on state change
- Triggers BullMQ release-expired job

**Key methods:**
```typescript
holdSeats(userId: string, showtimeId: number, seatIds: string[]): Promise<HoldResponse>
confirmBooking(bookingId: string, paymentId: string): Promise<void>
getUserBookings(userId: string): Promise<Booking[]>
```

### `HoldService`
- Create a hold with TTL (10 minutes)
- Check if hold expired
- Cancel a hold (on payment failure)

### `PaymentService`
- Wrap `PaymentGateway` interface
- Verify webhook HMAC signatures
- Idempotency: dedupe via `webhook_events` table
- Mark booking as `paid` only after verified webhook

### `OtpService`
- Wrap `OtpGateway` interface
- `send(phone)` → returns sessionId
- `verify(sessionId, code)` → boolean

### `ShowtimeService`
- Query movies with showtimes
- Get full seat map (with real-time status)
- No mutations (read-only)

### `UserService`
- Get profile
- Update name/phone
- Change password

---

## Real-time Engine (Socket.io)

### Rooms
- One room per showtime: `showtime:{id}`
- Subscribed clients receive seat updates for that showtime only

### Event Flow

```
Client connects → emits 'join:showtime' { showtimeId }
  ↓
Server adds socket to room `showtime:{showtimeId}`
Increments viewer count → broadcasts 'viewer:count'
  ↓
When any user holds/expires/books a seat:
  - BookingService mutates DB
  - Emits 'seat:update' to room `showtime:{showtimeId}`
  - All subscribed clients update their UI in real-time
  ↓
Client leaves → emits 'leave:showtime'
  - Server removes from room
  - Decrements viewer count
```

### Auth on Socket
- JWT passed in `auth` payload at connection time
- Rejected if invalid (no room joins allowed)

---

## Background Workers (BullMQ)

### `release-expired-holds`
**Schedule:** Every 30 seconds (repeatable job)

```typescript
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

### `webhook-retry`
**Trigger:** When payment gateway webhook returns 5xx

3 attempts with exponential backoff (1s, 5s, 30s).

### `cleanup-expired`
**Schedule:** Daily at 3 AM

Hard-delete bookings where `status='expired'` AND `updated_at < now() - 7 days`.

---

## The Critical Flow (End-to-End)

```
USER                FRONTEND              BACKEND             DB/REDIS
 │                      │                     │                    │
 │  Click "Hold Seats"  │                     │                    │
 ├─────────────────────→│                     │                    │
 │                      │  POST /bookings/hold│                    │
 │                      ├────────────────────→│                    │
 │                      │                     │ BEGIN TRANSACTION  │
 │                      │                     ├───────────────────→│
 │                      │                     │ SELECT FOR UPDATE  │
 │                      │                     ├───────────────────→│
 │                      │                     │ No conflicts?      │
 │                      │                     │ INSERT bookings    │
 │                      │                     ├───────────────────→│
 │                      │                     │ COMMIT             │
 │                      │                     ├───────────────────→│
 │                      │                     │ BullMQ schedule    │
 │                      │                     │ release-expired    │
 │                      │                     ├───────────────────→│
 │                      │                     │ emit seat:update   │
 │                      │                     │ (Socket.io)        │
 │                      │ ←───────────────────┤                    │
 │ ←────── 200 { holdId, heldUntil, total } ───┤                    │
 │                      │                     │                    │
 │  Click "Pay"         │                     │                    │
 ├─────────────────────→│                     │                    │
 │                      │ POST /payment/init  │                    │
 │                      ├────────────────────→│                    │
 │                      │                     │ Call gateway API   │
 │                      │                     │ Return paymentUrl  │
 │                      │ ←───────────────────┤                    │
 │ ←── Redirect to gateway ──┤                │                    │
 │                      │                     │                    │
 │  Pay on gateway page │                     │                    │
 │                      │                     │                    │
 │                      │                     │ Webhook POST       │
 │                      │                     │ /webhooks/payment  │
 │                      │                     │ Verify signature   │
 │                      │                     │ Update booking:    │
 │                      │                     │ status='paid'      │
 │                      │                     ├───────────────────→│
 │                      │                     │ emit seat:update   │
 │                      │                     │ status='booked'    │
 │                      │                     ├───────────────────→│
 │                      │                     │ BullMQ cancel      │
 │                      │                     │ release job        │
 │                      │ ←── 200 OK ──────────┤                    │
 │  Redirect to /confirmed                     │                    │
 │ ←─────────────────────┤                    │                    │
 │                      │                     │                    │
```

---

## Why These Choices?

### Why Postgres over MongoDB?

| Concern | Postgres ✅ | MongoDB ❌ |
|---|---|---|
| Booking atomicity | `SELECT ... FOR UPDATE` works | Possible but harder |
| Partial unique index | Native SQL | Workaround with transactions |
| Relational joins | Natural | `$lookup` aggregation is slow |
| Consistency | ACID by default | Eventually consistent by default |
| Schema enforcement | Strong | Flexible but error-prone |

### Why Socket.io over Server-Sent Events?

| Concern | Socket.io ✅ | SSE ❌ |
|---|---|---|
| Bidirectional | Yes | One-way only |
| Auto-reconnect | Built-in | Manual |
| Room management | Native | DIY |
| Browser support | Universal | Mostly OK |

### Why BullMQ over `setInterval`?

| Concern | BullMQ ✅ | setInterval ❌ |
|---|---|---|
| Survives restart | Yes (Redis-backed) | No |
| Retries | Built-in | Manual |
| Concurrency control | Yes | Manual |
| Monitoring UI | Yes (Bull Board) | None |
| Distributed workers | Yes | Race conditions |

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| **SQL injection** | Parameterized queries (Prisma or `pg`) |
| **XSS** | React auto-escapes; no `dangerouslySetInnerHTML` |
| **CSRF** | SameSite=Strict cookies + JWT in Authorization header |
| **Double-booking** | Partial unique index + `SELECT FOR UPDATE` |
| **Payment spoofing** | HMAC signature verification on every webhook |
| **Rate limiting** | `express-rate-limit` on auth + hold endpoints |
| **Password storage** | bcrypt with 10+ rounds |
| **JWT secret** | Min 32 chars, env var, rotated periodically |
| **Webhook idempotency** | Store `event_id` and dedupe |
