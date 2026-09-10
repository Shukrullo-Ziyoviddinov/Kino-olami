import { apiClient } from '../services/apiClient';

export const fetchActorsByIds = async (ids = []) => {
  const normalized = (Array.isArray(ids) ? ids : [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  if (!normalized.length) return [];

  const key = normalized.join(',');
  const data = await apiClient.get(`/api/actors/by-ids?ids=${key}`, {
    cacheKey: `actors:ids:${key}`,
    ttlMs: 60 * 1000,
    dedupeKey: `actors:ids:${key}`,
  });
  return Array.isArray(data) ? data : [];
};

export const fetchActorById = async (id) => {
  const actorId = Number(id);
  if (!Number.isFinite(actorId)) {
    throw new Error("Noto'g'ri actor id.");
  }

  return apiClient.get(`/api/actors/${actorId}`, {
    cacheKey: `actors:${actorId}`,
    ttlMs: 60 * 1000,
    dedupeKey: `actors:${actorId}`,
  });
};
