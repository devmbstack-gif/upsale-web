import { NextResponse } from "next/server";
import { z } from "zod";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const bodySchema = z.object({ email: z.string().trim().email() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Enter a valid business email." }, { status: 400 });
  }

  try {
    await connectDB();
    const exists = await BusinessOwnerModel.exists({
      email: parsed.data.email.toLowerCase(),
    });
    if (exists) {
      return NextResponse.json(
        { ok: false, available: false, message: "Account already exists with that email." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true, available: true });
  } catch (error) {
    console.error("Email availability check failed:", error);
    return NextResponse.json(
      { ok: false, message: "Could not verify the email. Try again." },
      { status: 503 },
    );
  }
}
