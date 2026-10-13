import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { PackageModel } from "@/lib/models/package";
import { getBusinessLimits, getMonthlyUsage } from "@/lib/billing/usage";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const packages = await PackageModel.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  const ownerCurrency = auth.owner.country?.trim().toLowerCase() === "pakistan" ? "PKR" : "USD";
  const [usage, currentLimits] = await Promise.all([
    getMonthlyUsage(auth.businessId),
    getBusinessLimits(auth.owner).catch(() => null),
  ]);
  return NextResponse.json({
    ok: true,
    currentPlan: auth.owner.plan ?? "Free Trial",
    subscriptionStatus: auth.owner.subscriptionStatus ?? "onboarding_pending",
    usage,
    currentLimits,
    plans: packages.map((plan) => {
      const price = plan.countryPricing.find((item) => item.currency.toUpperCase() === ownerCurrency);
      return {
        name: plan.name,
        slug: plan.slug,
        description: plan.shortDescription,
        features: plan.featureBullets,
        popular: plan.isMostPopular,
        enterprise: plan.isEnterprise,
        limits: { ...plan.limits, offers: plan.limits.offers ?? (plan.slug === "starter" ? 1 : 0) },
        price: price ? { amount: price.amount, currency: price.currency, interval: price.interval } : null,
      };
    }),
  });
}
