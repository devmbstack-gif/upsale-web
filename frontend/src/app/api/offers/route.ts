import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { OfferModel } from "@/lib/models/offer";
import { randomBytes } from "crypto";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const offers = await OfferModel.find({ businessId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, offers });
}

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const body = (await request.json()) as {
    title?: string;
    description?: string;
    type?: string;
    value?: number;
    rewardLabel?: string;
    rules?: string;
    expiresAt?: string | null;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ ok: false, message: "Title is required" }, { status: 400 });
  }

  const shareSlug = `o-${randomBytes(4).toString("hex")}`;
  const offer = await OfferModel.create({
    businessId,
    title: body.title.trim(),
    description: body.description ?? "",
    type: body.type ?? "percent",
    value: body.value ?? 0,
    rewardLabel: body.rewardLabel ?? null,
    rules: body.rules ?? "",
    status: "active",
    shareSlug,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
  });

  return NextResponse.json({ ok: true, offer }, { status: 201 });
}
