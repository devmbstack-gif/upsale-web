import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { CustomerModel } from "@/lib/models/customer";
import { computeSegmentStats, suggestDeal } from "@/lib/ai-deal-maker";
import { filterBySegment, type SegmentId } from "@/lib/segments";
import { callBackend } from "@/lib/server/backend";
import { reserveMonthlyUsage, UsageLimitError } from "@/lib/billing/usage";
import { callWhatsAppBackend } from "@/lib/whatsapp/backend";

const bodySchema = z.object({
  audience: z.enum(["all", "new", "repeat", "vip", "at_risk"]).default("all"),
  variant: z.number().int().min(0).optional(),
  productDetails: z.string().trim().max(2000).optional(),
  productImageUrl: z.string().url().optional(),
});

/** Suggest a deal from segment stats. Never sends messages. */
export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { owner, businessId } = auth;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Pick a valid audience." }, { status: 400 });
  }

  const audience = parsed.data.audience as SegmentId;
  const customers = await CustomerModel.find({ businessId }).lean();
  const segmentCustomers = filterBySegment(customers, audience);
  const stats = computeSegmentStats(segmentCustomers, audience);

  let usage: Awaited<ReturnType<typeof reserveMonthlyUsage>>;
  try {
    usage = await reserveMonthlyUsage(businessId, owner, "aiGenerations");
  } catch (error) {
    if (error instanceof UsageLimitError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 403 });
    }
    throw error;
  }
  const variant = parsed.data.variant ?? Math.floor(Date.now() / 1000) % 3;
  let contactNumber = String(owner.whatsapp ?? "").trim() || "+1 234 567 8900";
  try {
    const status = await callWhatsAppBackend<{ displayPhoneNumber?: string }>("status", { businessId });
    if (status.response.ok && status.data.displayPhoneNumber) contactNumber = status.data.displayPhoneNumber;
  } catch { /* Demo number remains until this business connects WhatsApp. */ }
  let suggestion: Record<string, unknown>;
  try {
    const generated = await callBackend<Record<string, unknown> & { message?: string }>(
      "/api/internal/ai/deal",
      {
        businessName: owner.businessName ?? "our shop",
        category: owner.category,
        currency: owner.currency,
        audience,
        stats,
        variant,
        productDetails: parsed.data.productDetails,
        productImageUrl: parsed.data.productImageUrl,
        contactNumber,
      },
    );
    if (!generated.response.ok) throw new Error(generated.data.message ?? "Gemini generation failed.");
    suggestion = { ...generated.data, contactNumber };
  } catch (error) {
    suggestion = {
      ...suggestDeal({
        stats,
        business: {
          businessName: owner.businessName ?? "our shop",
          category: owner.category,
          currency: owner.currency,
        },
        variant,
      }),
      provider: "local-fallback",
      contactNumber,
    };
    return NextResponse.json({
      ok: true,
      stats,
      suggestion,
      usage: usage.unlimited ? { unlimited: true } : { used: usage.used, limit: usage.limit },
      note: "Gemini was unavailable, so a safe local suggestion and promotional post were generated. This generation counts toward your monthly AI usage.",
    });
  }

  return NextResponse.json({
    ok: true,
    stats,
    suggestion,
    usage: usage.unlimited ? { unlimited: true } : { used: usage.used, limit: usage.limit },
    note: "Suggestion only — approve to open Deals. Nothing is sent automatically.",
  });
}
