'use client';

import { motion } from 'framer-motion';
import { formatDate, cn } from '@/lib/utils';

interface DatePickerProps {
  dates: Date[];
  selected: Date | null;
  onSelect: (date: Date) => void;
}

export function DatePicker({ dates, selected, onSelect }: DatePickerProps) {
  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
      {dates.map((date, i) => {
        const isSelected = selected?.toDateString() === date.toDateString();
        const isToday = new Date().toDateString() === date.toDateString();
        return (
          <motion.button
            key={date.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(date)}
            className={cn(
              'flex min-w-[80px] flex-col items-center gap-1 rounded-xl border px-4 py-3 transition-all',
              isSelected
                ? 'border-cinema-amber bg-cinema-amber text-cinema-bg shadow-lg shadow-cinema-amber/30'
                : 'border-cinema-border bg-cinema-surface text-cinema-muted hover:border-cinema-amber/50 hover:text-white',
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="font-display text-2xl">{date.getDate()}</span>
            <span className="text-[10px] uppercase">
              {date.toLocaleDateString('en-US', { month: 'short' })}
              {isToday && !isSelected && <span className="ml-1 text-cinema-amber">·</span>}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
