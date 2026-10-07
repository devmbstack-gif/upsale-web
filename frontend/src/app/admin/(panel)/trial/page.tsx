"use client";

import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import TrialLoading from "./loading";
import { useEffect, useState } from "react";

type Settings = {
  enabled: boolean;
  trialDays: number;
  unlockedPackageId: string | null;
  fairUsageCaps: {
    offers: number;
    customers: number;
    campaignsPerMonth: number;
    aiGenerations: number;
  };
  paywallMessage: string;
};

type PkgOption = { id: string; name: string; slug: string };

export default function AdminTrialPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [packages, setPackages] = useState<PkgOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/trial", { credentials: "same-origin" });
      const data = (await res.json()) as {
        ok: boolean;
        settings?: Settings;
        packages?: PkgOption[];
        message?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Failed to load");
        return;
      }
      setSettings(data.settings ?? null);
      setPackages(data.packages ?? []);
    })();
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/trial", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as { ok: boolean; settings?: Settings; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Save failed");
      setSettings(data.settings ?? settings);
      setMessage("Trial settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    if (error) {
      return <p className="text-sm text-[var(--danger-text)]">{error}</p>;
    }
    return <TrialLoading />;
  }

  return (
    <div className="card-interactive mx-auto max-w-2xl space-y-4 p-6">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
        />
        Trial enabled
      </label>
      <Input
        label="Trial days"
        type="number"
        min={1}
        value={settings.trialDays}
        onChange={(e) =>
          setSettings({ ...settings, trialDays: Number(e.target.value) || 1 })
        }
      />
      <label className="block space-y-1.5 text-sm font-medium text-foreground/90">
        Unlocked package during trial
        <select
          className="input-field"
          value={settings.unlockedPackageId ?? ""}
          onChange={(e) =>
            setSettings({
              ...settings,
              unlockedPackageId: e.target.value || null,
            })
          }
        >
          <option value="">None</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.slug})
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Fair use · QR offers"
          type="number"
          min={0}
          value={settings.fairUsageCaps.offers}
          onChange={(e) =>
            setSettings({
              ...settings,
              fairUsageCaps: {
                ...settings.fairUsageCaps,
                offers: Number(e.target.value),
              },
            })
          }
        />
        <Input
          label="Fair use · customers"
          type="number"
          value={settings.fairUsageCaps.customers}
          onChange={(e) =>
            setSettings({
              ...settings,
              fairUsageCaps: {
                ...settings.fairUsageCaps,
                customers: Number(e.target.value),
              },
            })
          }
        />
        <Input
          label="Campaigns / month"
          type="number"
          value={settings.fairUsageCaps.campaignsPerMonth}
          onChange={(e) =>
            setSettings({
              ...settings,
              fairUsageCaps: {
                ...settings.fairUsageCaps,
                campaignsPerMonth: Number(e.target.value),
              },
            })
          }
        />
        <Input
          label="AI generations"
          type="number"
          value={settings.fairUsageCaps.aiGenerations}
          onChange={(e) =>
            setSettings({
              ...settings,
              fairUsageCaps: {
                ...settings.fairUsageCaps,
                aiGenerations: Number(e.target.value),
              },
            })
          }
        />
      </div>
      <TextArea
        label="Paywall message"
        value={settings.paywallMessage}
        onChange={(e) => setSettings({ ...settings, paywallMessage: e.target.value })}
      />
      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving…" : "Save trial settings"}
      </Button>
    </div>
  );
}
