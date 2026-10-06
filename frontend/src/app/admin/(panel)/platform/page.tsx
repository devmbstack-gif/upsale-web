"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import PlatformLoading from "./loading";
import { useEffect, useState } from "react";

type Settings = {
  geminiApiKeyMasked: string;
  geminiApiKeySet: boolean;
  waApiBaseUrl: string;
  appPublicUrl: string;
};

export default function AdminPlatformPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [geminiApiKey, setGeminiApiKey] = useState("");
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

  async function save(extra?: { clearGeminiApiKey?: boolean }) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body: Record<string, unknown> = {
        waApiBaseUrl,
        appPublicUrl,
      };
      if (geminiApiKey.trim()) body.geminiApiKey = geminiApiKey.trim();
      if (extra?.clearGeminiApiKey) body.clearGeminiApiKey = true;

      const res = await fetch("/api/admin/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; settings?: Settings; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Save failed");
      setSettings(data.settings ?? null);
      setGeminiApiKey("");
      setMessage("Platform settings saved. Backend integrations use the new values immediately.");
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
    return <PlatformLoading />;
  }

  return (
    <div className="card-interactive mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <p className="text-sm font-medium text-foreground/90">Gemini API key</p>
        <p className="mt-1 text-xs text-muted">
          {settings?.geminiApiKeySet
            ? `Stored: ${settings.geminiApiKeyMasked}`
            : "Not set"}
        </p>
        <Input
          className="mt-2"
          type="password"
          placeholder="Paste new key to replace"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          autoComplete="off"
        />
        {settings?.geminiApiKeySet ? (
          <Button
            type="button"
            variant="danger"
            className="mt-2 !px-2.5 !py-1.5 text-xs"
            disabled={saving}
            onClick={() => void save({ clearGeminiApiKey: true })}
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
