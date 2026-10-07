import "server-only";
import { connectDB } from "@/lib/mongodb";
import { SiteSectionCMSModel } from "@/lib/models/site-section-cms";

export type SeoSettings = {
  siteName: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
};

export const DEFAULT_SEO: SeoSettings = {
  siteName: "UPSale",
  title: "UPSale — Turn walk-ins into customers",
  description: "Turn counter QR scans into permission-based WhatsApp customer relationships, one-time coupons, and repeat visits.",
  keywords: ["QR offers", "WhatsApp marketing", "customer retention", "digital coupons", "local business marketing"],
  canonicalUrl: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
  ogImage: "/icon-192.png",
  robotsIndex: true,
  robotsFollow: true,
};

export async function getPublishedSeo(): Promise<SeoSettings> {
  try {
    await connectDB();
    const section = await SiteSectionCMSModel.findOne({ sectionKey: "seo", locale: "en", isPublished: true }).lean();
    const content = (section?.content ?? {}) as Partial<SeoSettings>;
    return {
      ...DEFAULT_SEO,
      ...content,
      keywords: Array.isArray(content.keywords) ? content.keywords.map(String).filter(Boolean) : DEFAULT_SEO.keywords,
      canonicalUrl: String(content.canonicalUrl || DEFAULT_SEO.canonicalUrl).replace(/\/$/, ""),
      robotsIndex: content.robotsIndex !== false,
      robotsFollow: content.robotsFollow !== false,
    };
  } catch {
    return DEFAULT_SEO;
  }
}
