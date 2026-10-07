import type { MetadataRoute } from "next";
import { getPublishedSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { canonicalUrl } = await getPublishedSeo();
  const now = new Date();
  return [
    { url: canonicalUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${canonicalUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${canonicalUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${canonicalUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${canonicalUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
