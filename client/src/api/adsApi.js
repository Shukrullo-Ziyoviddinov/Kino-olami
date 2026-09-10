import { apiClient } from '../services/apiClient';

export const fetchActiveAd = async () => {
  const data = await apiClient.get('/api/ads/active', {
    cacheKey: 'ads:active',
    ttlMs: 60 * 1000,
    dedupeKey: 'ads:active',
  });
  return data || null;
};
