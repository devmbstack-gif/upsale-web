"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BadgePercent,
  CreditCard,
  LayoutDashboard,
  X,
  Megaphone,
  Sparkles,
  TicketCheck,
  UserRound,
  Users,
} from "lucide-react";

function WhatsAppIcon({ size = 20, className, strokeWidth = 1.9 }: { size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.45L3.5 20.5l1.38-4.25A8.5 8.5 0 1 1 20.5 11.7Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.05 7.75c.18-.4.37-.4.62-.41h.52c.16 0 .37.06.48.32l.82 1.95c.09.22.04.4-.1.58l-.63.76c-.12.15-.13.3-.03.48.53.93 1.32 1.7 2.26 2.22.17.1.33.09.46-.06l.8-.92c.16-.18.35-.23.56-.14l1.9.9c.23.11.35.27.31.53-.08.55-.32 1.08-.72 1.45-.45.42-1.07.65-1.7.61-1.04-.07-2.72-.7-4.25-2.05-1.24-1.1-2.2-2.48-2.49-3.64-.26-1.03-.04-1.82.28-2.35l.91-1.17Z" fill="currentColor" />
    </svg>
  );
}

const nav = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/offers", label: "Offers", icon: BadgePercent },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/coupons", label: "Coupons", icon: TicketCheck },
  { href: "/app/deals", label: "Deals", icon: Megaphone },
  { href: "/app/ai", label: "AI Deal Maker", icon: Sparkles },
  { href: "/app/whatsapp", label: "WhatsApp", icon: WhatsAppIcon },
  { href: "/app/billing", label: "Plans & Billing", icon: CreditCard },
  { href: "/app/profile", label: "Profile", icon: UserRound },
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
          "app-sidebar fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(300px,88vw)] flex-col border-r border-[var(--border)] bg-surface/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 lg:h-full lg:w-72 lg:shrink-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-6 md:px-5">
          <Link href="/app" onClick={onClose} className="min-w-0 flex-1 overflow-visible">
            <BrandLogo variant="auto" size="lg" />
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-muted hover:bg-[var(--hover-surface)] lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
          {nav.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{ transitionDelay: `${index * 30}ms` }}
                className={cn(
                  "group flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active
                    ? "sidebar-link-active translate-x-0.5 text-foreground"
                    : "text-muted hover:translate-x-1 hover:bg-[var(--hover-surface)] hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center transition-transform duration-300",
                    active ? "scale-110 opacity-100" : "opacity-80 group-hover:scale-110",
                  )}
                  aria-hidden
                >
                  <item.icon size={19} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 truncate leading-5">{item.label}</span>
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
