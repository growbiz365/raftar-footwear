import { useEffect } from 'react';
import { useSettings } from '../../store/settingsContext';

/**
 * Keeps the browser tab favicon (and iOS home-screen icon) in sync with the
 * logo uploaded from the dashboard. Mount this once at the app root.
 */
export default function FaviconSync() {
  const { settings } = useSettings();
  const logo = settings?.logo;

  useEffect(() => {
    const src = typeof logo === 'string' && logo.trim() ? logo.trim() : '';
    if (!src || src.startsWith('/uploads/')) return;

    const setLink = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    setLink('icon', src);
    setLink('apple-touch-icon', src);
  }, [logo]);

  return null;
}