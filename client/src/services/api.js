import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Necessary for HttpOnly cookies
});

// Response interceptor to handle session expiry automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Potentially redirect to login or clear store
      console.warn('Session expired or unauthorized access.');
    }
    return Promise.reject(error);
  }
);

export default api;
