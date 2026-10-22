"use client";

import { useSyncExternalStore } from "react";

export type ThemeMode = "system" | "light" | "dark";
export const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];

export const THEME_STORAGE_KEY = "ic-theme";
const CHANGE_EVENT = "ic-theme-change";

function isMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function readMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isMode(stored) ? stored : "system";
  } catch {
    return "system"; // storage can be blocked, e.g. in a private window
  }
}

/** Puts the resolved theme on <html>, which is what the CSS reads. */
function applyMode(mode: ThemeMode) {
  const dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function setThemeMode(mode: ThemeMode) {
  try {
    if (mode === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Not remembered, but it still applies for this visit.
  }
  applyMode(mode);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // another tab changed it
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The chosen mode. The server and the first client render say "system"; the real choice follows right after. */
export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, readMode, () => "system");
}
