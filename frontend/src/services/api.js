import axios from 'axios';

// In dev: Vite proxies /api → http://localhost:5000
// In prod: set VITE_API_URL=https://your-backend.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('tjp_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;

  // Flask blueprints base routes expect a trailing slash (e.g., /api/trades/)
  const slashEndpoints = ['/trades', '/reports'];
  if (cfg.url) {
    const basePath = cfg.url.split('?')[0];
    if (slashEndpoints.includes(basePath)) {
      cfg.url = cfg.url.replace(basePath, basePath + '/');
    }
  }

  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tjp_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
