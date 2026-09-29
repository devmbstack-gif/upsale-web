"use client";

import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/coupons", { credentials: "same-origin" });
      if (!res.ok) {
        setCoupons([]);
        return;
      }
      const data = (await res.json()) as { coupons: ApiCoupon[] };
      setCoupons(data.coupons ?? []);
    })();
  }, []);

  const list = coupons ?? [];
  const redeemedCount = list.filter((c) => c.status === "redeemed" || c.redeemedAt).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal className="flex flex-wrap gap-6 text-sm text-muted">
        <span>
          <strong className="text-foreground">{list.length}</strong> issued
        </span>
        <span>
          <strong className="text-foreground">{redeemedCount}</strong> redeemed
        </span>
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
              </tr>
            </THead>
            <TBody>
              {coupons === null ? (
                <TR>
                  <TD colSpan={6} className="py-10 text-center text-muted">
                    Loading…
                  </TD>
                </TR>
              ) : list.length === 0 ? (
                <TR>
                  <TD colSpan={6} className="py-10 text-center text-muted">
                    No coupons yet — customers receive codes when they redeem offers.
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
                        <Badge variant={redeemed ? "redeemed" : "pending"}>
                          {redeemed ? "Redeemed" : "Pending"}
                        </Badge>
                      </TD>
                      <TD>{formatDate(c.issuedAt)}</TD>
                      <TD>{c.redeemedAt ? formatDateTime(c.redeemedAt) : "—"}</TD>
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
