'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SeatMap } from '@/components/seat-map/SeatMap';
import { SelectionSummary } from '@/components/seat-map/SelectionSummary';
import { useSeatMap } from '@/hooks/useSeatMap';
import { useSeatMapStore } from '@/stores/seat-map-store';
import { api, endpoints } from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import { formatCurrency } from '@/lib/utils';
import type { SeatMapResponse } from '@/lib/types';

// Mock fallback data for development before backend is ready
const MOCK_DATA: SeatMapResponse = {
  showtimeId: 101,
  rows: 10,
  cols: 15,
  basePrice: 35000,
  viewerCount: 12,
  seats: Array.from({ length: 10 }, (_, row) =>
    Array.from({ length: 15 }, (_, col) => {
      const id = `${String.fromCharCode(65 + row)}${col + 1}`;
      const isBooked = Math.random() < 0.3;
      const isHeld = !isBooked && Math.random() < 0.1;
      const isPremium = row >= 6;
      return {
        id,
        row: String.fromCharCode(65 + row),
        col: col + 1,
        seatType: (isPremium ? 'premium' : 'regular') as 'regular' | 'premium' | 'recliner' | 'couple',
        priceModifier: isPremium ? 1.4 : 1.0,
        status: (isBooked ? 'booked' : isHeld ? 'held' : 'available') as 'booked' | 'held' | 'available',
      };
    }),
  ).flat(),
};

export default function SeatMapPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const showtimeId = Number(id);
  const [holding, setHolding] = useState(false);
  // Note: before backend is wired, fall back to mock data
  const { loading, error } = useSeatMap(showtimeId);
  const seats = useSeatMapStore((s) => s.seats);
  const viewerCount = useSeatMapStore((s) => s.viewerCount);
  const selectedIds = useSeatMapStore((s) => s.selectedIds);
  const setHeldUntil = useSeatMapStore((s) => s.setHeldUntil);
  const clearSelection = useSeatMapStore((s) => s.clearSelection);

  // Use mock data until backend integration
  const data = seats.length > 0 ? { seats, rows: MOCK_DATA.rows, cols: MOCK_DATA.cols, basePrice: MOCK_DATA.basePrice } : MOCK_DATA;
  const selectedSeats = data.seats.filter((s) => selectedIds.includes(s.id));

  const handleHold = async () => {
    if (selectedSeats.length === 0) return;
    setHolding(true);
    const seatIds = selectedIds;
    const { data: res, error } = await api.post<{ bookingId: string; heldUntil: string }>(endpoints.holdBooking(), {
      showtimeId,
      seatIds,
    });

    if (error) {
      toast({ type: 'error', title: 'Could not hold seats', description: error.message });
      setHolding(false);
      return;
    }

    if (res) {
      setHeldUntil(new Date(res.heldUntil));
      toast({ type: 'success', title: 'Seats held!', description: 'You have 10 minutes to complete payment.' });
      router.push(`/booking/${res.bookingId}/pay`);
    }
    setHolding(false);
  };

  return (
    <div className="container py-8">
      <Link href="/movies">
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
              <p className="mt-1 text-sm text-cinema-muted">Dune Part Three · PVR Phoenix · Today, 19:30</p>
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
            <div className="flex h-64 items-center justify-center">
              <p className="text-cinema-muted">Loading seat map…</p>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
              <p className="text-cinema-crimson">Failed to load seats</p>
              <p className="text-xs text-cinema-muted">{error}</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <SeatMap seats={data.seats} rows={data.rows} cols={data.cols} basePrice={data.basePrice} />
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <SelectionSummary
          selectedSeats={selectedSeats}
          basePrice={data.basePrice}
          onConfirm={handleHold}
          loading={holding}
        />
      </div>
    </div>
  );
}
