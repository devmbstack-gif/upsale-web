import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_SESSION_COOKIE, readAdminSessionToken } from "@/lib/auth/session";
import type { ReactNode } from "react";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const session = readAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
