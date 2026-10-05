import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { callWhatsAppBackend } from "@/lib/whatsapp/backend";

const schema = z.object({ recipient: z.string().regex(/^\+?\d{8,15}$/) });

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Enter a valid international recipient number." }, { status: 400 });
  try {
    const { response, data } = await callWhatsAppBackend<Record<string, unknown>>("test", { businessId: auth.businessId, ...parsed.data });
    return NextResponse.json({ ok: response.ok, ...data }, { status: response.status });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "WhatsApp service unavailable." }, { status: 502 });
  }
}
