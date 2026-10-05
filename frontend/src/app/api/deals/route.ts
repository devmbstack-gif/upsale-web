import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { DealModel } from "@/lib/models/deal";
import { CustomerModel } from "@/lib/models/customer";
import { filterBySegment, type SegmentId } from "@/lib/segments";
import { callWhatsAppBackend } from "@/lib/whatsapp/backend";
import { reserveMonthlyUsage, UsageLimitError } from "@/lib/billing/usage";

export async function GET() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId } = auth;
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
  templateName: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;
  const { businessId, owner } = auth;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Check deal details." }, { status: 400 });
  }

  const data = parsed.data;
  let usage: Awaited<ReturnType<typeof reserveMonthlyUsage>>;
  try {
    usage = await reserveMonthlyUsage(businessId, owner, "campaigns");
  } catch (error) {
    if (error instanceof UsageLimitError) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 403 });
    }
    throw error;
  }
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
    templateName: data.templateName ?? "",
    discountLabel: data.discountLabel ?? "",
    audience: data.audience,
    customerIds: data.audience === "custom" ? (data.customerIds ?? []) : [],
    scheduleType: data.scheduleType,
    scheduledAt,
    status: sendNow ? "sending" : "scheduled",
    sentAt: null,
    recipientCount: recipients.length,
  });

  if (sendNow) {
    try {
      const { response, data: result } = await callWhatsAppBackend<{
        accepted?: number;
        failed?: number;
        message?: string;
      }>("send-campaign", {
        businessId,
        dealId: String(deal._id),
        message: data.message,
        templateName: data.templateName || undefined,
        recipients: recipients.map((recipient) => ({
          customerId: String(recipient._id),
          name: recipient.name,
          phone: recipient.phone,
        })),
      });
      if (!response.ok) throw new Error(result.message ?? "WhatsApp rejected the campaign.");
      const accepted = result.accepted ?? 0;
      const failed = result.failed ?? 0;
      deal.status = accepted > 0 ? (failed > 0 ? "partial" : "sent") : "failed";
      deal.acceptedCount = accepted;
      deal.failedCount = failed;
      deal.sentAt = accepted > 0 ? new Date() : null;
      await deal.save();
    } catch (error) {
      deal.status = "failed";
      deal.failureReason = error instanceof Error ? error.message : "WhatsApp delivery failed.";
      await deal.save();
      await usage.release();
      return NextResponse.json({ ok: false, message: deal.failureReason, deal }, { status: 502 });
    }
  } else {
    try {
      const { response, data: result } = await callWhatsAppBackend<{ scheduled?: boolean; message?: string }>(
        "schedule-campaign",
        {
          businessId,
          dealId: String(deal._id),
          message: data.message,
          templateName: data.templateName || undefined,
          scheduleType: data.scheduleType,
          scheduledAt: scheduledAt?.toISOString(),
          recipients: recipients.map((recipient) => ({
            customerId: String(recipient._id),
            name: recipient.name,
            phone: recipient.phone,
          })),
        },
      );
      if (!response.ok || !result.scheduled) throw new Error(result.message ?? "Could not schedule WhatsApp campaign.");
    } catch (error) {
      deal.status = "failed";
      deal.failureReason = error instanceof Error ? error.message : "Could not schedule WhatsApp campaign.";
      await deal.save();
      await usage.release();
      return NextResponse.json({ ok: false, message: deal.failureReason, deal }, { status: 502 });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      deal,
      note: sendNow
        ? `WhatsApp accepted ${deal.acceptedCount} message(s); ${deal.failedCount} failed.`
        : `Scheduled for ${recipients.length} consented customer(s).`,
    },
    { status: 201 },
  );
}
