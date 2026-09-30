import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { DealModel } from "@/lib/models/deal";
import { CustomerModel } from "@/lib/models/customer";
import { filterBySegment, type SegmentId } from "@/lib/segments";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const deals = await DealModel.find({ businessId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, deals });
}

const bodySchema = z.object({
  title: z.string().trim().min(2),
  message: z.string().trim().min(2),
  discountLabel: z.string().trim().optional(),
  audience: z.enum(["all", "new", "repeat", "vip", "at_risk", "custom"]).default("all"),
  customerIds: z.array(z.string()).optional(),
  scheduleType: z.enum(["now", "once", "daily", "weekly"]).default("now"),
  scheduledAt: z.string().nullable().optional(),
  sendNow: z.boolean().optional(),
});

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Check deal details." }, { status: 400 });
  }

  const data = parsed.data;
  const customers = await CustomerModel.find({ businessId }).lean();
  let recipients = filterBySegment(customers, data.audience as SegmentId);
  if (data.audience === "custom" && data.customerIds?.length) {
    const set = new Set(data.customerIds);
    recipients = customers.filter((c) => set.has(String(c._id)) && !c.optedOut);
  }

  const sendNow = data.sendNow || data.scheduleType === "now";
  const scheduledAt =
    !sendNow && data.scheduledAt ? new Date(data.scheduledAt) : sendNow ? new Date() : null;

  const deal = await DealModel.create({
    businessId,
    title: data.title,
    message: data.message,
    discountLabel: data.discountLabel ?? "",
    audience: data.audience,
    customerIds: data.audience === "custom" ? (data.customerIds ?? []) : [],
    scheduleType: data.scheduleType,
    scheduledAt,
    status: sendNow ? "sent" : "scheduled",
    sentAt: sendNow ? new Date() : null,
    recipientCount: recipients.length,
  });

  return NextResponse.json(
    {
      ok: true,
      deal,
      note: sendNow
        ? `Marked sent to ${recipients.length} consented customer(s). Connect WhatsApp API to deliver real messages.`
        : `Scheduled for ${recipients.length} consented customer(s).`,
    },
    { status: 201 },
  );
}
