"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, PasswordField } from "@/components/ui/Input";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type EmbeddedSignup = { enabled: boolean; appId: string; configId: string; apiVersion: string };
type Connection = {
  status: "not_connected" | "connected" | "error" | "disabled";
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  lastError?: string;
  embeddedSignup?: EmbeddedSignup;
};

type MetaSignupEvent = { type?: string; event?: string; data?: { phone_number_id?: string; waba_id?: string } };

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>) => void;
    };
  }
}

export function WhatsAppConnectionCard({ defaultRecipient }: { defaultRecipient?: string }) {
  const [connection, setConnection] = useState<Connection>({ status: "not_connected" });
  const [manualOpen, setManualOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ accessToken: "", phoneNumberId: "", businessAccountId: "", testRecipient: "" });
  const signupValues = useRef<{ phoneNumberId: string; businessAccountId: string } | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/whatsapp/connection", { credentials: "same-origin", cache: "no-store" });
    if (response.ok) setConnection((await response.json()) as Connection);
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<string | MetaSignupEvent>) => {
      if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") return;
      let value: MetaSignupEvent | null = null;
      try { value = typeof event.data === "string" ? JSON.parse(event.data) as MetaSignupEvent : event.data; } catch { return; }
      if (value?.type !== "WA_EMBEDDED_SIGNUP" || value.event !== "FINISH") return;
      const phoneNumberId = value.data?.phone_number_id;
      const businessAccountId = value.data?.waba_id;
      if (phoneNumberId && businessAccountId) signupValues.current = { phoneNumberId, businessAccountId };
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function setupSdk() {
    const config = connection.embeddedSignup;
    if (!config?.enabled || !window.FB) return false;
    window.FB.init({ appId: config.appId, cookie: true, xfbml: false, version: config.apiVersion });
    return true;
  }

  async function finishEmbeddedSignup(authorizationCode: string) {
    for (let attempt = 0; attempt < 30 && !signupValues.current; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
    const details = signupValues.current;
    if (!details) throw new Error("Meta did not return the selected WhatsApp number. Please complete the signup again.");

    const response = await fetch("/api/whatsapp/embedded-signup", {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorizationCode, ...details }),
    });
    const data = (await response.json().catch(() => ({}))) as Connection & { ok?: boolean; message?: string };
    if (!response.ok || !data.ok) throw new Error(data.message ?? "Could not connect WhatsApp.");
    setConnection(data);
    setMessage("WhatsApp connected. You can now send a test message or create campaigns.");
    window.dispatchEvent(new Event("upsale:whatsapp-connected"));
  }

  function startEmbeddedSignup() {
    const config = connection.embeddedSignup;
    if (!config?.enabled) { setMessage("Embedded Signup is not configured yet. Use manual credentials or ask the platform owner to add the Meta App ID and Configuration ID."); return; }
    if (!setupSdk()) { setMessage("Meta signup is still loading. Please try again in a moment."); return; }
    signupValues.current = null;
    setBusy(true); setMessage(null);
    window.FB?.login(async (response) => {
      const authorizationCode = response.authResponse?.code;
      if (!authorizationCode) { setBusy(false); setMessage("Meta signup was cancelled or not completed."); return; }
      try { await finishEmbeddedSignup(authorizationCode); }
      catch (error) { setMessage(error instanceof Error ? error.message : "Could not connect WhatsApp."); }
      finally { setBusy(false); }
    }, {
      config_id: config.configId,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {}, sessionInfoVersion: 2 },
    });
  }

  async function connectManual() {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/whatsapp/connection", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) });
      const data = (await response.json().catch(() => ({}))) as Connection & { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) throw new Error(data.message ?? "Could not connect WhatsApp.");
      setConnection(data); setCredentials((value) => ({ ...value, accessToken: "" }));
      setMessage("WhatsApp connected. Send a test message to confirm delivery.");
      window.dispatchEvent(new Event("upsale:whatsapp-connected"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not connect WhatsApp."); }
    finally { setBusy(false); }
  }

  async function sendTest() {
    const recipient = credentials.testRecipient || defaultRecipient;
    if (!recipient) { setMessage("Enter a test recipient in international format first."); return; }
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/whatsapp/test", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipient }) });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      setMessage(response.ok && data.ok ? "Test message accepted by WhatsApp. Check the recipient phone." : data.message ?? "Test message failed.");
    } finally { setBusy(false); }
  }

  const metaConfig = connection.embeddedSignup;
  return (
    <div className="card-interactive space-y-6 p-6 md:p-8">
      <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="afterInteractive" onLoad={setupSdk} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">WhatsApp Cloud API</h2>
          <p className="text-sm text-muted">Connect your WhatsApp Business account securely through Meta. UPSale never shows your access token in the browser.</p>
        </div>
        <Badge variant={connection.status === "connected" ? "active" : "paused"}>{connection.status === "connected" ? "Connected" : "Not connected"}</Badge>
      </div>

      {connection.status === "connected" ? <div className="flex flex-wrap gap-3 text-sm"><span>{connection.verifiedName}</span><span className="text-muted">{connection.displayPhoneNumber}</span>{connection.qualityRating ? <span className="text-muted">Quality: {connection.qualityRating}</span> : null}</div> : null}

      {!manualOpen ? <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-5">
        <h3 className="font-medium">Connect your WhatsApp with Meta</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Sign in to Meta, choose your business and WhatsApp number, then UPSale connects it automatically.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" disabled={busy || !metaConfig?.enabled} onClick={startEmbeddedSignup}>{busy ? "Connecting…" : "Connect with Meta"}</Button>
          {!metaConfig?.enabled ? <span className="text-xs text-amber-300">Platform setup is required before Meta signup can be enabled.</span> : null}
        </div>
        <button type="button" className="mt-4 text-sm font-medium text-brand-to underline underline-offset-4" onClick={() => setManualOpen(true)}>If you want to add manual WhatsApp credentials, click here</button>
      </div> : <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium">Manual WhatsApp credentials</h3><p className="mt-1 text-sm text-muted">For advanced or temporary testing setups. Your token is encrypted at rest.</p></div><button type="button" className="text-sm font-medium text-brand-to underline underline-offset-4" onClick={() => setManualOpen(false)}>Use Meta signup instead</button></div>
        <div className="grid gap-4 md:grid-cols-2">
          <PasswordField label="Permanent access token" name="waAccessToken" autoComplete="off" value={credentials.accessToken} onChange={(event) => setCredentials((value) => ({ ...value, accessToken: event.target.value }))} />
          <Input label="Phone Number ID" name="waPhoneNumberId" value={credentials.phoneNumberId} onChange={(event) => setCredentials((value) => ({ ...value, phoneNumberId: event.target.value.replace(/\D/g, "") }))} />
          <Input label="WhatsApp Business Account ID" name="waBusinessAccountId" value={credentials.businessAccountId} onChange={(event) => setCredentials((value) => ({ ...value, businessAccountId: event.target.value.replace(/\D/g, "") }))} />
        </div>
        <Button type="button" disabled={busy || !credentials.accessToken || !credentials.phoneNumberId || !credentials.businessAccountId} onClick={() => void connectManual()}>{busy ? "Checking…" : "Connect manually"}</Button>
      </div>}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><Input label="Test recipient (international format)" name="waTestRecipient" value={credentials.testRecipient} placeholder={defaultRecipient || "+923001234567"} onChange={(event) => setCredentials((value) => ({ ...value, testRecipient: event.target.value }))} /><Button type="button" variant="secondary" disabled={busy || connection.status !== "connected"} onClick={() => void sendTest()}>Send test message</Button></div>
      {connection.lastError ? <p className="text-sm text-red-300">{connection.lastError}</p> : null}
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
