"use client";

import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Plan = {
  name: string;
  slug: string;
  description: string;
  features: string[];
  popular: boolean;
  price: { amount: number; currency: string; interval: string } | null;
  limits: { customers: number; campaignsPerMonth: number; aiGenerations: number };
};

type Usage = { campaigns: number; aiGenerations: number };
type Limits = Plan["limits"];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState("Free Trial");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<Usage>({ campaigns: 0, aiGenerations: 0 });
  const [currentLimits, setCurrentLimits] = useState<Limits | null>(null);

  const loadPlans = useCallback(async () => {
    const response = await fetch("/api/billing/plans", { cache: "no-store" });
    const data = (await response.json()) as { ok: boolean; currentPlan?: string; plans?: Plan[]; usage?: Usage; currentLimits?: Limits | null; message?: string };
    if (!response.ok || !data.ok) {
      setError(data.message ?? "Could not load plans.");
      return;
    }
    setCurrentPlan(data.currentPlan ?? "Free Trial");
    setPlans(data.plans ?? []);
    setUsage(data.usage ?? { campaigns: 0, aiGenerations: 0 });
    setCurrentLimits(data.currentLimits ?? null);
  }, []);

  useEffect(() => {
    // Initial page data loads asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (searchParams.get("payment") === "cancelled") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage("Checkout was cancelled. No payment was taken.");
    }
    if (!sessionId || searchParams.get("payment") !== "success") return;
    void (async () => {
      setBusy("confirming");
      const response = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await response.json()) as { ok?: boolean; plan?: string; message?: string };
      if (response.ok && data.ok) {
        setMessage(`Payment confirmed. Your ${data.plan} plan is active.`);
        await loadPlans();
      } else setError(data.message ?? "Could not verify the payment.");
      setBusy("");
    })();
  }, [loadPlans, searchParams]);

  async function checkout(planSlug: string) {
    setBusy(planSlug);
    setError("");
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSlug }),
    });
    const data = (await response.json()) as { ok?: boolean; url?: string; message?: string };
    if (!response.ok || !data.ok || !data.url) {
      setError(data.message ?? "Could not start checkout.");
      setBusy("");
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Plans and billing</h2>
        <p className="mt-1 text-muted">Current plan: <strong className="text-foreground">{currentPlan}</strong></p>
      </div>
      {currentLimits ? (
        <section className="card-interactive grid gap-4 p-5 sm:grid-cols-3">
          <div><p className="text-xs uppercase tracking-wide text-muted">Customers limit</p><p className="font-display mt-1 text-xl font-semibold">{currentLimits.customers || "Unlimited"}</p></div>
          <div><p className="text-xs uppercase tracking-wide text-muted">Campaigns this month</p><p className="font-display mt-1 text-xl font-semibold">{usage.campaigns} <span className="text-sm font-normal text-muted">/ {currentLimits.campaignsPerMonth || "Unlimited"}</span></p></div>
          <div><p className="text-xs uppercase tracking-wide text-muted">AI deals this month</p><p className="font-display mt-1 text-xl font-semibold">{usage.aiGenerations} <span className="text-sm font-normal text-muted">/ {currentLimits.aiGenerations || "Unlimited"}</span></p></div>
        </section>
      ) : null}
      {message ? <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p> : null}
      {error ? <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <section key={plan.slug} className="card-interactive flex flex-col gap-5 p-6">
            <div>
              {plan.popular ? <span className="text-xs font-semibold uppercase tracking-wide text-brand-to">Most popular</span> : null}
              <h3 className="font-display mt-1 text-xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
            </div>
            <p className="font-display text-3xl font-semibold">
              {plan.price ? new Intl.NumberFormat(undefined, { style: "currency", currency: plan.price.currency, maximumFractionDigits: 0 }).format(plan.price.amount) : "Unavailable"}
              {plan.price ? <span className="text-sm font-normal text-muted"> / {plan.price.interval}</span> : null}
            </p>
            <ul className="flex-1 space-y-2 text-sm">
              {plan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-300" />{feature}</li>)}
            </ul>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--hover-surface)]/40 p-3 text-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Usage limits</p>
              <div className="space-y-1"><p>{plan.limits.customers || "Unlimited"} customers</p><p>{plan.limits.campaignsPerMonth || "Unlimited"} campaigns / month</p><p>{plan.limits.aiGenerations || "Unlimited"} AI generations / month</p></div>
            </div>
            <Button className="w-full" disabled={!plan.price || busy !== "" || currentPlan === plan.name} onClick={() => void checkout(plan.slug)}>
              {currentPlan === plan.name ? "Current plan" : busy === plan.slug ? "Opening Stripe…" : "Choose plan"}
            </Button>
          </section>
        ))}
      </div>
      {busy === "confirming" ? <p className="text-sm text-muted">Confirming your payment…</p> : null}
    </div>
  );
}
