import { createHash } from "crypto";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const bodySchema = z
  .object({
    token: z.string().min(20),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Check the new password and try again." },
      { status: 400 },
    );
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  try {
    await connectDB();
    const owner = await BusinessOwnerModel.findOne({
      resetToken: tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!owner) {
      return NextResponse.json(
        { ok: false, message: "That reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    owner.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    owner.resetToken = null;
    owner.resetTokenExpiry = null;
    await owner.save();

    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch {
    return NextResponse.json(
      { ok: false, message: "The database is not reachable. Start MongoDB and try again." },
      { status: 503 },
    );
  }
}
