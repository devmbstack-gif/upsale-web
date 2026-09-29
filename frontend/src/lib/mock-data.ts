export type OfferStatus = "active" | "paused" | "expired" | "draft";

export type OfferType = "discount" | "reward" | "freebie";

export interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  country: string;
  currency: string;
  timezone: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  subscriptionPlan: "starter" | "growth" | "enterprise";
  subscriptionStatus: "active" | "trial" | "past_due";
  trialEndsAt: string | null;
  email: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  type: OfferType;
  status: OfferStatus;
  discountPercent: number | null;
  rewardLabel: string | null;
  scans: number;
  redemptions: number;
  createdAt: string;
  expiresAt: string | null;
  shareSlug: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  scans: number;
  couponsRedeemed: number;
  lastVisitAt: string;
  joinedAt: string;
  tags: string[];
}

export interface Coupon {
  id: string;
  code: string;
  offerId: string;
  offerTitle: string;
  customerName: string;
  customerId: string;
  redeemed: boolean;
  redeemedAt: string | null;
  issuedAt: string;
}

export interface ScanEvent {
  id: string;
  at: string;
  offerTitle: string;
  location: string;
}

export const businessProfile: BusinessProfile = {
  id: "biz_01",
  name: "Luna Roastery & Kitchen",
  category: "Café & Restaurant",
  country: "United Arab Emirates",
  currency: "AED",
  timezone: "Asia/Dubai",
  whatsappNumber: "+971 50 123 4567",
  whatsappEnabled: true,
  subscriptionPlan: "growth",
  subscriptionStatus: "active",
  trialEndsAt: null,
  email: "hello@lunarostery.ae",
};

export const offers: Offer[] = [
  {
    id: "off_001",
    title: "15% off your next visit",
    description: "Scan at checkout. One use per customer.",
    type: "discount",
    status: "active",
    discountPercent: 15,
    rewardLabel: null,
    scans: 842,
    redemptions: 312,
    createdAt: "2026-01-12T09:00:00Z",
    expiresAt: "2026-06-30T23:59:59Z",
    shareSlug: "luna-15-off",
  },
  {
    id: "off_002",
    title: "Free dessert with main",
    description: "Valid Mon–Thu after 6pm.",
    type: "freebie",
    status: "active",
    discountPercent: null,
    rewardLabel: "Free dessert",
    scans: 521,
    redemptions: 198,
    createdAt: "2026-02-01T11:30:00Z",
    expiresAt: "2026-04-30T23:59:59Z",
    shareSlug: "luna-free-dessert",
  },
  {
    id: "off_003",
    title: "Birthday reward — 20% off",
    description: "Auto-sent on customer birthday week.",
    type: "reward",
    status: "paused",
    discountPercent: 20,
    rewardLabel: "Birthday treat",
    scans: 96,
    redemptions: 41,
    createdAt: "2025-11-20T08:00:00Z",
    expiresAt: null,
    shareSlug: "luna-birthday",
  },
  {
    id: "off_004",
    title: "Ramadan iftar bundle",
    description: "Limited seasonal bundle pricing.",
    type: "discount",
    status: "expired",
    discountPercent: 25,
    rewardLabel: null,
    scans: 1204,
    redemptions: 890,
    createdAt: "2025-03-01T07:00:00Z",
    expiresAt: "2025-04-15T23:59:59Z",
    shareSlug: "luna-iftar-25",
  },
  {
    id: "off_005",
    title: "New loyalty tier preview",
    description: "Draft — not published yet.",
    type: "reward",
    status: "draft",
    discountPercent: null,
    rewardLabel: "VIP early access",
    scans: 0,
    redemptions: 0,
    createdAt: "2026-03-10T14:00:00Z",
    expiresAt: null,
    shareSlug: "luna-vip-preview",
  },
];

export const customers: Customer[] = [
  {
    id: "cus_001",
    name: "Sara Al-Mansoori",
    phone: "+971 55 234 8891",
    email: "sara.m@email.com",
    scans: 14,
    couponsRedeemed: 6,
    lastVisitAt: "2026-03-26T18:22:00Z",
    joinedAt: "2025-09-03T10:15:00Z",
    tags: ["regular", "whatsapp"],
  },
  {
    id: "cus_002",
    name: "James Okonkwo",
    phone: "+971 52 901 2234",
    email: null,
    scans: 8,
    couponsRedeemed: 3,
    lastVisitAt: "2026-03-25T12:40:00Z",
    joinedAt: "2025-12-18T16:00:00Z",
    tags: ["lunch"],
  },
  {
    id: "cus_003",
    name: "Fatima Hassan",
    phone: "+971 50 778 3344",
    email: "fatima.h@email.com",
    scans: 22,
    couponsRedeemed: 11,
    lastVisitAt: "2026-03-27T09:05:00Z",
    joinedAt: "2025-06-21T08:30:00Z",
    tags: ["vip", "regular"],
  },
  {
    id: "cus_004",
    name: "Omar Khalid",
    phone: "+971 56 112 9988",
    email: "omar.k@work.ae",
    scans: 3,
    couponsRedeemed: 1,
    lastVisitAt: "2026-03-20T20:10:00Z",
    joinedAt: "2026-02-14T19:45:00Z",
    tags: ["new"],
  },
  {
    id: "cus_005",
    name: "Elena Petrova",
    phone: "+971 54 667 1200",
    email: "elena.p@gmail.com",
    scans: 11,
    couponsRedeemed: 4,
    lastVisitAt: "2026-03-24T15:30:00Z",
    joinedAt: "2025-10-09T11:20:00Z",
    tags: ["weekend"],
  },
  {
    id: "cus_006",
    name: "Ahmed Youssef",
    phone: "+971 58 443 7766",
    email: null,
    scans: 5,
    couponsRedeemed: 2,
    lastVisitAt: "2026-03-22T13:00:00Z",
    joinedAt: "2026-01-05T09:00:00Z",
    tags: ["lunch"],
  },
];

export const coupons: Coupon[] = [
  {
    id: "cpn_101",
    code: "LUNA-15-X7K2",
    offerId: "off_001",
    offerTitle: "15% off your next visit",
    customerName: "Sara Al-Mansoori",
    customerId: "cus_001",
    redeemed: true,
    redeemedAt: "2026-03-18T17:45:00Z",
    issuedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "cpn_102",
    code: "LUNA-DS-M9P1",
    offerId: "off_002",
    offerTitle: "Free dessert with main",
    customerName: "Fatima Hassan",
    customerId: "cus_003",
    redeemed: true,
    redeemedAt: "2026-03-26T21:10:00Z",
    issuedAt: "2026-03-24T19:00:00Z",
  },
  {
    id: "cpn_103",
    code: "LUNA-15-Q4W8",
    offerId: "off_001",
    offerTitle: "15% off your next visit",
    customerName: "James Okonkwo",
    customerId: "cus_002",
    redeemed: false,
    redeemedAt: null,
    issuedAt: "2026-03-27T08:30:00Z",
  },
  {
    id: "cpn_104",
    code: "LUNA-BD-R2T6",
    offerId: "off_003",
    offerTitle: "Birthday reward — 20% off",
    customerName: "Elena Petrova",
    customerId: "cus_005",
    redeemed: false,
    redeemedAt: null,
    issuedAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "cpn_105",
    code: "LUNA-15-H3J5",
    offerId: "off_001",
    offerTitle: "15% off your next visit",
    customerName: "Omar Khalid",
    customerId: "cus_004",
    redeemed: true,
    redeemedAt: "2026-03-21T14:20:00Z",
    issuedAt: "2026-03-19T12:00:00Z",
  },
];

const scanEventsByCustomer: Record<string, ScanEvent[]> = {
  cus_001: [
    {
      id: "sc_1",
      at: "2026-03-26T18:22:00Z",
      offerTitle: "15% off your next visit",
      location: "Downtown branch",
    },
    {
      id: "sc_2",
      at: "2026-03-12T19:00:00Z",
      offerTitle: "Free dessert with main",
      location: "Downtown branch",
    },
  ],
  cus_003: [
    {
      id: "sc_3",
      at: "2026-03-27T09:05:00Z",
      offerTitle: "15% off your next visit",
      location: "Marina kiosk",
    },
  ],
};

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function getOfferById(id: string): Offer | undefined {
  return offers.find((o) => o.id === id);
}

export function getCustomerScanEvents(customerId: string): ScanEvent[] {
  return scanEventsByCustomer[customerId] ?? [];
}

export function getDashboardStats() {
  const activeOffers = offers.filter((o) => o.status === "active").length;
  const couponsRedeemed = coupons.filter((c) => c.redeemed).length;
  const totalScans = offers.reduce((sum, o) => sum + o.scans, 0);

  return {
    totalCustomers: customers.length,
    activeOffers,
    couponsRedeemed,
    totalScans,
  };
}

export function getOfferShareUrl(slug: string): string {
  return `https://upsale.app/o/${slug}`;
}
