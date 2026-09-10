import { apiClient } from '../services/apiClient';

export const fetchSocialLinks = async () => {
  const data = await apiClient.get('/api/social-links', {
    cacheKey: 'social-links',
    ttlMs: 5 * 60 * 1000,
    dedupeKey: 'social-links',
  });
  const payload = data || {};
  return {
    contact: payload.contact || {},
    social: payload.social || {},
    appStore: payload.appStore || {},
  };
};
