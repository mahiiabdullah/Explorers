'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/movies/DatePicker';
import { ShowtimePicker } from '@/components/movies/ShowtimePicker';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration, formatDate } from '@/lib/utils';
import type { Movie, Showtime } from '@/lib/types';

const MOCK_MOVIE: Movie = {
  id: 1,
  title: 'Dune Part Three',
  description:
    'Paul Atreides unites with the Fremen and seeks revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
  posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1200&fit=crop',
  durationMin: 165,
  rating: 9.1,
  genre: 'Sci-Fi',
  releaseDate: '2026-08-15',
};

const MOCK_SHOWTIMES: Showtime[] = [
  { id: 101, movieId: 1, screenId: 4, theatreName: 'PVR Phoenix', startsAt: '2026-08-15T10:30:00Z', basePrice: 35000, availableSeats: 42, totalSeats: 150 },
  { id: 102, movieId: 1, screenId: 4, theatreName: 'PVR Phoenix', startsAt: '2026-08-15T14:00:00Z', basePrice: 35000, availableSeats: 28, totalSeats: 150 },
  { id: 103, movieId: 1, screenId: 4, theatreName: 'PVR Phoenix', startsAt: '2026-08-15T18:30:00Z', basePrice: 45000, availableSeats: 12, totalSeats: 150 },
  { id: 104, movieId: 1, screenId: 7, theatreName: 'INOX Forum', startsAt: '2026-08-15T11:00:00Z', basePrice: 30000, availableSeats: 55, totalSeats: 180 },
  { id: 105, movieId: 1, screenId: 7, theatreName: 'INOX Forum', startsAt: '2026-08-15T20:00:00Z', basePrice: 40000, availableSeats: 8, totalSeats: 180 },
];

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedDate, setSelectedDate] = useState(new Date('2026-08-15'));

  const dates = Array.from({ length: 7 }, (_, i) => new Date(2026, 7, 15 + i));

  return (
    <div className="container py-12">
      <Link href="/movies">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to movies
        </Button>
      </Link>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-[2/3] overflow-hidden rounded-2xl border border-cinema-border"
        >
          <img src={MOCK_MOVIE.posterUrl} alt={MOCK_MOVIE.title} className="h-full w-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="default"><Star className="mr-1 h-3 w-3 fill-current" />{MOCK_MOVIE.rating.toFixed(1)}</Badge>
            <Badge variant="outline">{MOCK_MOVIE.genre}</Badge>
            <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{formatDuration(MOCK_MOVIE.durationMin)}</Badge>
            <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />{formatDate(MOCK_MOVIE.releaseDate)}</Badge>
          </div>

          <h1 className="font-display text-5xl text-white md:text-6xl">{MOCK_MOVIE.title.toUpperCase()}</h1>
          <p className="mt-6 max-w-2xl text-cinema-muted">{MOCK_MOVIE.description}</p>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" size="lg">
              <Play className="mr-2 h-4 w-4 fill-current" />
              Watch Trailer
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="mt-16">
        <h2 className="mb-6 font-display text-3xl text-cinema-amber">PICK A DATE</h2>
        <DatePicker dates={dates} selected={selectedDate} onSelect={setSelectedDate} />
      </div>

      <div className="mt-12">
        <h2 className="mb-6 font-display text-3xl text-cinema-amber">SHOWTIMES</h2>
        <ShowtimePicker showtimes={MOCK_SHOWTIMES} movieId={id} />
      </div>
    </div>
  );
}
