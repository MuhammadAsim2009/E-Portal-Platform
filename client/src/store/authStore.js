import { create } from 'zustand';
import api from '../services/api.js';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  /**
   * Initialize auth by checking /me endpoint
   */
  initAuth: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  /**
   * Login action
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      set({ user: response.data.user, isAuthenticated: true });
      return { success: true, user: response.data.user, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  },

  /**
   * Logout action
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));

export default useAuthStore;
