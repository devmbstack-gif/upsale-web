"use client";

import AdminListCardsSkeleton from "@/components/admin/AdminListCardsSkeleton";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input, TextArea } from "@/components/ui/Input";
import { Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Pkg = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  featureBullets: string[];
  limits: { offers: number; customers: number; campaignsPerMonth: number; aiGenerations: number };
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
  offers: "1",
  customers: "500",
  campaignsPerMonth: "10",
  aiGenerations: "30",
  sortOrder: 0,
  isMostPopular: false,
  isEnterprise: false,
  isActive: true,
  countryPricing: [
    { countryCode: "PK", currency: "PKR", amount: 0, interval: "month" },
    { countryCode: "INTL", currency: "USD", amount: 0, interval: "month" },
  ] as Pkg["countryPricing"],
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const editorRef = useRef<HTMLElement>(null);

  function parseLimit(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === "unlimited") return 0;
    if (!/^\d+$/.test(normalized)) return null;
    return Number(normalized);
  }

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
      requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
    setForm({
      name: pkg.name,
      slug: pkg.slug,
      shortDescription: pkg.shortDescription,
      featureBulletsText: pkg.featureBullets.join("\n"),
      offers: pkg.limits.offers ? String(pkg.limits.offers) : "",
      customers: pkg.limits.customers ? String(pkg.limits.customers) : "",
      campaignsPerMonth: pkg.limits.campaignsPerMonth ? String(pkg.limits.campaignsPerMonth) : "",
      aiGenerations: pkg.limits.aiGenerations ? String(pkg.limits.aiGenerations) : "",
      sortOrder: pkg.sortOrder,
      isMostPopular: pkg.isMostPopular,
      isEnterprise: pkg.isEnterprise,
      isActive: pkg.isActive,
      countryPricing: ([
        pkg.countryPricing.find((price) => price.currency.toUpperCase() === "PKR")
          ?? { countryCode: "PK", currency: "PKR", amount: 0, interval: "month" },
        pkg.countryPricing.find((price) => price.currency.toUpperCase() === "USD")
          ?? { countryCode: "INTL", currency: "USD", amount: 0, interval: "month" },
      ]).map((price) => ({ ...price })),
    });
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function save() {
    setError("");
    setMessage("");
    const hasPkr = form.countryPricing.some((price) => price.currency === "PKR" && Number(price.amount) > 0);
    const hasUsd = form.countryPricing.some((price) => price.currency === "USD" && Number(price.amount) > 0);
    if (form.isActive && !form.isEnterprise && (!hasPkr || !hasUsd)) {
      setError("Active self-service packages require both a PKR price and a USD price.");
      return;
    }
    const parsedLimits = {
      offers: parseLimit(form.offers),
      customers: parseLimit(form.customers),
      campaignsPerMonth: parseLimit(form.campaignsPerMonth),
      aiGenerations: parseLimit(form.aiGenerations),
    };
    if (Object.values(parsedLimits).some((value) => value === null)) {
      setError('Usage limits accept a whole number or the word "Unlimited".');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      shortDescription: form.shortDescription,
      featureBullets: form.featureBulletsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      limits: {
        offers: parsedLimits.offers as number,
        customers: parsedLimits.customers as number,
        campaignsPerMonth: parsedLimits.campaignsPerMonth as number,
        aiGenerations: parsedLimits.aiGenerations as number,
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  async function toggleActive(pkg: Pkg) {
    setError("");
    const res = await fetch(`/api/admin/packages/${pkg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Status update failed");
      return;
    }
    await load();
  }

  if (loading && packages.length === 0) {
    return <AdminListCardsSkeleton />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Packages</h2>
            <p className="mt-1 text-sm text-muted">Review plan status, limits, and pricing at a glance.</p>
          </div>
          <IconButton
            icon={Plus}
            label="Create new package"
            tone="neutral"
            size="md"
            onClick={() => startEdit(null)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card-interactive p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold">
                  {pkg.name}{" "}
                  <span className="text-xs text-muted">/{pkg.slug}</span>
                </p>
                <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted">{pkg.shortDescription || "No description added."}</p>
                <p className="mt-4 border-y border-[var(--border)] py-3 text-xs leading-6 text-muted">
                  Limits: {pkg.limits.offers || "∞"} QR offers ·{" "}
                  {pkg.limits.customers || "∞"} customers ·{" "}
                  {pkg.limits.campaignsPerMonth || "∞"} campaigns ·{" "}
                  {pkg.limits.aiGenerations || "∞"} AI
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {pkg.isMostPopular ? (
                    <span className="rounded-full bg-brand-from/20 px-2.5 py-1 text-brand-to">
                      Most popular
                    </span>
                  ) : null}
                  {pkg.isEnterprise ? (
                    <span className="rounded-full bg-surface-elevated px-2.5 py-1 text-muted">
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
                {pkg.countryPricing.some((price) => ["PKR", "USD"].includes(price.currency.toUpperCase())) ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pkg.countryPricing.filter((price) => ["PKR", "USD"].includes(price.currency.toUpperCase())).map((price) => (
                      <span key={`${price.countryCode}-${price.currency}-${price.interval}`} className="rounded-lg border border-[var(--border)] bg-[var(--hover-surface)] px-2.5 py-1.5 text-xs text-muted">
                        {price.currency.toUpperCase()} {price.amount.toLocaleString()} / {price.interval}
                      </span>
                    ))}
                  </div>
                ) : null}
                {pkg.isActive && !pkg.isEnterprise && !(["PKR", "USD"].every((currency) => pkg.countryPricing.some((price) => price.currency.toUpperCase() === currency && price.amount > 0))) ? (
                  <p className="mt-3 text-xs font-medium text-amber-300">Pricing incomplete — add PKR and USD prices to enable checkout.</p>
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
                  icon={pkg.isActive ? PowerOff : Power}
                  label={pkg.isActive ? "Deactivate package" : "Activate package"}
                  tone={pkg.isActive ? "danger" : "success"}
                  onClick={() => void toggleActive(pkg)}
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
      </section>

      <section ref={editorRef} className="card-interactive scroll-mt-6 space-y-6 p-5 md:p-7">
        <div className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-to">Package editor</p>
        <h2 className="font-display mt-1 text-xl font-semibold">
          {editing ? `Edit ${editing.name}` : "Create package"}
        </h2>
        <p className="mt-1 text-sm text-muted">Configure plan information, usage limits, pricing, and availability.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>
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

        <div className="space-y-4 border-t border-[var(--border)] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold">Plan prices</h3>
              <p className="mt-1 text-sm text-muted">Set the two supported prices: PKR and USD.</p>
            </div>
          </div>
          {form.countryPricing.map((price, index) => (
            <div key={index} className="rounded-2xl border border-[var(--border)] bg-[var(--hover-surface)]/40 p-4">
              <div className="mb-3"><p className="text-sm font-medium">{price.currency} price</p></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:items-end">
              <Input label="Amount" type="number" min={0} step="0.01" placeholder={`Enter ${price.currency} price`} value={price.amount === 0 ? "" : price.amount} onChange={(e) => setForm((current) => ({ ...current, countryPricing: current.countryPricing.map((item, itemIndex) => itemIndex === index ? { ...item, amount: e.target.value === "" ? 0 : Number(e.target.value) } : item) }))} />
              <label className="space-y-1.5 text-sm font-medium text-foreground/90">Billing interval<select className="input-field block w-full" value={price.interval} onChange={(e) => setForm((current) => ({ ...current, countryPricing: current.countryPricing.map((item, itemIndex) => itemIndex === index ? { ...item, interval: e.target.value } : item) }))}>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select></label>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t border-[var(--border)] pt-6">
          <div><h3 className="font-display text-base font-semibold">Usage limits</h3><p className="mt-1 text-sm text-muted">Enter 0 for unlimited access.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            label="QR offers"
            type="text"
            placeholder="Unlimited"
            value={form.offers}
            onChange={(e) => setForm((f) => ({ ...f, offers: e.target.value }))}
          />
          <Input
            label="Customers"
            type="text"
            placeholder="Unlimited"
            value={form.customers}
            onChange={(e) => setForm((f) => ({ ...f, customers: e.target.value }))}
          />
          <Input
            label="Campaigns/mo"
            type="text"
            placeholder="Unlimited"
            value={form.campaignsPerMonth}
            onChange={(e) =>
              setForm((f) => ({ ...f, campaignsPerMonth: e.target.value }))
            }
          />
          <Input
            label="AI gens"
            type="text"
            placeholder="Unlimited"
            value={form.aiGenerations}
            onChange={(e) =>
              setForm((f) => ({ ...f, aiGenerations: e.target.value }))
            }
          />
          <Input
          label="Sort order"
          type="number"
          min={0}
          placeholder="Automatic"
          value={form.sortOrder === 0 ? "" : form.sortOrder}
          onKeyDown={(e) => { if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault(); }}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) }))}
        />
        </div>
        </div>

        <div className="grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-3">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-sm hover:bg-[var(--hover-surface)]">
          <input
            type="checkbox"
            checked={form.isMostPopular}
            onChange={(e) => setForm((f) => ({ ...f, isMostPopular: e.target.checked }))}
          />
          Most popular
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-sm hover:bg-[var(--hover-surface)]">
          <input
            type="checkbox"
            checked={form.isEnterprise}
            onChange={(e) => setForm((f) => ({ ...f, isEnterprise: e.target.checked }))}
          />
          Enterprise
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-sm hover:bg-[var(--hover-surface)]">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          Active
        </label>
        </div>
        {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
        <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : editing ? "Update package" : "Create package"}
        </Button>
      </section>
    </div>
  );
}
