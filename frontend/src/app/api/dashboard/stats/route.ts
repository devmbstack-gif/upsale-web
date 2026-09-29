import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { OfferModel } from "@/lib/models/offer";
import { CustomerModel } from "@/lib/models/customer";
import { CouponModel } from "@/lib/models/coupon";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };

  const [customers, activeOffers, couponsRedeemed, offers] = await Promise.all([
    CustomerModel.countDocuments({ businessId }),
    OfferModel.countDocuments({ businessId, status: "active" }),
    CouponModel.countDocuments({ businessId, status: "redeemed" }),
    OfferModel.find({ businessId }).select("scans").lean(),
  ]);

  const totalScans = offers.reduce((sum, o) => sum + (o.scans ?? 0), 0);

  return NextResponse.json({
    ok: true,
    stats: {
      totalCustomers: customers,
      activeOffers,
      couponsRedeemed,
      totalScans,
    },
  });
}
