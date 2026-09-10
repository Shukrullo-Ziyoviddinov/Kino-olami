import { BASE_URL } from '../config/api';
import { createApiError, normalizeApiError } from '../utils/errorHandler';
import { getAuthToken } from '../utils/authStorage';

const getBase = () => BASE_URL.replace(/\/$/, '');
const toUrl = (path) => `${getBase()}${path.startsWith('/') ? path : `/${path}`}`;

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch (_error) {
    return null;
  }
};

const request = async (path, payload) => {
  const response = await fetch(toUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await parseJsonSafe(response);

  if (!response.ok || !(json?.success ?? json?.ok)) {
    throw createApiError(
      json?.message || `HTTP ${response.status}`,
      response.status,
      json
    );
  }

  return json?.data;
};

export const registerUser = async (payload) => {
  try {
    return await request('/api/auth/register', payload);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const loginUser = async (payload) => {
  try {
    return await request('/api/auth/login', payload);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(toUrl('/api/auth/logout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const json = await parseJsonSafe(response);
    if (!response.ok || !(json?.success ?? json?.ok)) {
      throw createApiError(json?.message || `HTTP ${response.status}`, response.status, json);
    }
    return json?.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};
