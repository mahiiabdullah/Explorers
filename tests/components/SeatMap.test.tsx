import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SeatMap } from '@/components/seat-map/SeatMap';
import { useSeatMapStore } from '@/stores/seat-map-store';
import type { Seat } from '@/lib/types';

const MOCK_SEATS: Seat[] = [
  { id: 'A1', row: 'A', col: 1, seatType: 'regular', priceModifier: 1, status: 'available' },
  { id: 'A2', row: 'A', col: 2, seatType: 'regular', priceModifier: 1, status: 'booked' },
  { id: 'A3', row: 'A', col: 3, seatType: 'regular', priceModifier: 1, status: 'held' },
  { id: 'B1', row: 'B', col: 1, seatType: 'premium', priceModifier: 1.4, status: 'available' },
];

describe('SeatMap', () => {
  beforeEach(() => {
    useSeatMapStore.setState({ seats: [], selectedIds: new Set() });
  });

  it('renders all seats', () => {
    render(<SeatMap seats={MOCK_SEATS} rows={2} cols={3} basePrice={35000} />);
    expect(screen.getAllByLabelText(/Seat A1/)).toHaveLength(1);
    expect(screen.getAllByLabelText(/Seat B1/)).toHaveLength(1);
  });

  it('disables booked seats', () => {
    render(<SeatMap seats={MOCK_SEATS} rows={2} cols={3} basePrice={35000} />);
    const bookedSeat = screen.getByLabelText(/Seat A2/);
    expect(bookedSeat).toBeDisabled();
  });

  it('disables held seats', () => {
    render(<SeatMap seats={MOCK_SEATS} rows={2} cols={3} basePrice={35000} />);
    const heldSeat = screen.getByLabelText(/Seat A3/);
    expect(heldSeat).toBeDisabled();
  });
});
