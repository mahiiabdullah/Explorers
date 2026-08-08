'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api, endpoints } from '@/lib/api';
import { MovieFilters } from '@/components/movies/MovieFilters';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState, LoadingState } from '@/components/shared/ErrorState';
import { GENRES_DISPLAY, type GenreFilter } from '@/lib/genre';
import type { Movie } from '@/lib/types';

export default function MoviesPage() {
  const [genre, setGenre] = useState<GenreFilter>('All');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setLoading(true);
    setError(null);
    api.get<Movie[]>(endpoints.movies()).then(({ data, error }) => {
      if (error) {
        setError(error.message);
        setMovies([]);
      } else {
        setMovies(data ?? []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    refetch();
  }, []);

  const filtered = useMemo(() => {
    if (genre === 'All') return movies;
    // Backend genre is an enum; only ACTION/COMEDY/DRAMA exist.
    const code = genre.toUpperCase();
    return movies.filter((m) => m.genre === code);
  }, [movies, genre]);

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="font-display text-5xl text-cinema-gradient md:text-6xl">ALL MOVIES</h1>
        <p className="mt-4 text-cinema-muted">
          {movies.length > 0
            ? `${movies.length} movie${movies.length === 1 ? '' : 's'} playing now`
            : 'Discover what is playing in theatres near you'}
        </p>
      </motion.div>

      <div className="mb-8">
        <MovieFilters selected={genre} onSelect={setGenre} genres={GENRES_DISPLAY} />
      </div>

      {loading ? (
        <LoadingState message="Loading movies…" />
      ) : error ? (
        <ErrorState
          title="Could not load movies"
          description={error}
          onRetry={refetch}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No movies found" description="Try a different genre" />
      ) : (
        <MovieGrid movies={filtered} />
      )}
    </div>
  );
}