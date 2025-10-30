// Very small in-memory TTL cache for API responses
const store = new Map();

export function setCache(key, value, ttlSeconds = 60) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  store.set(key, { value, expiresAt });
}

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function clearCache(prefix) {
  for (const k of store.keys()) {
    if (!prefix || k.startsWith(prefix)) store.delete(k);
  }
}
