"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";

type Settings = {
  openAiApiKeyMasked: string;
  openAiApiKeySet: boolean;
  waApiBaseUrl: string;
  appPublicUrl: string;
};

export default function AdminPlatformPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [waApiBaseUrl, setWaApiBaseUrl] = useState("");
  const [appPublicUrl, setAppPublicUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/platform", { credentials: "same-origin" });
    const data = (await res.json()) as { ok: boolean; settings?: Settings; message?: string };
    if (!res.ok || !data.ok || !data.settings) {
      setError(data.message ?? "Failed to load");
      return;
    }
    setSettings(data.settings);
    setWaApiBaseUrl(data.settings.waApiBaseUrl);
    setAppPublicUrl(data.settings.appPublicUrl);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(extra?: { clearOpenAiApiKey?: boolean }) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body: Record<string, unknown> = {
        waApiBaseUrl,
        appPublicUrl,
      };
      if (openAiApiKey.trim()) body.openAiApiKey = openAiApiKey.trim();
      if (extra?.clearOpenAiApiKey) body.clearOpenAiApiKey = true;

      const res = await fetch("/api/admin/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; settings?: Settings; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Save failed");
      setSettings(data.settings ?? null);
      setOpenAiApiKey("");
      setMessage("Platform settings saved (secrets encrypted at rest).");
      if (data.settings) {
        setWaApiBaseUrl(data.settings.waApiBaseUrl);
        setAppPublicUrl(data.settings.appPublicUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!settings && !error) {
    return <p className="text-sm text-muted">Loading platform settings…</p>;
  }

  return (
    <div className="card-interactive mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <p className="text-sm font-medium text-foreground/90">OpenAI API key</p>
        <p className="mt-1 text-xs text-muted">
          {settings?.openAiApiKeySet
            ? `Stored: ${settings.openAiApiKeyMasked}`
            : "Not set"}
        </p>
        <Input
          className="mt-2"
          type="password"
          placeholder="Paste new key to replace"
          value={openAiApiKey}
          onChange={(e) => setOpenAiApiKey(e.target.value)}
          autoComplete="off"
        />
        {settings?.openAiApiKeySet ? (
          <Button
            type="button"
            variant="danger"
            className="mt-2 !px-2.5 !py-1.5 text-xs"
            disabled={saving}
            onClick={() => void save({ clearOpenAiApiKey: true })}
          >
            Clear key
          </Button>
        ) : null}
      </div>
      <Input
        label="WhatsApp API base URL"
        value={waApiBaseUrl}
        onChange={(e) => setWaApiBaseUrl(e.target.value)}
        placeholder="https://…"
      />
      <Input
        label="App public URL"
        value={appPublicUrl}
        onChange={(e) => setAppPublicUrl(e.target.value)}
        placeholder="https://upsale.app"
      />
      {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
      <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving…" : "Save platform settings"}
      </Button>
    </div>
  );
}
