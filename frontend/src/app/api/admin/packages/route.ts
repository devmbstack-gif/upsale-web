import { PackageModel } from "@/lib/models/package";
import { writeAuditLog } from "@/lib/admin/audit";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

function serializePackage(doc: {
  _id: { toString(): string };
  name: string;
  slug: string;
  shortDescription: string;
  featureBullets: string[];
  limits: { offers?: number; customers: number; campaignsPerMonth: number; aiGenerations: number };
  sortOrder: number;
  isMostPopular: boolean;
  isEnterprise: boolean;
  isActive: boolean;
  countryPricing: Array<{
    countryCode: string;
    currency: string;
    amount: number;
    interval: string;
  }>;
}) {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    featureBullets: doc.featureBullets ?? [],
    limits: { ...doc.limits, offers: doc.limits.offers ?? (doc.slug === "starter" ? 1 : 0) },
    sortOrder: doc.sortOrder,
    isMostPopular: doc.isMostPopular,
    isEnterprise: doc.isEnterprise,
    isActive: doc.isActive,
    countryPricing: (doc.countryPricing ?? []).filter((price) => ["PKR", "USD"].includes(price.currency.toUpperCase())),
  };
}

export async function GET() {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const packages = await PackageModel.find().sort({ sortOrder: 1, name: 1 }).lean();
  return jsonOk({ packages: packages.map(serializePackage) });
}

export async function POST(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body?.name || !body?.slug || !body?.shortDescription || !body?.limits) {
    return jsonError("name, slug, shortDescription, and limits are required");
  }
  const submittedPrices = Array.isArray(body.countryPricing) ? body.countryPricing : [];
  const supportedPrices = submittedPrices.filter((price): price is Record<string, unknown> => {
    if (!price || typeof price !== "object") return false;
    return ["PKR", "USD"].includes(String((price as Record<string, unknown>).currency ?? "").toUpperCase());
  });
  if (body.isActive !== false && !body.isEnterprise && !["PKR", "USD"].every((currency) => supportedPrices.some((price) => String(price.currency).toUpperCase() === currency && Number(price.amount) > 0))) {
    return jsonError("Active self-service packages require positive PKR and USD prices.");
  }

  const created = await PackageModel.create({
    name: String(body.name).trim(),
    slug: String(body.slug).trim().toLowerCase(),
    shortDescription: String(body.shortDescription).trim(),
    featureBullets: Array.isArray(body.featureBullets)
      ? body.featureBullets.map(String)
      : [],
    limits: body.limits,
    sortOrder: Number(body.sortOrder ?? 0),
    isMostPopular: Boolean(body.isMostPopular),
    isEnterprise: Boolean(body.isEnterprise),
    isActive: body.isActive !== false,
    countryPricing: supportedPrices,
  });

  await writeAuditLog({
    userId: auth.adminId,
    action: "CREATE_PACKAGE",
    entity: `Package:${created._id}`,
    newValue: serializePackage(created),
  });

  return jsonOk({ package: serializePackage(created) }, 201);
}
