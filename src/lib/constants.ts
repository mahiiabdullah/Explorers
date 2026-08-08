// App-wide constants
export const APP_NAME = 'Cinema';
export const APP_TAGLINE = 'Your Seat. Your Story.';

// Backend hard-codes HOLD_DURATION_MINUTES = 5 in booking.service.ts.
// Keep frontend timer in sync so the hold-timer UI doesn't show a fake
// 10-minute window when the backend will actually expire in 5.
export const HOLD_DURATION_SECONDS = 300; // 5 minutes
export const HOLD_DURATION_MS = HOLD_DURATION_SECONDS * 1000;

export const SEAT_STATES = {
  AVAILABLE: 'available',
  HELD: 'held',
  BOOKED: 'booked',
  YOURS: 'yours',
} as const;

export type SeatStatus = (typeof SEAT_STATES)[keyof typeof SEAT_STATES];

export const SEAT_PRICE_LABELS = {
  regular: 'Regular',
  premium: 'Premium',
  recliner: 'Recliner',
  couple: 'Couple',
} as const;

export const GENRES = [
  'Action',
  'Drama',
  'Sci-Fi',
  'Comedy',
  'Thriller',
  'Romance',
  'Horror',
  'Animation',
] as const;

export const TIMER_WARN_THRESHOLDS = {
  GREEN: 300,  // >5 min
  AMBER: 120,  // 2-5 min
  RED: 0,      // <2 min
} as const;

export const API_VERSION_PREFIX = '/api/v1';

// Backend mounts its routes at /api/v1. Override the host only; the version
// prefix is applied centrally by the API client.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
