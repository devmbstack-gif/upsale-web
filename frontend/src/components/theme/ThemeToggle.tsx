"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (!spinning) return;
    const t = window.setTimeout(() => setSpinning(false), 450);
    return () => window.clearTimeout(t);
  }, [spinning]);

  return (
    <button
      type="button"
      onClick={() => {
        setSpinning(true);
        toggleTheme();
      }}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-surface-elevated text-muted transition-colors duration-200 hover:bg-[var(--hover-surface)] hover:text-foreground hover:scale-105 active:scale-95",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span
        className={cn("theme-toggle-icon text-base leading-none", spinning && "is-spinning")}
        aria-hidden
      >
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}
