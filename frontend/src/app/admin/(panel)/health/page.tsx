"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

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

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ping() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/health", { credentials: "same-origin" });
      const payload = (await response.json()) as HealthPayload;
      if (!response.ok || !payload.ok) {
        setError(payload.message ?? `Health check failed (${response.status})`);
        setData(null);
        return;
      }
      setData(payload);
    } catch {
      setError("Could not reach the health endpoint.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void ping();
  }, []);

  return (
    <div className="card-interactive mx-auto max-w-2xl space-y-5 p-6 md:p-8">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">System Health</h2>
        <p className="mt-2 text-sm text-muted">
          Live check of Super Admin RBAC, MongoDB connectivity, and core collection counts.
        </p>
      </div>

      <Button type="button" variant="primary" disabled={loading} onClick={() => void ping()}>
        {loading ? "Checking…" : "Run health check"}
      </Button>

      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}

      {data?.health ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted">MongoDB</p>
            <p className="mt-1 font-medium capitalize">{data.health.mongodb}</p>
            <p className="text-xs text-muted">{data.health.latencyMs} ms</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Session</p>
            <p className="mt-1 font-medium">{data.message}</p>
            <p className="text-xs text-muted">{data.email}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Businesses</p>
            <p className="mt-1 text-2xl font-semibold">{data.health.counts.businesses}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-surface-elevated/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted">Packages / Admins</p>
            <p className="mt-1 text-2xl font-semibold">
              {data.health.counts.packages} / {data.health.counts.superAdmins}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
