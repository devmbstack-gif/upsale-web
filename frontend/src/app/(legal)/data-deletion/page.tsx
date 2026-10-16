import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";
import styles from "@/components/legal/legal.module.css";
import { getLegalContent } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Data Deletion Instructions — UPSale", description: "Instructions for requesting deletion of UPSale account and personal data." };
export const dynamic = "force-dynamic";

export default async function DataDeletionPage() {
  const content = await getLegalContent("legal_data_deletion");
  return <LegalShell title={content.title} description={content.description} updated={content.updated}>
    {content.sections.map((section) => <section key={section.title} className={styles.section}><h2>{section.title}</h2><p>{section.body}</p></section>)}
    <section className={styles.section}><h2>Contact</h2><p>Send the request to <a href={`mailto:${content.contactEmail}?subject=UPSale%20data%20deletion%20request`}>{content.contactEmail}</a>.</p></section>
  </LegalShell>;
}
