"use client";

import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import { Reveal } from "@/components/ui/Reveal";
import { StatCard } from "@/components/ui/StatCard";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import DashboardHomeSkeleton from "@/components/dashboard/DashboardHomeSkeleton";

const RecentCustomersPanel = dynamic(
  () => import("@/components/dashboard/RecentCustomersPanel"),
  { loading: () => <PanelSkeleton rows={5} /> },
);

const QuickActionsPanel = dynamic(
  () => import("@/components/dashboard/QuickActionsPanel"),
  { loading: () => <PanelSkeleton rows={3} /> },
);

type Stats = {
  totalCustomers: number;
  activeOffers: number;
  couponsRedeemed: number;
  totalScans: number;
  usage?: { campaigns: number; aiGenerations: number };
  limits?: { customers: number; campaignsPerMonth: number; aiGenerations: number } | null;
};

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [statsRes, profileRes] = await Promise.all([
        fetch("/api/dashboard/stats", { credentials: "same-origin" }),
        fetch("/api/profile", { credentials: "same-origin" }),
      ]);
      if (statsRes.ok) {
        const data = (await statsRes.json()) as { stats: Stats };
        setStats(data.stats);
      } else {
        setStats({
          totalCustomers: 0,
          activeOffers: 0,
          couponsRedeemed: 0,
          totalScans: 0,
        });
      }
      if (profileRes.ok) {
        const data = (await profileRes.json()) as {
          profile?: { businessName?: string };
        };
        setBusinessName(data.profile?.businessName ?? "Your business");
      } else {
        setBusinessName("Your business");
      }
    })();
  }, []);

  if (!stats || businessName === null) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <Reveal>
        <div>
          <p className="text-sm text-muted">Welcome back</p>
          <h2 className="font-display mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="gradient-text">{businessName}</span>
          </h2>
        </div>
      </Reveal>

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Reveal delay={0} className="h-full [&>*]:h-full">
          <StatCard
            label="Customers"
            value={stats.totalCustomers}
            hint="Unique profiles in UPSale"
            icon={<span aria-hidden>◉</span>}
          />
        </Reveal>
        <Reveal delay={1} className="h-full [&>*]:h-full">
          <StatCard
            label="Active offers"
            value={stats.activeOffers}
            hint="Live QR campaigns"
            icon={<span aria-hidden>◎</span>}
          />
        </Reveal>
        <Reveal delay={2} className="h-full [&>*]:h-full">
          <StatCard
            label="Coupons redeemed"
            value={stats.couponsRedeemed}
            hint="All time"
            icon={<span aria-hidden>▣</span>}
          />
        </Reveal>
        <Reveal delay={3} className="h-full [&>*]:h-full">
          <StatCard
            label="Scans"
            value={stats.totalScans.toLocaleString()}
            hint="Across all offers"
            icon={<span aria-hidden>◫</span>}
          />
        </Reveal>
      </div>

      {stats.limits ? (
        <Reveal>
          <section className="card-interactive p-5 md:p-6">
            <div><h3 className="font-display text-lg font-semibold">Monthly plan usage</h3><p className="mt-1 text-sm text-muted">Your usage resets at the beginning of each month.</p></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] p-4"><p className="text-xs uppercase tracking-wide text-muted">Customers</p><p className="font-display mt-1 text-xl font-semibold">{stats.totalCustomers} <span className="text-sm font-normal text-muted">/ {stats.limits.customers || "Unlimited"}</span></p></div>
              <div className="rounded-xl border border-[var(--border)] p-4"><p className="text-xs uppercase tracking-wide text-muted">Campaigns</p><p className="font-display mt-1 text-xl font-semibold">{stats.usage?.campaigns ?? 0} <span className="text-sm font-normal text-muted">/ {stats.limits.campaignsPerMonth || "Unlimited"}</span></p></div>
              <div className="rounded-xl border border-[var(--border)] p-4"><p className="text-xs uppercase tracking-wide text-muted">AI deals</p><p className="font-display mt-1 text-xl font-semibold">{stats.usage?.aiGenerations ?? 0} <span className="text-sm font-normal text-muted">/ {stats.limits.aiGenerations || "Unlimited"}</span></p></div>
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal delay={1} variant="scale">
        <RecentCustomersPanel />
      </Reveal>

      <Reveal delay={2} variant="scale">
        <QuickActionsPanel />
      </Reveal>
    </div>
  );
}
