import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Super Admin Login — UPSale",
  description: "Sign in to the UPSale Super Admin console.",
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
