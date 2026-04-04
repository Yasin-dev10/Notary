"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-10 animate-pulse rounded-xl" style={{ background: "var(--border-subtle)" }} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group"
      style={{
        background: "var(--border-subtle)",
        border: "1px solid var(--border-default)",
        color: "var(--text-muted)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--border-default)";
        e.currentTarget.style.color = "var(--text-heading)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--border-subtle)";
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {/* Track */}
      <span className="flex items-center gap-2.5">
        <span className="text-base leading-none">
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </span>
        <span className="tracking-wide uppercase" style={{ fontSize: "9px" }}>
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      </span>

      {/* Toggle pill */}
      <span
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300"
        style={{
          background: "var(--primary)",
          color: "var(--btn-text)",
          boxShadow: "0 2px 8px var(--btn-shadow)",
        }}
      >
        {isDark ? "Switch to Light" : "Switch to Dark"}
      </span>
    </button>
  );
}
