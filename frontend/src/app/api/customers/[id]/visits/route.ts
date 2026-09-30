import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusiness } from "@/lib/auth/require-business";
import { CustomerModel } from "@/lib/models/customer";
import { VisitModel } from "@/lib/models/visit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { id } = await ctx.params;

  const customer = await CustomerModel.findOne({ _id: id, businessId }).lean();
  if (!customer) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  const visits = await VisitModel.find({ businessId, customerId: id })
    .sort({ visitedAt: -1 })
    .lean();

  return NextResponse.json({ ok: true, visits });
}

const bodySchema = z.object({
  amount: z.coerce.number().min(0).default(0),
  category: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export async function POST(request: Request, ctx: Ctx) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { id } = await ctx.params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid visit details" }, { status: 400 });
  }

  const customer = await CustomerModel.findOne({ _id: id, businessId });
  if (!customer) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }

  const visit = await VisitModel.create({
    businessId,
    customerId: id,
    amount: parsed.data.amount,
    category: parsed.data.category ?? "",
    note: parsed.data.note ?? "",
    visitedAt: new Date(),
  });

  const spendInc = parsed.data.amount || 0;
  customer.lastVisitAt = new Date();
  customer.scans = (customer.scans ?? 0) + 1;
  const tags = new Set(customer.tags ?? []);
  if (parsed.data.category) tags.add(parsed.data.category);
  customer.tags = Array.from(tags);
  await customer.save();

  // Store spend as soft field via tags not ideal — update optional totalSpend if we add it
  await CustomerModel.updateOne(
    { _id: id },
    {
      $inc: { totalSpend: spendInc, visitCount: 1 },
    },
  );

  return NextResponse.json({ ok: true, visit }, { status: 201 });
}
