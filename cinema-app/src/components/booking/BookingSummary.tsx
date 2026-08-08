import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import type { Booking } from '@/lib/types';

export function BookingSummary({ booking }: { booking: Booking }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex gap-4">
          <img
            src={booking.movie.posterUrl || '/placeholder.jpg'}
            alt={booking.movie.title}
            className="h-24 w-16 rounded-md object-cover"
          />
          <div className="flex-1 space-y-1">
            <h3 className="font-display text-2xl text-white">{booking.movie.title.toUpperCase()}</h3>
            <p className="text-sm text-cinema-muted">{booking.theatre.name}</p>
            <p className="text-xs text-cinema-muted">Screen {booking.screen.name}</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-cinema-border pt-4 text-sm">
          <div className="flex items-center gap-2 text-cinema-muted">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(booking.startsAt)} · {formatTime(booking.startsAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-cinema-muted">
            <MapPin className="h-4 w-4" />
            <span>{booking.theatre.name}</span>
          </div>
          <div className="flex items-center gap-2 text-cinema-muted">
            <Ticket className="h-4 w-4" />
            <span>{booking.seats.map((s) => `${s.row}${s.number}`).join(', ')}</span>
          </div>
        </div>

        <div className="space-y-2 border-t border-cinema-border pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-cinema-muted">Subtotal</span>
            <span className="text-white">{formatCurrency(booking.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cinema-muted">Convenience fee</span>
            <span className="text-white">{formatCurrency(3000)}</span>
          </div>
          <div className="flex justify-between border-t border-cinema-border pt-2 text-lg font-semibold">
            <span className="text-white">Total</span>
            <span className="text-cinema-amber">{formatCurrency(booking.totalAmount + 3000)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
