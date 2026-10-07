import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { withSuperAdmin, jsonOk } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { businessName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ];
  }

  const businesses = await BusinessOwnerModel.find(filter)
    .select("-passwordHash -resetToken -resetTokenExpiry")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return jsonOk({
    businesses: businesses.map((b) => ({
      id: String(b._id),
      businessName: b.businessName,
      email: b.email,
      supportEmail: b.supportEmail,
      category: b.category,
      country: b.country,
      city: b.city,
      plan: b.plan,
      planSlug: b.planSlug,
      isVerified: b.isVerified,
      isSuspended: Boolean(b.isSuspended),
      whatsapp: b.whatsapp,
      createdAt: b.createdAt,
    })),
  });
}
