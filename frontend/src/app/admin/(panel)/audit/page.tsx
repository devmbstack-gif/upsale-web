"use client";

import AdminAuditSkeleton from "@/components/admin/AdminAuditSkeleton";
import { Button } from "@/components/ui/Button";
import { useCallback, useEffect, useState } from "react";

type Log = {
  id: string;
  action: string;
  entity: string;
  previousValue: unknown;
  newValue: unknown;
  timestamp: string;
  user: { id: string; email: string; name: string } | null;
};

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/audit?limit=100", { credentials: "same-origin" });
      const data = (await res.json()) as { ok: boolean; logs?: Log[]; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Failed to load");
      setLogs(data.logs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && logs.length === 0) {
    return <AdminAuditSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Latest platform actions</p>
        <Button type="button" variant="secondary" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}

      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="card-interactive p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{log.action}</p>
                <p className="text-xs text-muted">{log.entity}</p>
                <p className="mt-1 text-xs text-muted">
                  {log.user?.email ?? "unknown"} ·{" "}
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="!px-2 !py-1 text-xs"
                onClick={() => setExpanded(expanded === log.id ? "" : log.id)}
              >
                {expanded === log.id ? "Hide" : "Details"}
              </Button>
            </div>
            {expanded === log.id ? (
              <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-background/60 p-3 text-[0.7rem] text-muted">
                {JSON.stringify(
                  { previousValue: log.previousValue, newValue: log.newValue },
                  null,
                  2,
                )}
              </pre>
            ) : null}
          </div>
        ))}
        {logs.length === 0 ? (
          <p className="text-sm text-muted">No audit events yet.</p>
        ) : null}
      </div>
    </div>
  );
}
