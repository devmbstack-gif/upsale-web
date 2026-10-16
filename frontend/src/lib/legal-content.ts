import { connectDB } from "@/lib/mongodb";
import { SiteSectionCMSModel } from "@/lib/models/site-section-cms";

export type LegalSection = { title: string; body: string };
export type LegalPageContent = {
  title: string;
  description: string;
  updated: string;
  contactEmail: string;
  sections: LegalSection[];
};

export const LEGAL_DEFAULTS: Record<"legal_privacy" | "legal_terms" | "legal_data_deletion", LegalPageContent> = {
  legal_privacy: {
    title: "Privacy Policy",
    description: "This Policy explains what information UPSale collects, how we use it, and the choices available to business owners and their customers.",
    updated: "October 16, 2026",
    contactEmail: "privacy@upsale.app",
    sections: [
      { title: "What We Collect", body: "We may collect business account details, customer details entered through QR offers, and technical data needed to run and secure UPSale." },
      { title: "How We Use It", body: "We use information to create and secure accounts, power offers and coupons, send service emails, and improve reliability and support. We do not sell personal information." },
      { title: "Data Sharing", body: "Customer data collected for one business is never shared with another business. We only share information with service providers needed to operate UPSale or where required by law." },
      { title: "Data Retention", body: "We keep records while an account is active and for a reasonable period afterward where needed for security, backups, disputes, billing, or legal obligations." },
      { title: "Customer Choices", body: "Customers can opt out of marketing messages. Business owners must honor opt-out requests promptly and only message customers who have provided consent." },
      { title: "Security and Contact", body: "We use reasonable security measures, including access controls and encrypted transport where available. For privacy questions or deletion requests, contact the email shown below." },
    ],
  },
  legal_terms: {
    title: "Terms of Service",
    description: "These Terms explain how business owners may use UPSale to run QR discounts and WhatsApp campaigns.",
    updated: "October 16, 2026",
    contactEmail: "legal@upsale.app",
    sections: [
      { title: "Acceptance of Terms", body: "By creating an UPSale account or using the product, you agree to these Terms. If you use UPSale for a business, you confirm that you are authorized to act for that business." },
      { title: "Description of Service", body: "UPSale provides QR offers, customer capture, one-time coupons, customer lists, and tools to draft and send WhatsApp campaigns. Features may change as the product improves." },
      { title: "Business Owner Responsibilities", body: "Business owners must only message customers who have provided consent, honor opt-outs, keep credentials secure, provide accurate information, and follow applicable laws." },
      { title: "Subscription and Billing", body: "Trials, prices, plan limits, and billing cycles are shown in UPSale. Fees and features can change with notice where required." },
      { title: "Acceptable Use", body: "You may not use UPSale for spam, scams, harassment, unlawful content, system disruption, or collecting customer data without a lawful basis and clear consent." },
      { title: "Contact", body: "For questions about these Terms, contact the email shown below." },
    ],
  },
  legal_data_deletion: {
    title: "Data deletion instructions",
    description: "You can request deletion of your UPSale account data or customer data connected to an UPSale business.",
    updated: "October 16, 2026",
    contactEmail: "privacy@upsale.app",
    sections: [
      { title: "Request deletion", body: "Email us from the address associated with your account and use the subject: UPSale data deletion request." },
      { title: "Include", body: "Include your name, email address or phone number, the business name if relevant, and whether you want account deletion, customer-data deletion, or both." },
      { title: "What happens next", body: "We verify ownership before processing the request. Data is deleted or anonymized unless retention is required for security, billing, disputes, or legal obligations. We will confirm the result by email." },
    ],
  },
};

export async function getLegalContent<Key extends keyof typeof LEGAL_DEFAULTS>(key: Key) {
  const fallback = LEGAL_DEFAULTS[key];
  try {
    await connectDB();
    const section = await SiteSectionCMSModel.findOne({ sectionKey: key, locale: "en", isPublished: true }).lean();
    if (!section?.content || typeof section.content !== "object") return fallback;
    const content = section.content as Partial<LegalPageContent>;
    const sections = Array.isArray(content.sections)
      ? content.sections.filter((item): item is LegalSection => Boolean(item && typeof item === "object" && typeof (item as LegalSection).title === "string" && typeof (item as LegalSection).body === "string"))
      : fallback.sections;
    return { ...fallback, ...content, sections: sections.length ? sections : fallback.sections } as LegalPageContent;
  } catch {
    return fallback;
  }
}
