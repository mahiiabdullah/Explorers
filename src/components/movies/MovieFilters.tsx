'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GENRES } from '@/lib/constants';

interface MovieFiltersProps {
  selected: string;
  onSelect: (genre: string) => void;
}

export function MovieFilters({ selected, onSelect }: MovieFiltersProps) {
  const filters = ['All', ...GENRES];
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {filters.map((g) => (
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
