import { BASE_URL } from '../config/api';
import { getOrSetCache } from '../utils/cache';
import { createApiError, normalizeApiError } from '../utils/errorHandler';

const getBase = () => BASE_URL.replace(/\/$/, '');

const inFlightRequests = new Map();

const toUrl = (path) => `${getBase()}${path.startsWith('/') ? path : `/${path}`}`;

const parseJsonSafe = async (res) => {
  try {
    return await res.json();
  } catch (_error) {
    return null;
  }
};

const assertApiSuccess = (json, fallbackMessage) => {
  if (!json) {
    throw createApiError(fallbackMessage, 500, null);
  }
  const success = Boolean(json.success ?? json.ok);
  if (!success) {
    throw createApiError(json.message || fallbackMessage, json.status || 500, json);
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(toUrl(path), options);
  const json = await parseJsonSafe(response);

  if (!response.ok) {
    throw createApiError(
      json?.message || `HTTP ${response.status}`,
      response.status,
      json
    );
  }

  assertApiSuccess(json, 'Server javobida xatolik.');
  return json;
};

const dedupeRequest = async (key, factory) => {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }
  const promise = factory().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, promise);
  return promise;
};

export const apiClient = {
  async get(path, { cacheKey, ttlMs = 0, dedupeKey, includeMeta = false } = {}) {
    const key = dedupeKey || `GET:${path}`;
    try {
      const runner = async () => {
        const json = await request(path);
        if (includeMeta) {
          return {
            data: json.data,
            meta: json.meta || null,
            message: json.message,
          };
        }
        return json.data;
      };
      if (cacheKey) {
        return await getOrSetCache(cacheKey, () => dedupeRequest(key, runner), ttlMs);
      }
      return await dedupeRequest(key, runner);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
