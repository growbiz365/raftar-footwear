const PREFIX = 'rc2_';

export const CACHE_TTL = 5 * 60 * 1000;

export function cacheKey(config) {
  const url = config.url || '';
  const params = config.params || {};
  return `${PREFIX}${config.method || 'get'}_${url}?${JSON.stringify(params)}`;
}

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return v;
  } catch {
    return null;
  }
}

export function cacheSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // storage full/private mode – silently skip
  }
}

export function clearCache() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}