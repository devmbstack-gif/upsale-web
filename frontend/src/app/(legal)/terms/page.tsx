import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import styles from "@/components/legal/legal.module.css";
import { getLegalContent } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Terms of Service — UPSale", description: "Terms of Service for using UPSale." };
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const content = await getLegalContent("legal_terms");
  return <LegalShell title={content.title} description={content.description} updated={content.updated}>
    {content.sections.map((section) => <section key={section.title} className={styles.section}><h2>{section.title}</h2><p>{section.body}</p></section>)}
    <section className={styles.section}><h2>Contact</h2><p>For questions about these Terms, email <a href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a>.</p></section>
  </LegalShell>;
}
