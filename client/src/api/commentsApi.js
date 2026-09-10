import { BASE_URL } from '../config/api';
import { clearAuthSession, getAuthToken } from '../utils/authStorage';
import { createApiError, normalizeApiError } from '../utils/errorHandler';

const getBase = () => BASE_URL.replace(/\/$/, '');
const toUrl = (path) => `${getBase()}${path.startsWith('/') ? path : `/${path}`}`;
const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch (_error) {
    return null;
  }
};
const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : undefined);

const handleUnauthorized = (response) => {
  if (response?.status === 401) {
    clearAuthSession();
  }
};

/** movieId har doim bir xil formatda (aralashmasin) */
export const toMovieKey = (movieId) => String(movieId);

/**
 * @param {string|number} movieId - Kino ID
 * @returns {Array} Kommentlar ro'yxati (faqat shu kinoga tegishli)
 */
export const getComments = (movieId) => {
  return fetchComments(movieId);
};

export const fetchComments = async (movieId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(toUrl(`/api/movies/${toMovieKey(movieId)}/comments`), {
      headers: authHeaders(token),
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    const list = json?.data;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    throw normalizeApiError(error);
  }
};

/**
 * @param {string|number} movieId - Kino ID
 * @param {Array} comments - Yangilangan kommentlar
 */
export const createComment = async (movieId, payload) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw createApiError('Unauthorized', 401);
    }
    const response = await fetch(toUrl(`/api/movies/${toMovieKey(movieId)}/comments`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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

export const likeComment = async (movieId, commentId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw createApiError('Unauthorized', 401);
    }
    const response = await fetch(toUrl(`/api/movies/${toMovieKey(movieId)}/comments/${commentId}/like`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return json?.data || { likes: 0, likedByMe: true };
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const unlikeComment = async (movieId, commentId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw createApiError('Unauthorized', 401);
    }
    const response = await fetch(toUrl(`/api/movies/${toMovieKey(movieId)}/comments/${commentId}/like`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      handleUnauthorized(response);
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return json?.data || { likes: 0, likedByMe: false };
  } catch (error) {
    throw normalizeApiError(error);
  }
};
