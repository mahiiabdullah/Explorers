'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SeatMap } from '@/components/seat-map/SeatMap';
import { SelectionSummary } from '@/components/seat-map/SelectionSummary';
import { ErrorState, LoadingState } from '@/components/shared/ErrorState';
import { useAuthStore } from '@/stores/auth-store';
import { useSeatMapStore } from '@/stores/seat-map-store';
import { api, endpoints } from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import { toFrontendSeat } from '@/lib/seats';
import type { BackendSeat, HoldResponse, Showtime } from '@/lib/types';

export default function SeatMapPage({ params }: { params: { id: string } }) {
  const { id: showtimeId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [layout, setLayout] = useState<{ rows: number; cols: number; theatreName?: string }>({
    rows: 0,
    cols: 0,
  });
  const [holding, setHolding] = useState(false);
  const user = useAuthStore((s) => s.user);

  const seats = useSeatMapStore((s) => s.seats);
  const setSeats = useSeatMapStore((s) => s.setSeats);
  const viewerCount = useSeatMapStore((s) => s.viewerCount);
  const selectedIds = useSeatMapStore((s) => s.selectedIds);
  const setHeldUntil = useSeatMapStore((s) => s.setHeldUntil);
  const clearSelection = useSeatMapStore((s) => s.clearSelection);

  const fetchSeats = () => {
    setLoading(true);
    setError(null);
    api
      .get<BackendSeat[]>(endpoints.showtimeSeats(showtimeId))
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setSeats([]);
        } else {
          const list = data ?? [];
          setSeats(list.map(toFrontendSeat));
          // Derive rows/cols from the actual seat set.
          const rowSet = new Set(list.map((s) => s.row));
          const cols = list.length > 0 ? Math.max(...list.map((s) => s.number)) : 0;
          setLayout((prev) => ({ ...(prev ?? {}), rows: rowSet.size, cols }));
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSeats();
    return () => clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showtimeId]);

  // Resolve basePrice from the first seat's booking via showtime lookup,
  // otherwise default to 0 — the seat map UI shows prices per-row even if
  // we don't know the showtime price yet.
  useEffect(() => {
    // Try to derive basePrice from the showtime list endpoint indirectly —
    // we don't have GET /showtimes/:id, but movies include showtimes.
    api.get<unknown[]>(endpoints.movies()).then(({ data }) => {
      if (!Array.isArray(data)) return;
      for (const movie of data) {
        const sts = (movie as { showtimes?: Showtime[] }).showtimes;
        if (!Array.isArray(sts)) continue;
        const match = sts.find((s) => s.id === showtimeId);
        if (match) {
          setBasePrice(match.basePrice);
          setShowtime((prev) => ({
            id: match.id,
            movieId: match.movieId,
            screenId: match.screenId,
            basePrice: match.basePrice,
            startsAt: match.startsAt,
            ...(prev ?? {}),
          }));
          setLayout((prev) => ({
            ...prev,
            theatreName: match.screen?.theatre.name,
          }));
          break;
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showtimeId]);

  const selectedSeats = useMemo(() => seats.filter((s) => selectedIds.includes(s.id)), [seats, selectedIds]);

  const handleHold = async () => {
    if (selectedSeats.length === 0) return;
    if (!user) {
      toast({ type: 'error', title: 'Please log in to hold seats' });
      return;
    }
    setHolding(true);
    // Convert the user-facing seat labels ("A5") into backend showSeatIds.
    const seatIds = selectedSeats.map((s) => s.showSeatId);
    const { data: res, error } = await api.post<HoldResponse>(endpoints.holdBooking(), {
      userId: user.id,
      showtimeId,
      seatIds,
    });

    if (error) {
      toast({ type: 'error', title: 'Could not hold seats', description: error.message });
      setHolding(false);
      return;
    }

    if (res?.booking) {
      setHeldUntil(res.booking.expiresAt ? new Date(res.booking.expiresAt) : null);
      toast({ type: 'success', title: 'Seats held!', description: 'You have 5 minutes to complete payment.' });
      router.push(`/booking/${res.booking.id}/pay`);
    }
    setHolding(false);
  };

  const rows = layout.rows;
  const cols = layout.cols;
  const theatreName = layout.theatreName;

  return (
    <div className="container py-8">
      <Link href={`/movies`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-white md:text-4xl">PICK YOUR SEATS</h1>
              <p className="mt-1 text-sm text-cinema-muted">
                {theatreName ?? 'Loading theatre…'}
                {showtime?.startsAt ? ` · ${new Date(showtime.startsAt).toLocaleString()}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-surface px-3 py-1.5">
                <Eye className="h-4 w-4 text-cinema-amber" />
                <span className="text-cinema-muted">{viewerCount} watching</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-surface px-3 py-1.5">
                <Users className="h-4 w-4 text-cinema-amber" />
                <span className="text-cinema-muted">{selectedSeats.length} selected</span>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingState message="Loading seat map…" />
          ) : error ? (
            <ErrorState
              title="Could not load seats"
              description={error}
              onRetry={fetchSeats}
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <SeatMap seats={seats} rows={rows} cols={cols} basePrice={basePrice} />
            </motion.div>
          )}
        </CardContent>
      </Card>

      {!loading && !error && (
        <div className="mt-6">
          <SelectionSummary
            selectedSeats={selectedSeats}
            basePrice={basePrice}
            onConfirm={handleHold}
            loading={holding}
          />
        </div>
      )}
    </div>
  );
}