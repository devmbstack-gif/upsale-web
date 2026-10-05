import { PackageModel } from "@/lib/models/package";
import { writeAuditLog } from "@/lib/admin/audit";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

type Ctx = { params: Promise<{ id: string }> };

function serializePackage(doc: {
  _id: { toString(): string };
  name: string;
  slug: string;
  shortDescription: string;
  featureBullets?: string[];
  limits: { customers: number; campaignsPerMonth: number; aiGenerations: number };
  sortOrder?: number;
  isMostPopular?: boolean;
  isEnterprise?: boolean;
  isActive?: boolean;
  countryPricing?: Array<{
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
    sortOrder: doc.sortOrder ?? 0,
    isMostPopular: Boolean(doc.isMostPopular),
    isEnterprise: Boolean(doc.isEnterprise),
    isActive: doc.isActive !== false,
    countryPricing: doc.countryPricing ?? [],
  };
}

export async function PATCH(request: Request, context: Ctx) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return jsonError("Invalid body");

  const previous = await PackageModel.findById(id).lean();
  if (!previous) return jsonError("Package not found", 404);

  const update: Record<string, unknown> = {};
  for (const key of [
    "name",
    "slug",
    "shortDescription",
    "featureBullets",
    "limits",
    "sortOrder",
    "isMostPopular",
    "isEnterprise",
    "isActive",
    "countryPricing",
  ] as const) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  if (typeof update.slug === "string") update.slug = update.slug.trim().toLowerCase();
  if (typeof update.name === "string") update.name = update.name.trim();

  if (update.isMostPopular === true) {
    await PackageModel.updateMany({ _id: { $ne: id } }, { $set: { isMostPopular: false } });
  }

  const next = await PackageModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();

  await writeAuditLog({
    userId: auth.adminId,
    action: "UPDATE_PACKAGE",
    entity: `Package:${id}`,
    previousValue: serializePackage(previous),
    newValue: serializePackage(next!),
  });

  return jsonOk({ package: serializePackage(next!) });
}

export async function DELETE(_request: Request, context: Ctx) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const previous = await PackageModel.findById(id).lean();
  if (!previous) return jsonError("Package not found", 404);
  await PackageModel.updateOne({ _id: id }, { $set: { isActive: false } });

  await writeAuditLog({
    userId: auth.adminId,
    action: "ARCHIVE_PACKAGE",
    entity: `Package:${id}`,
    previousValue: serializePackage(previous),
  });

  return jsonOk({ archived: true });
}
