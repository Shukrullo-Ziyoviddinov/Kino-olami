import { useCallback } from 'react';
import { clearCache, getCache, setCache } from '../utils/cache';

export const useCache = () => {
  const get = useCallback((key) => getCache(key), []);
  const set = useCallback((key, value, ttlMs) => setCache(key, value, ttlMs), []);
  const clear = useCallback((key) => clearCache(key), []);

  return { get, set, clear };
};
