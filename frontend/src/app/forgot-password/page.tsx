import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Forgot password — UPSale",
  description: "Request a password reset OTP for your UPSale account.",
};

export default function ForgotPasswordPage() {
  redirect("/login?forgot=1");
}
