"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCallback, useEffect, useState } from "react";

type Business = {
  id: string;
  businessName: string;
  email: string;
  category: string;
  country: string;
  city: string;
  plan: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt?: string;
};

export default function AdminBusinessesPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async (query = q) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/businesses?q=${encodeURIComponent(query)}`, {
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok: boolean; businesses?: Business[]; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Failed to load");
      setItems(data.businesses ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load("");
  }, []);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-interactive flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input
            label="Search tenants"
            placeholder="Name, email, city…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
          />
        </div>
        <Button type="button" variant="primary" onClick={() => void load()}>
          Search
        </Button>
      </div>

      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
      {loading ? <p className="text-sm text-muted">Loading businesses…</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-surface/80 backdrop-blur-md">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-b border-[var(--border)]/70 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{b.businessName}</p>
                  <p className="text-xs text-muted">{b.email}</p>
                  <p className="text-xs text-muted">
                    {b.category} · {b.city}, {b.country}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input-field max-w-[10rem] py-1.5 text-xs"
                    value={b.plan}
                    disabled={busyId === b.id}
                    onChange={(e) => void patch(b.id, { plan: e.target.value })}
                  >
                    <option value="Free Trial">Free Trial</option>
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className={b.isVerified ? "text-emerald-400" : "text-amber-400"}>
                      {b.isVerified ? "Verified" : "Unverified"}
                    </span>
                    <span className={b.isSuspended ? "text-[var(--danger-text)]" : "text-muted"}>
                      {b.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {!b.isVerified ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="!px-2.5 !py-1.5 text-xs"
                        disabled={busyId === b.id}
                        onClick={() => void patch(b.id, { isVerified: true })}
                      >
                        Verify
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant={b.isSuspended ? "primary" : "danger"}
                      className="!px-2.5 !py-1.5 text-xs"
                      disabled={busyId === b.id}
                      onClick={() => void patch(b.id, { isSuspended: !b.isSuspended })}
                    >
                      {b.isSuspended ? "Unsuspend" : "Suspend"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No businesses found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
