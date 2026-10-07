"use client";

import { AmbientOrbs } from "@/components/ui/AmbientOrbs";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Check, PartyPopper, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Plan = {
  name: string;
  slug: string;
  description: string;
  features: string[];
  popular: boolean;
  price: { amount: number; currency: string; interval: string } | null;
  limits: { offers: number; customers: number; campaignsPerMonth: number; aiGenerations: number };
};

function limit(value: number, suffix: string) {
  return value ? `${value.toLocaleString()} ${suffix}` : `Unlimited ${suffix}`;
}

export default function ChoosePlanClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(searchParams.get("welcome") === "1");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const loadPlans = useCallback(async () => {
    const response = await fetch("/api/billing/plans", { cache: "no-store" });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; plans?: Plan[]; subscriptionStatus?: string; message?: string };
    if (response.status === 401) {
      router.replace("/login");
      return;
    }
    if (!response.ok || !data.ok) {
      setError(data.message ?? "Could not load plans.");
    } else if (data.subscriptionStatus !== "onboarding_pending") {
      router.replace("/app");
      return;
    } else {
      setPlans(data.plans ?? []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { void loadPlans(); }, [loadPlans]);

  useEffect(() => {
    if (!showWelcome) return;
    const timer = window.setTimeout(() => setShowWelcome(false), 4000);
    return () => window.clearTimeout(timer);
  }, [showWelcome]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || searchParams.get("payment") !== "success") {
      if (searchParams.get("payment") === "cancelled") setError("Checkout was cancelled. No payment was taken.");
      return;
    }
    void (async () => {
      setBusy("confirming");
      const response = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Could not confirm your payment.");
        setBusy("");
        return;
      }
      router.replace("/app");
      router.refresh();
    })();
  }, [router, searchParams]);

  async function checkout(slug: string) {
    setBusy(slug); setError("");
    const response = await fetch("/api/billing/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planSlug: slug }),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; url?: string; message?: string };
    if (!response.ok || !data.ok || !data.url) {
      setError(data.message ?? "Could not start checkout."); setBusy(""); return;
    }
    window.location.assign(data.url);
  }

  async function skip() {
    setBusy("trial"); setError("");
    const response = await fetch("/api/billing/trial", { method: "POST" });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    if (!response.ok || !data.ok) {
      setError(data.message ?? "Could not start your trial."); setBusy(""); return;
    }
    router.replace("/app");
    router.refresh();
  }

  return (
    <main className="bg-atmosphere relative min-h-dvh overflow-x-hidden px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <AmbientOrbs />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-3">
          <BrandLogo size="lg" priority />
          <div className="flex items-center gap-2 sm:gap-3">
            {!showWelcome ? (
              <button
                type="button"
                className="rounded-xl border border-brand-from/70 bg-brand-from px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,.35)] transition hover:-translate-y-0.5 hover:bg-brand-to focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-to focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
                disabled={busy !== ""}
                onClick={() => void skip()}
              >
                {busy === "trial" ? "Starting trial…" : "Skip for now"}
              </button>
            ) : null}
            <ThemeToggle />
          </div>
        </header>
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <motion.section key="welcome" className="flex min-h-[calc(100dvh-100px)] flex-col items-center justify-center px-2 text-center" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -24, filter: "blur(8px)" }} transition={{ duration: .5 }}>
              <motion.div className="grid h-24 w-24 place-items-center rounded-full bg-brand-from/20 text-brand-to" initial={{ rotate: -18, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }}><PartyPopper size={46} /></motion.div>
              <motion.p className="mt-8 text-sm font-semibold uppercase tracking-[.2em] text-brand-to" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}>Account created</motion.p>
              <motion.h1 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .35 }}>Congratulations! Your UPSale account is ready.</motion.h1>
              <motion.p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .55 }}>Next, choose the plan that fits your business—or start with the free trial.</motion.p>
              <motion.div className="mt-8 flex items-center gap-2 text-sm text-muted" animate={{ opacity: [.45, 1, .45] }} transition={{ duration: 1.5, repeat: Infinity }}><Sparkles size={17} /> Preparing your plans…</motion.div>
            </motion.section>
          ) : (
            <motion.section key="plans" className="pb-8 pt-10 sm:pt-14" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
              <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[.18em] text-brand-to">Choose your plan</p><h1 className="font-display mt-3 text-3xl font-semibold sm:text-4xl">Start growing with UPSale</h1><p className="mt-3 text-sm text-muted sm:text-base">Your selected plan is enabled immediately after successful payment.</p></div>
              {error ? <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-200">{error}</p> : null}
              {loading || busy === "confirming" ? <div className="mx-auto mt-12 text-center text-muted">{busy === "confirming" ? "Confirming your payment…" : "Loading plans…"}</div> : (
                <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {plans.map((plan, index) => <motion.article key={plan.slug} className={`card-interactive flex min-w-0 flex-col p-5 sm:p-6 ${plan.popular ? "border-brand-from/60" : ""}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .1 }}>
                    {plan.popular ? <span className="mb-3 w-fit rounded-full bg-brand-from/20 px-2.5 py-1 text-xs font-semibold text-brand-to">Most popular</span> : null}
                    <h2 className="font-display text-xl font-semibold">{plan.name}</h2><p className="mt-2 min-h-10 text-sm leading-relaxed text-muted">{plan.description}</p>
                    <p className="font-display mt-5 text-3xl font-semibold">{plan.price ? new Intl.NumberFormat(undefined, { style: "currency", currency: plan.price.currency, maximumFractionDigits: 0 }).format(plan.price.amount) : "Unavailable"}{plan.price ? <span className="text-sm font-normal text-muted"> / {plan.price.interval}</span> : null}</p>
                    <ul className="mt-5 flex-1 space-y-2 text-sm">{plan.features.map(feature => <li key={feature} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-emerald-300" /> <span>{feature}</span></li>)}</ul>
                    <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--hover-surface)]/50 p-3 text-sm"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Plan limits</p><p>{limit(plan.limits.offers, "QR offers")}</p><p>{limit(plan.limits.customers, "customers")}</p><p>{limit(plan.limits.campaignsPerMonth, "campaigns / month")}</p><p>{limit(plan.limits.aiGenerations, "AI generations / month")}</p></div>
                    <Button className="mt-5 w-full" disabled={!plan.price || busy !== ""} onClick={() => void checkout(plan.slug)}>{busy === plan.slug ? "Opening checkout…" : `Choose ${plan.name}`}</Button>
                  </motion.article>)}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
