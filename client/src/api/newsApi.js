import { apiClient } from '../services/apiClient';
import { BASE_URL } from '../config/api';
import { createApiError, normalizeApiError } from '../utils/errorHandler';
import { clearAuthSession, getAuthToken } from '../utils/authStorage';
import { clearCache } from '../utils/cache';

const EMPTY_LAYOUT = {
  yangiliklar: [],
  trenddagiYangiliklar: [],
  yangiliklarGrid: [],
};

const NEWS_LAYOUT_CACHE_KEY = 'news:layout:1';
const NEWS_LAYOUT_CACHE_KEY_ALL = 'news:layout:0';

const getBase = () => BASE_URL.replace(/\/$/, '');
const toUrl = (path) => `${getBase()}${path.startsWith('/') ? path : `/${path}`}`;

export const fetchNewsLayout = async ({ active = true } = {}) => {
  const params = new URLSearchParams();
  if (active) params.set('active', '1');

  const data = await apiClient.get(`/api/news/layout?${params.toString()}`, {
    cacheKey: `news:layout:${active ? '1' : '0'}`,
    ttlMs: 15 * 1000,
    dedupeKey: `news:layout:${active ? '1' : '0'}`,
  });

  if (!data || typeof data !== 'object') {
    return { ...EMPTY_LAYOUT };
  }

  return {
    yangiliklar: Array.isArray(data.yangiliklar) ? data.yangiliklar : [],
    trenddagiYangiliklar: Array.isArray(data.trenddagiYangiliklar)
      ? data.trenddagiYangiliklar
      : [],
    yangiliklarGrid: Array.isArray(data.yangiliklarGrid) ? data.yangiliklarGrid : [],
  };
};

export const fetchNews = async ({
  page = 1,
  limit = 20,
  active = true,
  section = '',
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (active) params.set('active', '1');
  if (section) params.set('section', section);

  const data = await apiClient.get(`/api/news?${params.toString()}`, {
    cacheKey: `news:${page}:${limit}:${active ? '1' : '0'}:${section || 'all'}`,
    ttlMs: 15 * 1000,
    dedupeKey: `news:${page}:${limit}:${active ? '1' : '0'}:${section || 'all'}`,
  });

  return Array.isArray(data) ? data : [];
};

/**
 * Auth bo'lgan user uchun: bitta news = bir marta +1.
 */
export const registerNewsView = async (newsId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw createApiError('Unauthorized', 401);
    }

    const response = await fetch(toUrl(`/api/news/${newsId}/view`), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      if (response.status === 401) clearAuthSession();
      throw createApiError(
        json?.message || `HTTP ${response.status}`,
        response.status,
        json
      );
    }

    clearCache(NEWS_LAYOUT_CACHE_KEY);
    clearCache(NEWS_LAYOUT_CACHE_KEY_ALL);

    return json?.data || null;
  } catch (error) {
    throw normalizeApiError(error);
  }
};
