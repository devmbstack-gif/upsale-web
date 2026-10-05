import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { CouponModel } from "@/lib/models/coupon";
import { CustomerModel } from "@/lib/models/customer";

type Ctx = { params: Promise<{ id: string }> };

/** Mark a coupon as redeemed (one-use). */
export async function POST(_req: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { id } = await ctx.params;

  const coupon = await CouponModel.findOne({ _id: id, businessId });
  if (!coupon) {
    return NextResponse.json({ ok: false, message: "Coupon not found" }, { status: 404 });
  }
  if (coupon.status === "redeemed" || coupon.redeemedAt) {
    return NextResponse.json(
      { ok: false, message: "This coupon was already redeemed." },
      { status: 409 },
    );
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    coupon.status = "expired";
    await coupon.save();
    return NextResponse.json({ ok: false, message: "This coupon has expired." }, { status: 410 });
  }

  coupon.status = "redeemed";
  coupon.redeemedAt = new Date();
  await coupon.save();

  await CustomerModel.updateOne(
    { _id: coupon.customerId, businessId },
    {
      $inc: { couponsRedeemed: 1 },
      $set: { lastVisitAt: new Date() },
    },
  );

  return NextResponse.json({ ok: true, coupon });
}
