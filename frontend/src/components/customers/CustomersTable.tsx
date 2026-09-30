"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { classifyCustomer, segmentLabel, type SegmentId } from "@/lib/segments";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

export type DashboardCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  scans: number;
  couponsRedeemed: number;
  lastVisitAt: string;
  joinedAt: string;
  tags: string[];
  visitCount?: number;
  totalSpend?: number;
  optedOut?: boolean;
};

type CustomersTableProps = {
  customers: DashboardCustomer[];
  segmentCounts?: Record<string, number>;
};

const SEGMENT_FILTERS: SegmentId[] = ["all", "new", "repeat", "vip", "at_risk"];

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export default function CustomersTable({ customers, segmentCounts }: CustomersTableProps) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<SegmentId>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (c.optedOut && segment !== "all") return false;
      if (segment !== "all") {
        const tags = classifyCustomer({
          _id: c.id,
          joinedAt: c.joinedAt,
          lastVisitAt: c.lastVisitAt,
          scans: c.scans,
          couponsRedeemed: c.couponsRedeemed,
          visitCount: c.visitCount ?? c.scans,
          totalSpend: c.totalSpend ?? 0,
          optedOut: c.optedOut,
        });
        if (!tags.includes(segment)) return false;
      }
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [customers, query, segment]);

  function exportCsv() {
    const rows = [
      ["Name", "Phone", "Email", "Joined", "Last visit", "Scans", "Visits", "Spend", "Redeemed", "Segments", "Opted out"],
      ...filtered.map((c) => {
        const segs = classifyCustomer({
          _id: c.id,
          joinedAt: c.joinedAt,
          lastVisitAt: c.lastVisitAt,
          scans: c.scans,
          couponsRedeemed: c.couponsRedeemed,
          visitCount: c.visitCount ?? c.scans,
          totalSpend: c.totalSpend ?? 0,
        });
        return [
          c.name,
          c.phone,
          c.email ?? "",
          c.joinedAt,
          c.lastVisitAt,
          String(c.scans),
          String(c.visitCount ?? 0),
          String(c.totalSpend ?? 0),
          String(c.couponsRedeemed),
          segs.join("|"),
          c.optedOut ? "yes" : "no",
        ];
      }),
    ];
    const csv = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upsale-customers-${segment}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SEGMENT_FILTERS.map((id) => {
          const count = segmentCounts?.[id];
          const active = segment === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSegment(id)}
              className={
                active
                  ? "rounded-xl border border-[rgba(196,181,253,0.4)] bg-brand-from/20 px-3 py-1.5 text-xs font-medium text-foreground"
                  : "rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-muted hover:bg-[var(--hover-surface)]"
              }
            >
              {segmentLabel(id)}
              {typeof count === "number" ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md flex-1">
          <Input
            label="Search"
            placeholder="Name, phone, or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button variant="secondary" type="button" onClick={exportCsv} disabled={filtered.length === 0}>
          Export CSV ({filtered.length})
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
              <TH>Segment</TH>
              <TH />
            </tr>
          </THead>
          <TBody>
            {filtered.map((c) => {
              const segs = classifyCustomer({
                _id: c.id,
                joinedAt: c.joinedAt,
                lastVisitAt: c.lastVisitAt,
                scans: c.scans,
                couponsRedeemed: c.couponsRedeemed,
                visitCount: c.visitCount ?? c.scans,
                totalSpend: c.totalSpend ?? 0,
              });
              return (
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
                      {segs.length === 0 ? <Badge>standard</Badge> : null}
                      {segs.map((s) => (
                        <Badge key={s}>{s.replace("_", " ")}</Badge>
                      ))}
                      {c.optedOut ? <Badge variant="paused">opted out</Badge> : null}
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
              );
            })}
            {filtered.length === 0 ? (
              <TR>
                <TD colSpan={7} className="py-10 text-center text-muted">
                  No customers match your filters.
                </TD>
              </TR>
            ) : null}
          </TBody>
        </Table>
      </TableShell>
    </div>
  );
}
