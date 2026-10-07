"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Plus } from "lucide-react";

type TopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
};

type ProfileAvatar = {
  logoUrl?: string;
  businessName?: string;
};

function initialsFromName(name: string | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  const [avatar, setAvatar] = useState<ProfileAvatar>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/profile", { credentials: "same-origin" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { profile?: ProfileAvatar };
        if (!cancelled) {
          setAvatar({
            logoUrl: data.profile?.logoUrl ?? "",
            businessName: data.profile?.businessName ?? "",
          });
        }
      } catch {
        /* ignore */
      }
    })();

    function onLogoEvent(event: Event) {
      const detail = (event as CustomEvent<{ logoUrl?: string; businessName?: string }>).detail;
      setAvatar((current) => ({
        logoUrl: detail?.logoUrl ?? "",
        businessName: detail?.businessName ?? current.businessName,
      }));
    }
    window.addEventListener("upsale:logo", onLogoEvent);
    return () => {
      cancelled = true;
      window.removeEventListener("upsale:logo", onLogoEvent);
    };
  }, []);

  const logoUrl = avatar.logoUrl?.trim() ?? "";

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
          {subtitle ? (
            <p className="truncate text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <ThemeToggle />
        <Button href="/app/offers/new" variant="primary" className="h-10 w-10 !p-0 sm:w-auto sm:!px-4" aria-label="Create new offer">
          <Plus size={19} aria-hidden />
          <span className="sr-only sm:hidden">Create new offer</span>
          <span className="hidden sm:inline">New offer</span>
        </Button>
        <Link
          href="/app/profile"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-surface-elevated text-sm font-medium text-brand-to transition hover:border-[rgba(196,181,253,0.35)]"
          aria-label="Profile"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initialsFromName(avatar.businessName)
          )}
        </Link>
      </div>
    </header>
  );
}
