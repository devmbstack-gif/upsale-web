import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { connectDB } from "@/lib/mongodb";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { PackageModel } from "@/lib/models/package";
import { UserModel } from "@/lib/models/user";

export async function GET() {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;

  const started = Date.now();
  try {
    await connectDB();
    const [businesses, packages, admins] = await Promise.all([
      BusinessOwnerModel.countDocuments(),
      PackageModel.countDocuments(),
      UserModel.countDocuments({ role: "super_admin" }),
    ]);

    return NextResponse.json({
      ok: true,
      role: auth.admin.role,
      email: auth.admin.email,
      message: "Super admin access granted.",
      health: {
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "degraded",
        latencyMs: Date.now() - started,
        counts: { businesses, packages, superAdmins: admins },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 503 },
    );
  }
}
