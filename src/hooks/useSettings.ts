// Hook pour charger les site_settings depuis le backend PHP.
// Retourne un objet settings et un helper get(key, fallback).

import { useEffect, useState } from "react";
import { fetchSettings, type SiteSettings } from "@/lib/api";

interface UseSettingsResult {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  /** Retourne la valeur d'un setting ou le fallback si absent / en cours de chargement */
  get: (key: string, fallback?: string) => string;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Erreur inconnue")
      )
      .finally(() => setLoading(false));
  }, []);

  const get = (key: string, fallback = ""): string =>
    settings[key] ?? fallback;

  return { settings, loading, error, get };
}
