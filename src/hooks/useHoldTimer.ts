'use client';

import { useEffect, useState } from 'react';
import { timeUntil } from '@/lib/utils';

export function useHoldTimer(heldUntil: Date | null) {
  const [remaining, setRemaining] = useState(() =>
    heldUntil ? timeUntil(heldUntil) : { total: 0, minutes: 0, seconds: 0, expired: true },
  );

  useEffect(() => {
    if (!heldUntil) return;
    const tick = () => setRemaining(timeUntil(heldUntil));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [heldUntil]);

  const color =
    remaining.total > 300_000 ? 'text-cinema-success' : remaining.total > 120_000 ? 'text-cinema-amber' : 'text-cinema-crimson';

  return { ...remaining, color };
}
