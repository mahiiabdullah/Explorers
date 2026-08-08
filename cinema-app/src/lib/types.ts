// Shared types — kept in sync with backend contract.
// See D:\Explorer\Structure\04-schema-reconciliation.md for the mapping rules.
//
// Backend uses Prisma cuids for IDs. Booking IDs are returned as cuid strings.

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';
export type SeatType = 'REGULAR' | 'PREMIUM' | 'RECLINER' | 'COUPLE';
export type BookingStatus = 'HELD' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'upi' | 'card' | 'wallet';
export type MovieGenre = 'ACTION' | 'COMEDY' | 'DRAMA';

// Display-friendly aliases (frontend components sometimes lowercase these).
export type SeatStatusLower = 'available' | 'held' | 'booked';
export type SeatTypeLower = 'regular' | 'premium' | 'recliner' | 'couple';
export type BookingStatusLower = 'held' | 'paid' | 'expired';

export interface Theatre {
  id: string;
  name: string;
  city: string;
  address?: string;
}

export interface Screen {
  id: string;
  name: string;
  theatre: Theatre;
}

export interface Showtime {
  id: string;
  movieId: string;
  screenId: string;
  basePrice: number;
  startsAt: string;
  screen?: Screen;
}

export interface Movie {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string;
  durationMin: number;
  rating: number;
  genre?: MovieGenre;
  releaseDate?: string;
  showtimes?: Showtime[];
}

/** Seat as returned by `GET /showtimes/:id/seats`. */
export interface BackendSeat {
  showSeatId: string;
  seatId: string;
  row: string;
  number: number;
  type: SeatType;
  status: SeatStatus;
  bookingId?: string | null;
  holdExpiresAt?: string | null;
}

/** Seat in the frontend shape the seat-map components consume. */
export interface Seat {
  /** Derived human-readable id, e.g. "A5". */
  id: string;
  /** The backend's per-showtime ShowSeat id (used for hold requests). */
  showSeatId: string;
  row: string;
  col: number;
  seatType: SeatTypeLower;
  priceModifier: number;
  status: SeatStatusLower;
  heldUntil?: string;
  heldBy?: string;
}

export interface SeatMapResponse {
  showtimeId: string;
  rows: number;
  cols: number;
  seats: Seat[];
  basePrice: number;
  viewerCount: number;
}

/** Summary view of a booking enriched with display context (movie/theatre/screen/start time). */
export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  status: BookingStatus | BookingStatusLower;
  amount: number;
  totalAmount: number;
  expiresAt?: string | null;
  heldUntil?: string;
  createdAt: string;
  seats: BackendSeat[];
  movie: Pick<Movie, 'id' | 'title' | 'posterUrl' | 'durationMin' | 'rating'>;
  theatre: { id: string; name: string };
  screen: { id: string; name: string };
  startsAt: string;
}

export interface BookingDetail extends Booking {
  payment?: {
    id: string;
    status: PaymentStatus;
    amount: number;
    gatewayPaymentId?: string | null;
  } | null;
}

export interface ShowSeat {
  id: string;
  showtimeId: string;
  seatId: string;
  status: SeatStatus;
  bookingId?: string | null;
  holdExpiresAt?: string | null;
}

export interface HoldResponse {
  booking: Booking;
  seats: ShowSeat[];
}

export interface ConfirmBookingResponse {
  booking: Booking;
}

export interface PaymentChargeResponse {
  payment: {
    id: string;
    bookingId: string;
    status: PaymentStatus;
    gatewayPaymentId: string;
    amount: number;
  };
  gatewayResponse: {
    payment_id: string;
    redirect_url: string;
    status: 'PENDING' | 'SUCCEEDED';
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Backend uses { success, message, data } envelope on success and
 * { success: false, message, error } on failure (see backend/src/app/shared/sendResponse.ts).
 * Frontend normalizes both shapes into this ApiResponse envelope.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

// WebSocket event payloads
export interface SeatUpdateEvent {
  showtimeId: string;
  seatId: string;
  status: SeatStatusLower;
  heldUntil?: string;
  userId?: string;
}

export interface ViewerCountEvent {
  showtimeId: string;
  count: number;
}