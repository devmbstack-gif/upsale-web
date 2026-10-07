"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Menu } from "lucide-react";

type AdminTopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
};

export function AdminTopbar({ title, subtitle, onMenuClick }: AdminTopbarProps) {
  return (
    <header className="app-topbar z-30 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-background/80 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--border)] p-0 text-muted transition hover:bg-[var(--hover-surface)] lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} aria-hidden />
        </button>
        <div className="min-w-0">
          <h1 className="font-display truncate text-lg font-semibold tracking-tight md:text-xl">
            {title}
          </h1>
          {subtitle ? <p className="truncate text-sm text-muted">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
