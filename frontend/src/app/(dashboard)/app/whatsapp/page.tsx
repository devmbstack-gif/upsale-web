"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDateTime } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

type Delivery = { _id: string; phone?: string; recipientName?: string; dealTitle?: string; status: string; error?: string; createdAt: string };
type History = { items: Delivery[]; counts: Record<string, number> };
type Connection = { status: string; failureEmailAlerts?: boolean; failureAlertEmail?: string };

export default function WhatsAppPage() {
  const [history, setHistory] = useState<History | null>(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [historyResponse, connectionResponse] = await Promise.all([
      fetch("/api/whatsapp/history", { credentials: "same-origin" }),
      fetch("/api/whatsapp/connection", { credentials: "same-origin" }),
    ]);
    setHistory(historyResponse.ok ? (await historyResponse.json()) as History : { items: [], counts: {} });
    if (connectionResponse.ok) {
      const value = (await connectionResponse.json()) as Connection;
      setConnected(value.status === "connected");
      setAlerts(Boolean(value.failureEmailAlerts));
      setEmail(value.failureAlertEmail ?? "");
    }
  }, []);

  useEffect(() => {
    // Initial route-data synchronization; state updates occur after requests resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function savePreferences() {
    setSaving(true); setMessage("");
    const response = await fetch("/api/whatsapp/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ failureEmailAlerts: alerts, failureAlertEmail: email.trim() }) });
    const value = (await response.json().catch(() => ({}))) as { message?: string };
    setMessage(response.ok ? "Alert preferences saved." : (value.message ?? "Could not save preferences."));
    setSaving(false);
  }

  const counts = history?.counts ?? {};
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {["accepted", "sent", "delivered", "read", "failed"].map((status) => <div key={status} className="rounded-2xl border border-[var(--border)] bg-surface/70 p-5"><p className="text-xs uppercase tracking-widest text-muted">{status}</p><p className="mt-2 text-3xl font-semibold">{counts[status] ?? 0}</p></div>)}
    </div>
    <section className="rounded-2xl border border-[var(--border)] bg-surface/70 p-5 md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><h2 className="text-lg font-semibold">Failed-delivery email alerts</h2><p className="mt-1 text-sm text-muted">Receive an email when Meta rejects or cannot deliver a campaign message.</p></div><div className="flex flex-1 flex-col gap-3 md:max-w-xl md:flex-row md:items-center"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={alerts} onChange={(event) => setAlerts(event.target.checked)} disabled={!connected} /> Enable alerts</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!alerts || !connected} placeholder="alerts@business.com" className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-4 py-2.5 outline-none focus:border-brand-from" /><Button type="button" onClick={() => void savePreferences()} disabled={!connected || saving}>{saving ? "Saving..." : "Save"}</Button></div></div>
      {!connected ? <p className="mt-4 text-sm text-amber-300">Connect WhatsApp in Profile before enabling alerts.</p> : null}{message ? <p className="mt-4 text-sm text-brand-to">{message}</p> : null}
    </section>
    <TableShell><Table><THead><tr><TH>Sent at</TH><TH>Campaign</TH><TH>Recipient</TH><TH>Phone</TH><TH>Status</TH><TH>Failure detail</TH></tr></THead><TBody>
      {history === null ? <TR><TD colSpan={6} className="py-10 text-center text-muted">Loading delivery history...</TD></TR> : history.items.length === 0 ? <TR><TD colSpan={6} className="py-10 text-center text-muted">No WhatsApp deliveries yet.</TD></TR> : history.items.map((item) => <TR key={item._id}><TD label="Sent at">{formatDateTime(item.createdAt)}</TD><TD label="Campaign">{item.dealTitle ?? "Campaign"}</TD><TD label="Recipient">{item.recipientName ?? "-"}</TD><TD label="Phone">{item.phone ? `+${item.phone}` : "-"}</TD><TD label="Status"><Badge className={item.status === "failed" ? "border-red-500/25 bg-red-500/15 text-red-300" : item.status === "delivered" || item.status === "read" ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-300" : undefined}>{item.status}</Badge></TD><TD label="Failure detail" className="max-w-sm text-sm text-muted">{item.error || "-"}</TD></TR>)}
    </TBody></Table></TableShell>
  </div>;
}
