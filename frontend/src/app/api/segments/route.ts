import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { CustomerModel } from "@/lib/models/customer";
import { countSegments, filterBySegment, type SegmentId } from "@/lib/segments";

export async function GET(request: Request) {
  const auth = await requireBusiness();
  if ("error" in auth && auth.error) return auth.error;
  const { businessId } = auth as { businessId: string };
  const { searchParams } = new URL(request.url);
  const segment = (searchParams.get("segment") ?? "all") as SegmentId;

  const customers = await CustomerModel.find({ businessId }).lean();
  const counts = countSegments(customers);
  const list = filterBySegment(customers, segment);

  return NextResponse.json({
    ok: true,
    segment,
    counts,
    customers: list,
  });
}
