"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="nx-theme-switch">
      <span className="nx-theme-label">{isLight ? "LIGHT" : "DARK"}</span>
      <button
        type="button"
        className={`nx-toggle ${isLight ? "on" : ""}`}
        onClick={toggleTheme}
        aria-label="Toggle light and dark theme"
      >
        <span className="nx-toggle-knob" />
      </button>
    </div>
  );
}
