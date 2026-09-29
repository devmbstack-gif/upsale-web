"use client";

import { PanelSkeleton } from "@/components/dashboard/PanelSkeleton";
import { Reveal } from "@/components/ui/Reveal";
import type { Customer } from "@/lib/mock-data";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CustomersTable = dynamic(
  () => import("@/components/customers/CustomersTable"),
  { loading: () => <PanelSkeleton rows={6} /> },
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
};

function mapCustomer(c: ApiCustomer): Customer {
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
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);

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

  if (!customers) {
    return (
      <div className="mx-auto max-w-6xl">
        <PanelSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <CustomersTable customers={customers} />
      </Reveal>
    </div>
  );
}
