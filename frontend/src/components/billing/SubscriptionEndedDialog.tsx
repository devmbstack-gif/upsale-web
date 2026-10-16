"use client";

import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  planName: string | null;
  isTrial: boolean;
};

export function SubscriptionEndedDialog({ planName, isTrial }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(planName));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted, open]);

  if (!mounted || !open || !planName) return null;

  const heading = isTrial ? "Your free trial has ended" : `Your ${planName} plan has ended`;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-ended-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-[var(--border)] bg-surface p-6 shadow-2xl sm:p-7">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-xl p-2 text-muted transition hover:bg-[var(--hover-surface)] hover:text-foreground"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X size={19} />
        </button>
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
          <AlertTriangle size={24} />
        </div>
        <h2 id="subscription-ended-title" className="pr-8 font-display text-2xl font-semibold">
          {heading}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Choose an active plan in Plans &amp; Billing to continue creating offers, reaching customers, and using your plan features.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--hover-surface)]"
            onClick={() => setOpen(false)}
          >
            Remind me later
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-from to-brand-to px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-from/20"
            onClick={() => {
              setOpen(false);
              router.push("/app/billing");
            }}
          >
            Go to Plans &amp; Billing <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
