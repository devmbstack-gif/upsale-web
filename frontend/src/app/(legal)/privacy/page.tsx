/* Placeholder legal content — replace with reviewed text before production. */
import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import styles from "@/components/legal/legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — UPSale",
  description: "Privacy Policy for UPSale business owners and their customers.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      description="This Policy explains what information UPSale collects, how we use it, and the choices available to business owners and their customers."
      updated="September 29, 2026"
    >
      <section className={styles.section}>
        <h2>1. What We Collect</h2>
        <p>Depending on how the product is used, we may collect:</p>
        <ul>
          <li>
            Business owner account details such as business name, login email, support email,
            password (stored as a hash), location settings, WhatsApp business number, and optional
            logo.
          </li>
          <li>
            Customer information collected through QR offers — typically name, WhatsApp number,
            and optional email — only when the customer provides that information and consent.
          </li>
          <li>
            Usage and technical data needed to operate the service, such as login sessions,
            device or browser information, and product interaction events.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>2. How We Use It</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Create and secure business owner accounts.</li>
          <li>Power QR offers, coupons, customer lists, and WhatsApp campaign tools.</li>
          <li>Send service emails such as verification codes and password reset links.</li>
          <li>Improve reliability, prevent abuse, and provide support.</li>
        </ul>
        <p>
          We do not sell personal information. Marketing messages to end customers are sent by
          or on behalf of the business owner who collected consent for those messages.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Data Sharing</h2>
        <p>
          Customer data collected for one business is never shared with another business.
          We may share information with infrastructure providers that help us run UPSale
          (for example hosting, email delivery, or messaging partners), only as needed to
          operate the service and under appropriate safeguards. We may also disclose
          information if required by law.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Data Retention</h2>
        <p>
          We keep account and customer records while a business account is active and for a
          reasonable period afterward if needed for backups, disputes, or legal obligations.
          Business owners may request deletion of their account data, subject to retention
          requirements we cannot waive.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Customer Opt-Out Rights</h2>
        <p>
          Customers who shared a WhatsApp number through an UPSale offer can ask the business
          to stop messaging them, including by using standard opt-out replies such as STOP
          where supported. Business owners must honor those requests. Customers may also
          contact us if they need help identifying which business holds their details.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Security</h2>
        <p>
          We use reasonable technical and organizational measures to protect information,
          including hashed passwords, encrypted transport where available, and access
          controls. No method of transmission or storage is fully secure, so we cannot
          guarantee absolute security.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Cookies</h2>
        <p>
          UPSale may use cookies or similar technologies for essential functions such as
          keeping you signed in, remembering preferences, and understanding basic product
          usage. You can control cookies through your browser settings, but some features
          may not work without them.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will revise the
          &quot;Last updated&quot; date on this page when we do. Material changes may also be
          communicated by email to account owners.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Contact</h2>
        <p>
          Privacy questions can be sent to{" "}
          <a href="mailto:privacy@upsale.app">privacy@upsale.app</a> or through the contact
          form on our website.
        </p>
      </section>
    </LegalShell>
  );
}
