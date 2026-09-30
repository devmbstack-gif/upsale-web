"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminTopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
};

export function AdminTopbar({ title, subtitle, onMenuClick }: AdminTopbarProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="z-30 flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-background/80 px-4 py-4 backdrop-blur-md md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-[var(--border)] p-2.5 text-muted transition hover:bg-[var(--hover-surface)] lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
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
        <Button
          type="button"
          variant="secondary"
          className="hidden sm:inline-flex"
          disabled={signingOut}
          onClick={() => void signOut()}
        >
          {signingOut ? "Signing out…" : "Logout"}
        </Button>
      </div>
    </header>
  );
}
