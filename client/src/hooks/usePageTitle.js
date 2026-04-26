import { useEffect } from 'react';
import useAuthStore from '../store/authStore.js';

/**
 * Sets the browser tab title for the current page.
 * @param {string} title - The page-specific title (e.g. "Dashboard")
 */
const usePageTitle = (title) => {
  const { siteSettings } = useAuthStore();
  const appName = siteSettings?.siteName || 'E-Portal';

  useEffect(() => {
    document.title = title ? `${title} | ${appName}` : appName;
    return () => {
      document.title = appName;
    };
  }, [title, appName]);
};

export default usePageTitle;
