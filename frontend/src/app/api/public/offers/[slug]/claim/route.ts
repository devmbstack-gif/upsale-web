import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { findOfferByPublicSlug, toPublicOffer } from "@/lib/public-offer";
import { formatOfferHeadline } from "@/lib/public-offer-shared";
import { CouponModel, type CouponDoc } from "@/lib/models/coupon";
import type { FlattenMaps, Types } from "mongoose";
import { CustomerModel } from "@/lib/models/customer";
import { OfferModel } from "@/lib/models/offer";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { assertCustomerCapacity, UsageLimitError } from "@/lib/billing/usage";
import { ensureCustomerTenantIndexes } from "@/lib/customers/indexes";

type Ctx = { params: Promise<{ slug: string }> };

const bodySchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z.string().trim().min(8, "Enter a valid WhatsApp number"),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
});

async function uniqueCouponCode() {
  for (let i = 0; i < 8; i++) {
    const code = `UP${randomBytes(3).toString("hex").toUpperCase()}`;
    const exists = await CouponModel.exists({ code });
    if (!exists) return code;
  }
  return `UP${randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.errors[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const found = await findOfferByPublicSlug(slug);
  if (!found) {
    return NextResponse.json({ ok: false, message: "Offer not found" }, { status: 404 });
  }

  const { offer, business } = found;
  if (offer.status !== "active") {
    return NextResponse.json({ ok: false, message: "This offer is not active." }, { status: 410 });
  }
  const expiresAt = offer.expiresAt ? new Date(offer.expiresAt).getTime() : null;
  if (expiresAt && expiresAt < Date.now()) {
    return NextResponse.json({ ok: false, message: "This offer has expired." }, { status: 410 });
  }

  await connectDB();
  await ensureCustomerTenantIndexes();
  const businessId = offer.businessId;
  const phone = parsed.data.phone.replace(/\s+/g, "");
  const phoneNormalized = phone.replace(/\D/g, "");
  const email = parsed.data.email?.trim() || null;
  let customer = await CustomerModel.findOne({ businessId, $or: [{ phone }, { phoneNormalized }] });
  if (!customer) {
    const owner = await BusinessOwnerModel.findById(businessId)
      .select("planSlug subscriptionStatus trialEndsAt trialPackageId")
      .lean();
    if (!owner) return NextResponse.json({ ok: false, message: "Business not found." }, { status: 404 });
    try {
      await assertCustomerCapacity(String(businessId), owner);
    } catch (error) {
      if (error instanceof UsageLimitError) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 403 });
      }
      throw error;
    }
    customer = await CustomerModel.create({
      businessId,
      name: parsed.data.name,
      phone,
      phoneNormalized,
      email,
      scans: 1,
      lastVisitAt: new Date(),
      tags: ["qr"],
    });
  } else {
    customer.name = parsed.data.name;
    customer.phoneNormalized = phoneNormalized;
    if (email) customer.email = email;
    customer.scans = (customer.scans ?? 0) + 1;
    customer.lastVisitAt = new Date();
    await customer.save();
  }

  const existingCoupon = (await CouponModel.findOne({
    businessId,
    offerId: offer._id,
    customerId: customer._id,
  }).lean()) as (FlattenMaps<CouponDoc> & { _id: Types.ObjectId; code: string }) | null;

  if (existingCoupon) {
    return NextResponse.json({
      ok: true,
      alreadyIssued: true,
      coupon: {
        code: existingCoupon.code,
        offerTitle: formatOfferHeadline(toPublicOffer(offer, business)),
        issuedAt: existingCoupon.issuedAt,
      },
      businessName: business.businessName,
    });
  }

  const code = await uniqueCouponCode();
  const coupon = await CouponModel.create({
    businessId,
    offerId: offer._id,
    customerId: customer._id,
    code,
    status: "issued",
    expiresAt: offer.expiresAt ?? null,
  });

  await OfferModel.updateOne({ _id: offer._id }, { $inc: { redemptions: 1 } });

  return NextResponse.json({
    ok: true,
    alreadyIssued: false,
    coupon: {
      code: coupon.code,
      offerTitle: formatOfferHeadline(toPublicOffer(offer, business)),
      issuedAt: coupon.issuedAt,
    },
    businessName: business.businessName,
  });
}
