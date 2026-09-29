"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Offer = {
  _id: string;
  title: string;
  type: string;
  status: "draft" | "active" | "paused" | "expired";
  scans: number;
  redemptions: number;
  expiresAt?: string | null;
};

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadOffers() {
    const res = await fetch("/api/offers", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = (await res.json()) as { offers: Offer[] };
    setOffers(data.offers ?? []);
  }

  useEffect(() => {
    void loadOffers();
  }, []);

  async function deleteOffer(offer: Offer) {
    const ok = window.confirm(`Delete "${offer.title}"? The QR link will stop working.`);
    if (!ok) return;
    setDeletingId(offer._id);
    try {
      const res = await fetch(`/api/offers/${offer._id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) return;
      await loadOffers();
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Reveal className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">{offers.length} offers total</p>
        <Button href="/app/offers/new">New offer</Button>
      </Reveal>

      <Reveal delay={1}>
        <TableShell>
          <Table>
            <THead>
              <tr>
                <TH>Offer</TH>
                <TH>Type</TH>
                <TH>Status</TH>
                <TH>Scans</TH>
                <TH>Redemptions</TH>
                <TH>Expires</TH>
                <TH />
              </tr>
            </THead>
            <TBody>
              {offers.length === 0 ? (
                <TR>
                  <TD colSpan={7}>
                    <p className="py-8 text-center text-sm text-muted">
                      No offers yet. Create your first QR discount.
                    </p>
                  </TD>
                </TR>
              ) : (
                offers.map((offer) => (
                  <TR key={offer._id}>
                    <TD>
                      <p className="font-medium">{offer.title}</p>
                    </TD>
                    <TD>
                      <Badge>{offer.type}</Badge>
                    </TD>
                    <TD>
                      <Badge variant={offer.status}>{offer.status}</Badge>
                    </TD>
                    <TD>{offer.scans}</TD>
                    <TD>{offer.redemptions}</TD>
                    <TD>
                      {offer.expiresAt ? formatDate(offer.expiresAt) : "—"}
                    </TD>
                    <TD className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <Link
                          href={`/app/offers/${offer._id}`}
                          className="text-sm font-medium text-brand-to hover:underline"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          className="text-sm font-medium text-red-300 hover:text-red-200 disabled:opacity-50"
                          disabled={deletingId === offer._id}
                          onClick={() => void deleteOffer(offer)}
                        >
                          {deletingId === offer._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </TableShell>
      </Reveal>
    </div>
  );
}
