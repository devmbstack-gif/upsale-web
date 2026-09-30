import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { CouponModel } from "@/lib/models/coupon";
import { OfferModel } from "@/lib/models/offer";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { id } = await ctx.params;
  const offer = await OfferModel.findOne({ _id: id, businessId }).lean();
  if (!offer) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, offer });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { id } = await ctx.params;
  const body = await request.json();
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
