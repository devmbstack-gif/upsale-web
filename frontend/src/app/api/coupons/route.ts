import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { CouponModel } from "@/lib/models/coupon";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const coupons = await CouponModel.find({ businessId })
    .sort({ issuedAt: -1 })
    .populate("offerId", "title")
    .populate("customerId", "name")
    .lean();
  return NextResponse.json({ ok: true, coupons });
}
