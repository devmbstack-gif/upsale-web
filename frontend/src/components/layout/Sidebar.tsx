"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/app", label: "Overview", icon: "◫" },
  { href: "/app/offers", label: "Offers", icon: "◎" },
  { href: "/app/customers", label: "Customers", icon: "◉" },
  { href: "/app/coupons", label: "Coupons", icon: "▣" },
  { href: "/app/profile", label: "Profile", icon: "◈" },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      onClose();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ background: "var(--overlay)" }}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(300px,88vw)] flex-col border-r border-[var(--border)] bg-surface/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 lg:w-72 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-6 md:px-5">
          <Link href="/app" onClick={onClose} className="min-w-0 flex-1 overflow-visible">
            <BrandLogo size="lg" />
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-muted hover:bg-[var(--hover-surface)] lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{ transitionDelay: `${index * 30}ms` }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active
                    ? "sidebar-link-active translate-x-0.5 text-foreground"
                    : "text-muted hover:translate-x-1 hover:bg-[var(--hover-surface)] hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "text-base transition-transform duration-300",
                    active ? "scale-110 opacity-100" : "opacity-80 group-hover:scale-110",
                  )}
                  aria-hidden
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={signingOut}
            onClick={() => void signOut()}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>
    </>
  );
}
