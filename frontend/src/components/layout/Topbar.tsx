"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
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

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  const logoUrl = avatar.logoUrl?.trim() ?? "";

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
          {subtitle ? (
            <p className="truncate text-sm text-muted">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <Button href="/app/offers/new" variant="primary" className="hidden sm:inline-flex">
          New offer
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="hidden sm:inline-flex"
          disabled={signingOut}
          onClick={() => void signOut()}
        >
          {signingOut ? "Signing out…" : "Sign out"}
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
