import type { Metadata } from "next";
import { getPublishedSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublishedSeo();
  const base = new URL(seo.canonicalUrl);
  const image = new URL(seo.ogImage || "/icon-192.png", base).toString();

  return {
    metadataBase: base,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl },
    robots: { index: seo.robotsIndex, follow: seo.robotsFollow },
    openGraph: {
      type: "website",
      url: seo.canonicalUrl,
      siteName: seo.siteName,
      title: seo.title,
      description: seo.description,
      images: [{ url: image, alt: seo.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
  };
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
