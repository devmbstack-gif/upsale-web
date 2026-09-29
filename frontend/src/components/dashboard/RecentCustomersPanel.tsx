"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

type Customer = {
  _id: string;
  name: string;
  phone: string;
  lastVisitAt?: string;
  scans?: number;
  tags?: string[];
};

export default function RecentCustomersPanel() {
  const [recent, setRecent] = useState<Customer[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/customers", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { customers: Customer[] };
      setRecent((data.customers ?? []).slice(0, 5));
    })();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Recent customers</h2>
          <p className="text-sm text-muted">Latest visits and engagement</p>
        </div>
        <Button href="/app/customers" variant="secondary">
          View all
        </Button>
      </div>
      <TableShell>
        <Table>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH>Last visit</TH>
              <TH>Scans</TH>
              <TH>Tags</TH>
              <TH />
            </tr>
          </THead>
          <TBody>
            {recent.length === 0 ? (
              <TR>
                <TD colSpan={5}>
                  <p className="py-6 text-center text-sm text-muted">
                    No customers yet — share a QR offer to start capturing.
                  </p>
                </TD>
              </TR>
            ) : (
              recent.map((c) => (
                <TR key={c._id}>
                  <TD>
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted">{c.phone}</p>
                    </div>
                  </TD>
                  <TD>{c.lastVisitAt ? formatDate(c.lastVisitAt) : "—"}</TD>
                  <TD>{c.scans ?? 0}</TD>
                  <TD>
                    <div className="flex flex-wrap gap-1">
                      {(c.tags ?? []).slice(0, 2).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/app/customers/${c._id}`}
                      className="text-sm font-medium text-brand-to hover:underline"
                    >
                      Open
                    </Link>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </TableShell>
    </section>
  );
}
