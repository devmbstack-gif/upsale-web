import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SubscriptionEndedDialog } from "@/components/billing/SubscriptionEndedDialog";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { connectDB } from "@/lib/mongodb";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/login");

  let endedPlan: string | null = null;
  let isTrial = false;
  try {
    await connectDB();
    const owner = await BusinessOwnerModel.findById(session.sub)
      .select("plan planSlug subscriptionStatus trialEndsAt")
      .lean();
    if (owner?.subscriptionStatus === "trial" && owner.trialEndsAt && owner.trialEndsAt.getTime() <= Date.now()) {
      endedPlan = "Free Trial";
      isTrial = true;
    } else if (["cancelled", "canceled", "past_due", "expired", "inactive"].includes(owner?.subscriptionStatus ?? "")) {
      endedPlan = owner?.plan || "Subscription";
    }
  } catch {
    // Dashboard APIs surface database failures; do not block page rendering here.
  }

  return (
    <DashboardShell>
      {children}
      <SubscriptionEndedDialog planName={endedPlan} isTrial={isTrial} />
    </DashboardShell>
  );
}
