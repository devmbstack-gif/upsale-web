import type { MetadataRoute } from "next";
import { getPublishedSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getPublishedSeo();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/app/", "/api/", "/choose-plan", "/reset-password"],
    },
    sitemap: `${seo.canonicalUrl}/sitemap.xml`,
    host: seo.canonicalUrl,
  };
}
