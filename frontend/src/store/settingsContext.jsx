import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { STATIC_SETTINGS } from '../data/catalog';

// Persisted copy of the last payload from GET /api/settings. Lets repeat visits
// paint instantly with the correct hero/logo instead of flashing the code
// defaults first. The first-ever visit (no cache — e.g. private window) is
// blocked by <SettingsProvider> until the fetch resolves, so old defaults
// never flash on screen.
const STORAGE_KEY = 'raftar_live_settings_v1';

function readCached() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      if (v && typeof v === 'object') return v;
    }
  } catch {
    /* ignore corrupted cache */
  }
  return null;
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const cached = useRef(readCached());
  const [settings, setSettings] = useState(cached.current || null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api
      .get('/settings')
      .then((r) => {
        const d = r.data?.data;
        if (d) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
          } catch {
            /* storage unavailable */
          }
          setSettings(d);
        }
      })
      .catch(() => {
        /* keep current fallback — never block the page on settings */
      });
  }, []);

  // Never gate the app on settings: first paint always happens immediately
  // with cached settings (or the aligned code defaults). Settings load in the
  // background, so there is no blank screen — on slow API responses the app
  // just swaps in the live values a moment later.
  return (
    <SettingsContext.Provider value={{ settings: settings || STATIC_SETTINGS }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}