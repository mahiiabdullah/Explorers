'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Download, CalendarPlus, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfettiOnMount } from '@/components/magicui/confetti';
import { ErrorState, LoadingState } from '@/components/shared/ErrorState';
import { api, endpoints } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import type { BookingDetail, Showtime } from '@/lib/types';

export default function ConfirmedPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    const fetchBooking = () => {
      api.get<BookingDetail>(endpoints.booking(id)).then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setError(error.message);
          return;
        }
        setBooking(data);
        if (data && data.status === 'CONFIRMED') {
          // We can stop polling once we know the booking is confirmed.
        }
      });
    };

    fetchBooking();
    const interval = setInterval(() => {
      attempts += 1;
      if (attempts > 30) {
        clearInterval(interval);
        return;
      }
      fetchBooking();
    }, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id]);

  // Resolve showtime info for display
  useEffect(() => {
    if (!booking) return;
    api.get<unknown[]>(endpoints.movies()).then(({ data }) => {
      if (!Array.isArray(data)) return;
      for (const movie of data) {
        const sts = (movie as { showtimes?: Showtime[] }).showtimes;
        if (!Array.isArray(sts)) continue;
        const match = sts.find((s) => s.id === booking.showtimeId);
        if (match) {
          setShowtime(match);
          break;
        }
      }
    });
  }, [booking]);

  const isConfirmed = booking?.status === 'CONFIRMED';

  if (error && !booking) {
    return (
      <div className="container max-w-2xl py-12">
        <ErrorState title="Could not load booking" description={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container max-w-2xl py-12">
        <LoadingState message="Confirming your booking…" />
      </div>
    );
  }

  if (!isConfirmed) {
    return (
      <div className="container max-w-2xl py-12">
        <LoadingState message="Awaiting payment confirmation from the gateway…" />
        <p className="mt-4 text-center text-xs text-cinema-muted">
          If this takes more than 30 seconds, please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <ConfettiOnMount />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-cinema-amber bg-cinema-amber/10"
      >
        <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Check className="h-12 w-12 text-cinema-amber" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center font-display text-5xl text-cinema-gradient md:text-6xl"
      >
        BOOKING CONFIRMED!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center text-cinema-muted"
      >
        Your seats are locked in. See you at the movies.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-12">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-cinema-border pb-4">
              <span className="text-sm text-cinema-muted">Booking ID</span>
              <span className="font-mono text-white">{booking.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Theatre</span>
              <span className="text-white">{showtime?.screen?.theatre.name ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Date & Time</span>
              <span className="text-white">
                {showtime ? `${formatDate(showtime.startsAt)} · ${formatTime(showtime.startsAt)}` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Seats</span>
              <span className="text-white">
                {(booking.seats ?? []).map((s) => `${s.row}${s.number}`).join(', ') || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Amount</span>
              <span className="text-white">৳{(booking.amount / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Ticket
          </Button>
          <Button variant="outline" className="flex-1">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add to Calendar
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/bookings">
            <Button>
              <Ticket className="mr-2 h-4 w-4" />
              View All Bookings
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}