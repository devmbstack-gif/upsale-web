"use client";

import AdminHealthMetrics from "@/components/admin/AdminHealthMetrics";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { BadgeCheck, Trash2, UserCheck, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Business = {
  id: string;
  businessName: string;
  email: string;
  category: string;
  country: string;
  city: string;
  plan: string;
  planSlug: string;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt?: string;
};

type PlanOption = { id: string; name: string; slug: string; isActive: boolean };

function TableSkeleton() {
  return (
    <>
    <div className="grid gap-4 md:hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-interactive space-y-4 p-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="flex justify-between"><Skeleton className="h-7 w-32 rounded-full" /><Skeleton className="h-9 w-9 rounded-lg" /></div>
        </div>
      ))}
    </div>
    <div className="hidden rounded-2xl border border-[var(--border)] bg-surface/80 backdrop-blur-md md:block">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] text-muted">
          <tr>
            {Array.from({ length: 4 }).map((_, i) => (
              <th key={i} className="px-4 py-3 font-medium">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-[var(--border)]/70">
              <td className="px-4 py-3">
                <Skeleton className="mb-1 h-4 w-32" />
                <Skeleton className="mb-1 h-3 w-40" />
                <Skeleton className="h-3 w-36" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-8 w-28 rounded-xl" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="mb-1 h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

export default function AdminBusinessesPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Business[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null);

  const load = useCallback(async (query = q) => {
    setLoading(true);
    setError("");
    try {
      const [res, plansRes] = await Promise.all([
        fetch(`/api/admin/businesses?q=${encodeURIComponent(query)}`, { credentials: "same-origin" }),
        fetch("/api/admin/packages", { credentials: "same-origin" }),
      ]);
      const data = (await res.json()) as { ok: boolean; businesses?: Business[]; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Failed to load");
      setItems(data.businesses ?? []);
      if (plansRes.ok) {
        const plansData = (await plansRes.json()) as { packages?: PlanOption[] };
        setPlans((plansData.packages ?? []).filter((plan) => plan.isActive));
      }
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

  async function deleteBusiness() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/businesses/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Delete failed");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <AdminHealthMetrics />

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

      {loading && items.length === 0 ? (
        <TableSkeleton />
      ) : (
        <>
        <div className="grid gap-4 md:hidden">
          {items.map((b) => (
            <article key={b.id} className="card-interactive min-w-0 space-y-4 p-4">
              <div className="min-w-0 border-b border-[var(--border)] pb-3">
                <p className="font-display text-base font-semibold text-foreground">{b.businessName}</p>
                <p className="mt-1 break-all text-xs text-muted">{b.email}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{b.category} · {b.city}, {b.country}</p>
              </div>
              <label className="block min-w-0 space-y-1.5 text-sm font-medium">
                <span>Plan</span>
                <select
                  className="input-field w-full py-2.5 text-sm"
                  value={b.planSlug || ""}
                  disabled={busyId === b.id}
                  onChange={(e) => void patch(b.id, { planSlug: e.target.value })}
                >
                  {!b.planSlug ? <option value="">Plan not selected</option> : null}
                  {b.planSlug && b.planSlug !== "free-trial" && !plans.some((plan) => plan.slug === b.planSlug) ? <option value={b.planSlug}>{b.plan || b.planSlug} (Unavailable)</option> : null}
                  <option value="free-trial">Free Trial</option>
                  {plans.map((plan) => <option key={plan.id} value={plan.slug}>{plan.name}</option>)}
                </select>
              </label>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full border px-2.5 py-1 ${b.isVerified ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-amber-500/25 bg-amber-500/10 text-amber-400"}`}>{b.isVerified ? "Verified" : "Unverified"}</span>
                  <span className={`rounded-full border px-2.5 py-1 ${b.isSuspended ? "border-red-500/25 bg-red-500/10 text-[var(--danger-text)]" : "border-[var(--border)] text-muted"}`}>{b.isSuspended ? "Suspended" : "Active"}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!b.isVerified ? <IconButton icon={BadgeCheck} label="Verify Business" tone="success" disabled={busyId === b.id} onClick={() => void patch(b.id, { isVerified: true })} /> : null}
                  <IconButton icon={b.isSuspended ? UserCheck : UserX} label={b.isSuspended ? "Unsuspend Business" : "Suspend Business"} tone={b.isSuspended ? "primary" : "danger"} disabled={busyId === b.id} onClick={() => void patch(b.id, { isSuspended: !b.isSuspended })} />
                  <IconButton icon={Trash2} label="Delete Business" tone="danger" disabled={busyId === b.id} onClick={() => setDeleteTarget(b)} />
                </div>
              </div>
            </article>
          ))}
          {items.length === 0 ? <div className="card-interactive p-8 text-center text-sm text-muted">No businesses found.</div> : null}
        </div>

        <div className="hidden rounded-2xl border border-[var(--border)] bg-surface/80 backdrop-blur-md md:block">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="border-b border-[var(--border)] text-muted">
              <tr>
                <th className="w-[42%] px-4 py-3 font-medium">Business</th>
                <th className="w-[25%] px-4 py-3 font-medium">Plan</th>
                <th className="w-[18%] px-4 py-3 font-medium">Status</th>
                <th className="w-[15%] px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-[var(--border)]/70 align-top">
                  <td className="px-4 py-3">
                    <p className="truncate font-medium text-foreground" title={b.businessName}>{b.businessName}</p>
                    <p className="break-all text-xs text-muted">{b.email}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {b.category} · {b.city}, {b.country}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="input-field min-w-[9rem] py-2 text-sm"
                      value={b.planSlug || ""}
                      disabled={busyId === b.id}
                      onChange={(e) => void patch(b.id, { planSlug: e.target.value })}
                    >
                      {!b.planSlug ? <option value="">Plan not selected</option> : null}
                      {b.planSlug && b.planSlug !== "free-trial" && !plans.some((plan) => plan.slug === b.planSlug) ? <option value={b.planSlug}>{b.plan || b.planSlug} (Unavailable)</option> : null}
                      <option value="free-trial">Free Trial</option>
                      {plans.map((plan) => <option key={plan.id} value={plan.slug}>{plan.name}</option>)}
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
                    <div className="flex flex-wrap items-center gap-1.5">
                      {!b.isVerified ? (
                        <IconButton
                          icon={BadgeCheck}
                          label="Verify Business"
                          tone="success"
                          disabled={busyId === b.id}
                          onClick={() => void patch(b.id, { isVerified: true })}
                        />
                      ) : null}
                      <IconButton
                        icon={b.isSuspended ? UserCheck : UserX}
                        label={b.isSuspended ? "Unsuspend Business" : "Suspend Business"}
                        tone={b.isSuspended ? "primary" : "danger"}
                        disabled={busyId === b.id}
                        onClick={() => void patch(b.id, { isSuspended: !b.isSuspended })}
                      />
                      <IconButton icon={Trash2} label="Delete Business" tone="danger" disabled={busyId === b.id} onClick={() => setDeleteTarget(b)} />
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No businesses found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        </>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete business account?"
        description={`This permanently deletes ${deleteTarget?.businessName ?? "this business"} and its offers, customers, coupons, deals, visits, users, and usage records. This cannot be undone.`}
        confirmLabel="Delete business"
        busy={Boolean(deleteTarget && busyId === deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteBusiness()}
      />
    </div>
  );
}
