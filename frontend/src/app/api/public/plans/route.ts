import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PackageModel } from "@/lib/models/package";
import { requireBusiness } from "@/lib/auth/require-business";

export async function GET(request: Request) {
  const auth = await requireBusiness();
  const requestedCountry = new URL(request.url).searchParams.get("country")?.toUpperCase();
  const accountCountry = "owner" in auth ? auth.owner.country?.trim().toLowerCase() : null;
  const currency = accountCountry
    ? accountCountry === "pakistan" ? "PKR" : "USD"
    : requestedCountry === "PK" ? "PKR" : "USD";
  await connectDB();
  const packages = await PackageModel.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return NextResponse.json({
    ok: true,
    currency,
    plans: packages.map((plan) => {
      const price = plan.countryPricing.find((item) => item.currency.toUpperCase() === currency);
      return {
        id: plan.slug,
        name: plan.name,
        summary: plan.shortDescription,
        features: plan.featureBullets,
        popular: plan.isMostPopular,
        enterprise: plan.isEnterprise,
        limits: {
          customers: plan.limits.customers,
          campaigns: plan.limits.campaignsPerMonth,
          aiGenerations: plan.limits.aiGenerations,
        },
        price: price ? { amount: price.amount, currency, interval: price.interval } : null,
      };
    }),
  });
}
