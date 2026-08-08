// Shared types — keep in sync with backend

export type SeatStatus = 'available' | 'held' | 'booked';

export interface Seat {
  id: string;
  row: string;
  col: number;
  seatType: 'regular' | 'premium' | 'recliner' | 'couple';
  priceModifier: number;
  status: SeatStatus;
  heldUntil?: string;
  heldBy?: string;
}

export interface Screen {
  id: number;
  theatreId: number;
  name: string;
  rows: number;
  cols: number;
}

export interface Theatre {
  id: number;
  name: string;
  address: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  durationMin: number;
  rating: number;
  genre: string;
  releaseDate: string;
}

export interface Showtime {
  id: number;
  movieId: number;
  screenId: number;
  theatreName: string;
  startsAt: string;
  basePrice: number;
  availableSeats: number;
  totalSeats: number;
}

export type BookingStatus = 'held' | 'paid' | 'expired';

export interface Booking {
  id: string;
  userId: string;
  showtimeId: number;
  movie: Pick<Movie, 'id' | 'title' | 'posterUrl' | 'durationMin'>;
  theatre: Pick<Theatre, 'id' | 'name'>;
  screen: Pick<Screen, 'id' | 'name'>;
  seats: Seat[];
  startsAt: string;
  status: BookingStatus;
  heldUntil?: string;
  totalAmount: number;
  paymentId?: string;
  createdAt: string;
}

export interface SeatMapResponse {
  showtimeId: number;
  rows: number;
  cols: number;
  seats: Seat[];
  basePrice: number;
  viewerCount: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

// WebSocket event payloads
export interface SeatUpdateEvent {
  showtimeId: number;
  seatId: string;
  status: SeatStatus;
  heldUntil?: string;
  userId?: string;
}

export interface ViewerCountEvent {
  showtimeId: number;
  count: number;
}
