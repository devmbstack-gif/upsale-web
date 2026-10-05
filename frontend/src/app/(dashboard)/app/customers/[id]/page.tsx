"use client";

import { Badge } from "@/components/ui/Badge";
import { RedeemCouponDialog } from "@/components/coupons/RedeemCouponDialog";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate, formatDateTime } from "@/lib/utils";
import { TicketCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import CustomerDetailLoading from "./loading";

type Customer = {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  scans?: number;
  couponsRedeemed?: number;
  visitCount?: number;
  totalSpend?: number;
  lastVisitAt?: string;
  tags?: string[];
  optedOut?: boolean;
};

type Coupon = {
  _id: string;
  code: string;
  status: string;
  issuedAt: string;
  redeemedAt?: string | null;
  offerId?: { title?: string } | string;
  customerId?: { _id?: string } | string;
};

type Visit = {
  _id: string;
  amount: number;
  category?: string;
  note?: string;
  visitedAt: string;
};

export default function CustomerDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [redeemDialog, setRedeemDialog] = useState<{
    id: string;
    code: string;
    mode: "confirm" | "success";
  } | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [cRes, couponRes, visitRes] = await Promise.all([
      fetch(`/api/customers/${id}`, { credentials: "same-origin" }),
      fetch("/api/coupons", { credentials: "same-origin" }),
      fetch(`/api/customers/${id}/visits`, { credentials: "same-origin" }),
    ]);
    if (!cRes.ok) {
      setCustomer(null);
      return;
    }
    const cData = (await cRes.json()) as { customer: Customer };
    setCustomer(cData.customer);
    if (couponRes.ok) {
      const data = (await couponRes.json()) as { coupons: Coupon[] };
      setCoupons(
        (data.coupons ?? []).filter((c) => {
          const cid = typeof c.customerId === "object" ? c.customerId?._id : c.customerId;
          return String(cid) === id;
        }),
      );
    }
    if (visitRes.ok) {
      const data = (await visitRes.json()) as { visits: Visit[] };
      setVisits(data.visits ?? []);
    }
  }, [id]);

  useEffect(() => {
    // Initial route-data synchronization; state updates occur after fetches resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function recordVisit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormMessage(null);
    try {
      const res = await fetch(`/api/customers/${id}/visits`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount || 0),
          category,
          note,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setFormMessage(data.message ?? "Could not save visit.");
        return;
      }
      setAmount("");
      setCategory("");
      setNote("");
      setFormMessage("Visit saved.");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function redeemCoupon(couponId: string, code: string) {
    setRedeeming(couponId);
    setRedeemError(null);
    try {
      const res = await fetch(`/api/coupons/${couponId}/redeem`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setRedeemError(data.message ?? "Could not redeem coupon.");
        return;
      }
      setRedeemDialog({ id: couponId, code, mode: "success" });
      await load();
    } finally {
      setRedeeming(null);
    }
  }

  if (customer === undefined) {
    return <CustomerDetailLoading />;
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-12 text-center">
        <p className="text-muted">Customer not found.</p>
        <Button href="/app/customers" variant="secondary">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Reveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">{customer.name}</h2>
          <p className="mt-1 text-muted">{customer.phone}</p>
          {customer.email ? <p className="text-sm text-muted">{customer.email}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {(customer.tags ?? []).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            {customer.optedOut ? <Badge variant="paused">Opted out</Badge> : null}
          </div>
        </div>
        <Button href="/app/customers" variant="secondary">
          Back
        </Button>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-4">
        <Reveal delay={1} className="card-interactive p-5">
          <p className="text-xs uppercase text-muted">Scans</p>
          <p className="font-display mt-1 text-2xl font-semibold">{customer.scans ?? 0}</p>
        </Reveal>
        <Reveal delay={1} className="card-interactive p-5">
          <p className="text-xs uppercase text-muted">Visits logged</p>
          <p className="font-display mt-1 text-2xl font-semibold">{customer.visitCount ?? 0}</p>
        </Reveal>
        <Reveal delay={1} className="card-interactive p-5">
          <p className="text-xs uppercase text-muted">Total spend</p>
          <p className="font-display mt-1 text-2xl font-semibold">
            {(customer.totalSpend ?? 0).toLocaleString()}
          </p>
        </Reveal>
        <Reveal delay={2} className="card-interactive p-5">
          <p className="text-xs uppercase text-muted">Last visit</p>
          <p className="mt-1 text-sm font-medium">
            {customer.lastVisitAt ? formatDateTime(customer.lastVisitAt) : "—"}
          </p>
        </Reveal>
      </div>

      <Reveal delay={1}>
        <section className="card-interactive space-y-4 p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Record purchase / visit</h3>
            <p className="text-sm text-muted">Used for segments and future AI deal suggestions.</p>
          </div>
          <form className="grid gap-3 sm:grid-cols-3" onSubmit={recordVisit}>
            <Input
              label="Amount"
              name="amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            <Input
              label="Category (optional)"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Coffee, Haircut…"
            />
            <Input
              label="Note (optional)"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Walk-in"
            />
            <div className="flex items-end gap-3 sm:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save visit"}
              </Button>
              {formMessage ? <span className="text-sm text-muted">{formMessage}</span> : null}
            </div>
          </form>
        </section>
      </Reveal>

      <Reveal delay={1}>
        <section className="space-y-3">
          <h3 className="font-display text-lg font-semibold">Visit history</h3>
          <TableShell>
            <Table>
              <THead>
                <tr>
                  <TH>When</TH>
                  <TH>Amount</TH>
                  <TH>Category</TH>
                  <TH>Note</TH>
                </tr>
              </THead>
              <TBody>
                {visits.map((v) => (
                  <TR key={v._id}>
                    <TD>{formatDateTime(v.visitedAt)}</TD>
                    <TD>{(v.amount ?? 0).toLocaleString()}</TD>
                    <TD>{v.category || "—"}</TD>
                    <TD>{v.note || "—"}</TD>
                  </TR>
                ))}
                {visits.length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="py-8 text-center text-muted">
                      No visits recorded yet.
                    </TD>
                  </TR>
                ) : null}
              </TBody>
            </Table>
          </TableShell>
        </section>
      </Reveal>

      <Reveal delay={2}>
        <section className="space-y-3">
          <h3 className="font-display text-lg font-semibold">Coupons</h3>
          <TableShell>
            <Table>
              <THead>
                <tr>
                  <TH>Code</TH>
                  <TH>Offer</TH>
                  <TH>Status</TH>
                  <TH>Issued</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {coupons.map((c) => {
                  const offerTitle =
                    typeof c.offerId === "object" ? (c.offerId?.title ?? "—") : "—";
                  const redeemed = c.status === "redeemed" || Boolean(c.redeemedAt);
                  return (
                    <TR key={c._id}>
                      <TD className="font-mono text-xs">{c.code}</TD>
                      <TD>{offerTitle}</TD>
                      <TD>
                        <Badge variant={redeemed ? "redeemed" : "pending"}>
                          {redeemed ? "Redeemed" : "Pending"}
                        </Badge>
                      </TD>
                      <TD>{formatDate(c.issuedAt)}</TD>
                      <TD className="text-right">
                        {!redeemed ? (
                          <div className="flex justify-end">
                            <IconButton
                              icon={TicketCheck}
                              label="Redeem"
                              tone="success"
                              disabled={redeeming === c._id}
                              onClick={() => {
                                setRedeemError(null);
                                setRedeemDialog({ id: c._id, code: c.code, mode: "confirm" });
                              }}
                            />
                          </div>
                        ) : null}
                      </TD>
                    </TR>
                  );
                })}
                {coupons.length === 0 ? (
                  <TR>
                    <TD colSpan={5} className="py-8 text-center text-muted">
                      No coupons for this customer.
                    </TD>
                  </TR>
                ) : null}
              </TBody>
            </Table>
          </TableShell>
          <Link href="/app/coupons" className="text-sm text-brand-to hover:underline">
            View all coupons
          </Link>
        </section>
      </Reveal>
      {redeemDialog ? (
        <RedeemCouponDialog
          code={redeemDialog.code}
          mode={redeemDialog.mode}
          busy={redeeming === redeemDialog.id}
          error={redeemError}
          onClose={() => {
            if (!redeeming) setRedeemDialog(null);
          }}
          onConfirm={() => void redeemCoupon(redeemDialog.id, redeemDialog.code)}
        />
      ) : null}
    </div>
  );
}
