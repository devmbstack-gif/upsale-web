import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { CustomerModel } from "@/lib/models/customer";
import { computeSegmentStats, suggestDeal } from "@/lib/ai-deal-maker";
import { filterBySegment, type SegmentId } from "@/lib/segments";

const bodySchema = z.object({
  audience: z.enum(["all", "new", "repeat", "vip", "at_risk"]).default("all"),
  variant: z.number().int().min(0).optional(),
});

/** Suggest a deal from segment stats. Never sends messages. */
export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { owner, businessId } = auth as {
    businessId: string;
    owner: {
      businessName?: string;
      category?: string;
      currency?: string;
    };
  };

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Pick a valid audience." }, { status: 400 });
  }

  const audience = parsed.data.audience as SegmentId;
  const customers = await CustomerModel.find({ businessId }).lean();
  const segmentCustomers = filterBySegment(customers, audience);
  const stats = computeSegmentStats(segmentCustomers, audience);

  const suggestion = suggestDeal({
    stats,
    business: {
      businessName: owner.businessName ?? "our shop",
      category: owner.category,
      currency: owner.currency,
    },
    variant: parsed.data.variant ?? Math.floor(Date.now() / 1000) % 3,
  });

  return NextResponse.json({
    ok: true,
    stats,
    suggestion,
    note: "Suggestion only — approve to open Deals. Nothing is sent automatically.",
  });
}
