"use client";

import { useEffect, useState } from "react";
import type { ThemeMode } from "@/src/lib/types";

const STORAGE_KEY = "pcm-admin-theme";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

  root.dataset.theme = mode;
  root.style.colorScheme = resolved;
  root.classList.toggle("dark", resolved === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    return (window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
  });

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentTheme = (window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
      if (currentTheme === "system") {
        applyTheme(currentTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  function handleThemeChange(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="inline-flex rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-1 shadow-sm">
      {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => handleThemeChange(mode)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
            theme === mode
              ? "bg-[var(--admin-accent)] text-white"
              : "text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-foreground)]"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
