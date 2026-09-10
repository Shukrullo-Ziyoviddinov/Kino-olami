import { apiClient } from '../services/apiClient';

export const fetchGenres = async () => {
  const data = await apiClient.get('/api/genres', {
    cacheKey: 'genres',
    ttlMs: 5 * 60 * 1000,
    dedupeKey: 'genres',
  });
  return Array.isArray(data) ? data : [];
};
