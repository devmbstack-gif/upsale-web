"use client";

import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function todayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isPastDate(value: string, today: string) {
  return Boolean(value) && value < today;
}

export default function NewOfferPage() {
  const router = useRouter();
  const minExpiry = useMemo(() => todayISODate(), []);
  const [type, setType] = useState<"percent" | "reward" | "fixed">("percent");
  const [discount, setDiscount] = useState("15");
  const [expires, setExpires] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function validateExpiry(value: string) {
    if (isPastDate(value, minExpiry)) {
      setExpiryError("Expiry date cannot be in the past.");
      return false;
    }
    setExpiryError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const expiresValue = String(form.get("expires") ?? "").trim();
    if (!validateExpiry(expiresValue)) {
      return;
    }
    const discountValue = Number(form.get("discount") ?? 0);
    if ((type === "percent" || type === "fixed") && !Number.isFinite(discountValue)) {
      setError("Enter a valid discount value."); return;
    }
    if (type === "percent" && (discountValue < 0 || discountValue > 100)) {
      setError("Percentage discount must be between 0 and 100."); return;
    }
    if (type === "fixed" && discountValue < 0) {
      setError("Amount off cannot be negative."); return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(form.get("title") ?? ""),
          description: String(form.get("description") ?? ""),
          type,
          value: discountValue,
          rewardLabel: String(form.get("reward") ?? "") || null,
          expiresAt: expiresValue || null,
        }),
      });
      const data = (await res.json()) as { ok: boolean; offer?: { _id: string }; message?: string };
      if (!res.ok || !data.ok || !data.offer) {
        setError(data.message ?? "Could not create offer");
        return;
      }
      router.push(`/app/offers/${data.offer._id}`);
    } catch {
      setError("Could not create offer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <div className="card-interactive p-6 md:p-8">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input label="Offer title" name="title" placeholder="e.g. 10% off lunch" required />
            <TextArea
              label="Description"
              name="description"
              placeholder="What customers see after scanning"
            />
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground/90">Offer type</span>
              <div className="flex flex-wrap gap-2">
                {(["percent", "reward", "fixed"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      if (t === "percent" && Number(discount) > 100) setDiscount("100");
                    }}
                    className={
                      type === t
                        ? "rounded-xl border border-[rgba(196,181,253,0.35)] bg-brand-from/20 px-4 py-2 text-sm capitalize text-foreground"
                        : "rounded-xl border border-[var(--border)] px-4 py-2 text-sm capitalize text-muted hover:bg-[var(--hover-surface)]"
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {type === "percent" || type === "fixed" ? (
              <Input
                key="discount-value"
                label={type === "percent" ? "Discount (%)" : "Amount off"}
                name="discount"
                type="number"
                min={0}
                max={type === "percent" ? 100 : undefined}
                step="any"
                value={discount}
                onKeyDown={(event) => {
                  if (["-", "+", "e", "E"].includes(event.key)) event.preventDefault();
                }}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next === "") {
                    setDiscount("");
                    return;
                  }
                  const numeric = Number(next);
                  if (!Number.isFinite(numeric)) return;
                  if (numeric < 0) {
                    setDiscount("0");
                    return;
                  }
                  if (type === "percent" && numeric > 100) {
                    setDiscount("100");
                    return;
                  }
                  setDiscount(next);
                }}
                required
              />
            ) : (
              <Input
                key="reward-label"
                label="Reward label"
                name="reward"
                placeholder="Free dessert, VIP access…"
              />
            )}
            <div className="space-y-1.5">
              <Input
                label="Expiry date"
                name="expires"
                type="date"
                min={minExpiry}
                value={expires}
                aria-invalid={Boolean(expiryError)}
                onChange={(event) => {
                  const next = event.target.value;
                  setExpires(next);
                  validateExpiry(next);
                }}
              />
              {expiryError ? (
                <p className="text-sm text-red-300" role="alert">
                  {expiryError}
                </p>
              ) : null}
            </div>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={submitting || Boolean(expiryError)}>
                {submitting ? "Publishing…" : "Publish offer"}
              </Button>
              <Link
                href="/app/offers"
                className="inline-flex items-center px-2 text-sm text-muted hover:text-foreground"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </Reveal>
    </div>
  );
}
