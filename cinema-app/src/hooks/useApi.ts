'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, endpoints } from '@/lib/api';
import type { ApiResponse } from '@/lib/types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Tiny helper hook for one-shot REST fetches with loading/error state.
 * Calls the API client with the path returned by `endpointFn` (which may
 * be null to defer the request — useful for routes that depend on params
 * like `id` from a dynamic route).
 */
export function useApi<T>(endpointFn: (() => string) | null): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(endpointFn));
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!endpointFn) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);

    api.get<T>(endpointFn()).then(({ data, error }: ApiResponse<T>) => {
      if (!mounted) return;
      if (error) {
        setError(error.message);
        setData(null);
      } else {
        setData(data);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [endpointFn, tick]);

  return { data, loading, error, refetch };
}

export { endpoints };