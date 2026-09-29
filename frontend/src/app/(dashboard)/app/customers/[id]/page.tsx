"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Customer = {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  scans?: number;
  couponsRedeemed?: number;
  lastVisitAt?: string;
  tags?: string[];
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

export default function CustomerDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const [cRes, couponRes] = await Promise.all([
        fetch(`/api/customers/${id}`, { credentials: "same-origin" }),
        fetch("/api/coupons", { credentials: "same-origin" }),
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
            const cid =
              typeof c.customerId === "object" ? c.customerId?._id : c.customerId;
            return String(cid) === id;
          }),
        );
      }
    })();
  }, [id]);

  if (customer === undefined) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center text-sm text-muted">
        Loading customer…
      </div>
    );
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
          {customer.email ? (
            <p className="text-sm text-muted">{customer.email}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {(customer.tags ?? []).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>
        <Button href="/app/customers" variant="secondary">
          Back
        </Button>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        <Reveal delay={1} className="card-interactive p-5">
          <p className="text-xs uppercase text-muted">Total scans</p>
          <p className="font-display mt-1 text-2xl font-semibold">{customer.scans ?? 0}</p>
        </Reveal>
        <Reveal delay={1} className="card-interactive p-5">
          <p className="text-xs uppercase text-muted">Coupons redeemed</p>
          <p className="font-display mt-1 text-2xl font-semibold">
            {customer.couponsRedeemed ?? 0}
          </p>
        </Reveal>
        <Reveal delay={2} className="card-interactive p-5">
          <p className="text-xs uppercase text-muted">Last visit</p>
          <p className="mt-1 text-sm font-medium">
            {customer.lastVisitAt ? formatDateTime(customer.lastVisitAt) : "—"}
          </p>
        </Reveal>
      </div>

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
                    </TR>
                  );
                })}
                {coupons.length === 0 ? (
                  <TR>
                    <TD colSpan={4} className="py-8 text-center text-muted">
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
    </div>
  );
}
