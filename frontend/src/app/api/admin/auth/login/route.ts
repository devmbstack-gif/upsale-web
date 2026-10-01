import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models/user";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { writeAuditLog } from "@/lib/admin/audit";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
} from "@/lib/auth/session";

/**
 * Super Admin login — sets `upsale_admin_session` cookie.
 * Body: { email, password }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    const email = body?.email?.trim().toLowerCase();
    const password = body?.password ?? "";
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    await connectDB();

    const admin = await UserModel.findOne({ email }).select(
      "+passwordHash email name role isActive",
    );

    if (admin && admin.role === "business_owner") {
      return NextResponse.json(
        {
          ok: false,
          code: "NOT_SUPER_ADMIN",
          message: "Access Denied: Super Admin credentials required.",
        },
        { status: 403 },
      );
    }

    if (!admin || admin.role !== "super_admin" || admin.isActive === false) {
      const owner = await BusinessOwnerModel.findOne({ email }).select("_id email");
      if (owner) {
        return NextResponse.json(
          {
            ok: false,
            code: "NOT_SUPER_ADMIN",
            message: "Access Denied: Super Admin credentials required.",
          },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { ok: false, message: "Invalid credentials." },
        { status: 401 },
      );
    }

    const hash = admin.passwordHash;
    if (!hash || typeof hash !== "string") {
      console.error("[admin/login] Super admin missing passwordHash for", email);
      return NextResponse.json(
        { ok: false, message: "Admin account is misconfigured. Re-run npm run seed:admin." },
        { status: 500 },
      );
    }

    const match = await bcrypt.compare(password, hash);
    if (!match) {
      return NextResponse.json(
        { ok: false, message: "Invalid credentials." },
        { status: 401 },
      );
    }

    const token = createAdminSessionToken({
      sub: String(admin._id),
      email: admin.email,
      name: admin.name,
      role: "super_admin",
      exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
    });

    try {
      await writeAuditLog({
        userId: admin._id,
        action: "LOGIN_ADMIN",
        entity: "User",
        newValue: { email: admin.email },
      });
    } catch (auditError) {
      console.error("[admin/login] audit log failed", auditError);
    }

    const response = NextResponse.json({
      ok: true,
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 14 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error("[admin/login]", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? `Login failed: ${error.message}`
            : "Login failed. Check MongoDB connection and try again.",
      },
      { status: 500 },
    );
  }
}
