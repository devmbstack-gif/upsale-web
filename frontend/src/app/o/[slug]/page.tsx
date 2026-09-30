"use client";

import { AmbientOrbs } from "@/components/ui/AmbientOrbs";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatOfferHeadline, type PublicOfferPayload } from "@/lib/public-offer-shared";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ClaimState =
  | { step: "form" }
  | { step: "success"; code: string; offerTitle: string; businessName: string; alreadyIssued: boolean };

function ConsentDialog({
  businessName,
  onAccept,
}: {
  businessName: string;
  onAccept: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
    >
      <div
        className="card-interactive w-full max-w-sm space-y-5 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-to">UPSale</p>
          <h2 id="consent-title" className="font-display mt-2 text-xl font-semibold tracking-tight">
            Why we ask for WhatsApp
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-foreground">{businessName}</strong> needs your
            WhatsApp number to send you this offer and future deals. Your number is only used for
            that — you can ask them to stop anytime.
          </p>
        </div>

        <Button type="button" variant="primary" className="w-full" onClick={onAccept}>
          I Accept
        </Button>
      </div>
    </div>
  );
}

export default function PublicOfferPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const scanRecorded = useRef(false);

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<PublicOfferPayload | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [claim, setClaim] = useState<ClaimState>({ step: "form" });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/public/offers/${encodeURIComponent(slug)}`);
        const data = (await res.json()) as {
          ok: boolean;
          offer?: PublicOfferPayload;
          unavailable?: boolean;
          message?: string;
        };
        if (!res.ok || !data.ok || !data.offer) {
          setOffer(null);
          setError(data.message ?? "Offer not found");
          return;
        }
        setOffer(data.offer);
        setUnavailable(data.unavailable ? (data.message ?? "Unavailable") : null);
      } catch {
        setError("Could not load this offer.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!slug || !offer || unavailable || scanRecorded.current) return;
    scanRecorded.current = true;
    void fetch(`/api/public/offers/${encodeURIComponent(slug)}/scan`, { method: "POST" });
  }, [slug, offer, unavailable]);

  async function onClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || !consentAccepted) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/offers/${encodeURIComponent(slug)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email: email.trim() }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        coupon?: { code: string; offerTitle: string };
        businessName?: string;
        alreadyIssued?: boolean;
      };
      if (!res.ok || !data.ok || !data.coupon) {
        setError(data.message ?? "Could not claim this offer.");
        return;
      }
      setClaim({
        step: "success",
        code: data.coupon.code,
        offerTitle: data.coupon.offerTitle,
        businessName: data.businessName ?? offer?.business.name ?? "Business",
        alreadyIssued: Boolean(data.alreadyIssued),
      });
    } catch {
      setError("Could not claim this offer.");
    } finally {
      setSubmitting(false);
    }
  }

  const showConsent =
    !loading && Boolean(offer) && !unavailable && claim.step === "form" && !consentAccepted;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AmbientOrbs />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link href="/" aria-label="UPSale home">
            <BrandLogo variant="auto" size="md" />
          </Link>
          <span className="text-xs text-muted">Guest offer</span>
        </header>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-from border-t-transparent" />
            <p className="text-sm text-muted">Loading offer…</p>
          </div>
        ) : null}

        {!loading && error && !offer ? (
          <div className="card-interactive flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <h1 className="font-display text-xl font-semibold">Page not found</h1>
            <p className="text-sm text-muted">
              This QR link may be wrong or the offer was removed. Ask the business for a new code.
            </p>
            <Button href="/" variant="secondary">
              Go to UPSale
            </Button>
          </div>
        ) : null}

        {!loading && offer ? (
          <main className="flex flex-1 flex-col gap-6">
            <section className="card-interactive space-y-3 p-6 text-center">
              <p className="text-xs uppercase tracking-wide text-muted">{offer.business.name}</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {formatOfferHeadline(offer)}
              </h1>
              {offer.description ? (
                <p className="text-sm leading-relaxed text-muted">{offer.description}</p>
              ) : null}
              {unavailable ? (
                <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  {unavailable}
                </p>
              ) : null}
            </section>

            {claim.step === "success" ? (
              <section className="card-interactive space-y-4 p-6 text-center">
                <p className="text-sm text-muted">
                  {claim.alreadyIssued ? "You already have a code for this offer." : "Your coupon is ready"}
                </p>
                <p className="font-display text-lg font-semibold">{claim.offerTitle}</p>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--code-bg)] px-4 py-6">
                  <p className="text-xs uppercase tracking-widest text-muted">Show at checkout</p>
                  <p className="font-mono mt-2 text-3xl font-bold tracking-wider text-brand-to">
                    {claim.code}
                  </p>
                </div>
                <p className="text-xs text-muted">
                  {claim.businessName} will apply this single-use code on your visit.
                </p>
              </section>
            ) : unavailable ? null : consentAccepted ? (
              <section className="card-interactive p-6">
                <h2 className="font-display text-lg font-semibold">Claim your offer</h2>
                <p className="mt-1 text-sm text-muted">
                  Enter your details to receive your one-time coupon code.
                </p>
                <form className="mt-5 space-y-4" onSubmit={onClaim}>
                  <Input
                    label="Your name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                  <Input
                    label="WhatsApp number"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    required
                    autoComplete="tel"
                  />
                  <Input
                    label="Email (optional)"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {error ? <p className="text-sm text-red-300">{error}</p> : null}
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Creating coupon…" : "Get my code"}
                  </Button>
                </form>
              </section>
            ) : (
              <section className="card-interactive p-6 text-center">
                <p className="text-sm text-muted">
                  Please review and accept how we use your details to continue.
                </p>
              </section>
            )}
          </main>
        ) : null}
      </div>

      {showConsent && offer ? (
        <ConsentDialog
          businessName={offer.business.name}
          onAccept={() => setConsentAccepted(true)}
        />
      ) : null}
    </div>
  );
}
