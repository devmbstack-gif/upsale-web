import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — UPSale",
  description: "Sign in to your UPSale business account.",
};

export default function LoginPage() {
  return <LoginForm />;
}
