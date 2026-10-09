import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { callBackend } from "@/lib/server/backend";

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const body = await request.json().catch(() => null) as { dataUrl?: string } | null;
  if (!body?.dataUrl) return NextResponse.json({ ok: false, message: "Choose a product photo." }, { status: 400 });
  try {
    const { response, data } = await callBackend<{ url?: string; message?: string }>("/api/internal/media/product", { businessId: auth.businessId, dataUrl: body.dataUrl });
    return NextResponse.json(response.ok && data.url ? { ok: true, url: data.url } : { ok: false, message: data.message ?? "Upload failed." }, { status: response.status });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Product image service is unavailable." }, { status: 502 });
  }
}
