import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { callWhatsAppBackend } from "@/lib/whatsapp/backend";

const schema = z.object({
  accessToken: z.string().min(20),
  phoneNumberId: z.string().regex(/^\d+$/),
  businessAccountId: z.string().regex(/^\d+$/),
});

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  try {
    const { response, data } = await callWhatsAppBackend<Record<string, unknown>>("status", { businessId: auth.businessId });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "WhatsApp service unavailable." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Enter a valid token, Phone Number ID, and Business Account ID." }, { status: 400 });
  try {
    const { response, data } = await callWhatsAppBackend<Record<string, unknown>>("connect", { businessId: auth.businessId, ...parsed.data });
    return NextResponse.json({ ok: response.ok, ...data }, { status: response.status });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "WhatsApp service unavailable." }, { status: 502 });
  }
}
