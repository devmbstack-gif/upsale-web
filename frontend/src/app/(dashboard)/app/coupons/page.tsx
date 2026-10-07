"use client";

import { Badge } from "@/components/ui/Badge";
import { RedeemCouponDialog } from "@/components/coupons/RedeemCouponDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Search, TicketCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import CouponsLoading from "./loading";

type ApiCoupon = {
  _id: string;
  code: string;
  status: "issued" | "redeemed" | "expired";
  issuedAt: string;
  redeemedAt?: string | null;
  offerId?: { _id?: string; title?: string } | string;
  customerId?: { _id?: string; name?: string } | string;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<ApiCoupon[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [redeemDialog, setRedeemDialog] = useState<{
    id: string;
    code: string;
    mode: "confirm" | "success";
  } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/coupons", { credentials: "same-origin" });
    if (!res.ok) {
      setCoupons([]);
      return;
    }
    const data = (await res.json()) as { coupons: ApiCoupon[] };
    setCoupons(data.coupons ?? []);
  }, []);

  useEffect(() => {
    // Initial route-data synchronization; state updates occur after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function redeem(id: string, code: string) {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/coupons/${id}/redeem`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setMessage(data.message ?? "Could not redeem coupon.");
        return;
      }
      setRedeemDialog({ id, code, mode: "success" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const allCoupons = coupons ?? [];
  const redeemedCount = allCoupons.filter((c) => c.status === "redeemed" || c.redeemedAt).length;
  const list = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const now = new Date();
    const start = new Date(now);
    if (dateFilter === "today") start.setHours(0, 0, 0, 0);
    else if (dateFilter === "7days") start.setDate(now.getDate() - 7);
    else if (dateFilter === "30days") start.setDate(now.getDate() - 30);

    return allCoupons.filter((coupon) => {
      const redeemed = coupon.status === "redeemed" || Boolean(coupon.redeemedAt);
      const pending = coupon.status === "issued" && !coupon.redeemedAt;
      if (statusFilter === "redeemed" && !redeemed) return false;
      if (statusFilter === "pending" && !pending) return false;
      if (statusFilter === "expired" && coupon.status !== "expired") return false;
      if (dateFilter !== "all") {
        const relevantDate = new Date(coupon.redeemedAt || coupon.issuedAt);
        if (Number.isNaN(relevantDate.getTime()) || relevantDate < start) return false;
      }
      if (!needle) return true;
      const customerName = typeof coupon.customerId === "object" ? coupon.customerId?.name ?? "" : "";
      const offerTitle = typeof coupon.offerId === "object" ? coupon.offerId?.title ?? "" : "";
      const searchable = [coupon.code, customerName, offerTitle, coupon.status, formatDate(coupon.issuedAt), coupon.redeemedAt ? formatDateTime(coupon.redeemedAt) : ""].join(" ").toLocaleLowerCase();
      return searchable.includes(needle);
    });
  }, [allCoupons, dateFilter, query, statusFilter]);

  if (coupons === null) {
    return <CouponsLoading />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal className="flex flex-wrap items-center gap-6 text-sm text-muted">
        <span>
          <strong className="text-foreground">{coupons.length}</strong> issued
        </span>
        <span>
          <strong className="text-foreground">{redeemedCount}</strong> redeemed
        </span>
        {message ? <span className="text-brand-to">{message}</span> : null}
      </Reveal>

      <Reveal delay={1} className="grid gap-3 rounded-2xl border border-[var(--border)] bg-surface/70 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_190px_190px]">
        <label className="relative min-w-0">
          <span className="sr-only">Search coupons</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input className="input-field !pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, code, offer or date" />
        </label>
        <label className="min-w-0">
          <span className="sr-only">Filter by status</span>
          <select className="input-field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="redeemed">Redeemed</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </label>
        <label className="min-w-0 sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Filter according to date</span>
          <select className="input-field" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
          </select>
        </label>
      </Reveal>

      <Reveal delay={2}>
        <TableShell>
          <Table>
            <THead>
              <tr>
                <TH>Code</TH>
                <TH>Offer</TH>
                <TH>Customer</TH>
                <TH>Status</TH>
                <TH>Issued</TH>
                <TH>Redeemed at</TH>
                <TH />
              </tr>
            </THead>
            <TBody>
              {list.length === 0 ? (
                <TR>
                  <TD colSpan={7} className="py-10 text-center text-muted">
                    {coupons.length === 0 ? "No coupons yet — customers receive codes when they claim offers." : "No coupons match your search and filters."}
                  </TD>
                </TR>
              ) : (
                list.map((c) => {
                  const offerTitle =
                    typeof c.offerId === "object" ? (c.offerId?.title ?? "—") : "—";
                  const customerName =
                    typeof c.customerId === "object" ? (c.customerId?.name ?? "—") : "—";
                  const customerId =
                    typeof c.customerId === "object"
                      ? c.customerId?._id
                      : typeof c.customerId === "string"
                        ? c.customerId
                        : null;
                  const redeemed = c.status === "redeemed" || Boolean(c.redeemedAt);
                  const expired = c.status === "expired";

                  return (
                    <TR key={c._id}>
                      <TD label="Code" className="font-mono text-xs">{c.code}</TD>
                      <TD label="Offer">{offerTitle}</TD>
                      <TD label="Customer">
                        {customerId ? (
                          <Link
                            href={`/app/customers/${customerId}`}
                            className="text-brand-to hover:underline"
                          >
                            {customerName}
                          </Link>
                        ) : (
                          customerName
                        )}
                      </TD>
                      <TD label="Status">
                        <Badge variant={redeemed ? "redeemed" : expired ? "paused" : "pending"}>
                          {redeemed ? "Redeemed" : expired ? "Expired" : "Pending"}
                        </Badge>
                      </TD>
                      <TD label="Issued">{formatDate(c.issuedAt)}</TD>
                      <TD label="Redeemed at">{c.redeemedAt ? formatDateTime(c.redeemedAt) : redeemed ? "Redeemed" : ""}</TD>
                      <TD label="Actions" className="text-right">
                        {!redeemed && !expired ? (
                          <div className="flex justify-end">
                            <IconButton
                              icon={TicketCheck}
                              label="Mark redeemed"
                              tone="success"
                              disabled={busyId === c._id}
                              onClick={() => {
                                setMessage(null);
                                setRedeemDialog({ id: c._id, code: c.code, mode: "confirm" });
                              }}
                            />
                          </div>
                        ) : null}
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </TableShell>
      </Reveal>
      {redeemDialog ? (
        <RedeemCouponDialog
          code={redeemDialog.code}
          mode={redeemDialog.mode}
          busy={busyId === redeemDialog.id}
          error={redeemDialog.mode === "confirm" ? message : null}
          onClose={() => {
            if (!busyId) setRedeemDialog(null);
          }}
          onConfirm={() => void redeem(redeemDialog.id, redeemDialog.code)}
        />
      ) : null}
    </div>
  );
}
