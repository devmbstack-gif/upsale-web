import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { OfferModel } from "@/lib/models/offer";
import { randomBytes } from "crypto";
import { offerNameSlug } from "@/lib/offer-slug";

async function availableSlug(title: string) {
  const base = offerNameSlug(title);
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    if (!(await OfferModel.exists({ shareSlug: candidate }))) return candidate;
  }
  return `${base}-${randomBytes(3).toString("hex")}`;
}

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

  let expiresAt: Date | null = null;
  if (body.expiresAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parsed = new Date(`${body.expiresAt}T00:00:00`);
    if (Number.isNaN(parsed.getTime()) || parsed < today) {
      return NextResponse.json(
        { ok: false, message: "Expiry date cannot be in the past." },
        { status: 400 },
      );
    }
    expiresAt = parsed;
  }

  const shareSlug = await availableSlug(body.title);
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
    expiresAt,
  });

  return NextResponse.json({ ok: true, offer }, { status: 201 });
}
