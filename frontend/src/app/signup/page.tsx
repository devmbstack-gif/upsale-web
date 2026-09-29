import type { Metadata } from "next";
import SignUpMultiStepForm from "@/components/auth/SignUpMultiStepForm";

export const metadata: Metadata = {
  title: "Sign up — UPSale",
  description: "Create a UPSale business account and start a free trial.",
};

export default function SignUpPage() {
  return <SignUpMultiStepForm />;
}
