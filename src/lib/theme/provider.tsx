"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "survpay-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Inline, synchronous, blocking script — rendered as the very first thing in
// <body>, before React hydrates. Reads the stored preference (or falls back
// to the OS setting) and flips the .dark class immediately, so the page
// never paints in the wrong theme and then flashes to the right one.
export function ThemeScript() {
  const script = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
    STORAGE_KEY
  )});var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;
  // eslint-disable-next-line react/no-danger -- static, non-interpolated script; nothing user-controlled reaches this string
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // ThemeScript already set the DOM class before hydration; read it back
  // once on mount so React's state agrees with what's actually on screen.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage can throw (private mode, blocked storage) — theme just
      // won't persist across visits, which is fine, not worth surfacing.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
