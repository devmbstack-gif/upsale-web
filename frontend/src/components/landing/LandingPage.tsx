"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AmbientOrbs } from "@/components/ui/AmbientOrbs";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import PhonePreview, { QrMark } from "./PhonePreview";
import styles from "./landing.module.css";

type DealAction = "approve" | "regenerate" | "edit";
type CustomerGroup = "New" | "Repeat" | "VIP" | "At Risk";
type RegionId = "PK" | "IN" | "AE" | "SA" | "GB" | "US";
type PlanId = "starter" | "growth" | "pro";

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

type Region = {
  id: RegionId;
  label: string;
  currency: string;
  locale: string;
  prices: Record<PlanId, number>;
};

type Plan = {
  id: PlanId;
  name: string;
  summary: string;
  features: string[];
  popular?: boolean;
};

type Deal = {
  title: string;
  body: string;
  audience: CustomerGroup;
};

type Customer = {
  name: string;
  visits: number;
  group: CustomerGroup;
};

const BUSINESSES = [
  "Restaurants",
  "Salons",
  "Bakeries",
  "Cafes",
  "Retail stores",
  "Boutiques",
] as const;

const FLOW = [
  {
    title: "Scan QR",
    text: "A code on the counter opens your offer. No app download, no account to create first.",
  },
  {
    title: "Get discount",
    text: "The guest enters a name and WhatsApp number and leaves with a one-time saving.",
  },
  {
    title: "Business gets customer",
    text: "That visit becomes a profile you own, with the visit date and the offer they used.",
  },
  {
    title: "Send future deals",
    text: "Next week you message the same person with a reason to come back.",
  },
] as const;

const DEALS: Deal[] = [
  {
    title: "Slow-hour boost",
    body: "20% off Tuesday to Thursday, 2–5pm, for guests who have been quiet for 21 days.",
    audience: "At Risk",
  },
  {
    title: "Second-visit nudge",
    body: "A free add-on for anyone who already came twice this month.",
    audience: "Repeat",
  },
  {
    title: "VIP early look",
    body: "Seasonal menu access 48 hours early, reserved for your highest spenders.",
    audience: "VIP",
  },
];

const CUSTOMERS: Customer[] = [
  { name: "Ayesha K.", visits: 1, group: "New" },
  { name: "Bilal R.", visits: 6, group: "Repeat" },
  { name: "Noor S.", visits: 14, group: "VIP" },
  { name: "Hamza A.", visits: 2, group: "At Risk" },
  { name: "Meher Q.", visits: 4, group: "Repeat" },
];

const SETUP = [
  {
    title: "Create your place",
    text: "Add the business name, city, and the counter the QR will sit on.",
  },
  {
    title: "Brand the offer page",
    text: "Upload a logo and set the violet, or any color your floor already uses.",
  },
  {
    title: "Choose the discount",
    text: "Percent off, a free item, or a fixed amount. One clear offer is enough.",
  },
  {
    title: "Put the QR on the counter",
    text: "Print the code or show it on a stand. Staff point, guests scan.",
  },
  {
    title: "Collect WhatsApp",
    text: "The form asks for a name and the number you can message again.",
  },
  {
    title: "Issue a unique coupon",
    text: "Each scan mints a single-use code so the offer cannot be passed around.",
  },
  {
    title: "Open the customer list",
    text: "Every claim shows up with the visit, the code, and the group.",
  },
  {
    title: "Sort by intent",
    text: "New, Repeat, VIP, and At Risk are ready before you write a word.",
  },
  {
    title: "Send the next deal",
    text: "Approve a draft and it goes out on WhatsApp to the group you picked.",
  },
] as const;

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    summary: "One counter, one offer, a list you can actually use.",
    features: [
      "1 location",
      "QR discount page",
      "500 customer profiles",
      "Unique one-time coupons",
      "Manual WhatsApp handoff",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    summary: "The loop, automated: capture, group, and message.",
    popular: true,
    features: [
      "3 locations",
      "AI Deal Maker",
      "Unlimited customers",
      "New, Repeat, VIP, At Risk",
      "Scheduled WhatsApp campaigns",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    summary: "For teams running more than one floor.",
    features: [
      "10 locations",
      "Everything in Growth",
      "Staff seats",
      "Custom offer rules",
      "Customer export",
    ],
  },
];

const REGIONS: Region[] = [
  {
    id: "PK",
    label: "Pakistan",
    currency: "PKR",
    locale: "en-PK",
    prices: { starter: 4990, growth: 9990, pro: 19990 },
  },
  {
    id: "IN",
    label: "India",
    currency: "INR",
    locale: "en-IN",
    prices: { starter: 1499, growth: 3499, pro: 7999 },
  },
  {
    id: "AE",
    label: "UAE",
    currency: "AED",
    locale: "en-AE",
    prices: { starter: 79, growth: 179, pro: 349 },
  },
  {
    id: "SA",
    label: "Saudi Arabia",
    currency: "SAR",
    locale: "en-SA",
    prices: { starter: 79, growth: 179, pro: 349 },
  },
  {
    id: "GB",
    label: "UK",
    currency: "GBP",
    locale: "en-GB",
    prices: { starter: 19, growth: 39, pro: 79 },
  },
  {
    id: "US",
    label: "USA",
    currency: "USD",
    locale: "en-US",
    prices: { starter: 29, growth: 59, pro: 119 },
  },
];

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

function formatMoney(amount: number, region: Region) {
  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function Bento() {
  const [dealIndex, setDealIndex] = useState(0);
  const [action, setAction] = useState<DealAction | null>(null);
  const [draft, setDraft] = useState(DEALS[0].body);
  const [group, setGroup] = useState<CustomerGroup>("Repeat");
  const deal = DEALS[dealIndex];
  const visibleCustomers = CUSTOMERS.filter((customer) => customer.group === group);

  function runAction(next: DealAction) {
    setAction(next);
    if (next === "regenerate") {
      const following = (dealIndex + 1) % DEALS.length;
      setDealIndex(following);
      setDraft(DEALS[following].body);
    }
    if (next === "edit" && action !== "edit") {
      setDraft(deal.body);
    }
  }

  return (
    <div className={styles.bento}>
      <Reveal className={styles.ai}>
        <article className={styles.card}>
          <p className={styles.eyebrow}>AI Deal Maker</p>
          <h3>A next offer, drafted from who already visited</h3>
          <p>
            Pick a group, read the draft, then approve it, regenerate it, or
            rewrite the line yourself.
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${dealIndex}-${action === "edit" ? "edit" : "view"}`}
              className={styles.dealPreview}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
              <strong>{deal.title}</strong>
              {action === "edit" ? (
                <textarea
                  className={styles.editor}
                  value={draft}
                  aria-label="Edit deal copy"
                  onChange={(event) => setDraft(event.target.value)}
                />
              ) : (
                <p>{draft}</p>
              )}
              <span className={styles.audience}>{deal.audience}</span>
            </motion.div>
          </AnimatePresence>
          <div className={styles.tags}>
            {(
              [
                ["approve", "Approve"],
                ["regenerate", "Regenerate"],
                ["edit", "Edit"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`${styles.tag} ${action === id ? styles.tagOn : ""}`}
                onClick={() => runAction(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className={styles.status}>
            {action === "approve" && "Approved. Queued for WhatsApp."}
            {action === "regenerate" && "New draft ready to review."}
            {action === "edit" && "Editing the message before it sends."}
            {action === null && "Waiting for a decision."}
          </p>
        </article>
      </Reveal>

      <Reveal className={styles.qrCard} delay={0.12}>
        <article className={styles.card}>
          <h3>QR discounts</h3>
          <p>One code. One offer. Printed beside the till.</p>
          <div className={styles.miniQr}>
            <div className={styles.miniQrFrame}>
              <QrMark compact />
              <span className={styles.miniScan} aria-hidden="true" />
            </div>
            <div>
              <strong>15% off first visit</strong>
              <p>Scan opens the claim page in the browser.</p>
            </div>
          </div>
        </article>
      </Reveal>

      <Reveal className={styles.dbCard} delay={0.2}>
        <article className={styles.card}>
          <h3>Customer database</h3>
          <p>Filtered to {group}.</p>
          <div className={styles.rows}>
            <AnimatePresence mode="popLayout">
              {visibleCustomers.map((customer) => (
                <motion.div
                  key={customer.name}
                  className={styles.row}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <span>{customer.name}</span>
                  <span>
                    {customer.visits} {customer.visits === 1 ? "visit" : "visits"}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </article>
      </Reveal>

      <Reveal className={styles.groupCard} delay={0.28}>
        <article className={styles.card}>
          <h3>Customer groups</h3>
          <p>Message a slice of the list, not the whole room.</p>
          <div className={styles.chips}>
            {(["New", "Repeat", "VIP", "At Risk"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.chip} ${
                  item === "New"
                    ? styles.chipNew
                    : item === "Repeat"
                      ? styles.chipRepeat
                      : item === "VIP"
                        ? styles.chipVip
                        : styles.chipRisk
                } ${group === item ? styles.chipOn : ""}`}
                aria-pressed={group === item}
                onClick={() => setGroup(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </article>
      </Reveal>

      <Reveal className={styles.waFeature} delay={0.36}>
        <article className={styles.card}>
          <h3>WhatsApp campaigns</h3>
          <p>The same thread the coupon already opened.</p>
          <div className={styles.bubble}>
            Brew & Co: Tuesday is quiet. 20% off from 2–5pm if you show this
            chat. Reply STOP to opt out.
          </div>
          <div className={styles.typing} aria-hidden="true">
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
            <span className={styles.typingDot} />
          </div>
        </article>
      </Reveal>

      <Reveal className={styles.couponCard} delay={0.44}>
        <article className={styles.card}>
          <h3>Unique coupons</h3>
          <p>Each code dies after one redemption.</p>
          <div className={styles.codes}>
            <div className={styles.codeRow}>
              <code>AYE-15-4K</code>
              <span>Used</span>
            </div>
            <div className={styles.codeRow}>
              <code>BIL-10-2Q</code>
              <span>Live</span>
            </div>
            <div className={styles.codeRow}>
              <code>NOR-20-9M</code>
              <span>Live</span>
            </div>
          </div>
        </article>
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
  const [regionId, setRegionId] = useState<RegionId>("PK");
  const region = REGIONS.find((item) => item.id === regionId) ?? REGIONS[0];

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Pricing region">
        {REGIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={`${styles.tab} ${regionId === item.id ? styles.tabOn : ""}`}
            aria-selected={regionId === item.id}
            onClick={() => setRegionId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.pricingGrid}>
        {PLANS.map((plan, index) => (
          <PricingCardReveal key={plan.id} index={index}>
            <article
              className={`${styles.priceCard} ${plan.popular ? styles.popular : ""}`}
            >
              {plan.popular ? <span className={styles.badge}>Most Popular</span> : null}
              <h3>{plan.name}</h3>
              <p>{plan.summary}</p>
              <div className={styles.amount}>
                {formatMoney(region.prices[plan.id], region)}
                <span>/ month</span>
              </div>
              <ul className={styles.features}>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Link href="/signup" className={`${styles.btn} ${styles.btnPrimary}`}>
                {plan.popular ? "Start with Growth" : "Sign up"}
              </Link>
            </article>
          </PricingCardReveal>
        ))}
      </div>
      <Reveal>
        <div className={styles.enterprise}>
          <div>
            <h3>Enterprise</h3>
            <p>
              More locations, a white-label offer page, or a custom handoff
              into the tools you already run.
            </p>
          </div>
          <a href="#contact" className={`${styles.btn} ${styles.btnGhost}`}>
            Contact sales
          </a>
        </div>
      </Reveal>
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
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.page}>
      <AmbientOrbs />
      <div className={styles.shell}>
        <div className={styles.navWrap}>
          <header className={styles.nav}>
            <Link href="/" className={styles.logo} aria-label="UPSale home">
              <BrandLogo variant="auto" size="md" />
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
                  <p className={styles.subtitle}>
                    UPSale puts a discount on your counter. Guests scan, share
                    WhatsApp, and take a one-time code. You keep the person,
                    not just the receipt.
                  </p>
                  <div className={styles.heroActions}>
                    <Link
                      href="/signup"
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnPulse}`}
                    >
                      Sign up
                    </Link>
                  </div>
                  <p className={styles.finePrint}>
                    Free to start. No card. Customers never install an app.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.08}>
                <PhonePreview />
              </Reveal>
            </div>
          </section>

          <section className={styles.marquee} aria-label="Built for">
            <div className={styles.track}>
              {[...BUSINESSES, ...BUSINESSES].map((name, index) => (
                <span
                  className={styles.pill}
                  key={`${name}-${index}`}
                  aria-hidden={index >= BUSINESSES.length}
                >
                  <span className={styles.dotSep} aria-hidden="true" />
                  {name}
                </span>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.container}`} id="how">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>How it works</p>
              <h2>Four steps from the door to the next message</h2>
              <p className={styles.lede}>
                The guest gets a saving today. You get a contact you can reach
                when the floor is quiet.
              </p>
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
                    <span className={styles.flowIndex}>{index + 1}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.container}`} id="features">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Product</p>
              <h2>Everything between the scan and the next visit</h2>
            </Reveal>
            <Bento />
          </section>

          <section className={`${styles.section} ${styles.container}`} id="setup">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Setup</p>
              <h2>Nine moves from an empty account to a live offer</h2>
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
                      <p>{item.text}</p>
                    </div>
                  </article>
                </motion.div>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.container}`} id="demo">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Demo</p>
              <h2>Watch a walk-in become a contact</h2>
            </Reveal>
            <Reveal>
              <figure className={styles.video}>
                {playing ? (
                  <>
                    <div className={styles.timeline} aria-hidden="true">
                      <span />
                    </div>
                    <figcaption className={styles.videoCaption}>
                      Preview playing · counter QR, claim form, coupon, WhatsApp
                    </figcaption>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.play}
                    aria-label="Play product demo"
                    onClick={() => setPlaying(true)}
                  >
                    <span className={styles.playPulse} aria-hidden="true" />
                    <span className={styles.playIcon} aria-hidden="true" />
                  </button>
                )}
              </figure>
            </Reveal>
          </section>

          <section className={`${styles.section} ${styles.container}`} id="pricing">
            <Reveal className={styles.heading}>
              <p className={styles.eyebrow}>Pricing</p>
              <h2>Local prices for the counter you already have</h2>
              <p className={styles.lede}>
                Same product. Currency and monthly price follow the country you
                sell in.
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

        <footer className={styles.siteFooter}>
          <div className={`${styles.container} ${styles.footerInner}`}>
            <div className={styles.footerBrand}>
              <BrandLogo variant="auto" size="sm" />
              <p>QR offers that turn walk-ins into WhatsApp customers.</p>
            </div>
            <nav className={styles.footerNav} aria-label="Footer">
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Sign up</Link>
            </nav>
            <p className={styles.copy}>© {new Date().getFullYear()} UPSale. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
