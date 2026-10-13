"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Reveal } from "@/components/ui/Reveal";
import { TBody, TD, THead, TH, TR, Table, TableShell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OffersLoading from "./loading";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOffer, setConfirmOffer] = useState<Offer | null>(null);

  async function loadOffers() {
    const res = await fetch("/api/offers", { credentials: "same-origin" });
    if (!res.ok) {
      setOffers([]);
      return;
    }
    const data = (await res.json()) as { offers: Offer[] };
    setOffers(data.offers ?? []);
  }

  useEffect(() => {
    void loadOffers();
  }, []);

  async function deleteOffer(offer: Offer) {
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
      setConfirmOffer(null);
    }
  }

  if (offers === null) {
    return <OffersLoading />;
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
                    <TD label="Offer">
                      <p className="font-medium">{offer.title}</p>
                    </TD>
                    <TD label="Type">
                      <Badge>{offer.type}</Badge>
                    </TD>
                    <TD label="Status">
                      <Badge variant={offer.status}>{offer.status}</Badge>
                    </TD>
                    <TD label="Scans">{offer.scans}</TD>
                    <TD label="Redemptions">{offer.redemptions}</TD>
                    <TD label="Expires">
                      {offer.expiresAt ? formatDate(offer.expiresAt) : "—"}
                    </TD>
                    <TD label="Actions" className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <IconButton
                          icon={Eye}
                          label="Open"
                          tone="primary"
                          href={`/app/offers/${offer._id}`}
                        />
                        <IconButton
                          icon={Trash2}
                          label="Delete"
                          tone="danger"
                          disabled={deletingId === offer._id}
                          onClick={() => setConfirmOffer(offer)}
                        />
                      </div>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </TableShell>
      </Reveal>
      <ConfirmDialog open={Boolean(confirmOffer)} title={`Delete “${confirmOffer?.title ?? "offer"}”?`} description="This offer and its issued coupons will be deleted. The QR link will stop working." busy={Boolean(deletingId)} onCancel={() => setConfirmOffer(null)} onConfirm={() => { if (confirmOffer) void deleteOffer(confirmOffer); }} />
    </div>
  );
}
