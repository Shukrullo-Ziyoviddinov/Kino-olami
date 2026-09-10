const memoryCache = new Map();

const buildKey = (key) => String(key || '');

export const getCache = (key) => {
  const entry = memoryCache.get(buildKey(key));
  if (!entry) return null;
  if (entry.expireAt && Date.now() > entry.expireAt) {
    memoryCache.delete(buildKey(key));
    return null;
  }
  return entry.value;
};

export const setCache = (key, value, ttlMs = 0) => {
  const expireAt = ttlMs > 0 ? Date.now() + ttlMs : null;
  memoryCache.set(buildKey(key), { value, expireAt });
  return value;
};

export const clearCache = (key) => {
  if (typeof key === 'undefined') {
    memoryCache.clear();
    return;
  }
  memoryCache.delete(buildKey(key));
};

export const getOrSetCache = async (key, factory, ttlMs = 0) => {
  const cached = getCache(key);
  if (cached !== null) return cached;
  const value = await factory();
  setCache(key, value, ttlMs);
  return value;
};
