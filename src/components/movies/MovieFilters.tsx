'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GenreFilter } from '@/lib/genre';

interface MovieFiltersProps {
  selected: GenreFilter;
  onSelect: (genre: GenreFilter) => void;
  genres?: readonly GenreFilter[];
}

export function MovieFilters({ selected, onSelect, genres = ['All'] }: MovieFiltersProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {genres.map((g) => (
        <motion.button
          key={g}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(g)}
          className={cn(
            'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all',
            selected === g
              ? 'border-cinema-amber bg-cinema-amber text-cinema-bg'
              : 'border-cinema-border bg-cinema-surface text-cinema-muted hover:border-cinema-amber/50 hover:text-white',
          )}
        >
          {g}
        </motion.button>
      ))}
    </div>
  );
}