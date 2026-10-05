import { redirect } from "next/navigation";

export default function SuperAdminHome() {
  redirect(process.env.FRONTEND_ADMIN_URL ?? "http://localhost:3000/admin/login");
}
