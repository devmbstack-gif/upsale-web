import { segmentLabel, type SegmentCustomer, type SegmentId } from "@/lib/segments";

export type SegmentStats = {
  audience: SegmentId;
  audienceLabel: string;
  count: number;
  avgVisits: number;
  avgSpend: number;
  avgDaysSinceVisit: number;
  totalRedeemed: number;
  redemptionRate: number;
};

export type DealSuggestion = {
  title: string;
  discountLabel: string;
  message: string;
  rationale: string;
  variant: number;
  maxDiscountHint: string;
};

function daysAgo(d: Date | string | null | undefined) {
  if (!d) return 90;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return 90;
  return Math.max(0, (Date.now() - t) / (1000 * 60 * 60 * 24));
}

export function computeSegmentStats(
  customers: SegmentCustomer[],
  audience: SegmentId,
): SegmentStats {
  const count = customers.length;
  if (count === 0) {
    return {
      audience,
      audienceLabel: segmentLabel(audience),
      count: 0,
      avgVisits: 0,
      avgSpend: 0,
      avgDaysSinceVisit: 0,
      totalRedeemed: 0,
      redemptionRate: 0,
    };
  }

  let visits = 0;
  let spend = 0;
  let days = 0;
  let redeemed = 0;
  for (const c of customers) {
    visits += c.visitCount ?? c.scans ?? 0;
    spend += c.totalSpend ?? 0;
    days += daysAgo(c.lastVisitAt);
    redeemed += c.couponsRedeemed ?? 0;
  }

  return {
    audience,
    audienceLabel: segmentLabel(audience),
    count,
    avgVisits: Math.round((visits / count) * 10) / 10,
    avgSpend: Math.round(spend / count),
    avgDaysSinceVisit: Math.round(days / count),
    totalRedeemed: redeemed,
    redemptionRate: Math.round((redeemed / count) * 100),
  };
}

type Biz = { businessName: string; category?: string; currency?: string };

type Template = {
  title: (s: SegmentStats, b: Biz) => string;
  discount: (s: SegmentStats) => string;
  message: (s: SegmentStats, b: Biz) => string;
  rationale: (s: SegmentStats) => string;
};

const byAudience: Record<SegmentId, Template[]> = {
  all: [
    {
      title: (_s, b) => `${b.businessName} — weekend special`,
      discount: () => "10% off",
      message: (s, b) =>
        `Hi {{name}}! ${b.businessName} has a weekend treat for you — 10% off your next visit. Reply STOP to opt out. (${s.count} guests on this list)`,
      rationale: (s) => `Broad offer for all ${s.count} consented customers.`,
    },
    {
      title: (_s, b) => `Thanks from ${b.businessName}`,
      discount: () => "Buy 1 get 10% off",
      message: (_s, b) =>
        `Hi {{name}}, thank you for choosing ${b.businessName}. Show this message for 10% off your next order. Reply STOP to opt out.`,
      rationale: () => "Simple thank-you deal for the full list.",
    },
    {
      title: () => "Midweek boost",
      discount: () => "Free add-on",
      message: (_s, b) =>
        `Hi {{name}}! Midweek perk from ${b.businessName}: free add-on with any purchase today. See you soon! Reply STOP to opt out.`,
      rationale: () => "Light midweek incentive for everyone.",
    },
  ],
  new: [
    {
      title: (_s, b) => `Welcome to ${b.businessName}`,
      discount: () => "15% first visit",
      message: (_s, b) =>
        `Hi {{name}}! Welcome to ${b.businessName}. Enjoy 15% off your first full visit — we can't wait to see you again. Reply STOP to opt out.`,
      rationale: (s) =>
        `${s.count} new guests (avg ${s.avgVisits} visits). Strong welcome discount helps first return.`,
    },
    {
      title: () => "New guest treat",
      discount: () => "Free small item",
      message: (_s, b) =>
        `Hi {{name}}, thanks for joining ${b.businessName}. Come back this week for a free small item on us. Reply STOP to opt out.`,
      rationale: (s) => `New segment size ${s.count} — gift-style welcome.`,
    },
    {
      title: (_s, b) => `${b.businessName} starter offer`,
      discount: () => "Rs 200 off",
      message: (_s, b) =>
        `Hi {{name}}! As a new ${b.businessName} guest, get Rs 200 off your next bill. Valid this week. Reply STOP to opt out.`,
      rationale: () => "Fixed-value welcome for new customers.",
    },
  ],
  repeat: [
    {
      title: () => "Thanks for coming back",
      discount: () => "10% loyalty",
      message: (s, b) =>
        `Hi {{name}}! You are one of our regulars at ${b.businessName} (avg ${s.avgVisits} visits). Enjoy 10% off next time. Reply STOP to opt out.`,
      rationale: (s) =>
        `Repeat group: ${s.count} people, avg ${s.avgVisits} visits — loyalty thank-you.`,
    },
    {
      title: () => "Regulars double points day",
      discount: () => "Extra reward",
      message: (_s, b) =>
        `Hi {{name}}, ${b.businessName} regulars get an extra reward on your next visit this week. See you soon! Reply STOP to opt out.`,
      rationale: () => "Engagement boost without a deep discount.",
    },
    {
      title: (_s, b) => `${b.businessName} repeat perk`,
      discount: () => "Buy 2 save 15%",
      message: (_s, b) =>
        `Hi {{name}}! Because you keep coming back to ${b.businessName}, enjoy Buy 2 save 15% this weekend. Reply STOP to opt out.`,
      rationale: (s) => `Spend-friendly bundle for ${s.count} repeat customers.`,
    },
  ],
  vip: [
    {
      title: () => "VIP exclusive",
      discount: () => "20% VIP",
      message: (s, b) =>
        `Hi {{name}}, you are a VIP at ${b.businessName} (avg spend ~${s.avgSpend}). Enjoy an exclusive 20% off — our thank you. Reply STOP to opt out.`,
      rationale: (s) =>
        `VIP: ${s.count} guests, avg spend ${s.avgSpend}, ${s.avgVisits} visits — higher reward ok.`,
    },
    {
      title: (_s, b) => `${b.businessName} inner circle`,
      discount: () => "Complimentary upgrade",
      message: (_s, b) =>
        `Hi {{name}}! Inner-circle perk from ${b.businessName}: complimentary upgrade on your next visit. Reply STOP to opt out.`,
      rationale: () => "Experience perk for high-value guests.",
    },
    {
      title: () => "Private VIP hour",
      discount: () => "Early access + 15%",
      message: (_s, b) =>
        `Hi {{name}}, VIP early access at ${b.businessName} this Friday + 15% off. We saved a spot for you. Reply STOP to opt out.`,
      rationale: (s) => `Scarcity + discount for ${s.count} VIPs.`,
    },
  ],
  at_risk: [
    {
      title: () => "We miss you",
      discount: () => "20% come-back",
      message: (s, b) =>
        `Hi {{name}}, it has been about ${s.avgDaysSinceVisit} days since we saw you at ${b.businessName}. Come back for 20% off — on us. Reply STOP to opt out.`,
      rationale: (s) =>
        `At risk: ${s.count} inactive ~${s.avgDaysSinceVisit} days — win-back discount.`,
    },
    {
      title: (_s, b) => `${b.businessName} wants you back`,
      discount: () => "Free favorite + drink",
      message: (_s, b) =>
        `Hi {{name}}! ${b.businessName} misses you. Return this week for a free favorite item (or drink). Reply STOP to opt out.`,
      rationale: () => "Gift-style win-back, strong pull.",
    },
    {
      title: () => "Last chance this month",
      discount: () => "25% return offer",
      message: (_s, b) =>
        `Hi {{name}}, last chance this month: 25% off when you visit ${b.businessName} again. We hope to see you soon. Reply STOP to opt out.`,
      rationale: (s) => `Stronger discount for ${s.count} at-risk customers.`,
    },
  ],
};

/** Rule-based Deal Maker v1 — never sends; owner must approve. */
export function suggestDeal(options: {
  stats: SegmentStats;
  business: Biz;
  variant?: number;
}): DealSuggestion {
  const { stats, business } = options;
  const templates = byAudience[stats.audience] ?? byAudience.all;
  const variant = Math.abs(options.variant ?? 0) % templates.length;
  const t = templates[variant]!;
  const biz: Biz = {
    businessName: business.businessName || "our shop",
    category: business.category,
    currency: business.currency,
  };

  if (stats.count === 0) {
    return {
      title: `Draft deal for ${stats.audienceLabel}`,
      discountLabel: "10% off",
      message: `Hi {{name}}! ${biz.businessName} has a special offer for you. Reply STOP to opt out.`,
      rationale: `No consented customers in “${stats.audienceLabel}” yet. Suggestion is a safe default — approve only after you have an audience.`,
      variant,
      maxDiscountHint: "Keep discounts within your usual max (e.g. 25%).",
    };
  }

  return {
    title: t.title(stats, biz),
    discountLabel: t.discount(stats),
    message: t.message(stats, biz),
    rationale: t.rationale(stats),
    variant,
    maxDiscountHint: "AI never auto-sends. Edit freely before approving into Deals.",
  };
}

export const AI_DEAL_DRAFT_KEY = "upsale-ai-deal-draft";

export type AiDealDraft = {
  title: string;
  message: string;
  discountLabel: string;
  audience: SegmentId;
  fromAi: true;
  cta?: string;
  postCaption?: string;
  productImageUrl?: string;
  includePost?: boolean;
};
