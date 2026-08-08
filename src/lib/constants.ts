// App-wide constants
export const APP_NAME = 'Cinema';
export const APP_TAGLINE = 'Your Seat. Your Story.';

export const HOLD_DURATION_SECONDS = 600; // 10 minutes
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

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
