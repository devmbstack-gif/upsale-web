"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AmbientOrbs } from "@/components/ui/AmbientOrbs";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import PhonePreview, { QrMark } from "./PhonePreview";
import Footer from "@/components/Footer";
import styles from "./landing.module.css";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

type LeadFormState = {
  name: string;
  business: string;
  email: string;
  whatsapp: string;
  message: string;
};

type Plan = {
  id: string;
  name: string;
  summary: string;
  features: string[];
  popular?: boolean;
  enterprise?: boolean;
  limits: { customers: number; campaigns: number; aiGenerations: number };
  price?: { amount: number; currency: "PKR" | "USD"; interval: "month" | "year" } | null;
};

const FLOW = [
  { title: "Scan the QR code" },
  { title: "Claim the offer" },
  { title: "Welcome a new customer" },
  { title: "Invite them back" },
] as const;

const DEALS = [
  {
    title: "20% Off Slow-Hour Boost",
    body: "Quiet afternoons get a 20% nudge for guests quiet 21+ days.",
    audience: "At Risk Customers",
  },
  {
    title: "VIP Early Access",
    body: "Seasonal menu 48 hours early for your highest spenders.",
    audience: "VIPs",
  },
  {
    title: "Second-Visit Nudge",
    body: "A free add-on for anyone who already came twice this month.",
    audience: "Repeat Guests",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Meet your customers",
  },
  {
    step: "02",
    title: "Create the right offer",
  },
  {
    step: "03",
    title: "Bring customers back",
  },
] as const;

const GROWTH_BARS = [28, 36, 42, 48, 55, 63, 72] as const;

const SETUP = [
  { title: "Add your business" },
  { title: "Add your branding" },
  { title: "Choose a discount" },
  { title: "Display your QR code" },
  { title: "Collect customer details" },
  { title: "Give each customer a coupon" },
  { title: "View your customer list" },
  { title: "Choose an audience" },
  { title: "Send your next deal" },
] as const;

const EMPTY_LEAD: LeadFormState = {
  name: "",
  business: "",
  email: "",
  whatsapp: "",
  message: "",
};

const revealEase = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}

function formatMoney(amount: number, currency: "PKR" | "USD") {
  return new Intl.NumberFormat(currency === "PKR" ? "en-PK" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductWorkflow() {
  const reduceMotion = useReducedMotion();
  const [dealIndex, setDealIndex] = useState(0);
  const [action, setAction] = useState<"approve" | "regenerate" | null>(null);
  const deal = DEALS[dealIndex];

  function runAction(next: "approve" | "regenerate") {
    setAction(next);
    if (next === "regenerate") {
      setDealIndex((current) => (current + 1) % DEALS.length);
    }
  }

  return (
    <div className={styles.workflow}>
      <Reveal className={styles.workflowCardWrap} delay={0.05}>
        <motion.article
          className={styles.workflowCard}
          whileHover={reduceMotion ? undefined : { y: -6 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <span className={styles.workflowStep}>{WORKFLOW_STEPS[0].step}</span>
          <h3>{WORKFLOW_STEPS[0].title}</h3>
          <div className={styles.workflowVisual}>
            <div className={styles.workflowQrStand}>
              <div className={styles.workflowQrMark}>
                <QrMark compact />
                <span className={styles.workflowScan} aria-hidden="true" />
              </div>
              <span className={styles.workflowQrLabel}>Counter QR</span>
            </div>
          </div>
        </motion.article>
      </Reveal>

      <div className={styles.workflowArrow} aria-hidden="true">
        →
      </div>

      <Reveal className={styles.workflowCardWrap} delay={0.15}>
        <motion.article
          className={`${styles.workflowCard} ${styles.workflowCardAi}`}
          whileHover={reduceMotion ? undefined : { y: -6 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <span className={styles.workflowStep}>{WORKFLOW_STEPS[1].step}</span>
          <h3>{WORKFLOW_STEPS[1].title}</h3>
          <div className={styles.workflowVisual}>
            <div className={styles.aiSegments}>
              <span className={styles.segmentRisk}>At Risk Customers</span>
              <span className={styles.segmentVip}>VIPs</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={deal.title}
                className={styles.aiPrompt}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <strong>{deal.title}</strong>
                <span>{deal.audience}</span>
              </motion.div>
            </AnimatePresence>
            <div className={styles.aiActions}>
              <button
                type="button"
                className={`${styles.aiPill} ${styles.aiPillPulse} ${
                  action === "approve" ? styles.aiPillOn : ""
                }`}
                onClick={() => runAction("approve")}
              >
                Approve
              </button>
              <button
                type="button"
                className={`${styles.aiPill} ${action === "regenerate" ? styles.aiPillOn : ""}`}
                onClick={() => runAction("regenerate")}
              >
                Regenerate
              </button>
            </div>
          </div>
        </motion.article>
      </Reveal>

      <div className={styles.workflowArrow} aria-hidden="true">
        →
      </div>

      <Reveal className={styles.workflowCardWrap} delay={0.25}>
        <motion.article
          className={`${styles.workflowCard} ${styles.workflowCardGrowth}`}
          whileHover={reduceMotion ? undefined : { y: -6 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          <span className={styles.workflowStep}>{WORKFLOW_STEPS[2].step}</span>
          <h3>{WORKFLOW_STEPS[2].title}</h3>
          <div className={styles.workflowVisual}>
            <div className={styles.growthMetric}>
              <strong>+35%</strong>
              <span>Return Visits</span>
            </div>
            <div className={styles.growthChart} aria-hidden="true">
              {GROWTH_BARS.map((height, index) => (
                <motion.span
                  key={height}
                  className={styles.growthBar}
                  initial={{ scaleY: reduceMotion ? 1 : 0.2 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.06,
                    ease: revealEase,
                  }}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </motion.article>
      </Reveal>
    </div>
  );
}

function PricingCardReveal({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div style={{ height: "100%" }}>{children}</div>;
  }

  return (
    <motion.div
      style={{ height: "100%" }}
      initial={{ opacity: 0, x: 48, scale: 0.92 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay: index * 0.3,
        ease: revealEase,
      }}
    >
      {children}
    </motion.div>
  );
}

function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [pricingLoaded, setPricingLoaded] = useState(false);

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const pakistanLocale = (navigator.languages ?? [navigator.language]).some((language) => /(?:^|-)PK$/i.test(language));
    const country = timezone === "Asia/Karachi" || pakistanLocale ? "PK" : "OTHER";
    const controller = new AbortController();
    fetch(`/api/public/plans?country=${country}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Pricing unavailable");
        return response.json() as Promise<{ ok: boolean; plans: Plan[] }>;
      })
      .then((payload) => {
        if (payload.ok && payload.plans.length) setPlans(payload.plans);
      })
      .catch(() => undefined)
      .finally(() => setPricingLoaded(true));
    return () => controller.abort();
  }, []);
  const standardPlans = plans.filter((plan) => !plan.enterprise);
  const enterprisePlan = plans.find((plan) => plan.enterprise);

  return (
    <div>
      <div className={styles.pricingGrid}>
        {standardPlans.map((plan, index) => (
          <PricingCardReveal key={plan.id} index={index}>
            <article
              className={`${styles.priceCard} ${plan.popular ? styles.popular : ""}`}
            >
              {plan.popular ? <span className={styles.badge}>Most Popular</span> : null}
              <h3>{plan.name}</h3>
              <p>{plan.summary}</p>
              <div className={styles.amount}>
                {plan.price ? formatMoney(plan.price.amount, plan.price.currency) : "Contact us"}
                {plan.price ? <small>{plan.price.currency}</small> : null}
                {plan.price ? <span>/ {plan.price.interval}</span> : null}
              </div>
              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className={styles.planLimits}>
                <strong>Monthly usage limits</strong>
                <span>{plan.limits.customers ? `${plan.limits.customers.toLocaleString()} customers` : "Unlimited customers"}</span>
                <span>{plan.limits.campaigns ? `${plan.limits.campaigns} campaigns` : "Unlimited campaigns"}</span>
                <span>{plan.limits.aiGenerations ? `${plan.limits.aiGenerations} AI generations` : "Unlimited AI generations"}</span>
              </div>
              <Link href="/signup" className={`${styles.btn} ${styles.btnPrimary}`}>
                {plan.popular ? "Start with Growth" : "Subscribe"}
              </Link>
            </article>
          </PricingCardReveal>
        ))}
      </div>
      {pricingLoaded && plans.length === 0 ? (
        <p className={styles.lede}>Plans are being updated. Please check back shortly.</p>
      ) : null}
      {enterprisePlan ? <Reveal>
        <div className={styles.enterprise}>
          <div>
            <h3>{enterprisePlan.name}</h3>
            <p>{enterprisePlan.summary}</p>
          </div>
          <a href="#contact" className={`${styles.btn} ${styles.btnGhost}`}>
            Contact sales
          </a>
        </div>
      </Reveal> : null}
    </div>
  );
}

function ContactForm() {
  const [lead, setLead] = useState<LeadFormState>(EMPTY_LEAD);
  const [sent, setSent] = useState(false);

  function update(field: keyof LeadFormState, value: string) {
    setLead((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className={styles.thanks} role="status">
        <h3>Request received</h3>
        <p>
          Thanks {lead.name.trim() || "there"}. We will reply on WhatsApp
          {lead.whatsapp.trim() ? ` at ${lead.whatsapp.trim()}` : ""}.
        </p>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={() => {
            setLead(EMPTY_LEAD);
            setSent(false);
          }}
        >
          Send another note
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.formRow}>
        <label className={styles.field}>
          Name
          <input
            name="name"
            autoComplete="name"
            required
            value={lead.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          Business
          <input
            name="organization"
            autoComplete="organization"
            required
            value={lead.business}
            onChange={(event) => update("business", event.target.value)}
          />
        </label>
      </div>
      <div className={styles.formRow}>
        <label className={styles.field}>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={lead.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        <label className={styles.field}>
          WhatsApp
          <input
            type="tel"
            name="tel"
            autoComplete="tel"
            required
            placeholder="+92 300 0000000"
            value={lead.whatsapp}
            onChange={(event) => update("whatsapp", event.target.value)}
          />
        </label>
      </div>
      <label className={styles.field}>
        Message
        <textarea
          name="message"
          required
          value={lead.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="How many locations, and what should the first offer be?"
        />
      </label>
      <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
        Talk to sales
      </button>
    </form>
  );
}

export default function LandingPage() {
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const demoFrameRef = useRef<HTMLElement>(null);
  const videoStartedRef = useRef(false);
  const [videoFloating, setVideoFloating] = useState(false);
  const [videoDismissed, setVideoDismissed] = useState(false);

  useEffect(() => {
    const video = demoVideoRef.current;
    const frame = demoFrameRef.current;
    if (!video || !frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
          videoStartedRef.current = true;
          setVideoFloating(false);
          void video.play().catch(() => undefined);
        } else if (videoStartedRef.current && entry.boundingClientRect.bottom < 0 && !videoDismissed) {
          setVideoFloating(true);
          void video.play().catch(() => undefined);
        } else {
          setVideoFloating(false);
          video.pause();
        }
      },
      { threshold: [0, 0.9, 1] },
    );
    observer.observe(frame);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [videoDismissed]);

  return (
    <div className={styles.page}>
      <AmbientOrbs />
      <div className={styles.shell}>
        <div className={styles.navWrap}>
          <header className={styles.nav}>
            <Link href="/" className={styles.logo} aria-label="UPSale home">
              <BrandLogo variant="auto" size="md" priority />
            </Link>
            <nav className={styles.navActions} aria-label="Account">
              <ThemeToggle />
              <Link
                href="/login"
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
              >
                Sign up
              </Link>
            </nav>
          </header>
        </div>

        <main>
          <section className={styles.container}>
            <div className={styles.hero}>
              <div>
                <Reveal>
                  <p className={styles.eyebrow}>QR to WhatsApp</p>
                  <h1 className={styles.headline}>
                    Turn every walk-in into{" "}
                    <span className={styles.headlineAccent}>a customer you can message again</span>
                  </h1>
                  <div className={styles.heroActions}>
                    <Link
                      href="/signup"
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnPulse}`}
                    >
                      Sign up
                    </Link>
                  </div>
                </Reveal>
              </div>
              <Reveal delay={0.08}>
                <PhonePreview />
              </Reveal>
            </div>
          </section>

          <section className={`${styles.demoIntro} ${styles.container}`} id="demo">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Demo</p>
              <h2>Watch a walk-in become a contact</h2>
            </Reveal>
            <Reveal>
              <figure ref={demoFrameRef} className={`${styles.video} ${styles.videoCompact}`}>
                <video
                  ref={demoVideoRef}
                  className={`${styles.videoElement} ${videoFloating ? styles.videoFloating : ""}`}
                  src={process.env.NEXT_PUBLIC_DEMO_VIDEO_URL}
                  poster="/video-thumbnail.png"
                  width={1280}
                  height={720}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                >
                  Your browser does not support HTML video.
                </video>
                {videoFloating ? (
                  <button
                    type="button"
                    className={styles.videoFloatingClose}
                    aria-label="Close floating video"
                    onClick={() => {
                      setVideoDismissed(true);
                      setVideoFloating(false);
                      demoVideoRef.current?.pause();
                    }}
                  >
                    ×
                  </button>
                ) : null}
              </figure>
            </Reveal>
          </section>

          <section className={`${styles.section} ${styles.container}`} id="how-it-works">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>How it works</p>
              <h2>Four steps from the door to the next message</h2>
            </Reveal>
            <div className={styles.flow}>
              <motion.div
                className={styles.flowLine}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, ease: revealEase }}
              />
              <motion.div
                className={styles.flowLineVertical}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: revealEase }}
              />
              {FLOW.map((item, index) => (
                <Reveal key={item.title} delay={0.08 * index}>
                  <article className={styles.flowCard}>
                    <span
                      className={styles.flowIndex}
                      style={{ animationDelay: `${index * 0.32}s` }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{item.title}</h3>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.container}`} id="features">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Product</p>
              <h2>Bring customers back with smarter offers</h2>
            </Reveal>
            <ProductWorkflow />
          </section>

          <section className={`${styles.section} ${styles.container}`} id="integrations">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Setup</p>
              <h2>Set up your first offer in nine steps</h2>
            </Reveal>
            <div className={styles.setup}>
              {SETUP.map((item, index) => (
                <motion.div
                  key={item.title}
                  className={styles.setupCell}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: revealEase }}
                >
                  <article className={styles.setupItem}>
                    <motion.span
                      className={styles.num}
                      style={{ animationDelay: `${index * 0.32}s` }}
                      initial={{ scale: 0.4, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 16,
                        delay: index * 0.08,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </motion.span>
                    <div>
                      <h3>{item.title}</h3>
                    </div>
                  </article>
                </motion.div>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.container}`} id="pricing">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Pricing</p>
              <h2>Simple pricing for your business</h2>
              <p className={styles.lede}>
                Choose the plan that fits today, then grow when you are ready.
              </p>
            </Reveal>
            <Pricing />
          </section>

          <section className={`${styles.section} ${styles.container}`} id="contact">
            <div className={styles.contact}>
              <Reveal className={styles.pitch}>
                <p className={styles.eyebrow}>Contact sales</p>
                <h2>We will stand up the first QR with you</h2>
                <p className={styles.lede}>
                  Tell us the business and the offer you want on the counter.
                  A short WhatsApp reply is enough to start.
                </p>
                <ul className={styles.points}>
                  <li>About twenty minutes to a printable code.</li>
                  <li>Works beside the billing you already use.</li>
                  <li>Guests stay in the browser and on WhatsApp.</li>
                </ul>
              </Reveal>
              <Reveal delay={0.08}>
                <ContactForm />
              </Reveal>
            </div>
          </section>
        </main>

        <section className={`${styles.ctaBand} ${styles.container}`}>
          <Reveal>
            <h2>Put a QR on the counter. Keep the customer.</h2>
            <Link href="/signup" className={`${styles.btn} ${styles.btnPrimary}`}>
              Sign up
            </Link>
          </Reveal>
        </section>

        <Footer />
      </div>
    </div>
  );
}
