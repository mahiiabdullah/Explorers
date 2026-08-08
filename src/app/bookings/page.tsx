'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState, LoadingState } from '@/components/shared/ErrorState';
import { api, endpoints } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { formatDate, formatTime } from '@/lib/utils';
import type { BookingDetail, Showtime } from '@/lib/types';

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  CONFIRMED: { label: 'CONFIRMED', variant: 'default' },
  AWAITING_PAYMENT: { label: 'AWAITING PAYMENT', variant: 'secondary' },
  HELD: { label: 'PENDING PAYMENT', variant: 'secondary' },
  FAILED: { label: 'FAILED', variant: 'destructive' },
  EXPIRED: { label: 'EXPIRED', variant: 'destructive' },
  CANCELLED: { label: 'CANCELLED', variant: 'destructive' },
};

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [showtimeMap, setShowtimeMap] = useState<Record<string, Showtime>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    api
      .get<BookingDetail[]>(endpoints.bookings({ userId: user.id }))
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setBookings([]);
        } else {
          setBookings(data ?? []);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    refetch();
  }, [user?.id]);

  // Resolve showtime names for each booking
  useEffect(() => {
    api.get<unknown[]>(endpoints.movies()).then(({ data }) => {
      if (!Array.isArray(data)) return;
      const map: Record<string, Showtime> = {};
      for (const movie of data) {
        const sts = (movie as { showtimes?: Showtime[] }).showtimes;
        if (!Array.isArray(sts)) continue;
        for (const s of sts) map[s.id] = s;
      }
      setShowtimeMap(map);
    });
  }, []);

  if (loading) {
    return (
      <div className="container py-12">
        <LoadingState message="Loading your bookings…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <ErrorState title="Could not load bookings" description={error} onRetry={refetch} />
      </div>
    );
  }

  const now = new Date();
  const upcoming = bookings.filter((b) => {
    const st = showtimeMap[b.showtimeId];
    if (!st) return false;
    return new Date(st.startsAt) > now;
  });
  const past = bookings.filter((b) => {
    const st = showtimeMap[b.showtimeId];
    if (!st) return false;
    return new Date(st.startsAt) <= now;
  });

  return (
    <div className="container py-12">
      <h1 className="mb-8 font-display text-5xl text-cinema-gradient">MY BOOKINGS</h1>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming shows"
              description="Time to book your next cinema experience"
              actionLabel="Browse Movies"
              onAction={() => (window.location.href = '/movies')}
            />
          ) : (
            upcoming.map((b, i) => <BookingCard key={b.id} booking={b} showtime={showtimeMap[b.showtimeId]} index={i} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {past.length === 0 ? (
            <EmptyState title="No past bookings" />
          ) : (
            past.map((b, i) => <BookingCard key={b.id} booking={b} showtime={showtimeMap[b.showtimeId]} index={i} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingCard({
  booking,
  showtime,
  index,
}: {
  booking: BookingDetail;
  showtime?: Showtime;
  index: number;
}) {
  const status = STATUS_LABELS[booking.status] ?? STATUS_LABELS.HELD!;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <div className="flex-shrink-0">
            <div className="flex h-24 w-16 items-center justify-center rounded-md bg-cinema-surface">
              <Ticket className="h-8 w-8 text-cinema-muted" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-2xl text-white">
                {showtime?.screen?.theatre.name?.toUpperCase() ?? 'BOOKING'}
              </h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-cinema-muted">
              {showtime && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(showtime.startsAt)} · {formatTime(showtime.startsAt)}
                </span>
              )}
              {showtime?.screen?.theatre && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {showtime.screen.theatre.name}
                </span>
              )}
            </div>
            <p className="text-sm text-cinema-muted">
              Seats: {(booking.seats ?? []).map((s) => `${s.row}${s.number}`).join(', ') || '—'}
            </p>
            <p className="text-sm text-cinema-amber">৳{(booking.amount / 100).toFixed(2)}</p>
          </div>

          <Link href={`/booking/${booking.id}/confirmed`}>
            <Button variant="outline">View</Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}