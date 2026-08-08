'use client';

import { useEffect, useState } from 'react';
import { useSeatMapStore } from '@/stores/seat-map-store';
import { connectSocket, joinShowtime, leaveShowtime, onSeatUpdate, onBulkSeatUpdate, onViewerCount } from '@/lib/socket';
import { api, endpoints } from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import type { SeatMapResponse, Seat } from '@/lib/types';

export function useSeatMap(showtimeId: string) {
  const seats = useSeatMapStore((s) => s.seats);
  const setSeats = useSeatMapStore((s) => s.setSeats);
  const updateSeat = useSeatMapStore((s) => s.updateSeat);
  const viewerCount = useSeatMapStore((s) => s.viewerCount);
  const setViewerCount = useSeatMapStore((s) => s.setViewerCount);
  const selectedIds = useSeatMapStore((s) => s.selectedIds);
  const clearSelection = useSeatMapStore((s) => s.clearSelection);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch — gracefully fall back to mock data on backend failure
  useEffect(() => {
    let mounted = true;

    // Skip backend fetch in development if NEXT_PUBLIC_API_URL is not set or returns errors
    // The seat-map page itself handles the mock data fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setLoading(false);
      return;
    }

    api.get<SeatMapResponse>(endpoints.showtimeSeats(showtimeId)).then(({ data, error }) => {
      if (!mounted) return;
      if (error || !data) {
        // Backend unavailable — silently fall back to mock data in page
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

  // WebSocket subscription — only if backend is configured
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const socket = connectSocket();
    joinShowtime(showtimeId);

    const unsubSeat = onSeatUpdate((e) => {
      if (e.showtimeId !== showtimeId) return;
      updateSeat(e.seatId, { status: e.status, heldUntil: e.heldUntil });

      if (selectedIds.includes(e.seatId) && e.status === 'booked') {
        clearSelection();
        toast({ type: 'error', title: 'Seat taken', description: `${e.seatId} was just booked by someone else.` });
      }

      if (e.status === 'held' && !selectedIds.includes(e.seatId)) {
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

  const selectedSeats: Seat[] = seats.filter((s) => selectedIds.includes(s.id));

  return { seats, loading, error, selectedSeats, viewerCount };
}
