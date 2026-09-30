import type { Types } from "mongoose";

export type SegmentId = "all" | "new" | "repeat" | "vip" | "at_risk";

export type SegmentCustomer = {
  _id: Types.ObjectId | string;
  joinedAt?: Date | string;
  lastVisitAt?: Date | string | null;
  scans?: number;
  couponsRedeemed?: number;
  totalSpend?: number;
  visitCount?: number;
  optedOut?: boolean;
};

const NEW_DAYS = 14;
const AT_RISK_DAYS = 30;

function daysAgo(d: Date | string | null | undefined) {
  if (!d) return Number.POSITIVE_INFINITY;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

export function segmentLabel(id: SegmentId) {
  switch (id) {
    case "new":
      return "New customers";
    case "repeat":
      return "Repeat customers";
    case "vip":
      return "VIP / high spend";
    case "at_risk":
      return "At risk / inactive";
    default:
      return "All customers";
  }
}

/** Assign primary marketing segment tags for a customer. */
export function classifyCustomer(c: SegmentCustomer): SegmentId[] {
  const segments: SegmentId[] = [];
  const visits = c.visitCount ?? c.scans ?? 0;
  const spend = c.totalSpend ?? 0;
  const joinedDays = daysAgo(c.joinedAt);
  const lastDays = daysAgo(c.lastVisitAt);

  if (joinedDays <= NEW_DAYS && visits <= 1) segments.push("new");
  if (visits >= 2 || (c.couponsRedeemed ?? 0) >= 2) segments.push("repeat");
  if (spend >= 5000 || visits >= 5 || (c.couponsRedeemed ?? 0) >= 3) segments.push("vip");
  if (lastDays >= AT_RISK_DAYS && visits >= 1) segments.push("at_risk");

  return segments;
}

export function filterBySegment<T extends SegmentCustomer>(customers: T[], segment: SegmentId): T[] {
  if (segment === "all") return customers.filter((c) => !c.optedOut);
  return customers.filter((c) => !c.optedOut && classifyCustomer(c).includes(segment));
}

export function countSegments(customers: SegmentCustomer[]) {
  const eligible = customers.filter((c) => !c.optedOut);
  return {
    all: eligible.length,
    new: filterBySegment(eligible, "new").length,
    repeat: filterBySegment(eligible, "repeat").length,
    vip: filterBySegment(eligible, "vip").length,
    at_risk: filterBySegment(eligible, "at_risk").length,
  };
}
