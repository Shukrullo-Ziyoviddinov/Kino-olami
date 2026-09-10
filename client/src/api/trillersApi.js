import { apiClient } from '../services/apiClient';

export const fetchTrillers = async ({ page = 1, limit = 20, active = true } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (active) params.set('active', '1');

  const data = await apiClient.get(`/api/trillers?${params.toString()}`, {
    cacheKey: `trillers:${page}:${limit}:${active ? '1' : '0'}`,
    ttlMs: 60 * 1000,
    dedupeKey: `trillers:${page}:${limit}:${active ? '1' : '0'}`,
  });

  return Array.isArray(data) ? data : [];
};
