import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { OfferModel } from "@/lib/models/offer";
import { CustomerModel } from "@/lib/models/customer";
import { CouponModel } from "@/lib/models/coupon";
import { getBusinessLimits, getMonthlyUsage } from "@/lib/billing/usage";
import { PackageModel } from "@/lib/models/package";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId, owner } = auth;

  const [customers, totalOffers, activeOffers, couponsRedeemed, offers, usage, limits, plan] = await Promise.all([
    CustomerModel.countDocuments({ businessId }),
    OfferModel.countDocuments({ businessId }),
    OfferModel.countDocuments({ businessId, status: "active" }),
    CouponModel.countDocuments({ businessId, status: "redeemed" }),
    OfferModel.find({ businessId }).select("scans").lean(),
    getMonthlyUsage(businessId),
    getBusinessLimits(owner).catch(() => null),
    owner.subscriptionStatus === "trial" && owner.trialPackageId
      ? PackageModel.findOne({ _id: owner.trialPackageId, isActive: true }).select("name featureBullets").lean()
      : owner.planSlug ? PackageModel.findOne({ slug: owner.planSlug, isActive: true }).select("name featureBullets").lean() : null,
  ]);

  const totalScans = offers.reduce((sum, o) => sum + (o.scans ?? 0), 0);

  return NextResponse.json({
    ok: true,
    stats: {
      totalCustomers: customers,
      totalOffers,
      activeOffers,
      couponsRedeemed,
      totalScans,
      usage,
      limits,
      plan: {
        name: plan?.name ?? owner.plan?.replace(/\s*\(Free Trial\)\s*$/i, "") ?? "Free Trial",
        status: owner.subscriptionStatus ?? "inactive",
        features: plan?.featureBullets ?? [],
      },
    },
  });
}
