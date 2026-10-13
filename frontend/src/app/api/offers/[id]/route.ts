import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { CouponModel } from "@/lib/models/coupon";
import { OfferModel } from "@/lib/models/offer";
import { offerNameSlug } from "@/lib/offer-slug";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId, owner } = auth as { businessId: string; owner: { businessName: string; businessSlug?: string } };
  const { id } = await ctx.params;
  let offer = await OfferModel.findOne({ _id: id, businessId });
  if (!offer) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
  const indexes = await OfferModel.collection.indexes();
  if (indexes.some((index) => index.name === "shareSlug_1")) {
    await OfferModel.collection.dropIndex("shareSlug_1");
  }
  await OfferModel.collection.createIndex({ businessId: 1, shareSlug: 1 }, { unique: true, name: "businessId_1_shareSlug_1" });
  const expectedSlug = offerNameSlug(offer.title);
  if (offer.shareSlug !== expectedSlug) {
    const base = offerNameSlug(offer.title);
    let candidate = base;
    let suffix = 2;
    while (await OfferModel.exists({
      businessId,
      shareSlug: candidate,
      _id: { $ne: offer._id },
      status: { $ne: "expired" },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    })) {
      candidate = `${base}-${suffix++}`;
    }
    offer.shareSlug = candidate;
    await offer.save();
  }
  const businessSlug = owner.businessSlug || offerNameSlug(owner.businessName);
  if (!owner.businessSlug) {
    const { BusinessOwnerModel } = await import("@/lib/models/business-owner");
    await BusinessOwnerModel.updateOne({ _id: businessId }, { $set: { businessSlug } });
  }
  return NextResponse.json({ ok: true, offer: { ...offer.toObject(), businessSlug } });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { id } = await ctx.params;
  const body = await request.json();
  const currentOffer = (body.value !== undefined && !body.type
    ? await OfferModel.findOne({ _id: id, businessId }).select("type").lean()
    : null) as { type?: string } | null;
  const nextType = body.type ?? currentOffer?.type;
  if (body.value !== undefined || nextType === "percent" || nextType === "fixed") {
    const value = Number(body.value);
    if (!Number.isFinite(value)) return NextResponse.json({ ok: false, message: "Enter a valid discount value." }, { status: 400 });
    if (nextType === "percent" && (value < 0 || value > 100)) return NextResponse.json({ ok: false, message: "Percentage discount must be between 0 and 100." }, { status: 400 });
    if (nextType === "fixed" && value < 0) return NextResponse.json({ ok: false, message: "Fixed discount cannot be negative." }, { status: 400 });
    body.value = value;
  }
  const offer = await OfferModel.findOneAndUpdate(
    { _id: id, businessId },
    { $set: body },
    { new: true },
  ).lean();
  if (!offer) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, offer });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { id } = await ctx.params;

  const offer = await OfferModel.findOne({ _id: id, businessId });
  if (!offer) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  await CouponModel.deleteMany({ businessId, offerId: offer._id });
  await OfferModel.deleteOne({ _id: offer._id });

  return NextResponse.json({ ok: true });
}
