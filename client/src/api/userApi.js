import { BASE_URL } from '../config/api';
import { createApiError, normalizeApiError } from '../utils/errorHandler';
import { clearAuthSession, getAuthToken } from '../utils/authStorage';
import { sendMoviyMessage } from '../utils/moviyBridge';

const getBase = () => BASE_URL.replace(/\/$/, '');
const toUrl = (path) => `${getBase()}${path.startsWith('/') ? path : `/${path}`}`;

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch (_error) {
    return null;
  }
};

const hasToken = () => Boolean(getAuthToken());
const authFetch = async (url, options) => {
  const token = getAuthToken();
  const response = await fetch(url, { ...options, headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  } });
  if (response.status === 401 && token === getAuthToken()) {
    clearAuthSession();
    sendMoviyMessage({ type: 'kino-olami:refresh-session' });
  }
  return response;
};

export const fetchWishlist = async () => {
  try {
    if (!hasToken()) return [];
    const response = await authFetch(toUrl('/api/user/wishlist'));
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl('/api/user/profile'));
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl('/api/user/profile'), {
      method: 'PUT',
      body: JSON.stringify({ firstName, lastName, avatar }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl('/api/user/wishlist'), {
      method: 'POST',
      body: JSON.stringify({ movieId }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl(`/api/user/wishlist/${movieId}`), {
      method: 'DELETE',
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl(`/api/user/reactions/movie/${movieId}`));
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl('/api/user/reactions/movie'), {
      method: 'POST',
      body: JSON.stringify({ movieId, reaction }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl(`/api/user/reactions/movie/${movieId}`), {
      method: 'DELETE',
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
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
    const response = await authFetch(toUrl('/api/user/viewed-movies'), {
      method: 'POST',
      body: JSON.stringify({ movieId }),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return Array.isArray(json?.data?.viewedMovies) ? json.data.viewedMovies : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
};
