import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { PackageModel } from "@/lib/models/package";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const packages = await PackageModel.find({ isActive: true, isEnterprise: false })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  const ownerCurrency = auth.owner.currency?.toUpperCase();
  return NextResponse.json({
    ok: true,
    currentPlan: auth.owner.plan ?? "Free Trial",
    plans: packages.map((plan) => {
      const price = plan.countryPricing.find((item) => item.currency === ownerCurrency)
        ?? plan.countryPricing.find((item) => item.currency === "USD")
        ?? plan.countryPricing[0];
      return {
        name: plan.name,
        slug: plan.slug,
        description: plan.shortDescription,
        features: plan.featureBullets,
        popular: plan.isMostPopular,
        price: price ? { amount: price.amount, currency: price.currency, interval: price.interval } : null,
      };
    }),
  });
}
