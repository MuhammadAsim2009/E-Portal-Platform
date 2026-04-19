import { useEffect } from 'react';

const APP_NAME = 'E-Portal';

/**
 * Sets the browser tab title for the current page.
 * @param {string} title - The page-specific title (e.g. "Dashboard")
 */
const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = APP_NAME;
    };
  }, [title]);
};

export default usePageTitle;
