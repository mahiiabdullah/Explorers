import type { BackendSeat, Seat, SeatStatusLower, SeatTypeLower } from './types';

/** Converts a backend seat row to the frontend Seat shape (id = "A5"). */
export function toFrontendSeat(b: BackendSeat): Seat {
  const status: SeatStatusLower =
    b.status === 'AVAILABLE' ? 'available' : b.status === 'HELD' ? 'held' : 'booked';
  const seatType: SeatTypeLower =
    b.type === 'PREMIUM' ? 'premium' : b.type === 'RECLINER' ? 'recliner' : b.type === 'COUPLE' ? 'couple' : 'regular';
  return {
    id: `${b.row}${b.number}`,
    showSeatId: b.showSeatId,
    row: b.row,
    col: b.number,
    seatType,
    // Backend doesn't track priceModifier yet — every seat uses 1.0 until the
    // schema is extended. See 04-schema-reconciliation.md.
    priceModifier: 1.0,
    status,
    heldUntil: b.holdExpiresAt ?? undefined,
  };
}

export function seatLabel(row: string, number: number): string {
  return `${row}${number}`;
}