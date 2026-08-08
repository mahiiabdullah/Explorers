'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatTime } from '@/lib/utils';
import type { Showtime } from '@/lib/types';

interface ShowtimePickerProps {
  showtimes: Showtime[];
  movieId: number | string;
}

export function ShowtimePicker({ showtimes, movieId }: ShowtimePickerProps) {
  // Group by theatre
  const byTheatre = showtimes.reduce((acc, s) => {
    if (!acc[s.theatreName]) acc[s.theatreName] = [];
    acc[s.theatreName]!.push(s);
    return acc;
  }, {} as Record<string, Showtime[]>);

  return (
    <div className="space-y-6">
      {Object.entries(byTheatre).map(([theatre, times], i) => (
        <motion.div
          key={theatre}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cinema-amber" />
                <h3 className="font-display text-2xl text-white">{theatre}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {times.map((s) => (
                  <Link key={s.id} href={`/showtimes/${s.id}/seat-map`}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outline"
                        className="group h-auto w-full flex-col items-start gap-1 py-3 hover:border-cinema-amber hover:bg-cinema-amber/5"
                      >
                        <span className="font-display text-xl text-white group-hover:text-cinema-amber">
                          {formatTime(s.startsAt)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-cinema-muted">
                          <Users className="h-3 w-3" />
                          {s.availableSeats}/{s.totalSeats} seats
                        </span>
                        <span className="text-xs text-cinema-amber">
                          {formatCurrency(s.basePrice)}
                        </span>
                      </Button>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
