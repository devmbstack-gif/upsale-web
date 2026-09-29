import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — UPSale",
  description: "Choose a new password for your UPSale business account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const raw = params.token;
  const token = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return <ResetPasswordForm token={token} />;
}
