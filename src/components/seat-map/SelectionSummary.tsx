'use client';

import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { HoldTimer } from './HoldTimer';
import type { Seat } from '@/lib/types';
import { ArrowRight } from 'lucide-react';
import { useSeatMapStore } from '@/stores/seat-map-store';

interface SelectionSummaryProps {
  selectedSeats: Seat[];
  basePrice: number;
  onConfirm: () => void;
  loading?: boolean;
}

export function SelectionSummary({ selectedSeats, basePrice, onConfirm, loading }: SelectionSummaryProps) {
  const heldUntil = useSeatMapStore((s) => s.heldUntil);
  const total = selectedSeats.reduce((sum, s) => sum + basePrice * s.priceModifier, 0);

  return (
    <Card className="sticky bottom-4 border-cinema-amber/30 shadow-2xl shadow-black/50">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-white">YOUR SELECTION</h3>
          {heldUntil && <HoldTimer heldUntil={heldUntil} />}
        </div>

        {selectedSeats.length === 0 ? (
          <p className="py-4 text-center text-sm text-cinema-muted">Click an available seat to select</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <Badge key={seat.id} variant="default" className="text-sm">
                  {seat.id} · {seat.seatType} · {formatCurrency(Math.round(basePrice * seat.priceModifier))}
                </Badge>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-cinema-border pt-4">
              <span className="text-sm text-cinema-muted">Subtotal</span>
              <span className="font-display text-3xl text-cinema-amber">{formatCurrency(total)}</span>
            </div>
            <ShimmerButton onClick={onConfirm} disabled={loading || selectedSeats.length === 0} className="w-full">
              {loading ? 'Holding seats...' : 'Continue to Payment'}
              <ArrowRight className="h-4 w-4" />
            </ShimmerButton>
          </>
        )}
      </CardContent>
    </Card>
  );
}
