import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { writeAuditLog } from "@/lib/admin/audit";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";
import { PackageModel } from "@/lib/models/package";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    isSuspended?: boolean;
    planSlug?: string;
    isVerified?: boolean;
  } | null;

  if (!body) return jsonError("Invalid body");

  const previous = await BusinessOwnerModel.findById(id).select("-passwordHash").lean();
  if (!previous) return jsonError("Business not found", 404);

  const update: Record<string, unknown> = {};
  if (typeof body.isSuspended === "boolean") update.isSuspended = body.isSuspended;
  if (typeof body.isVerified === "boolean") update.isVerified = body.isVerified;
  if (typeof body.planSlug === "string" && body.planSlug.trim()) {
    const planSlug = body.planSlug.trim().toLowerCase();
    if (planSlug === "free-trial") {
      update.plan = "Free Trial";
      update.planSlug = "free-trial";
      update.subscriptionStatus = "trial";
    } else {
      const plan = await PackageModel.findOne({ slug: planSlug, isActive: true }).select("name slug").lean();
      if (!plan) return jsonError("Select an active package", 400);
      update.plan = plan.name;
      update.planSlug = plan.slug;
      update.subscriptionStatus = "active";
    }
  }

  if (Object.keys(update).length === 0) return jsonError("No changes provided");

  const next = await BusinessOwnerModel.findByIdAndUpdate(id, { $set: update }, { new: true })
    .select("-passwordHash")
    .lean();

  await writeAuditLog({
    userId: auth.adminId,
    action: "UPDATE_BUSINESS",
    entity: `BusinessOwner:${id}`,
    previousValue: {
      isSuspended: previous.isSuspended,
      plan: previous.plan,
      planSlug: previous.planSlug,
      isVerified: previous.isVerified,
    },
    newValue: update,
  });

  return jsonOk({
    business: {
      id: String(next!._id),
      businessName: next!.businessName,
      email: next!.email,
      plan: next!.plan,
      planSlug: next!.planSlug,
      isVerified: next!.isVerified,
      isSuspended: Boolean(next!.isSuspended),
    },
  });
}
