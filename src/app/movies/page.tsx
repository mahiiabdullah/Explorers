'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MovieFilters } from '@/components/movies/MovieFilters';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Movie } from '@/lib/types';

// Mock data — replace with SWR fetch
const allMovies: Movie[] = [
  { id: 1, title: 'Dune Part Three', description: 'The saga continues.', posterUrl: '', durationMin: 165, rating: 9.1, genre: 'Sci-Fi', releaseDate: '2026-08-15' },
  { id: 2, title: 'Inception 2', description: 'Dreams within dreams.', posterUrl: '', durationMin: 148, rating: 8.4, genre: 'Sci-Fi', releaseDate: '2026-08-20' },
  { id: 3, title: 'The Dark Knight Returns', description: 'The legend rises.', posterUrl: '', durationMin: 152, rating: 9.0, genre: 'Action', releaseDate: '2026-08-22' },
  { id: 4, title: 'Interstellar II', description: 'Beyond the stars.', posterUrl: '', durationMin: 169, rating: 8.8, genre: 'Sci-Fi', releaseDate: '2026-08-25' },
  { id: 5, title: 'Oppenheimer', description: 'A story of creation.', posterUrl: '', durationMin: 180, rating: 8.6, genre: 'Drama', releaseDate: '2026-08-28' },
  { id: 6, title: 'Tenet', description: 'Time is the weapon.', posterUrl: '', durationMin: 150, rating: 7.9, genre: 'Action', releaseDate: '2026-08-30' },
  { id: 7, title: 'The Hangover 4', description: 'What happened?', posterUrl: '', durationMin: 105, rating: 7.2, genre: 'Comedy', releaseDate: '2026-09-01' },
  { id: 8, title: 'Hereditary 2', description: 'Family secrets.', posterUrl: '', durationMin: 127, rating: 8.0, genre: 'Horror', releaseDate: '2026-09-03' },
  { id: 9, title: 'Soulmate', description: 'When worlds collide.', posterUrl: '', durationMin: 130, rating: 8.2, genre: 'Romance', releaseDate: '2026-09-05' },
  { id: 10, title: 'Spirited Away Live', description: 'Studio Ghibli magic.', posterUrl: '', durationMin: 125, rating: 9.4, genre: 'Animation', releaseDate: '2026-09-08' },
];

export default function MoviesPage() {
  const [genre, setGenre] = useState('All');

  const filtered = useMemo(() => {
    if (genre === 'All') return allMovies;
    return allMovies.filter((m) => m.genre === genre);
  }, [genre]);

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="font-display text-5xl text-cinema-gradient md:text-6xl">ALL MOVIES</h1>
        <p className="mt-4 text-cinema-muted">Discover what's playing in theatres near you</p>
      </motion.div>

      <div className="mb-8">
        <MovieFilters selected={genre} onSelect={setGenre} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No movies found" description="Try a different genre" />
      ) : (
        <MovieGrid movies={filtered} />
      )}
    </div>
  );
}
