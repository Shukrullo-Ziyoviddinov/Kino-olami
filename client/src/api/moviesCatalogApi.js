import { apiClient } from '../services/apiClient';
import { BASE_URL } from '../config/api';
import { getAuthToken } from '../utils/authStorage';
import { createApiError, normalizeApiError } from '../utils/errorHandler';

const catalogRequest = async (path, { cacheKey, dedupeKey } = {}) => {
  const token = getAuthToken();

  if (!token) {
    const data = await apiClient.get(path, {
      cacheKey,
      ttlMs: 60 * 1000,
      dedupeKey,
      includeMeta: true,
    });
    return {
      data: data?.data || {},
      meta: data?.meta || null,
    };
  }

  try {
    const base = BASE_URL.replace(/\/$/, '');
    const response = await fetch(`${base}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return {
      data: json?.data || {},
      meta: json?.meta || null,
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const fetchMoviesCatalog = async ({ page = 1, limit = 30, section = null } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (section) params.set('section', section);
  const query = `?${params.toString()}`;
  const cacheSuffix = section ? `:${section}` : '';

  const { data, meta } = await catalogRequest(`/api/movies-catalog${query}`, {
    cacheKey: `movies-catalog:${page}:${limit}${cacheSuffix}`,
    dedupeKey: `movies-catalog:${page}:${limit}${cacheSuffix}`,
  });

  return {
    allMovies: data.allMovies || [],
    recommendedMovies: data.recommendedMovies || [],
    sections: data.sections || {},
    meta,
  };
};

/**
 * Serverdagi home batch algoritmi:
 * batch=0 → recommended + birinchi 2 bo'lim (har biri limit)
 * batch=1+ → keyingi 2 bo'lim
 */
export const fetchHomeCatalogBatch = async ({
  batch = 0,
  limit = 7,
  batchSize = 2,
} = {}) => {
  const params = new URLSearchParams({
    batch: String(batch),
    limit: String(limit),
    batchSize: String(batchSize),
  });
  const query = `?${params.toString()}`;

  const { data, meta } = await catalogRequest(`/api/movies-catalog/home${query}`, {
    cacheKey: `movies-catalog-home:${batch}:${limit}:${batchSize}`,
    dedupeKey: `movies-catalog-home:${batch}:${limit}:${batchSize}`,
  });

  return {
    recommendedMovies: data.recommendedMovies || [],
    sections: data.sections || {},
    sectionKeys: data.sectionKeys || [],
    sectionOrder: data.sectionOrder || [],
    sectionHasMore: data.sectionHasMore || {},
    allMovies: data.allMovies || [],
    meta,
  };
};
