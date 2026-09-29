import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "@/components/auth/auth.module.css";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth/session";

export default async function DashboardPage() {
  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/signup");

  return (
    <div className={styles.page}>
      <header className={styles.progress}>
        <div className={styles.progressTop}>
          <Link href="/" className={styles.brand} aria-label="UPSale home">
            <img src="/upsale-logo.png" alt="" />
          </Link>
          <p className={styles.stepLabel}>{session.businessName}</p>
        </div>
      </header>
      <main className={styles.shell}>
        <section className={styles.banner}>
          <p className={styles.eyebrow}>Free trial</p>
          <h1>Create your first discount QR code</h1>
          <p>
            {session.businessName} is on the Free trial. Plan changes stay in Settings and Billing,
            later.
          </p>
        </section>
        <div className={styles.grid}>
          <article className={styles.stat}>
            <span>Plan</span>
            <strong>{session.plan}</strong>
          </article>
          <article className={styles.stat}>
            <span>Login email</span>
            <strong>{session.email}</strong>
          </article>
          <article className={styles.stat}>
            <span>WhatsApp</span>
            <strong>{session.whatsapp}</strong>
          </article>
          <article className={styles.stat}>
            <span>Location</span>
            <strong>
              {session.city}, {session.country}
            </strong>
          </article>
        </div>
      </main>
    </div>
  );
}
