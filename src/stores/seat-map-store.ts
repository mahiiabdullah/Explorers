import { create } from 'zustand';
import type { Seat } from '@/lib/types';

interface SeatMapState {
  // server-known seats
  seats: Seat[];
  setSeats: (seats: Seat[]) => void;
  updateSeat: (seatId: string, patch: Partial<Seat>) => void;

  // user-selected seats
  selectedIds: Set<string>;
  toggleSeat: (seatId: string) => void;
  clearSelection: () => void;

  // hold timer
  heldUntil: Date | null;
  setHeldUntil: (date: Date | null) => void;

  // meta
  viewerCount: number;
  setViewerCount: (n: number) => void;
}

export const useSeatMapStore = create<SeatMapState>((set) => ({
  seats: [],
  setSeats: (seats) => set({ seats }),
  updateSeat: (seatId, patch) =>
    set((state) => ({
      seats: state.seats.map((s) => (s.id === seatId ? { ...s, ...patch } : s)),
    })),

  selectedIds: new Set(),
  toggleSeat: (seatId) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return { selectedIds: next };
    }),
  clearSelection: () => set({ selectedIds: new Set() }),

  heldUntil: null,
  setHeldUntil: (heldUntil) => set({ heldUntil }),

  viewerCount: 0,
  setViewerCount: (viewerCount) => set({ viewerCount }),
}));
