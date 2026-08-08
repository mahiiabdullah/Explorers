'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useHoldTimer } from '@/hooks/useHoldTimer';

interface HoldTimerProps {
  heldUntil: Date | null;
}

export function HoldTimer({ heldUntil }: HoldTimerProps) {
  const { minutes, seconds, color, expired } = useHoldTimer(heldUntil);

  if (!heldUntil) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 rounded-full border border-cinema-border bg-cinema-surface/80 px-4 py-2 backdrop-blur"
    >
      <Clock className={`h-4 w-4 ${color}`} />
      <span className={`font-mono text-lg font-semibold ${color}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="text-xs text-cinema-muted">{expired ? 'expired' : 'until hold expires'}</span>
    </motion.div>
  );
}
