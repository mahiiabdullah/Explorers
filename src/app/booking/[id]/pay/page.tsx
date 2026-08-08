'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { PaymentForm } from '@/components/booking/PaymentForm';
import type { Booking } from '@/lib/types';

const MOCK_BOOKING: Booking = {
  id: 'bk_123',
  userId: 'user_1',
  showtimeId: 101,
  movie: {
    id: 1,
    title: 'Dune Part Three',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop',
    durationMin: 165,
    rating: 9.1,
  },
  theatre: { id: 1, name: 'PVR Phoenix' },
  screen: { id: 4, name: '4' },
  seats: [
    { id: 'E5', row: 'E', col: 5, seatType: 'premium', priceModifier: 1.4, status: 'held' },
    { id: 'E6', row: 'E', col: 6, seatType: 'premium', priceModifier: 1.4, status: 'held' },
  ],
  startsAt: '2026-08-15T19:30:00Z',
  status: 'held',
  totalAmount: 98000,
  createdAt: '2026-08-10T10:00:00Z',
};

export default function PayPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const booking = { ...MOCK_BOOKING, id };
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
        <BookingSummary booking={booking} />
        <PaymentForm bookingId={booking.id} totalAmount={booking.totalAmount + convenienceFee} />
      </div>
    </div>
  );
}
