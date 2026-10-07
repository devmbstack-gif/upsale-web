"use client";

import { AdminSidebar, ADMIN_NAV } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AmbientOrbs } from "@/components/ui/AmbientOrbs";
import { PageTransition } from "@/components/ui/PageTransition";
import { usePathname } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/admin/businesses": {
    title: "Businesses / Tenants",
    subtitle: "Manage owner accounts and subscriptions",
  },
  "/admin/packages": {
    title: "Packages Manager",
    subtitle: "Plans, limits, and country pricing",
  },
  "/admin/trial": {
    title: "Trial Settings",
    subtitle: "Free trial length and fair-usage caps",
  },
  "/admin/cms": {
    title: "Site Sections CMS",
    subtitle: "Landing and marketing content",
  },
  "/admin/platform": {
    title: "Platform Settings",
    subtitle: "API keys and public URLs",
  },
  "/admin/health": {
    title: "System Health",
    subtitle: "Connectivity and service status",
  },
  "/admin/audit": {
    title: "Audit Logs",
    subtitle: "Platform change history",
  },
  "/admin/account": {
    title: "Admin Account",
    subtitle: "Security and password",
  },
};

function resolveHeader(pathname: string) {
  if (titles[pathname]) return titles[pathname];
  const match = ADMIN_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (match) return { title: match.label };
  return { title: "Super Admin", subtitle: "Platform console" };
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const header = useMemo(() => resolveHeader(pathname), [pathname]);

  return (
    <div className="bg-atmosphere relative flex h-dvh overflow-hidden">
      <AmbientOrbs />
      <div className="relative z-10 flex h-full min-h-0 w-full">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AdminTopbar
            title={header.title}
            subtitle={header.subtitle}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="app-main min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-8 pt-5 sm:px-4 sm:pb-10 sm:pt-6 md:px-8 md:pt-8">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
