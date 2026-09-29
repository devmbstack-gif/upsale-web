import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./legal.module.css";

type LegalShellProps = {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
};

export default function LegalShell({ title, description, updated, children }: LegalShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="UPSale home">
            <img src="/upsale-logo.png" alt="" className={styles.brandImg} />
            <span className={styles.brandMark}>UPSale</span>
          </Link>
          <Link href="/" className={styles.back}>
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.meta}>Last updated: {updated}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lede}>{description}</p>
        {children}
      </main>
    </div>
  );
}
