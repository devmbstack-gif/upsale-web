"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { UserCog } from "lucide-react";

export const ADMIN_NAV = [
  { href: "/admin/businesses", label: "Businesses / Tenants", icon: "▣" },
  { href: "/admin/packages", label: "Packages Manager", icon: "◈" },
  { href: "/admin/trial", label: "Trial Settings", icon: "◷" },
  { href: "/admin/cms", label: "Site Sections CMS", icon: "✎" },
  { href: "/admin/platform", label: "Platform Settings", icon: "⚙" },
  { href: "/admin/health", label: "System Health", icon: "♡" },
  { href: "/admin/audit", label: "Audit Logs", icon: "☰" },
  { href: "/admin/account", label: "Admin Account", icon: UserCog },
] as const;

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      onClose();
      router.push("/admin/login");
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
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(300px,88vw)] flex-col border-r border-[var(--border)] bg-surface/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 lg:h-full lg:w-72 lg:shrink-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative flex items-center justify-center border-b border-[var(--border)] px-4 py-6 md:px-5">
          <Link
            href="/admin/businesses"
            onClick={onClose}
            className="inline-flex justify-center overflow-visible"
            aria-label="UPSale Super Admin home"
          >
            <BrandLogo variant="auto" size="lg" />
          </Link>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:bg-[var(--hover-surface)] lg:hidden md:right-4"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ADMIN_NAV.map((item, index) => {
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
                <span className="text-base opacity-90" aria-hidden>
                  {typeof item.icon === "string" ? item.icon : <item.icon size={16} strokeWidth={2} />}
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
            {signingOut ? "Signing out…" : "Logout"}
          </Button>
        </div>
      </aside>
    </>
  );
}
