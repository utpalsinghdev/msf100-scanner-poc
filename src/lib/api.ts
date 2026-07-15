import axios from 'axios';

export const Api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  // Slow ops (enhance / export / large lists) can exceed 2 minutes behind the proxy.
  timeout: 600_000, // 10 minutes
});

Api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('scanner_user');
  if (raw) {
    const token = JSON.parse(raw)?.Authorization;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('scanner_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default Api;
