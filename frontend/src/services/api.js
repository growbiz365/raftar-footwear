import axios from 'axios';
import { cacheKey, cacheGet, cacheSet, clearCache } from './cache';

// Settings endpoints are edited from the admin dashboard, so never serve them
// from the response cache — otherwise saved changes show up late.
const NO_CACHE_RE = /\/settings(\?|$|\/)/;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Key': import.meta.env.VITE_APP_KEY || 'raftar-frontend-key-2026',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('revone_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const method = (config.method || 'get').toLowerCase();
  if (method === 'get' && !NO_CACHE_RE.test(config.url || '')) {
    const key = cacheKey(config);
    config._cacheKey = key;
    const hit = cacheGet(key);
    if (hit !== null) {
      config.adapter = () =>
        Promise.resolve({
          data: hit,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const method = (res.config.method || 'get').toLowerCase();
    if (method === 'get' && res.config._cacheKey && res.status >= 200 && res.status < 300) {
      cacheSet(res.config._cacheKey, res.data);
    } else if (res.status >= 200 && res.status < 300) {
      clearCache();
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('revone_token');
      localStorage.removeItem('revone_user');
      clearCache();
    }
    return Promise.reject(err);
  }
);

export default api;
