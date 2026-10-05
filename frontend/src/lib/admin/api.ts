import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export async function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export async function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function withSuperAdmin() {
  return requireSuperAdmin();
}
