'use client';

import { useMemo } from 'react';
import { Screen } from './Screen';
import { Seat } from './Seat';
import { Legend } from './Legend';
import type { Seat as SeatType } from '@/lib/types';

interface SeatMapProps {
  seats: SeatType[];
  rows: number;
  cols: number;
  basePrice: number;
}

export function SeatMap({ seats, rows, cols, basePrice }: SeatMapProps) {
  const grid = useMemo(() => {
    const map = new Map<string, SeatType>();
    seats.forEach((s) => map.set(s.id, s));
    return map;
  }, [seats]);

  const rowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="space-y-6">
      <Screen />

      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          {/* Column numbers header */}
          <div className="mb-2 flex items-center" style={{ paddingLeft: '2rem' }}>
            <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: cols }, (_, i) => (
                <div key={i} className="text-center text-[10px] text-cinema-muted/60">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Seat grid */}
          <div className="space-y-1">
            {rowLabels.map((row) => (
              <div key={row} className="flex items-center gap-1">
                <div className="w-6 text-center text-xs font-medium text-cinema-muted">{row}</div>
                <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                  {Array.from({ length: cols }, (_, j) => {
                    const seatId = `${row}${j + 1}`;
                    const seat = grid.get(seatId);
                    if (!seat) return <div key={seatId} />;
                    return <Seat key={seatId} seat={seat} basePrice={basePrice} />;
                  })}
                </div>
                <div className="w-6 text-center text-xs font-medium text-cinema-muted">{row}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Legend />
    </div>
  );
}
