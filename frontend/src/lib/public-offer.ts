import { Types, type FlattenMaps } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { OfferModel, type OfferDoc } from "@/lib/models/offer";
import { BusinessOwnerModel, type BusinessOwner } from "@/lib/models/business-owner";
import type { PublicOfferPayload } from "@/lib/public-offer-shared";
import { offerNameSlug } from "@/lib/offer-slug";

export type { PublicOfferPayload } from "@/lib/public-offer-shared";

type OfferLean = FlattenMaps<OfferDoc> & { _id: Types.ObjectId };
type BusinessLean = FlattenMaps<BusinessOwner> & {
  _id: Types.ObjectId;
  businessName: string;
  category: string;
  whatsapp: string;
};

export async function findOfferByPublicSlug(slug: string, businessId?: string | null, businessSlug?: string | null): Promise<{
  offer: OfferLean;
  business: BusinessLean;
} | null> {
  await connectDB();
  const trimmed = slug.trim();
  if (!trimmed) return null;

  const or: Record<string, unknown>[] = [{ shareSlug: trimmed }];
  if (Types.ObjectId.isValid(trimmed)) {
    or.push({ _id: trimmed });
  }

  let scopedBusinessId = businessId && Types.ObjectId.isValid(businessId) ? businessId : null;
  if (!scopedBusinessId && businessSlug) {
    let scopedBusiness = await BusinessOwnerModel.findOne({ businessSlug }).select("_id").lean();
    if (!scopedBusiness) {
      const legacyBusinesses = await BusinessOwnerModel.find({}).select("_id businessName").lean();
      const legacy = legacyBusinesses.find((item) => offerNameSlug(String(item.businessName)) === businessSlug);
      if (legacy) {
        scopedBusiness = legacy;
        await BusinessOwnerModel.updateOne({ _id: legacy._id }, { $set: { businessSlug } });
      }
    }
    scopedBusinessId = scopedBusiness ? String(scopedBusiness._id) : null;
    if (!scopedBusinessId) return null;
  }
  const scope = scopedBusinessId ? { businessId: scopedBusinessId } : {};
  const offer = (await OfferModel.findOne({ ...scope, $or: or }).sort({ createdAt: -1 }).lean()) as OfferLean | null;
  if (!offer) return null;

  const business = (await BusinessOwnerModel.findById(offer.businessId)
    .select("businessName category whatsapp")
    .lean()) as BusinessLean | null;
  if (!business) return null;

  return { offer, business };
}

export function toPublicOffer(offer: OfferLean, business: BusinessLean): PublicOfferPayload {
  return {
    id: String(offer._id),
    title: offer.title,
    description: offer.description ?? "",
    type: offer.type,
    value: offer.value ?? 0,
    rewardLabel: offer.rewardLabel ?? null,
    status: offer.status,
    expiresAt: offer.expiresAt ? new Date(offer.expiresAt).toISOString() : null,
    shareSlug: offer.shareSlug,
    business: {
      name: business.businessName,
      category: business.category,
      whatsapp: business.whatsapp,
    },
  };
}
