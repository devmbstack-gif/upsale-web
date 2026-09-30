import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { FlattenMaps } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { UserModel, type User } from "@/lib/models/user";
import {
  ADMIN_SESSION_COOKIE,
  readAdminSessionToken,
  SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/session";

type AdminUserLean = FlattenMaps<User> & { _id: { toString(): string } };

/**
 * Guard for `/api/admin/*` routes.
 * Requires an admin session whose user has `role === "super_admin"`.
 * Business-owner sessions and unauthenticated requests receive 403.
 */
export async function requireSuperAdmin(): Promise<
  | { error: NextResponse }
  | { admin: AdminUserLean; adminId: string }
> {
  await connectDB();
  const jar = await cookies();

  const adminSession = readAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
  if (adminSession?.sub) {
    const admin = (await UserModel.findById(adminSession.sub).lean()) as AdminUserLean | null;
    if (admin?._id && admin.role === "super_admin" && admin.isActive !== false) {
      return { admin, adminId: String(admin._id) };
    }
  }

  // Explicitly reject business-owner dashboard sessions from admin APIs
  const businessSession = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (businessSession?.sub) {
    return {
      error: NextResponse.json(
        { ok: false, message: "Forbidden. Super admin access required." },
        { status: 403 },
      ),
    };
  }

  return {
    error: NextResponse.json(
      { ok: false, message: "Forbidden. Super admin access required." },
      { status: 403 },
    ),
  };
}
