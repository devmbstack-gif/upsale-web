"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Activity,
  Database,
  Package,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type HealthPayload = {
  ok: boolean;
  message?: string;
  email?: string;
  health?: {
    mongodb: string;
    latencyMs: number;
    counts: { businesses: number; packages: number; superAdmins: number };
  };
};

function computeHealthScore(mongodb: string, latencyMs: number) {
  if (mongodb !== "connected") return 42;
  const penalty = Math.min(40, Math.round(latencyMs / 25));
  return Math.max(60, 100 - penalty);
}

function strategyLabel(score: number) {
  if (score >= 95) return "Optimal";
  if (score >= 85) return "Stable";
  if (score >= 70) return "Watch";
  return "Degraded";
}

function MiniBars({
  values,
  accent = "var(--brand-to)",
}: {
  values: number[];
  accent?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-10 items-end gap-1" aria-hidden>
      {values.map((v, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ background: accent, opacity: 0.45 + (v / max) * 0.55 }}
          initial={{ height: 4 }}
          animate={{ height: Math.max(6, (v / max) * 40) }}
          transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

function sparkFromCount(n: number, seed = 1) {
  return Array.from({ length: 8 }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.9) * 0.35 + 0.65;
    return Math.max(1, Math.round((n || 1) * wave * ((i % 3) + 1) * 0.35));
  });
}

function HealthGauge({ score, latencyMs }: { score: number; latencyMs: number }) {
  const radius = 54;
  const stroke = 10;
  const cx = 70;
  const cy = 68;
  // Semi-circle from 180° to 0° (left to right)
  const startAngle = Math.PI;
  const endAngle = 0;
  const polar = (angle: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy - radius * Math.sin(angle),
  });
  const start = polar(startAngle);
  const end = polar(endAngle);
  const track = `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  const circumference = Math.PI * radius;
  const progress = (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const strategy = strategyLabel(score);

  return (
    <div className="relative mx-auto w-[140px]">
      <svg viewBox="0 0 140 86" className="h-auto w-full overflow-visible">
        <defs>
          <linearGradient id="health-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
          <filter id="health-gauge-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={track}
          fill="none"
          stroke="rgba(196,181,253,0.14)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <motion.path
          d={track}
          fill="none"
          stroke="url(#health-gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          filter="url(#health-gauge-glow)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 text-center">
        <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {score}%
        </p>
        <p className="text-[0.65rem] uppercase tracking-wide text-muted">Uptime</p>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[0.7rem] text-muted">
        <span>{latencyMs} ms</span>
        <span className="font-medium text-brand-to">{strategy}</span>
      </div>
    </div>
  );
}

function MetricShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-interactive relative overflow-hidden p-5",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.14),transparent_55%)]",
        className,
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export function AdminHealthMetrics() {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/health", { credentials: "same-origin" });
        const payload = (await res.json()) as HealthPayload;
        if (!cancelled && res.ok && payload.ok) setData(payload);
      } catch {
        /* keep empty */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const health = data?.health;
  const score = useMemo(() => {
    if (!health) return 0;
    return computeHealthScore(health.mongodb, health.latencyMs);
  }, [health]);

  if (loading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricShell key={i}>
            <Skeleton className="mb-3 h-3 w-24" />
            <Skeleton className="mx-auto h-20 w-28 rounded-full" />
            <Skeleton className="mt-3 h-3 w-full" />
          </MetricShell>
        ))}
      </section>
    );
  }

  if (!health) {
    return (
      <section className="card-interactive flex items-center gap-3 p-4 text-sm text-muted">
        <Activity size={18} className="text-brand-to" />
        System health metrics unavailable right now.
      </section>
    );
  }

  const mongoOk = health.mongodb === "connected";
  const businessBars = sparkFromCount(health.counts.businesses, 2);
  const packageBars = sparkFromCount(health.counts.packages + health.counts.superAdmins, 5);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricShell>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
          <Activity size={14} className="text-brand-to" />
          System Health
        </div>
        <HealthGauge score={score} latencyMs={health.latencyMs} />
        <p className="mt-2 text-center text-[0.7rem] text-muted">
          Latency · Strategy status
        </p>
      </MetricShell>

      <MetricShell>
        <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
          <ShieldCheck size={14} className="text-brand-to" />
          Session & Security
        </div>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">Super Admin</p>
              <p className="text-xs text-muted">{data?.message ?? "Access granted"}</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-400">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-surface/50 px-3 py-2">
            <Database size={16} className={mongoOk ? "text-emerald-400" : "text-amber-400"} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground">MongoDB</p>
              <p className="truncate text-[0.7rem] capitalize text-muted">{health.mongodb}</p>
            </div>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                mongoOk ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" : "bg-amber-400",
              )}
            />
          </div>
          <p className="truncate text-xs text-muted">
            Session · <span className="text-foreground/90">{data?.email ?? "—"}</span>
          </p>
        </div>
      </MetricShell>

      <MetricShell>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Building2 size={14} className="text-brand-to" />
              Tenants
            </div>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">
              {health.counts.businesses}
            </p>
            <p className="mt-1 text-xs text-muted">Total businesses</p>
          </div>
          <MiniBars values={businessBars} />
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] text-emerald-400/90">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live platform count
        </div>
      </MetricShell>

      <MetricShell>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Package size={14} className="text-brand-to" />
              Packages / Admins
            </div>
            <p className="font-display mt-2 text-3xl font-semibold tracking-tight">
              {health.counts.packages}
              <span className="text-lg text-muted"> / {health.counts.superAdmins}</span>
            </p>
            <p className="mt-1 text-xs text-muted">Plans · Super admins</p>
          </div>
          <MiniBars values={packageBars} accent="#a78bfa" />
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] text-brand-to/90">
          <Users size={12} />
          RBAC roles synced
        </div>
      </MetricShell>
    </section>
  );
}

export default AdminHealthMetrics;
