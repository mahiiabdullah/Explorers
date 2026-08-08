// Maps backend enum values to display strings.
import type { MovieGenre } from './types';

export const GENRE_LABELS: Record<MovieGenre, string> = {
  ACTION: 'Action',
  COMEDY: 'Comedy',
  DRAMA: 'Drama',
};

export function genreLabel(genre: MovieGenre | string | undefined): string {
  if (!genre) return '';
  return GENRE_LABELS[genre as MovieGenre] ?? String(genre);
}

// Frontend uses 8 genres on the filter bar but backend only has 3. Show all
// 8 in the filter, but only the 3 the backend understands will produce
// results — the rest will show empty. This keeps the UI rich for when
// the schema is extended.
export const GENRES_DISPLAY = [
  'All',
  'Action',
  'Drama',
  'Sci-Fi',
  'Comedy',
  'Thriller',
  'Romance',
  'Horror',
  'Animation',
] as const;

export type GenreFilter = (typeof GENRES_DISPLAY)[number];

// Maps a UI genre filter string back to the backend enum (returns null if
// the genre is not represented in the backend schema).
export function genreToBackend(label: string): MovieGenre | null {
  switch (label) {
    case 'Action':
      return 'ACTION';
    case 'Comedy':
      return 'COMEDY';
    case 'Drama':
      return 'DRAMA';
    default:
      return null;
  }
}