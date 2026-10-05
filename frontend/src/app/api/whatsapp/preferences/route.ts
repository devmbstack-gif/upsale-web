import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { callWhatsAppBackend } from "@/lib/whatsapp/backend";

const schema = z.object({
  failureEmailAlerts: z.boolean(),
  failureAlertEmail: z.union([z.string().email(), z.literal("")]).optional(),
}).refine((value) => !value.failureEmailAlerts || Boolean(value.failureAlertEmail), { message: "Enter the email address that should receive failure alerts." });

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid preferences." }, { status: 400 });
  try {
    const { response, data } = await callWhatsAppBackend<Record<string, unknown>>("preferences", { businessId: auth.businessId, ...parsed.data });
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "WhatsApp service unavailable." }, { status: 502 });
  }
}
