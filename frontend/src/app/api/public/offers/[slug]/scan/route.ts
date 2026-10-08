import { NextResponse } from "next/server";
import { findOfferByPublicSlug } from "@/lib/public-offer";
import { OfferModel } from "@/lib/models/offer";

type Ctx = { params: Promise<{ slug: string }> };

/** Record a QR / link view (scan) */
export async function POST(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const query = new URL(req.url).searchParams;
  const found = await findOfferByPublicSlug(slug, query.get("business"), query.get("businessSlug"));
  if (!found) {
    return NextResponse.json({ ok: false, message: "Offer not found" }, { status: 404 });
  }

  const { offer } = found;
  if (offer.status !== "active") {
    return NextResponse.json({ ok: false, message: "Offer is not active" }, { status: 410 });
  }

  await OfferModel.updateOne({ _id: offer._id }, { $inc: { scans: 1 } });
  return NextResponse.json({ ok: true });
}
