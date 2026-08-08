# 01 — Entities, Relationships & User Roles

> Foundation document. Defines what we're modeling and who's using it.

---

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│  │   theatres   │ 1───∞│   screens    │ 1───∞ │    seats     │      │
│  └──────────────┘      └──────────────┘      └──────────────┘      │
│        │                       │                       │            │
│        │                       │                       │            │
│        │                       └──────┐                │            │
│        │                              ↓ 1              │            │
│        │                       ┌──────────────┐         │            │
│        │                       │  showtimes   │ ∞───────┘            │
│        │                       └──────────────┘                       │
│        │                              ↑ 1                             │
│        │                              │                               │
│        │                       ┌──────────────┐                       │
│        └───────────────────────│    movies    │                       │
│                                └──────────────┘                       │
│                                                                      │
│  ┌──────────────┐                                                    │
│  │    users     │                                                    │
│  └──────────────┘                                                    │
│        │ 1                                                            │
│        │                                                              │
│        │ ∞                                                            │
│  ┌──────────────┐         ┌──────────────┐                          │
│  │   bookings   │ ∞──────1│   payments   │                          │
│  └──────────────┘         └──────────────┘                          │
│        │ ∞                                                            │
│        │ 1                                                            │
│  ┌──────────────┐                                                    │
│  │    seats     │  (via showtime)                                   │
│  └──────────────┘                                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Entities (9 Total)

### 1. `theatres`
Physical cinema locations. Pre-populated.

| Field | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `name` | VARCHAR(200) NOT NULL | e.g. "PVR Phoenix" |
| `address` | TEXT | |
| `city` | VARCHAR(100) | |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |

### 2. `screens`
Auditorium/halls inside a theatre. Pre-populated.

| Field | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `theatre_id` | INTEGER REFERENCES theatres(id) | |
| `name` | VARCHAR(50) | e.g. "Screen 4" |
| `rows` | SMALLINT NOT NULL | e.g. 10 |
| `cols` | SMALLINT NOT NULL | e.g. 15 |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |

### 3. `seats`
Individual seats in a screen. Pre-populated.

| Field | Type | Notes |
|---|---|---|
| `id` | VARCHAR(10) PRIMARY KEY | e.g. "A5" |
| `screen_id` | INTEGER REFERENCES screens(id) | |
| `row_label` | VARCHAR(2) NOT NULL | e.g. "A" |
| `col_number` | SMALLINT NOT NULL | e.g. 5 |
| `seat_type` | VARCHAR(20) DEFAULT 'regular' | regular / premium / recliner / couple |
| `price_modifier` | DECIMAL(3,2) DEFAULT 1.00 | 1.40 for premium |

### 4. `movies`
Films being shown. Pre-populated.

| Field | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `title` | VARCHAR(200) NOT NULL | |
| `description` | TEXT | |
| `poster_url` | TEXT | |
| `duration_min` | SMALLINT NOT NULL | |
| `rating` | DECIMAL(2,1) | 0.0 to 10.0 |
| `genre` | VARCHAR(50) | |
| `release_date` | DATE | |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |

### 5. `showtimes`
A specific screening of a movie in a specific screen. Pre-populated.

| Field | Type | Notes |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `movie_id` | INTEGER REFERENCES movies(id) | |
| `screen_id` | INTEGER REFERENCES screens(id) | |
| `starts_at` | TIMESTAMPTZ NOT NULL | |
| `base_price` | INTEGER NOT NULL | in paise (₹350 = 35000) |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |

### 6. `users`
Customers who can book tickets.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PRIMARY KEY DEFAULT gen_random_uuid() | |
| `email` | VARCHAR(200) UNIQUE NOT NULL | |
| `password_hash` | VARCHAR(200) NOT NULL | bcrypt |
| `name` | VARCHAR(200) NOT NULL | |
| `phone` | VARCHAR(20) | optional |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |

### 7. `bookings` ⭐ (HOT TABLE)
A user's seat reservation or confirmed booking.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PRIMARY KEY DEFAULT gen_random_uuid() | |
| `user_id` | UUID REFERENCES users(id) | |
| `showtime_id` | INTEGER REFERENCES showtimes(id) | |
| `seat_id` | VARCHAR(10) REFERENCES seats(id) | |
| `status` | VARCHAR(20) NOT NULL | 'held' / 'paid' / 'expired' |
| `held_until` | TIMESTAMPTZ | when status='held' |
| `payment_id` | VARCHAR(200) | gateway payment id |
| `amount` | INTEGER NOT NULL | in paise |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ DEFAULT NOW() | |

**Critical constraints:**
```sql
-- Prevent double-booking: only ONE active (held or paid) booking per seat per showtime
CREATE UNIQUE INDEX idx_one_active_booking_per_seat
  ON bookings(showtime_id, seat_id)
  WHERE status IN ('held', 'paid');

-- Speed up hot queries
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_held_until ON bookings(held_until) WHERE status = 'held';
CREATE INDEX idx_showtimes_movie ON showtimes(movie_id, starts_at);
```

### 8. `payments`
Payment transactions.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PRIMARY KEY | |
| `booking_id` | UUID REFERENCES bookings(id) UNIQUE | one payment per booking |
| `gateway_payment_id` | VARCHAR(200) UNIQUE NOT NULL | from gateway |
| `amount` | INTEGER NOT NULL | in paise |
| `status` | VARCHAR(20) NOT NULL | pending / paid / failed / refunded |
| `method` | VARCHAR(20) | upi / card / wallet |
| `created_at` | TIMESTAMPTZ DEFAULT NOW() | |
| `paid_at` | TIMESTAMPTZ | |

### 9. `webhook_events` (idempotency)
Prevents duplicate processing of payment webhooks.

| Field | Type | Notes |
|---|---|---|
| `id` | VARCHAR(200) PRIMARY KEY | gateway event id |
| `processed_at` | TIMESTAMPTZ DEFAULT NOW() | |

---

## Relationships Summary

| Parent | Child | Cardinality | FK Action |
|---|---|---|---|
| theatre | screen | 1:N | ON DELETE RESTRICT |
| screen | seat | 1:N | ON DELETE CASCADE |
| movie | showtime | 1:N | ON DELETE RESTRICT |
| screen | showtime | 1:N | ON DELETE RESTRICT |
| user | booking | 1:N | ON DELETE CASCADE |
| showtime | booking | 1:N | ON DELETE RESTRICT |
| seat | booking | 1:N | ON DELETE RESTRICT |
| booking | payment | 1:1 | ON DELETE CASCADE |

---

## User Roles

### Roles Identified

| Role | Purpose | Auth Required |
|---|---|---|
| **Customer** | Browse, book, pay, manage bookings | Yes (email/password + optional OTP) |
| **Guest** | Browse movies only (no booking) | No |
| **System Worker** | Release expired holds, retry webhooks | Service token (env) |

### Explicitly Excluded

❌ **Admin role** — The brief says: *"You do not need a cinema admin portal. Pre-populate the database."*

### Capability Matrix

| Capability | Guest | Customer | System Worker |
|---|---|---|---|
| Browse movies | ✅ | ✅ | ❌ |
| View showtimes | ✅ | ✅ | ❌ |
| View seat map | ✅ | ✅ | ❌ |
| Sign up / Login | ✅ | ❌ (already auth) | ❌ |
| Hold seats | ❌ | ✅ | ❌ |
| Initiate payment | ❌ | ✅ | ❌ |
| View own bookings | ❌ | ✅ | ❌ |
| Receive webhooks | ❌ | ❌ | ✅ |
| Release expired holds | ❌ | ❌ | ✅ |
