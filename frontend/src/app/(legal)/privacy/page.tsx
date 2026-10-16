import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import styles from "@/components/legal/legal.module.css";
import { getLegalContent } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Privacy Policy — UPSale", description: "Privacy Policy for UPSale business owners and their customers." };
export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const content = await getLegalContent("legal_privacy");
  return <LegalShell title={content.title} description={content.description} updated={content.updated}>
    {content.sections.map((section) => <section key={section.title} className={styles.section}><h2>{section.title}</h2><p>{section.body}</p></section>)}
    <section className={styles.section}><h2>Contact</h2><p>For privacy questions or a deletion request, email <a href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a>.</p></section>
  </LegalShell>;
}
