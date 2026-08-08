# Cinema Ticket Backend

This backend supports movie/showtime listing, seat holds, payment processing, and webhook-based booking confirmation.

## Key User Flow

1. User fetches movies and showtimes
2. User selects a showtime
3. User loads the seat map
4. User clicks a seat → `POST /api/v1/bookings/hold`
5. User clicks Pay → `POST /api/v1/payments/charge`
6. Gateway calls back → `POST /webhooks/payment`
7. Booking is confirmed and seats are marked `BOOKED`
8. Expired holds are auto-released whenever seat map is requested or a new hold is created
9. Concurrency is protected by database transactions and `updateMany` seat availability checks

## API Endpoints

### Movies
- `GET /api/v1/movies`
  - Returns movies with showtimes

### Seat Map
- `GET /api/v1/showtimes/:showtimeId/seats`
  - Returns the seat map for the showtime
  - Auto-releases expired held seats before returning results

### Hold Seats
- `POST /api/v1/bookings/hold`
  - Request body: `{ userId, showtimeId, seatIds }`
  - Places a hold on available seats for a short TTL
  - Uses a transaction to ensure only one request can hold the same seat

### Confirm Booking
- `POST /api/v1/bookings/:bookingId/confirm`
  - Confirms a held booking and marks seats as `BOOKED`

### Payment Charge
- `POST /api/v1/payments/charge`
  - Request body: `{ bookingId, amount, currency, callbackUrl, idempotencyKey?, mockMode?, mockForce? }`
  - Initiates payment and prevents duplicate charge attempts for the same booking

### Payment Webhook
- `POST /webhooks/payment`
  - Accepts gateway callback notifications with raw JSON body
  - Verifies HMAC signature using `GATEWAY_SECRET`
  - Deduplicates repeated events and confirms / fails the booking safely

### OTP
- `POST /api/v1/payments/otp/send`
- `POST /api/v1/payments/otp/verify`

### Refund
- `POST /api/v1/payments/refund`

## Concurrency and Safety

- Seat holds run inside a Prisma transaction.
- The hold flow updates only `AVAILABLE` seats and checks the number of rows affected.
- If any seat is already held or booked, the request fails with `409` and no partial hold is committed.
- Expiration cleanup runs before seat map retrieval and before new holds.

## Expected Behavior for Judges

- Only one of many concurrent requests for the same seat will succeed.
- Expired holds are automatically released.
- Gateway callbacks always return a `2xx` response to avoid retry loops.
- Seats become `BOOKED` only after payment confirmation.
