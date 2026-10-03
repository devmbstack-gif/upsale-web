"use client";

import { Reveal } from "@/components/ui/Reveal";
import type { DashboardCustomer } from "@/components/customers/CustomersTable";
import { countSegments } from "@/lib/segments";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import CustomersLoading from "./loading";

const CustomersTable = dynamic(
  () => import("@/components/customers/CustomersTable"),
  { loading: () => <CustomersLoading /> },
);

type ApiCustomer = {
  _id: string;
  name: string;
  phone: string;
  email?: string | null;
  scans?: number;
  couponsRedeemed?: number;
  lastVisitAt?: string;
  joinedAt?: string;
  tags?: string[];
  visitCount?: number;
  totalSpend?: number;
  optedOut?: boolean;
};

function mapCustomer(c: ApiCustomer): DashboardCustomer {
  return {
    id: c._id,
    name: c.name,
    phone: c.phone,
    email: c.email ?? null,
    scans: c.scans ?? 0,
    couponsRedeemed: c.couponsRedeemed ?? 0,
    lastVisitAt: c.lastVisitAt ?? new Date().toISOString(),
    joinedAt: c.joinedAt ?? new Date().toISOString(),
    tags: c.tags ?? [],
    visitCount: c.visitCount ?? 0,
    totalSpend: c.totalSpend ?? 0,
    optedOut: c.optedOut ?? false,
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<DashboardCustomer[] | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/customers", { credentials: "same-origin" });
      if (!res.ok) {
        setCustomers([]);
        return;
      }
      const data = (await res.json()) as { customers: ApiCustomer[] };
      setCustomers((data.customers ?? []).map(mapCustomer));
    })();
  }, []);

  const segmentCounts = useMemo(() => {
    if (!customers) return undefined;
    return countSegments(
      customers.map((c) => ({
        _id: c.id,
        joinedAt: c.joinedAt,
        lastVisitAt: c.lastVisitAt,
        scans: c.scans,
        couponsRedeemed: c.couponsRedeemed,
        visitCount: c.visitCount ?? c.scans,
        totalSpend: c.totalSpend ?? 0,
        optedOut: c.optedOut,
      })),
    );
  }, [customers]);

  if (!customers) {
    return <CustomersLoading />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <CustomersTable customers={customers} segmentCounts={segmentCounts} />
      </Reveal>
    </div>
  );
}
