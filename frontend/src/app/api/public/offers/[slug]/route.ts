import { NextResponse } from "next/server";
import { findOfferByPublicSlug, toPublicOffer } from "@/lib/public-offer";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const query = new URL(req.url).searchParams;
  const found = await findOfferByPublicSlug(slug, query.get("business"), query.get("businessSlug"));
  if (!found) {
    return NextResponse.json({ ok: false, message: "Offer not found" }, { status: 404 });
  }

  const { offer, business } = found;
  if (offer.status !== "active") {
    return NextResponse.json({
      ok: true,
      offer: toPublicOffer(offer, business),
      unavailable: true,
      message:
        offer.status === "expired"
          ? "This offer has expired."
          : "This offer is not active right now.",
    });
  }

  const expiresAt = offer.expiresAt ? new Date(offer.expiresAt).getTime() : null;
  if (expiresAt && expiresAt < Date.now()) {
    return NextResponse.json({
      ok: true,
      offer: toPublicOffer(offer, business),
      unavailable: true,
      message: "This offer has expired.",
    });
  }

  return NextResponse.json({
    ok: true,
    offer: toPublicOffer(offer, business),
    unavailable: false,
  });
}
