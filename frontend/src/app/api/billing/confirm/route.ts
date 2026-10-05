import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";

const schema = z.object({ sessionId: z.string().min(10) });

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Invalid checkout." }, { status: 400 });
  try {
    const response = await fetch(`${process.env.BACKEND_INTERNAL_URL}/api/internal/billing/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-secret": process.env.INTERNAL_API_SECRET ?? "" },
      body: JSON.stringify({ businessId: auth.businessId, sessionId: parsed.data.sessionId }),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ ok: false, message: "Could not verify the payment." }, { status: 502 });
  }
}
