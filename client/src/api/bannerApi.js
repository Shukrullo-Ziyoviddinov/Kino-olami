import { apiClient } from '../services/apiClient';

export const fetchActiveBanners = async (lang) => {
  const query = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const data = await apiClient.get(`/api/banners/active${query}`, {
    cacheKey: `banners:active:${lang || 'all'}`,
    ttlMs: 60 * 1000,
    dedupeKey: `banners:active:${lang || 'all'}`,
  });
  return Array.isArray(data) ? data : [];
};
