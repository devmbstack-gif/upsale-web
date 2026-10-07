"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent,
  CreditCard,
  LayoutDashboard,
  X,
  Megaphone,
  MessageCircle,
  Sparkles,
  TicketCheck,
  UserRound,
  Users,
} from "lucide-react";

const nav = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/offers", label: "Offers", icon: BadgePercent },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/coupons", label: "Coupons", icon: TicketCheck },
  { href: "/app/deals", label: "Deals", icon: Megaphone },
  { href: "/app/ai", label: "AI Deal Maker", icon: Sparkles },
  { href: "/app/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/app/billing", label: "Plans & Billing", icon: CreditCard },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

const whatsAppFeatureEnabled = process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === "true";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(false);

  useEffect(() => {
    if (!whatsAppFeatureEnabled) return;
    let cancelled = false;
    async function checkWhatsApp() {
      try {
        const response = await fetch("/api/whatsapp/connection", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as { status?: string };
        if (!cancelled) setWhatsAppEnabled(response.ok && data.status === "connected");
      } catch {
        if (!cancelled) setWhatsAppEnabled(false);
      }
    }
    void checkWhatsApp();
    window.addEventListener("upsale:whatsapp-connected", checkWhatsApp);
    return () => {
      cancelled = true;
      window.removeEventListener("upsale:whatsapp-connected", checkWhatsApp);
    };
  }, []);

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
            if (item.href === "/app/whatsapp" && !whatsAppEnabled) {
              return (
                <div
                  key={item.href}
                  className="flex min-h-11 min-w-0 cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted opacity-60"
                  aria-disabled="true"
                  title="WhatsApp messaging is coming soon"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center" aria-hidden><item.icon size={19} strokeWidth={1.9} /></span>
                  <span className="min-w-0 flex-1 truncate leading-5">{item.label}</span>
                  <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Coming Soon</span>
                </div>
              );
            }
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
