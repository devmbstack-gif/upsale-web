"use client";

import { Button } from "@/components/ui/Button";
import { CheckCircle2, TicketCheck } from "lucide-react";

type Props = {
  code: string;
  mode: "confirm" | "success";
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm?: () => void;
};

export function RedeemCouponDialog({ code, mode, busy = false, error, onClose, onConfirm }: Props) {
  const successful = mode === "success";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section className="card-interactive w-full max-w-sm space-y-5 p-6 text-center shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="redeem-dialog-title">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
          {successful ? <CheckCircle2 size={30} /> : <TicketCheck size={30} />}
        </div>
        <div>
          <h2 id="redeem-dialog-title" className="font-display text-xl font-semibold">
            {successful ? "Coupon redeemed" : "Redeem this coupon?"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {successful ? `${code} has been marked as redeemed.` : `${code} cannot be used again after redemption.`}
          </p>
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </div>
        {successful ? (
          <Button className="w-full" onClick={onClose}>Close</Button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button onClick={onConfirm} disabled={busy}>{busy ? "Redeeming…" : "Redeem"}</Button>
          </div>
        )}
      </section>
    </div>
  );
}
