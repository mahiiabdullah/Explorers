'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/movies/DatePicker';
import { ShowtimePicker } from '@/components/movies/ShowtimePicker';
import { ErrorState, LoadingState } from '@/components/shared/ErrorState';
import { api, endpoints } from '@/lib/api';
import { formatDuration, formatDate, formatTime } from '@/lib/utils';
import { genreLabel } from '@/lib/genre';
import type { Movie, Showtime } from '@/lib/types';

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    setError(null);
    api.get<Movie[]>(endpoints.movies()).then(({ data, error }) => {
      if (error) {
        setError(error.message);
        setMovie(null);
        setShowtimes([]);
        setLoading(false);
        return;
      }
      const all = data ?? [];
      const found = all.find((m) => m.id === id);
      if (!found) {
        setError('Movie not found');
        setMovie(null);
        setShowtimes([]);
      } else {
        setMovie(found);
        setShowtimes(found.showtimes ?? []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    refetch();
  }, [id]);

  const dates = useMemo(() => {
    const out: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push(d);
    }
    return out;
  }, []);

  const showtimesForDate = useMemo(() => {
    return showtimes.filter((s) => {
      const d = new Date(s.startsAt);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [showtimes, selectedDate]);

  if (loading) {
    return (
      <div className="container py-12">
        <LoadingState message="Loading movie…" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-12">
        <ErrorState
          title={error ?? 'Movie not found'}
          description="Check the URL or go back to browse all movies."
          onRetry={refetch}
        />
      </div>
    );
  }

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
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=1200&fit=crop'}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="default"><Star className="mr-1 h-3 w-3 fill-current" />{movie.rating.toFixed(1)}</Badge>
            {movie.genre && <Badge variant="outline">{genreLabel(movie.genre)}</Badge>}
            <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{formatDuration(movie.durationMin)}</Badge>
            {movie.releaseDate && (
              <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />{formatDate(movie.releaseDate)}</Badge>
            )}
          </div>

          <h1 className="font-display text-5xl text-white md:text-6xl">{movie.title.toUpperCase()}</h1>
          {movie.description && (
            <p className="mt-6 max-w-2xl text-cinema-muted">{movie.description}</p>
          )}

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
        {showtimesForDate.length === 0 ? (
          <p className="text-sm text-cinema-muted">No showtimes for {formatDate(selectedDate.toISOString())}.</p>
        ) : (
          <ShowtimePicker
            showtimes={showtimesForDate.map((s) => ({
              id: s.id,
              movieId: s.movieId,
              screenId: s.screenId,
              theatreName: s.screen?.theatre.name ?? 'Unknown Theatre',
              city: s.screen?.theatre.city,
              startsAt: s.startsAt,
              basePrice: s.basePrice,
              availableSeats: 0,
              totalSeats: 0,
            }))}
          />
        )}
      </div>
    </div>
  );
}