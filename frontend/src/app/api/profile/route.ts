import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { escapeRegex, normalizeBusinessName } from "@/lib/business-name";
import { offerNameSlug } from "@/lib/offer-slug";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { owner } = auth as { owner: Record<string, unknown> };
  const { passwordHash: _, resetToken: __, resetTokenExpiry: ___, ...safe } = owner as {
    passwordHash?: string;
    resetToken?: string;
    resetTokenExpiry?: Date;
  } & Record<string, unknown>;
  return NextResponse.json({ ok: true, profile: safe });
}

export async function PATCH(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const body = await request.json();
  const allowed = [
    "businessName",
    "supportEmail",
    "category",
    "country",
    "timezone",
    "city",
    "whatsapp",
  ] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  if (typeof body.country === "string") {
    update.currency = body.country.trim().toLowerCase() === "pakistan" ? "PKR" : "USD";
  }
  if (typeof body.supportEmail === "string") {
    const supportEmail = body.supportEmail.trim().toLowerCase();
    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      return NextResponse.json({ ok: false, message: "Enter a valid support email or leave it empty." }, { status: 400 });
    }
    update.supportEmail = supportEmail;
  }
  if (typeof body.businessName === "string") {
    const businessName = body.businessName.trim().replace(/\s+/g, " ");
    if (businessName.length < 2) {
      return NextResponse.json({ ok: false, message: "Business name is required." }, { status: 400 });
    }
    const businessNameKey = normalizeBusinessName(businessName);
    const businessSlug = offerNameSlug(businessName);
    const duplicate = await BusinessOwnerModel.exists({
      _id: { $ne: businessId },
      $or: [
        { businessNameKey },
        { businessName: { $regex: `^${escapeRegex(businessName)}$`, $options: "i" } },
        { businessSlug },
      ],
    });
    if (duplicate) {
      return NextResponse.json({ ok: false, message: "A business with this name already exists." }, { status: 409 });
    }
    update.businessName = businessName;
    update.businessNameKey = businessNameKey;
    update.businessSlug = businessSlug;
  }
  const profile = await BusinessOwnerModel.findByIdAndUpdate(
    businessId,
    { $set: update },
    { new: true },
  )
    .select("-passwordHash -resetToken -resetTokenExpiry")
    .lean();
  return NextResponse.json({ ok: true, profile });
}
