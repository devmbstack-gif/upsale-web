import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { CustomerModel } from "@/lib/models/customer";

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
  return NextResponse.json({ ok: true, customer });
}
