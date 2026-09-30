"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
    void load();
  }, [load]);

  async function redeem(id: string, code: string) {
    const ok = window.confirm(`Mark coupon ${code} as redeemed? It cannot be used again.`);
    if (!ok) return;
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
      setMessage(`Redeemed ${code}.`);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const list = coupons ?? [];
  const redeemedCount = list.filter((c) => c.status === "redeemed" || c.redeemedAt).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal className="flex flex-wrap items-center gap-6 text-sm text-muted">
        <span>
          <strong className="text-foreground">{list.length}</strong> issued
        </span>
        <span>
          <strong className="text-foreground">{redeemedCount}</strong> redeemed
        </span>
        {message ? <span className="text-brand-to">{message}</span> : null}
      </Reveal>

      <Reveal delay={1}>
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
              {coupons === null ? (
                <TR>
                  <TD colSpan={7} className="py-10 text-center text-muted">
                    Loading…
                  </TD>
                </TR>
              ) : list.length === 0 ? (
                <TR>
                  <TD colSpan={7} className="py-10 text-center text-muted">
                    No coupons yet — customers receive codes when they claim offers.
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
                      <TD className="font-mono text-xs">{c.code}</TD>
                      <TD>{offerTitle}</TD>
                      <TD>
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
                      <TD>
                        <Badge variant={redeemed ? "redeemed" : expired ? "paused" : "pending"}>
                          {redeemed ? "Redeemed" : expired ? "Expired" : "Pending"}
                        </Badge>
                      </TD>
                      <TD>{formatDate(c.issuedAt)}</TD>
                      <TD>{c.redeemedAt ? formatDateTime(c.redeemedAt) : "—"}</TD>
                      <TD className="text-right">
                        {!redeemed && !expired ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-brand-to hover:underline disabled:opacity-50"
                            disabled={busyId === c._id}
                            onClick={() => void redeem(c._id, c.code)}
                          >
                            {busyId === c._id ? "Saving…" : "Mark redeemed"}
                          </button>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </TableShell>
      </Reveal>
    </div>
  );
}
