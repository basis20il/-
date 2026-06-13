import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, SiteSettings, siteFavicon } from '../lib/supabase';

interface SettingsContextValue {
  settings: SiteSettings | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({ settings: null, loading: true, reload: async () => {} });

// Default emoji favicon (cake) used until an admin uploads a custom one.
const DEFAULT_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8D%B0%3C/text%3E%3C/svg%3E";

const applyFavicon = (href: string) => {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href || DEFAULT_FAVICON;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    setSettings((data as SiteSettings) || null);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => { applyFavicon(siteFavicon(settings)); }, [settings]);

  return <SettingsContext.Provider value={{ settings, loading, reload }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
