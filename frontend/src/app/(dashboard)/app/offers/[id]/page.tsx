"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { IconButton } from "@/components/ui/IconButton";
import { QrPlaceholder } from "@/components/ui/QrPlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import OfferDetailLoading from "./loading";

type Offer = {
  _id: string;
  businessId: string;
  businessSlug: string;
  title: string;
  description?: string;
  type: string;
  status: "draft" | "active" | "paused" | "expired";
  scans: number;
  redemptions: number;
  shareSlug?: string;
  expiresAt?: string | null;
  createdAt?: string;
  discountPercent?: number | null;
  rewardLabel?: string | null;
};

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const [offer, setOffer] = useState<Offer | null | undefined>(undefined);
  const [shareUrl, setShareUrl] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const slug = useMemo(() => {
    if (!offer) return "";
    return offer.shareSlug || offer._id;
  }, [offer]);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const res = await fetch(`/api/offers/${id}`, { credentials: "same-origin" });
      if (!res.ok) {
        setOffer(null);
        return;
      }
      const data = (await res.json()) as { offer: Offer };
      setOffer(data.offer);
    })();
  }, [id]);

  useEffect(() => {
    // Build the absolute share URL only after browser hydration.
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShareUrl("");
      return;
    }
    if (!offer?.businessSlug) return;
    setShareUrl(`${window.location.origin}/${offer.businessSlug}/${slug}`);
  }, [slug, offer?.businessSlug]);

  if (offer === undefined) {
    return <OfferDetailLoading />;
  }

  if (!offer) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-12 text-center">
        <p className="text-muted">Offer not found.</p>
        <Button href="/app/offers" variant="secondary">
          Back to list
        </Button>
      </div>
    );
  }

  async function deleteOffer() {
    if (!offer) return;
    const ok = window.confirm(
      `Delete "${offer.title}"? This removes the offer and its issued coupons. The public QR link will stop working.`,
    );
    if (!ok) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setDeleteError(data.message ?? "Could not delete offer.");
        return;
      }
      router.push("/app/offers");
      router.refresh();
    } catch {
      setDeleteError("Could not delete offer.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Reveal className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={offer.status}>{offer.status}</Badge>
            <Badge>{offer.type}</Badge>
          </div>
          <h2 className="font-display mt-3 text-2xl font-semibold">{offer.title}</h2>
          {offer.description ? (
            <p className="mt-2 max-w-xl text-muted">{offer.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={`/${offer.businessSlug}/${slug}`} variant="primary">
            Preview claim page
          </Button>
          <Button href="/app/offers" variant="secondary">
            Back to list
          </Button>
          <IconButton
            icon={Trash2}
            label="Delete offer"
            tone="danger"
            size="md"
            disabled={deleting}
            onClick={() => void deleteOffer()}
          />
        </div>
      </Reveal>
      {deleteError ? <p className="text-sm text-red-300">{deleteError}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Reveal delay={1}>
          <div className="card-interactive flex flex-col items-center p-6">
            <QrPlaceholder
              value={shareUrl || undefined}
              seed={slug}
              size={240}
              title="Scan with your camera"
              downloadFilename={offer.title}
              subtitle="Customers scan this at your counter to open the claim page (like a Wi‑Fi QR)"
            />
          </div>
        </Reveal>

        <Reveal delay={2} className="space-y-6">
          <div className="card-interactive space-y-4 p-6">
            <h3 className="font-display font-semibold">Shareable link</h3>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 truncate rounded-xl border border-[var(--border)] bg-[var(--code-bg)] px-3 py-2.5 text-sm text-brand-to">
                {shareUrl || `/${slug}`}
              </code>
              <CopyButton value={shareUrl || `/${slug}`} label="Copy link" />
            </div>
          </div>

          <div className="card-interactive grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted">Scans</p>
              <p className="font-display text-2xl font-semibold">
                {(offer.scans ?? 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted">Redemptions</p>
              <p className="font-display text-2xl font-semibold">
                {(offer.redemptions ?? 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted">Expires</p>
              <p className="mt-1 text-sm font-medium">
                {offer.expiresAt ? formatDate(offer.expiresAt) : "No expiry"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted">Created</p>
              <p className="mt-1 text-sm font-medium">
                {offer.createdAt ? formatDate(offer.createdAt) : "—"}
              </p>
            </div>
          </div>

          <Link href="/app/offers/new" className="text-sm text-muted hover:text-foreground">
            Create another offer →
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
