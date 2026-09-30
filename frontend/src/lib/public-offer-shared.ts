export type PublicOfferPayload = {
  id: string;
  title: string;
  description: string;
  type: string;
  value: number;
  rewardLabel: string | null;
  status: string;
  expiresAt: string | null;
  shareSlug: string;
  business: {
    name: string;
    category: string;
    whatsapp: string;
  };
};

export function formatOfferHeadline(
  offer: Pick<PublicOfferPayload, "type" | "value" | "rewardLabel" | "title">,
) {
  if (offer.type === "percent" && offer.value > 0) return `${offer.value}% off`;
  if (offer.type === "fixed" && offer.value > 0) return `Rs ${offer.value} off`;
  if (offer.rewardLabel) return offer.rewardLabel;
  return offer.title;
}
