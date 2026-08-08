'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cinema-crimson/10">
        <AlertCircle className="h-6 w-6 text-cinema-crimson" />
      </div>
      <h3 className="font-display text-xl text-white">{title}</h3>
      {description && <p className="max-w-md text-sm text-cinema-muted">{description}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </motion.div>
  );
}

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="flex items-center gap-3 text-cinema-muted">
        <div className="h-2 w-2 animate-pulse rounded-full bg-cinema-amber [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-cinema-amber [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-pulse rounded-full bg-cinema-amber" />
        <span className="ml-2 text-sm">{message}</span>
      </div>
    </div>
  );
}