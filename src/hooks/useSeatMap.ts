'use client';

import { useEffect, useState } from 'react';
import { useSeatMapStore } from '@/stores/seat-map-store';
import { connectSocket, joinShowtime, leaveShowtime, onSeatUpdate, onBulkSeatUpdate, onViewerCount } from '@/lib/socket';
import { api, endpoints } from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import type { SeatMapResponse, Seat } from '@/lib/types';

export function useSeatMap(showtimeId: number) {
  const { seats, setSeats, updateSeat, setViewerCount, selectedIds, clearSelection } = useSeatMapStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    api.get<SeatMapResponse>(endpoints.showtimeSeats(showtimeId)).then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data) {
        setError(error?.message ?? 'Failed to load seats');
        setLoading(false);
        return;
      }
      setSeats(data.seats);
      setViewerCount(data.viewerCount);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [showtimeId, setSeats, setViewerCount]);

  // WebSocket subscription
  useEffect(() => {
    const socket = connectSocket();
    joinShowtime(showtimeId);

    const unsubSeat = onSeatUpdate((e) => {
      if (e.showtimeId !== showtimeId) return;
      updateSeat(e.seatId, { status: e.status, heldUntil: e.heldUntil });

      // If user had selected this seat and someone else grabbed it, deselect
      if (selectedIds.has(e.seatId) && e.status === 'booked') {
        clearSelection();
        toast({ type: 'error', title: 'Seat taken', description: `${e.seatId} was just booked by someone else.` });
      }

      if (e.status === 'held' && !selectedIds.has(e.seatId)) {
        toast({ type: 'info', title: `Seat ${e.seatId} just got held` });
      }
    });

    const unsubBulk = onBulkSeatUpdate((updates) => {
      updates.forEach((u) => updateSeat(u.seatId, { status: u.status, heldUntil: u.heldUntil }));
    });

    const unsubViewer = onViewerCount((e) => {
      if (e.showtimeId === showtimeId) setViewerCount(e.count);
    });

    return () => {
      leaveShowtime(showtimeId);
      unsubSeat();
      unsubBulk();
      unsubViewer();
    };
  }, [showtimeId, updateSeat, selectedIds, clearSelection, setViewerCount]);

  const selectedSeats: Seat[] = seats.filter((s) => selectedIds.has(s.id));

  return { seats, loading, error, selectedSeats, viewerCount: useSeatMapStore.getState().viewerCount };
}
