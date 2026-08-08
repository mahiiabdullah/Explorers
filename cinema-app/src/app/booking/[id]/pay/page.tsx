'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { PaymentForm } from '@/components/booking/PaymentForm';
import { ErrorState, LoadingState } from '@/components/shared/ErrorState';
import { api, endpoints } from '@/lib/api';
import type { BackendSeat, Booking, BookingDetail, Movie, Showtime } from '@/lib/types';

export default function PayPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = () => {
    setLoading(true);
    setError(null);
    api.get<BookingDetail>(endpoints.booking(id)).then(({ data, error }) => {
      if (error) {
        setError(error.message);
        setBooking(null);
      } else {
        setBooking(data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Resolve showtime + movie for convenience fee / display
  useEffect(() => {
    if (!booking) return;
    api.get<Movie[]>(endpoints.movies()).then(({ data }) => {
      if (!Array.isArray(data)) return;
      for (const m of data) {
        const sts = (m as Movie).showtimes;
        if (!Array.isArray(sts)) continue;
        const match = sts.find((s) => s.id === booking.showtimeId);
        if (match) {
          setShowtime(match);
          setMovie(m);
          break;
        }
      }
    });
  }, [booking]);

  const summary: Booking | null = useMemo(() => {
    if (!booking) return null;
    const seats: BackendSeat[] = booking.seats ?? [];
    const theatreName = showtime?.screen?.theatre.name ?? 'Theatre';
    return {
      id: booking.id,
      userId: booking.userId,
      showtimeId: booking.showtimeId,
      status: booking.status,
      amount: booking.amount,
      totalAmount: booking.amount,
      expiresAt: booking.expiresAt,
      heldUntil: booking.expiresAt ?? undefined,
      createdAt: booking.createdAt,
      seats,
      movie: {
        id: movie?.id ?? '',
        title: movie?.title ?? 'Booking',
        posterUrl: movie?.posterUrl ?? '',
        durationMin: movie?.durationMin ?? 0,
        rating: movie?.rating ?? 0,
      },
      theatre: {
        id: showtime?.screen?.theatre.id ?? '',
        name: theatreName,
      },
      screen: {
        id: showtime?.screen?.id ?? booking.showtimeId,
        name: showtime?.screen?.name ?? 'Screen',
      },
      startsAt: showtime?.startsAt ?? booking.createdAt,
    };
  }, [booking, movie, showtime]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <LoadingState message="Loading booking…" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container max-w-4xl py-8">
        <ErrorState
          title={error ?? 'Booking not found'}
          description="The booking may have expired."
          onRetry={fetchBooking}
        />
      </div>
    );
  }

  if (!summary) return null;

  const convenienceFee = 3000;

  return (
    <div className="container max-w-4xl py-8">
      <Link href={`/showtimes/${booking.showtimeId}/seat-map`}>
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to seats
        </Button>
      </Link>

      <h1 className="mb-8 font-display text-4xl text-cinema-gradient">COMPLETE PAYMENT</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <BookingSummary booking={summary} />
        <PaymentForm bookingId={booking.id} totalAmount={booking.amount + convenienceFee} />
      </div>
    </div>
  );
}