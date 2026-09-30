"use client";

import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewOfferPage() {
  const router = useRouter();
  const [type, setType] = useState<"percent" | "reward" | "fixed">("percent");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(form.get("title") ?? ""),
          description: String(form.get("description") ?? ""),
          type,
          value: Number(form.get("discount") ?? 0),
          rewardLabel: String(form.get("reward") ?? "") || null,
          expiresAt: String(form.get("expires") ?? "") || null,
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
          <form className="space-y-5" onSubmit={handleSubmit}>
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
                    onClick={() => setType(t)}
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
                label={type === "percent" ? "Discount (%)" : "Amount off"}
                name="discount"
                type="number"
                min={1}
                defaultValue={15}
              />
            ) : (
              <Input
                label="Reward label"
                name="reward"
                placeholder="Free dessert, VIP access…"
              />
            )}
            <Input label="Expiry date" name="expires" type="date" />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
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
