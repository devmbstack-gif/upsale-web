import { PackageModel } from "@/lib/models/package";
import { writeAuditLog } from "@/lib/admin/audit";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

function serializePackage(doc: {
  _id: { toString(): string };
  name: string;
  slug: string;
  shortDescription: string;
  featureBullets: string[];
  limits: { customers: number; campaignsPerMonth: number; aiGenerations: number };
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
    limits: doc.limits,
    sortOrder: doc.sortOrder,
    isMostPopular: doc.isMostPopular,
    isEnterprise: doc.isEnterprise,
    isActive: doc.isActive,
    countryPricing: doc.countryPricing ?? [],
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
    countryPricing: Array.isArray(body.countryPricing) ? body.countryPricing : [],
  });

  await writeAuditLog({
    userId: auth.adminId,
    action: "CREATE_PACKAGE",
    entity: `Package:${created._id}`,
    newValue: serializePackage(created),
  });

  return jsonOk({ package: serializePackage(created) }, 201);
}
