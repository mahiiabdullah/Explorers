'use client';

import { useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Download, CalendarPlus, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfettiOnMount } from '@/components/magicui/confetti';
import { formatDate, formatTime } from '@/lib/utils';

export default function ConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

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
              <span className="font-mono text-white">{id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Movie</span>
              <span className="text-white">Dune Part Three</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Theatre</span>
              <span className="text-white">PVR Phoenix</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Date & Time</span>
              <span className="text-white">{formatDate('2026-08-15')} · {formatTime('2026-08-15T19:30:00Z')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cinema-muted">Seats</span>
              <span className="text-white">E5, E6 (Premium)</span>
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
