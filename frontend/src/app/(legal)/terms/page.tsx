/* Placeholder legal content — replace with reviewed text before production. */
import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import styles from "@/components/legal/legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — UPSale",
  description: "Terms of Service for using UPSale.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      description="These Terms explain how business owners may use UPSale to run QR discounts and WhatsApp campaigns."
      updated="September 29, 2026"
    >
      <section className={styles.section}>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an UPSale account or using the product, you agree to these Terms of Service.
          If you do not agree, do not use the service. If you use UPSale on behalf of a business,
          you confirm that you have authority to bind that business to these Terms.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Description of Service</h2>
        <p>
          UPSale helps business owners turn walk-in visits into follow-up customers. The service
          may include QR discount offers, customer capture through WhatsApp, one-time coupons,
          customer lists and groups, and tools to draft and send WhatsApp marketing campaigns.
          Features may change as we improve the product.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Business Owner Responsibilities</h2>
        <p>You are responsible for how you use UPSale with your customers. You agree to:</p>
        <ul>
          <li>Only message customers who have provided explicit consent to be contacted.</li>
          <li>Honor opt-out requests promptly, including STOP replies on WhatsApp.</li>
          <li>Provide accurate business details and keep your login credentials secure.</li>
          <li>Comply with applicable laws, including marketing, privacy, and consumer rules in your region.</li>
          <li>Not use UPSale to send spam, harassment, scams, or unlawful content.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. Subscription and Billing</h2>
        <p>
          New accounts may begin with a 14-day free trial, unless we state otherwise at signup.
          After the trial, paid plans follow the pricing shown on the UPSale website for your
          selected region. Fees, plan limits, and billing cycles may be updated with notice
          through the product or website. You remain responsible for taxes where applicable.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Acceptable Use</h2>
        <p>
          You may not reverse engineer the service, probe or disrupt our systems, share your
          account in a way that violates these Terms, scrape other businesses&apos; data, or use
          UPSale to collect customer information without a lawful basis and clear consent.
          We may suspend or terminate accounts that violate this section.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Limitation of Liability</h2>
        <p>
          UPSale is provided on an &quot;as available&quot; basis. To the fullest extent permitted by law,
          we are not liable for lost profits, lost data, delivery failures from third-party
          messaging platforms, or indirect or consequential damages arising from your use of the
          service. Our total liability for any claim relating to UPSale is limited to the fees
          you paid us for the service in the three months before the claim.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. When we make material changes, we will
          update the &quot;Last updated&quot; date on this page and may notify account owners by email.
          Continued use of UPSale after changes take effect means you accept the revised Terms.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Contact</h2>
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:legal@upsale.app">legal@upsale.app</a> or through the contact form on
          our website.
        </p>
      </section>
    </LegalShell>
  );
}
