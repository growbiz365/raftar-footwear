import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { STATIC_SETTINGS, getLocalSettings } from '../data/catalog';

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
  const [loaded, setLoaded] = useState(!!cached.current);
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
        } else {
          setSettings(getLocalSettings());
        }
      })
      .catch(() => {
        setSettings(getLocalSettings());
      })
      .finally(() => setLoaded(true));
  }, []);

  // First visit with no cache: hold the app on a blank screen instead of
  // painting the old defaults. Render as soon as settings (or a fallback)
  // are available — the fetch error path still releases the gate.
  if (!loaded) {
    return <div className="min-h-screen bg-white" aria-hidden="true" />;
  }

  return (
    <SettingsContext.Provider value={{ settings: settings || STATIC_SETTINGS, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}