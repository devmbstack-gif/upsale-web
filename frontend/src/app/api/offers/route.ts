import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { OfferModel } from "@/lib/models/offer";
import { randomBytes } from "crypto";
import { offerNameSlug } from "@/lib/offer-slug";
import { assertOfferCapacity, UsageLimitError } from "@/lib/billing/usage";

let indexMigration: Promise<void> | null = null;
function ensureBusinessScopedSlugIndex() {
  if (!indexMigration) {
    indexMigration = (async () => {
      const indexes = await OfferModel.collection.indexes();
      const legacy = indexes.find((index) => index.name === "shareSlug_1");
      if (legacy) await OfferModel.collection.dropIndex("shareSlug_1");
      await OfferModel.collection.createIndex({ businessId: 1, shareSlug: 1 }, { unique: true, name: "businessId_1_shareSlug_1" });
    })().catch((error) => {
      indexMigration = null;
      throw error;
    });
  }
  return indexMigration;
}

async function availableSlug(title: string, businessId: string) {
  const base = offerNameSlug(title);
  const now = new Date();
  // Release the human-readable name when an older offer has ended. Historical
  // records keep a private archival slug, while the new offer gets the exact name.
  const ended = await OfferModel.find({
    businessId,
    shareSlug: base,
    $or: [{ status: "expired" }, { expiresAt: { $lte: now } }],
  }).select("_id").lean();
  for (const oldOffer of ended) {
    await OfferModel.updateOne(
      { _id: oldOffer._id },
      { $set: { shareSlug: `${base}-expired-${String(oldOffer._id).slice(-8)}`, status: "expired" } },
    );
  }
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    if (!(await OfferModel.exists({
      businessId,
      shareSlug: candidate,
      status: { $ne: "expired" },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }))) return candidate;
  }
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId } = auth;
  const offers = await OfferModel.find({ businessId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, offers });
}

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId, owner } = auth;
  await ensureBusinessScopedSlugIndex();
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

  const offerType = body.type ?? "percent";
  const offerValue = Number(body.value);
  if ((offerType === "percent" || offerType === "fixed") && !Number.isFinite(offerValue)) {
    return NextResponse.json({ ok: false, message: "Enter a valid discount value." }, { status: 400 });
  }
  if (offerType === "percent" && (offerValue < 0 || offerValue > 100)) {
    return NextResponse.json({ ok: false, message: "Percentage discount must be between 0 and 100." }, { status: 400 });
  }
  if (offerType === "fixed" && offerValue < 0) {
    return NextResponse.json({ ok: false, message: "Fixed discount cannot be negative." }, { status: 400 });
  }

  try {
    await assertOfferCapacity(businessId, owner);
  } catch (error) {
    if (error instanceof UsageLimitError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 403 });
    }
    throw error;
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

  const shareSlug = await availableSlug(body.title, businessId);
  const offer = await OfferModel.create({
    businessId,
    title: body.title.trim(),
    description: body.description ?? "",
    type: offerType,
    value: offerType === "reward" ? 0 : offerValue,
    rewardLabel: body.rewardLabel ?? null,
    rules: body.rules ?? "",
    status: "active",
    shareSlug,
    expiresAt,
  });

  return NextResponse.json({ ok: true, offer }, { status: 201 });
}
