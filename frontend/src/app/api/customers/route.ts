import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { CustomerModel } from "@/lib/models/customer";

export async function GET(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const filter: Record<string, unknown> = { businessId };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  const customers = await CustomerModel.find(filter).sort({ lastVisitAt: -1 }).lean();
  return NextResponse.json({ ok: true, customers });
}
