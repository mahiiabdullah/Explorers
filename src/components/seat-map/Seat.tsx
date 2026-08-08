'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSeatMapStore } from '@/stores/seat-map-store';
import type { Seat as SeatType } from '@/lib/types';

interface SeatProps {
  seat: SeatType;
  basePrice: number;
}

export function Seat({ seat, basePrice }: SeatProps) {
  const selectedIds = useSeatMapStore((s) => s.selectedIds);
  const toggleSeat = useSeatMapStore((s) => s.toggleSeat);
  const isSelected = selectedIds.includes(seat.id);

  const isPremium = seat.seatType === 'premium' || seat.seatType === 'recliner';
  const price = Math.round(basePrice * seat.priceModifier);

  const isBooked = seat.status === 'booked';
  const isHeld = seat.status === 'held' && !isSelected;

  const handleClick = () => {
    if (isBooked || isHeld) return;
    toggleSeat(seat.id);
  };

  return (
    <motion.button
      whileHover={!(isBooked || isHeld) ? { scale: 1.15, y: -1 } : {}}
      whileTap={!(isBooked || isHeld) ? { scale: 0.95 } : {}}
      onClick={handleClick}
      disabled={isBooked || isHeld}
      aria-label={`Seat ${seat.id}, ${seat.seatType}, ${isBooked ? 'booked' : isHeld ? 'held' : isSelected ? 'selected' : 'available'}`}
      title={`${seat.id} · ${seat.seatType} · ₹${price}`}
      className={cn(
        'relative aspect-square rounded-md border text-[10px] font-medium transition-all',
        'flex items-center justify-center',
        isSelected && [
          'bg-cinema-amber text-cinema-bg border-cinema-amber',
          'shadow-lg shadow-cinema-amber/50',
        ],
        !isSelected && !isBooked && !isHeld && 'border-cinema-border bg-cinema-surface hover:border-cinema-amber/60 hover:bg-cinema-surfaceHover',
        isHeld && 'cursor-not-allowed border-cinema-amber/40 bg-cinema-amber/20 text-cinema-amber/60 animate-pulse-soft',
        isBooked && 'cursor-not-allowed border-cinema-border/40 bg-cinema-crimson/10 text-cinema-muted/40 line-through',
        isPremium && !isSelected && !isBooked && !isHeld && 'border-cinema-gold/50',
      )}
    >
      {seat.id}
    </motion.button>
  );
}
