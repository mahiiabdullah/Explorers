'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="font-display text-6xl text-cinema-amber">OOPS</h2>
      <p className="text-lg text-cinema-muted">Something went wrong on our end.</p>
      <p className="font-mono text-xs text-cinema-muted/60">{error.message}</p>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}
