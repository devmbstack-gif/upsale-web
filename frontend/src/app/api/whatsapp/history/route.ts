import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { callWhatsAppBackend } from "@/lib/whatsapp/backend";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  try {
    const { response, data } = await callWhatsAppBackend<Record<string, unknown>>("history", { businessId: auth.businessId });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "WhatsApp service unavailable." }, { status: 502 });
  }
}
