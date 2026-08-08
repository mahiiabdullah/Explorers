'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate, formatTime } from '@/lib/utils';
import type { Booking } from '@/lib/types';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk_001',
    userId: 'user_1',
    showtimeId: 101,
    movie: { id: 1, title: 'Dune Part Three', posterUrl: '', durationMin: 165, rating: 9.1, genre: '', description: '', releaseDate: '' },
    theatre: { id: 1, name: 'PVR Phoenix' },
    screen: { id: 4, name: '4' },
    seats: [{ id: 'E5', row: 'E', col: 5, seatType: 'premium', priceModifier: 1, status: 'paid' }],
    startsAt: '2026-08-15T19:30:00Z',
    status: 'paid',
    totalAmount: 49000,
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'bk_002',
    userId: 'user_1',
    showtimeId: 87,
    movie: { id: 2, title: 'Inception 2', posterUrl: '', durationMin: 148, rating: 8.4, genre: '', description: '', releaseDate: '' },
    theatre: { id: 2, name: 'INOX Forum' },
    screen: { id: 7, name: '7' },
    seats: [{ id: 'B3', row: 'B', col: 3, seatType: 'regular', priceModifier: 1, status: 'paid' }],
    startsAt: '2026-08-12T15:00:00Z',
    status: 'paid',
    totalAmount: 35000,
    createdAt: '2026-08-05T09:00:00Z',
  },
];

const STATUS_LABELS = {
  paid: { label: 'CONFIRMED', variant: 'default' as const },
  held: { label: 'PENDING PAYMENT', variant: 'secondary' as const },
  expired: { label: 'EXPIRED', variant: 'destructive' as const },
};

export default function BookingsPage() {
  const now = new Date();
  const upcoming = MOCK_BOOKINGS.filter((b) => new Date(b.startsAt) > now);
  const past = MOCK_BOOKINGS.filter((b) => new Date(b.startsAt) <= now);

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
            upcoming.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {past.length === 0 ? (
            <EmptyState title="No past bookings" />
          ) : (
            past.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const status = STATUS_LABELS[booking.status];
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
              <h3 className="font-display text-2xl text-white">{booking.movie.title.toUpperCase()}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-cinema-muted">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(booking.startsAt)} · {formatTime(booking.startsAt)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {booking.theatre.name}
              </span>
            </div>
            <p className="text-sm text-cinema-muted">Seats: {booking.seats.map((s) => s.id).join(', ')}</p>
          </div>

          <Link href={`/booking/${booking.id}/confirmed`}>
            <Button variant="outline">View Ticket</Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
