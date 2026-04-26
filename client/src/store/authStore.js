import { create } from 'zustand';
import api from '../services/api.js';
import { getDeviceFingerprint } from '../utils/fingerprint.js';

const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour in ms

let inactivityTimer = null;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

const clearInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
};

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  siteSettings: {},

  /**
   * Start 1-hour inactivity watchdog.
   * Resets on any user interaction. Logs out automatically if idle.
   */
  startInactivityTimer: () => {
    const reset = () => {
      clearInactivityTimer();
      inactivityTimer = setTimeout(() => {
        console.warn('[Session] Logged out due to 1 hour of inactivity.');
        get().logout();
      }, INACTIVITY_LIMIT);
    };

    // Attach activity listeners
    ACTIVITY_EVENTS.forEach(evt => {
      window.removeEventListener(evt, reset); // prevent duplicate listeners
      window.addEventListener(evt, reset, { passive: true });
    });

    reset(); // Start the first timer immediately
  },

  /**
   * Stop the inactivity timer and remove listeners.
   */
  stopInactivityTimer: () => {
    clearInactivityTimer();
    const reset = () => {}; // no-op — listeners will just fire harmlessly
    ACTIVITY_EVENTS.forEach(evt => window.removeEventListener(evt, reset));
  },

  /**
   * Initialize auth by checking /me endpoint
   */
  initAuth: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/auth/me');
      if (response.data.authenticated) {
        set({ user: response.data.user, isAuthenticated: true, loading: false, siteSettings: response.data.siteSettings || {} });
        get().startInactivityTimer();
      } else {
        set({ user: null, isAuthenticated: false, loading: false, siteSettings: response.data.siteSettings || {} });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  /**
   * Login action
   */
  login: async (email, password) => {
    try {
      const fingerprint = await getDeviceFingerprint();
      const response = await api.post('/auth/login', { email, password, fingerprint });
      
      if (response.data.message === 'MFA REQUIRED') {
        return { success: false, mfaRequired: true, userId: response.data.userId };
      }

      set({ user: response.data.user, isAuthenticated: true });
      get().startInactivityTimer();
      return { success: true, user: response.data.user, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  },

  /**
   * Verify MFA code and finalize login
   */
  verifyMFA: async (userId, code) => {
    try {
      const fingerprint = await getDeviceFingerprint();
      const response = await api.post('/auth/verify-mfa', { userId, code, fingerprint });
      set({ user: response.data.user, isAuthenticated: true });
      get().startInactivityTimer();
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'MFA verification failed.'
      };
    }
  },

  /**
   * Logout action — clears session and stops inactivity timer
   */
  logout: async () => {
    clearInactivityTimer();
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, isAuthenticated: false });
      const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/login/';
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }
  },
}));

export default useAuthStore;
