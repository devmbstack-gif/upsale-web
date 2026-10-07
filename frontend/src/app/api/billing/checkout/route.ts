import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";

const schema = z.object({ planSlug: z.string().regex(/^[a-z0-9-]+$/) });

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Select a valid plan." }, { status: 400 });
  const backendUrl = process.env.BACKEND_INTERNAL_URL;
  const secret = process.env.INTERNAL_API_SECRET;
  if (!backendUrl || !secret) return NextResponse.json({ ok: false, message: "Billing is not configured." }, { status: 503 });
  const origin = new URL(request.url).origin;
  const onboarding = auth.owner.subscriptionStatus === "onboarding_pending";
  const returnPath = onboarding ? "/choose-plan" : "/app/billing";
  try {
    const response = await fetch(`${backendUrl}/api/internal/billing/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": secret },
      body: JSON.stringify({
        businessId: auth.businessId,
        planSlug: parsed.data.planSlug,
        successUrl: `${origin}${returnPath}?payment=success`,
        cancelUrl: `${origin}${returnPath}?payment=cancelled`,
      }),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, message: "The payment service is unavailable." }, { status: 502 });
  }
}
