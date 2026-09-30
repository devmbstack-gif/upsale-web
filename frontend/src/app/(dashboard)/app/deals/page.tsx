"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { segmentLabel, type SegmentId } from "@/lib/segments";
import { formatDateTime } from "@/lib/utils";
import { useEffect, useState } from "react";

type Deal = {
  _id: string;
  title: string;
  message: string;
  discountLabel?: string;
  audience: SegmentId | "custom";
  scheduleType: "now" | "once" | "daily" | "weekly";
  scheduledAt?: string | null;
  status: "draft" | "scheduled" | "sent" | "failed";
  sentAt?: string | null;
  recipientCount?: number;
  createdAt?: string;
};

type Counts = Record<string, number>;

const AUDIENCES: SegmentId[] = ["all", "new", "repeat", "vip", "at_risk"];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [counts, setCounts] = useState<Counts>({});
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [discountLabel, setDiscountLabel] = useState("");
  const [audience, setAudience] = useState<SegmentId>("all");
  const [scheduleType, setScheduleType] = useState<"now" | "once" | "daily" | "weekly">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function load() {
    const [dealsRes, segRes] = await Promise.all([
      fetch("/api/deals", { credentials: "same-origin" }),
      fetch("/api/segments", { credentials: "same-origin" }),
    ]);
    if (dealsRes.ok) {
      const data = (await dealsRes.json()) as { deals: Deal[] };
      setDeals(data.deals ?? []);
    }
    if (segRes.ok) {
      const data = (await segRes.json()) as { counts: Counts };
      setCounts(data.counts ?? {});
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNote(null);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          discountLabel,
          audience,
          scheduleType,
          scheduledAt: scheduleType === "now" ? null : scheduledAt || null,
          sendNow: scheduleType === "now",
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; note?: string };
      if (!res.ok || !data.ok) {
        setNote(data.message ?? "Could not create deal.");
        return;
      }
      setTitle("");
      setMessage("");
      setDiscountLabel("");
      setScheduleType("now");
      setScheduledAt("");
      setNote(data.note ?? "Deal saved.");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Reveal>
        <form className="card-interactive space-y-4 p-6 md:p-8" onSubmit={onSubmit}>
          <div>
            <h2 className="font-display text-lg font-semibold">Create a deal</h2>
            <p className="text-sm text-muted">
              Choose an audience segment, then send now or schedule. Opted-out customers are excluded.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Deal title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Weekend 10% off"
            />
            <Input
              label="Discount label"
              name="discount"
              value={discountLabel}
              onChange={(e) => setDiscountLabel(e.target.value)}
              placeholder="10% off / Free drink"
            />
          </div>

          <TextArea
            label="WhatsApp message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Hi {{name}}, here’s a special offer from us…"
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground/90">Audience</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAudience(id)}
                  className={
                    audience === id
                      ? "rounded-xl border border-[rgba(196,181,253,0.4)] bg-brand-from/20 px-3 py-1.5 text-xs font-medium"
                      : "rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-muted hover:bg-[var(--hover-surface)]"
                  }
                >
                  {segmentLabel(id)}
                  {typeof counts[id] === "number" ? ` (${counts[id]})` : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/90" htmlFor="scheduleType">
                Schedule
              </label>
              <select
                id="scheduleType"
                className="input-field w-full"
                value={scheduleType}
                onChange={(e) =>
                  setScheduleType(e.target.value as "now" | "once" | "daily" | "weekly")
                }
              >
                <option value="now">Send now</option>
                <option value="once">One-time schedule</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            {scheduleType !== "now" ? (
              <Input
                label="First run at"
                name="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            ) : (
              <div className="flex items-end text-sm text-muted">
                Marks the deal as sent immediately (WhatsApp delivery uses your connected API later).
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving…"
                : scheduleType === "now"
                  ? "Send now"
                  : "Schedule deal"}
            </Button>
            {note ? <span className="text-sm text-muted">{note}</span> : null}
          </div>
        </form>
      </Reveal>

      <Reveal delay={1}>
        <section className="space-y-3">
          <h3 className="font-display text-lg font-semibold">Recent deals</h3>
          <TableShell>
            <Table>
              <THead>
                <tr>
                  <TH>Title</TH>
                  <TH>Audience</TH>
                  <TH>Schedule</TH>
                  <TH>Status</TH>
                  <TH>Recipients</TH>
                  <TH>When</TH>
                </tr>
              </THead>
              <TBody>
                {deals.map((d) => (
                  <TR key={d._id}>
                    <TD>
                      <p className="font-medium">{d.title}</p>
                      {d.discountLabel ? (
                        <p className="text-xs text-muted">{d.discountLabel}</p>
                      ) : null}
                    </TD>
                    <TD>
                      <Badge>
                        {d.audience === "custom"
                          ? "custom"
                          : segmentLabel(d.audience as SegmentId)}
                      </Badge>
                    </TD>
                    <TD className="capitalize">{d.scheduleType}</TD>
                    <TD>
                      <Badge
                        variant={
                          d.status === "sent"
                            ? "active"
                            : d.status === "failed"
                              ? "paused"
                              : "pending"
                        }
                      >
                        {d.status}
                      </Badge>
                    </TD>
                    <TD>{d.recipientCount ?? 0}</TD>
                    <TD>
                      {d.sentAt
                        ? formatDateTime(d.sentAt)
                        : d.scheduledAt
                          ? formatDateTime(d.scheduledAt)
                          : d.createdAt
                            ? formatDateTime(d.createdAt)
                            : "—"}
                    </TD>
                  </TR>
                ))}
                {deals.length === 0 ? (
                  <TR>
                    <TD colSpan={6} className="py-10 text-center text-muted">
                      No deals yet. Create your first WhatsApp campaign above.
                    </TD>
                  </TR>
                ) : null}
              </TBody>
            </Table>
          </TableShell>
        </section>
      </Reveal>
    </div>
  );
}
