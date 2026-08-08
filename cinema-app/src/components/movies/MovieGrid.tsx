import { MovieCard } from './MovieCard';
import type { Movie } from '@/lib/types';

export function MovieGrid({ movies }: { movies: Movie[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((m, i) => (
        <MovieCard key={m.id} movie={m} index={i} />
      ))}
    </div>
  );
}
