import { BASE_URL } from '../config/api';
import { createApiError, normalizeApiError } from '../utils/errorHandler';
import { clearAuthSession, getAuthToken } from '../utils/authStorage';

const getBase = () => BASE_URL.replace(/\/$/, '');
const toUrl = (path) => `${getBase()}${path.startsWith('/') ? path : `/${path}`}`;

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch (_error) {
    return null;
  }
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

const hasToken = () => Boolean(getAuthToken());
const handleUnauthorized = (response) => {
  if (response?.status === 401) {
    clearAuthSession();
  }
};

export const fetchWishlist = async () => {
  try {
    if (!hasToken()) return [];
    const response = await fetch(toUrl('/api/user/wishlist'), { headers: authHeaders() });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return Array.isArray(json?.data?.wishlist) ? json.data.wishlist : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const fetchUserProfile = async () => {
  try {
    if (!hasToken()) return null;
    const response = await fetch(toUrl('/api/user/profile'), { headers: authHeaders() });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return json?.data || null;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateUserProfile = async ({ firstName, lastName, avatar }) => {
  try {
    if (!hasToken()) throw createApiError('Unauthorized', 401);
    const response = await fetch(toUrl('/api/user/profile'), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ firstName, lastName, avatar }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return json?.data || null;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const addWishlist = async (movieId) => {
  try {
    if (!hasToken()) throw createApiError('Unauthorized', 401);
    const response = await fetch(toUrl('/api/user/wishlist'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ movieId }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return Array.isArray(json?.data?.wishlist) ? json.data.wishlist : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const removeWishlist = async (movieId) => {
  try {
    if (!hasToken()) throw createApiError('Unauthorized', 401);
    const response = await fetch(toUrl(`/api/user/wishlist/${movieId}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return Array.isArray(json?.data?.wishlist) ? json.data.wishlist : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const fetchMovieReaction = async (movieId) => {
  try {
    if (!hasToken()) return null;
    const response = await fetch(toUrl(`/api/user/reactions/movie/${movieId}`), { headers: authHeaders() });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return json?.data?.reaction || null;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const setMovieReaction = async (movieId, reaction) => {
  try {
    if (!hasToken()) throw createApiError('Unauthorized', 401);
    const response = await fetch(toUrl('/api/user/reactions/movie'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ movieId, reaction }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return json?.data?.reaction || null;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const removeMovieReaction = async (movieId) => {
  try {
    if (!hasToken()) throw createApiError('Unauthorized', 401);
    const response = await fetch(toUrl(`/api/user/reactions/movie/${movieId}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return null;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const addViewedMovie = async (movieId) => {
  try {
    if (!hasToken()) return [];
    const response = await fetch(toUrl('/api/user/viewed-movies'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ movieId }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return Array.isArray(json?.data?.viewedMovies) ? json.data.viewedMovies : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
};
