import { useCallback } from 'react';

// Simple in-memory cache to store prefetched data
export const prefetchCache = new Map<string, any>();

type Fetcher<T> = (id: string) => T | undefined;

/**
 * A custom hook to prefetch data and store it in a shared cache.
 * @param fetcher A function that takes an ID and returns the data for that item.
 * @returns An object containing the prefetch function.
 */
export function usePrefetch<T>(fetcher: Fetcher<T>) {
  const prefetch = useCallback((id: string) => {
    // Only fetch if the data is not already in the cache
    if (!prefetchCache.has(id)) {
      const data = fetcher(id);
      if (data) {
        prefetchCache.set(id, data);
      }
    }
  }, [fetcher]);

  return { prefetch };
}
