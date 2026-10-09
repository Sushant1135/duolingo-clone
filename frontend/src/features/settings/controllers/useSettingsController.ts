"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "@/shared/controllers/ThemeProvider";
import { sound } from "@/services/audio";
import {
  defaultPreferenceSnapshot,
  getPreferenceSnapshot,
  parsePreferences,
  preferenceStorageKey,
  subscribeToPreferences,
  type PreferenceKey,
} from "@/features/settings/models/preferences";

export function useSettingsController() {
  const { theme, setTheme } = useTheme();
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const preferenceSnapshot = useSyncExternalStore(
    subscribeToPreferences,
    getPreferenceSnapshot,
    () => defaultPreferenceSnapshot,
  );
  const preferences = parsePreferences(preferenceSnapshot);

  useEffect(() => {
    sound.setMuted(!preferences.soundEffects);
  }, [preferences.soundEffects]);

  const togglePreference = (key: PreferenceKey) => {
    const nextPreferences = { ...preferences, [key]: !preferences[key] };
    window.localStorage.setItem(preferenceStorageKey, JSON.stringify(nextPreferences));
    window.dispatchEvent(new Event("duo-preferences-change"));
  };

  const showNotice = (title: string, message: string) => setNotice({ title, message });

  return { theme, setTheme, preferences, togglePreference, notice, showNotice, closeNotice: () => setNotice(null) };
}
