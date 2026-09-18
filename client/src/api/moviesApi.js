import { apiClient } from '../services/apiClient';

export const fetchMoviesList = async () => {
  const data = await apiClient.get('/api/movies', {
    cacheKey: 'movies:list',
    ttlMs: 30 * 1000,
    dedupeKey: 'movies:list',
  });
  return Array.isArray(data) ? data : [];
};

export const fetchMovieById = async (id) => {
  const movieId = Number(id);
  if (!Number.isFinite(movieId)) {
    throw new Error("Noto'g'ri kino id.");
  }

  return apiClient.get(`/api/movies/${movieId}`, {
    cacheKey: `movies:${movieId}`,
    ttlMs: 30 * 1000,
    dedupeKey: `movies:${movieId}`,
  });
};

export const fetchSimilarMovies = async (movieId, { page = 1, limit = 20 } = {}) => {
  const id = Number(movieId);
  if (!Number.isFinite(id)) {
    throw new Error("Noto'g'ri kino id.");
  }

  const query = `?page=${page}&limit=${limit}`;
  const data = await apiClient.get(`/api/movies/${id}/similar${query}`, {
    cacheKey: `movies:similar:${id}:${page}:${limit}`,
    ttlMs: 30 * 1000,
    dedupeKey: `movies:similar:${id}:${page}:${limit}`,
    includeMeta: true,
  });

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta || null,
  };
};

/** Yuqori reyting — faqat server: GET /api/movies/top-rated */
export const fetchTopRatedMovies = async ({ page = 1, limit = 20 } = {}) => {
  const query = `?page=${page}&limit=${limit}`;
  const data = await apiClient.get(`/api/movies/top-rated${query}`, {
    cacheKey: `movies:top-rated:${page}:${limit}`,
    ttlMs: 30 * 1000,
    dedupeKey: `movies:top-rated:${page}:${limit}`,
    includeMeta: true,
  });

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta || null,
  };
};

/** Haftaning top 5 — max 5, Ko'proq sahifasi yo'q */
export const WEEKLY_TOP_LIMIT = 5;

export const fetchWeeklyTopMovies = async ({ limit = WEEKLY_TOP_LIMIT } = {}) => {
  const safeLimit = Math.min(Math.max(1, Number(limit) || WEEKLY_TOP_LIMIT), WEEKLY_TOP_LIMIT);
  const query = `?limit=${safeLimit}`;
  const data = await apiClient.get(`/api/movies/weekly-top${query}`, {
    cacheKey: `movies:weekly-top:${safeLimit}`,
    ttlMs: 60 * 1000,
    dedupeKey: `movies:weekly-top:${safeLimit}`,
    includeMeta: true,
  });

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta || null,
  };
};
