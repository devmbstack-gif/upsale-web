import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { OfferModel } from "@/lib/models/offer";
import { CustomerModel } from "@/lib/models/customer";
import { CouponModel } from "@/lib/models/coupon";
import { getBusinessLimits, getMonthlyUsage } from "@/lib/billing/usage";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId, owner } = auth;

  const [customers, activeOffers, couponsRedeemed, offers, usage, limits] = await Promise.all([
    CustomerModel.countDocuments({ businessId }),
    OfferModel.countDocuments({ businessId, status: "active" }),
    CouponModel.countDocuments({ businessId, status: "redeemed" }),
    OfferModel.find({ businessId }).select("scans").lean(),
    getMonthlyUsage(businessId),
    getBusinessLimits(owner).catch(() => null),
  ]);

  const totalScans = offers.reduce((sum, o) => sum + (o.scans ?? 0), 0);

  return NextResponse.json({
    ok: true,
    stats: {
      totalCustomers: customers,
      activeOffers,
      couponsRedeemed,
      totalScans,
      usage,
      limits,
    },
  });
}
