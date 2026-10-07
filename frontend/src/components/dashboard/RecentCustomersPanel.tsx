"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/customers", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as { customers: Customer[] };
        setRecent((data.customers ?? []).slice(0, 5));
      } finally {
        setLoading(false);
      }
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
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TR key={i}>
                  <TD label="Customer">
                    <Skeleton className="mb-1 h-4 w-28" />
                    <Skeleton className="h-3 w-24" />
                  </TD>
                  <TD>
                    <Skeleton className="h-4 w-20" />
                  </TD>
                  <TD>
                    <Skeleton className="h-4 w-8" />
                  </TD>
                  <TD>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TD>
                  <TD className="text-right">
                    <Skeleton className="ml-auto h-4 w-12" />
                  </TD>
                </TR>
              ))
            ) : recent.length === 0 ? (
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
                  <TD label="Last visit">{c.lastVisitAt ? formatDate(c.lastVisitAt) : "—"}</TD>
                  <TD label="Scans">{c.scans ?? 0}</TD>
                  <TD label="Tags">
                    <div className="flex flex-wrap gap-1">
                      {(c.tags ?? []).slice(0, 2).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </TD>
                  <TD label="Actions" className="text-right">
                    <div className="flex justify-end">
                      <IconButton
                        icon={Eye}
                        label="Open"
                        tone="primary"
                        href={`/app/customers/${c._id}`}
                      />
                    </div>
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
