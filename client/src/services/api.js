import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005/api',
  withCredentials: true, // Required for HttpOnly cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

// Response interceptor — auto-refresh on 401, then retry original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and not on the refresh/login routes themselves
    const isAuthRoute = 
      originalRequest.url.includes('/auth/refresh') || 
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/verify-mfa');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      // Don't even try to refresh if we are already on the login page or MFA page
      const currentPath = window.location.pathname;
      const isPublicPage = ['/login', '/register', '/mfa/verify'].some(p => currentPath.startsWith(p));

      if (isPublicPage) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue additional requests while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest); // Retry original request with new cookie
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        
        // Refresh failed — redirect to login if not already there
        if (!isPublicPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
