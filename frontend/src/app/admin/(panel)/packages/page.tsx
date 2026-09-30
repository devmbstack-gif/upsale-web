"use client";

import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { useCallback, useEffect, useState } from "react";

type Pkg = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  featureBullets: string[];
  limits: { customers: number; campaignsPerMonth: number; aiGenerations: number };
  sortOrder: number;
  isMostPopular: boolean;
  isEnterprise: boolean;
  isActive: boolean;
  countryPricing: Array<{
    countryCode: string;
    currency: string;
    amount: number;
    interval: string;
  }>;
};

const emptyForm = {
  name: "",
  slug: "",
  shortDescription: "",
  featureBulletsText: "",
  customers: 500,
  campaignsPerMonth: 10,
  aiGenerations: 30,
  sortOrder: 0,
  isMostPopular: false,
  isEnterprise: false,
  isActive: true,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages", { credentials: "same-origin" });
      const data = (await res.json()) as { ok: boolean; packages?: Pkg[]; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Failed to load");
      setPackages(data.packages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(pkg: Pkg | null) {
    setEditing(pkg);
    setMessage("");
    if (!pkg) {
      setForm(emptyForm);
      return;
    }
    setForm({
      name: pkg.name,
      slug: pkg.slug,
      shortDescription: pkg.shortDescription,
      featureBulletsText: pkg.featureBullets.join("\n"),
      customers: pkg.limits.customers,
      campaignsPerMonth: pkg.limits.campaignsPerMonth,
      aiGenerations: pkg.limits.aiGenerations,
      sortOrder: pkg.sortOrder,
      isMostPopular: pkg.isMostPopular,
      isEnterprise: pkg.isEnterprise,
      isActive: pkg.isActive,
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    const payload = {
      name: form.name,
      slug: form.slug,
      shortDescription: form.shortDescription,
      featureBullets: form.featureBulletsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      limits: {
        customers: Number(form.customers),
        campaignsPerMonth: Number(form.campaignsPerMonth),
        aiGenerations: Number(form.aiGenerations),
      },
      sortOrder: Number(form.sortOrder),
      isMostPopular: form.isMostPopular,
      isEnterprise: form.isEnterprise,
      isActive: form.isActive,
      countryPricing: editing?.countryPricing ?? [],
    };

    try {
      const res = await fetch(
        editing ? `/api/admin/packages/${editing.id}` : "/api/admin/packages",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Save failed");
      setMessage(editing ? "Package updated." : "Package created.");
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this package?")) return;
    const res = await fetch(`/api/admin/packages/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Delete failed");
      return;
    }
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">All packages</h2>
          <Button type="button" variant="secondary" onClick={() => startEdit(null)}>
            New package
          </Button>
        </div>
        {loading ? <p className="text-sm text-muted">Loading…</p> : null}
        {packages.map((pkg) => (
          <div key={pkg.id} className="card-interactive p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {pkg.name}{" "}
                  <span className="text-xs text-muted">/{pkg.slug}</span>
                </p>
                <p className="mt-1 text-sm text-muted">{pkg.shortDescription}</p>
                <p className="mt-2 text-xs text-muted">
                  Limits: {pkg.limits.customers || "∞"} customers ·{" "}
                  {pkg.limits.campaignsPerMonth || "∞"} campaigns ·{" "}
                  {pkg.limits.aiGenerations || "∞"} AI
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[0.7rem]">
                  {pkg.isMostPopular ? (
                    <span className="rounded-full bg-brand-from/20 px-2 py-0.5 text-brand-to">
                      Most popular
                    </span>
                  ) : null}
                  {pkg.isEnterprise ? (
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-muted">
                      Enterprise
                    </span>
                  ) : null}
                  <span
                    className={
                      pkg.isActive ? "text-emerald-400" : "text-[var(--danger-text)]"
                    }
                  >
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="!px-2.5 !py-1.5 text-xs"
                  onClick={() => startEdit(pkg)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="!px-2.5 !py-1.5 text-xs"
                  onClick={() => void remove(pkg.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-interactive space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">
          {editing ? `Edit ${editing.name}` : "Create package"}
        </h2>
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
        <TextArea
          label="Short description"
          value={form.shortDescription}
          onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
        />
        <TextArea
          label="Feature bullets (one per line)"
          value={form.featureBulletsText}
          onChange={(e) => setForm((f) => ({ ...f, featureBulletsText: e.target.value }))}
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Customers"
            type="number"
            value={form.customers}
            onChange={(e) => setForm((f) => ({ ...f, customers: Number(e.target.value) }))}
          />
          <Input
            label="Campaigns/mo"
            type="number"
            value={form.campaignsPerMonth}
            onChange={(e) =>
              setForm((f) => ({ ...f, campaignsPerMonth: Number(e.target.value) }))
            }
          />
          <Input
            label="AI gens"
            type="number"
            value={form.aiGenerations}
            onChange={(e) =>
              setForm((f) => ({ ...f, aiGenerations: Number(e.target.value) }))
            }
          />
        </div>
        <Input
          label="Sort order"
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isMostPopular}
            onChange={(e) => setForm((f) => ({ ...f, isMostPopular: e.target.checked }))}
          />
          Most popular
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isEnterprise}
            onChange={(e) => setForm((f) => ({ ...f, isEnterprise: e.target.checked }))}
          />
          Enterprise
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          Active
        </label>
        {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : editing ? "Update package" : "Create package"}
        </Button>
      </div>
    </div>
  );
}
