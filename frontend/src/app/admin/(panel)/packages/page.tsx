"use client";

import AdminListCardsSkeleton from "@/components/admin/AdminListCardsSkeleton";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input, TextArea } from "@/components/ui/Input";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  countryPricing: [] as Pkg["countryPricing"],
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
    // Initial route-data synchronization; state updates occur after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      countryPricing: pkg.countryPricing.map((price) => ({ ...price })),
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
      countryPricing: form.countryPricing
        .map((price) => ({
          countryCode: price.countryCode.trim().toUpperCase(),
          currency: price.currency.trim().toUpperCase(),
          amount: Number(price.amount),
          interval: price.interval,
        }))
        .filter((price) => price.countryCode && price.currency && price.amount >= 0),
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

  if (loading && packages.length === 0) {
    return <AdminListCardsSkeleton />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">All packages</h2>
          <IconButton
            icon={Plus}
            label="New package"
            tone="neutral"
            size="md"
            onClick={() => startEdit(null)}
          />
        </div>
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
                {pkg.countryPricing.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pkg.countryPricing.map((price) => (
                      <span key={`${price.countryCode}-${price.currency}-${price.interval}`} className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs text-muted">
                        {price.countryCode}: {price.currency} {price.amount.toLocaleString()} / {price.interval}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <IconButton
                  icon={Pencil}
                  label="Edit"
                  tone="neutral"
                  onClick={() => startEdit(pkg)}
                />
                <IconButton
                  icon={Trash2}
                  label="Delete"
                  tone="danger"
                  onClick={() => void remove(pkg.id)}
                />
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
        <div className="space-y-3 rounded-2xl border border-[var(--border)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Country pricing</p>
              <p className="text-xs text-muted">Use ISO codes such as PK / PKR, US / USD, or AE / AED.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="!px-3 !py-2"
              onClick={() => setForm((current) => ({
                ...current,
                countryPricing: [...current.countryPricing, { countryCode: "", currency: "", amount: 0, interval: "month" }],
              }))}
            >
              Add country
            </Button>
          </div>
          {form.countryPricing.map((price, index) => (
            <div key={index} className="grid gap-2 rounded-xl bg-[var(--hover-surface)]/50 p-3 sm:grid-cols-[0.7fr_0.8fr_1fr_1fr_auto]">
              <Input aria-label="Country code" placeholder="PK" maxLength={2} value={price.countryCode} onChange={(e) => setForm((current) => ({ ...current, countryPricing: current.countryPricing.map((item, itemIndex) => itemIndex === index ? { ...item, countryCode: e.target.value.toUpperCase() } : item) }))} />
              <Input aria-label="Currency" placeholder="PKR" maxLength={3} value={price.currency} onChange={(e) => setForm((current) => ({ ...current, countryPricing: current.countryPricing.map((item, itemIndex) => itemIndex === index ? { ...item, currency: e.target.value.toUpperCase() } : item) }))} />
              <Input aria-label="Amount" type="number" min={0} step="0.01" value={price.amount} onChange={(e) => setForm((current) => ({ ...current, countryPricing: current.countryPricing.map((item, itemIndex) => itemIndex === index ? { ...item, amount: Number(e.target.value) } : item) }))} />
              <select aria-label="Billing interval" className="input-field w-full" value={price.interval} onChange={(e) => setForm((current) => ({ ...current, countryPricing: current.countryPricing.map((item, itemIndex) => itemIndex === index ? { ...item, interval: e.target.value } : item) }))}>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              <Button type="button" variant="danger" className="!px-3" onClick={() => setForm((current) => ({ ...current, countryPricing: current.countryPricing.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</Button>
            </div>
          ))}
          {form.countryPricing.length === 0 ? <p className="text-xs text-muted">No self-service prices configured.</p> : null}
        </div>
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
