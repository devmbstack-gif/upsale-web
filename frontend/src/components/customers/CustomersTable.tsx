"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import type { Customer } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

type CustomersTableProps = {
  customers: Customer[];
};

export default function CustomersTable({ customers }: CustomersTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false),
    );
  }, [customers, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md flex-1">
          <Input
            label="Search"
            placeholder="Name, phone, or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="secondary" type="button">
          Export CSV
        </Button>
      </div>
      <TableShell>
        <Table>
          <THead>
            <tr>
              <TH>Customer</TH>
              <TH>Joined</TH>
              <TH>Last visit</TH>
              <TH>Scans</TH>
              <TH>Redeemed</TH>
              <TH>Tags</TH>
              <TH />
            </tr>
          </THead>
          <TBody>
            {filtered.map((c) => (
              <TR key={c.id}>
                <TD>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted">{c.phone}</p>
                </TD>
                <TD>{formatDate(c.joinedAt)}</TD>
                <TD>{formatDate(c.lastVisitAt)}</TD>
                <TD>{c.scans}</TD>
                <TD>{c.couponsRedeemed}</TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </TD>
                <TD className="text-right">
                  <Link
                    href={`/app/customers/${c.id}`}
                    className="text-sm font-medium text-brand-to hover:underline"
                  >
                    Details
                  </Link>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 ? (
              <TR>
                <TD colSpan={7} className="py-10 text-center text-muted">
                  No customers match your search.
                </TD>
              </TR>
            ) : null}
          </TBody>
        </Table>
      </TableShell>
    </div>
  );
}
