 "use client";

import { AmbientOrbs } from "@/components/ui/AmbientOrbs";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatOfferHeadline, type PublicOfferPayload } from "@/lib/public-offer-shared";
import {
  COUNTRIES_AZ,
  formatNationalPhone,
  getPhoneDigitCount,
} from "@/lib/data/countries";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ClaimPageLoading from "./loading";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryFlags = new Map<string, string>();

for (let first = 65; first <= 90; first += 1) {
  for (let second = 65; second <= 90; second += 1) {
    const code = String.fromCharCode(first, second);
    const name = countryNames.of(code);
    if (name && name !== code) {
      countryFlags.set(name.toLowerCase(), String.fromCodePoint(
        0x1f1e6 + first - 65,
        0x1f1e6 + second - 65,
      ));
    }
  }
}

const countryCodeAliases: Record<string, string> = {
  "antigua and barbuda": "AG",
  "bosnia and herzegovina": "BA",
  "brunei": "BN",
  "cape verde": "CV",
  "czech republic": "CZ",
  "hong kong": "HK",
  "ivory coast": "CI",
  "laos": "LA",
  "macao": "MO",
  "micronesia": "FM",
  "moldova": "MD",
  "myanmar": "MM",
  "north korea": "KP",
  "palestine": "PS",
  "russia": "RU",
  "saint kitts and nevis": "KN",
  "saint lucia": "LC",
  "saint vincent and the grenadines": "VC",
  "sao tome and principe": "ST",
  "south korea": "KR",
  "syria": "SY",
  "taiwan": "TW",
  "tanzania": "TZ",
  "trinidad and tobago": "TT",
  "turkey": "TR",
  "vatican city": "VA",
  congo: "CG",
};

function getCountryFlag(name: string) {
  const aliasCode = countryCodeAliases[name.toLowerCase()];
  if (aliasCode) {
    return String.fromCodePoint(
      ...aliasCode.split("").map((character) => 0x1f1e6 + character.charCodeAt(0) - 65),
    );
  }
  return countryFlags.get(name.toLowerCase()) ?? "🌐";
}

type ClaimState =
  | { step: "form" }
  | {
      step: "success";
      code: string;
      offerTitle: string;
      businessName: string;
      alreadyIssued: boolean;
      issuedAt: string;
    };

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
  const defaultPhoneCountry =
    COUNTRIES_AZ.find((country) => country.name === "Pakistan") ?? COUNTRIES_AZ[0];
  const [countryName, setCountryName] = useState(defaultPhoneCountry.name);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryMenuRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const selectedCountry =
    COUNTRIES_AZ.find((country) => country.name === countryName) ??
    defaultPhoneCountry;
  const phoneDigits = phone.replace(/\D/g, "");
  const expectedPhoneDigits = getPhoneDigitCount(selectedCountry.name);

  useEffect(() => {
    function closeCountryMenu(event: MouseEvent) {
      if (!countryMenuRef.current?.contains(event.target as Node)) {
        setCountryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", closeCountryMenu);
    return () => document.removeEventListener("mousedown", closeCountryMenu);
  }, []);

  // Live clock + copy state for the success card
  const [now, setNow] = useState(() => new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (claim.step !== "success") return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [claim.step]);

  // Confetti burst (only for a freshly issued coupon, respects reduced motion)
  useEffect(() => {
    if (claim.step !== "success" || claim.alreadyIssued) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
  }, [claim]);

  function formatStamp(value: string | Date) {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

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
    if (phoneDigits.length !== expectedPhoneDigits) {
      setError(`Enter a complete ${selectedCountry.name} WhatsApp number.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/offers/${encodeURIComponent(slug)}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: `${selectedCountry.dialCode}${phoneDigits}`,
          email: email.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message?: string;
        coupon?: { code: string; offerTitle: string; issuedAt: string };
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
        issuedAt: data.coupon.issuedAt,
      });
    } catch {
      setError("Could not claim this offer.");
    } finally {
      setSubmitting(false);
    }
  }

  const showConsent =
    !loading && Boolean(offer) && !unavailable && claim.step === "form" && !consentAccepted;

  if (loading) {
    return <ClaimPageLoading />;
  }

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

        {error && !offer ? (
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

        {offer ? (
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
              <section className="card-interactive space-y-5 p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-from/20 text-2xl animate-[pop_0.5s_ease-out]">
                  ✓
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold animate-[fadeUp_0.6s_ease-out]">
                    {claim.alreadyIssued
                      ? "Welcome back! You already have a code"
                      : "Congratulations! You won your coupon 🎉"}
                  </h2>
                  <p className="mt-1 text-sm text-muted">{claim.offerTitle}</p>
                </div>

                <div className="rounded-2xl border-2 border-dashed border-brand-from/50 bg-[var(--code-bg)] px-4 py-6">
                  <p className="text-xs uppercase tracking-widest text-muted">Your coupon code</p>
                  <p className="font-mono mt-2 text-3xl font-bold tracking-wider text-brand-to">
                    {claim.code}
                  </p>
                  <button
                    type="button"
                    onClick={() => void copyCode(claim.code)}
                    className="mt-3 text-sm font-medium text-brand-to hover:underline"
                  >
                    {copied ? "Copied ✓" : "Copy code"}
                  </button>
                </div>

                <div className="space-y-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm">
                  <p>
                    <span className="text-muted">Issued on: </span>
                    <strong>{formatStamp(claim.issuedAt)}</strong>
                  </p>
                  <p>
                    <span className="text-muted">Live time now: </span>
                    <strong className="font-mono">{formatStamp(now)}</strong>
                  </p>
                </div>

                <p className="text-xs text-muted">
                  {claim.businessName} will apply this single-use code on your visit. Take a
                  screenshot so you don&apos;t lose it.
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
                  <div className="space-y-1.5">
                    <label htmlFor="claim-phone" className="block text-sm font-medium text-foreground/90">
                      WhatsApp number
                    </label>
                    <div className="flex gap-2">
                      <div ref={countryMenuRef} className="relative w-24 shrink-0">
                        <button
                          type="button"
                          className="input-field flex w-full items-center justify-between px-3 font-semibold"
                          aria-label="Select country calling code"
                          aria-haspopup="listbox"
                          aria-expanded={countryMenuOpen}
                          onClick={() => setCountryMenuOpen((open) => !open)}
                        >
                          <span>{selectedCountry.dialCode}</span>
                          <span className="text-xs text-muted" aria-hidden="true">⌄</span>
                        </button>
                        {countryMenuOpen ? (
                          <div
                            className="absolute bottom-full left-0 z-40 mb-2 max-h-64 w-72 overflow-y-auto rounded-xl border border-[var(--border)] bg-surface-elevated p-1 shadow-2xl"
                            role="listbox"
                          >
                            {COUNTRIES_AZ.map((country) => (
                              <button
                                key={country.name}
                                type="button"
                                role="option"
                                aria-selected={country.name === countryName}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[var(--hover-surface)]"
                                onClick={() => {
                                  setCountryName(country.name);
                                  setPhone("");
                                  setCountryMenuOpen(false);
                                }}
                              >
                                <span aria-hidden="true">{getCountryFlag(country.name)}</span>
                                <span className="min-w-0 flex-1 truncate">{country.name}</span>
                                <span className="font-semibold">{country.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <input
                        id="claim-phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        className="input-field min-w-0 flex-1"
                        value={phone}
                        onChange={(e) => setPhone(formatNationalPhone(selectedCountry.name, e.target.value))}
                        placeholder={selectedCountry.phoneExample}
                        required
                        autoComplete="tel-national"
                        aria-describedby="claim-phone-format"
                      />
                    </div>
                    <p id="claim-phone-format" className="text-xs text-muted">
                      Format: {selectedCountry.dialCode} {selectedCountry.phoneExample}
                    </p>
                  </div>
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || phoneDigits.length !== expectedPhoneDigits}
                  >
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
