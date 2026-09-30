"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AmbientOrbs } from "@/components/ui/AmbientOrbs";
import { PageTransition } from "@/components/ui/PageTransition";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/app": {
    title: "Overview",
    subtitle: "Your business at a glance",
  },
  "/app/profile": {
    title: "Business profile",
    subtitle: "Settings and subscription",
  },
  "/app/offers": {
    title: "QR offers",
    subtitle: "Manage discounts and rewards",
  },
  "/app/offers/new": {
    title: "Create offer",
    subtitle: "Publish a new QR campaign",
  },
  "/app/customers": {
    title: "Customers",
    subtitle: "Engagement and visit history",
  },
  "/app/coupons": {
    title: "Coupons",
    subtitle: "Issued and redeemed codes",
  },
  "/app/deals": {
    title: "Deals",
    subtitle: "WhatsApp campaigns by segment",
  },
};

function resolveHeader(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/app/offers/")) {
    return { title: "Offer details", subtitle: "QR, link, and performance" };
  }
  if (pathname.startsWith("/app/customers/")) {
    return { title: "Customer", subtitle: "Profile and activity" };
  }
  return { title: "Dashboard", subtitle: undefined };
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const header = useMemo(() => resolveHeader(pathname), [pathname]);

  return (
    <div className="bg-atmosphere relative flex h-dvh overflow-hidden">
      <AmbientOrbs />
      <div className="relative z-10 flex h-full min-h-0 w-full">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Topbar
            title={header.title}
            subtitle={header.subtitle}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-6 md:px-8 md:pt-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
