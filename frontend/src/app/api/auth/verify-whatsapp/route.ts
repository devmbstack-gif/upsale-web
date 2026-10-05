import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCaptchaForEmail } from "@/lib/auth/captcha";
import { createWhatsAppProof } from "@/lib/auth/whatsapp-proof";
import { callWhatsAppBackend } from "@/lib/whatsapp/backend";

const schema = z.object({ email: z.string().email(), phone: z.string().regex(/^\+\d{8,15}$/), captchaToken: z.string().optional(), captchaAnswer: z.string().optional() });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Enter a valid international WhatsApp number." }, { status: 400 });
  if (!verifyCaptchaForEmail(parsed.data.email, parsed.data.captchaToken, parsed.data.captchaAnswer).ok) return NextResponse.json({ ok: false, message: "CAPTCHA verification expired. Return to step 1 and solve it again." }, { status: 400 });
  try {
    const { response, data } = await callWhatsAppBackend<{ accepted?: boolean; message?: string }>("verify-number", { phone: parsed.data.phone });
    if (!response.ok || !data.accepted) return NextResponse.json({ ok: false, message: data.message ?? "This number is not registered on WhatsApp." }, { status: response.status });
    return NextResponse.json({ ok: true, proof: createWhatsAppProof(parsed.data.email, parsed.data.phone), message: "WhatsApp number confirmed." });
  } catch (error) { return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "WhatsApp verification is unavailable." }, { status: 503 }); }
}
