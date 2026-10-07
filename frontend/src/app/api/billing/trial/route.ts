import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/auth/require-business";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { TrialSettingsModel } from "@/lib/models/trial-settings";

export async function POST() {
  const auth = await requireBusiness();
  if ("error" in auth) return auth.error;

  const settings = await TrialSettingsModel.findOne({ key: "default" }).lean();
  if (settings?.enabled === false) {
    return NextResponse.json({ ok: false, message: "The free trial is not currently available." }, { status: 403 });
  }
  if (auth.owner.trialGrantedOnce) {
    return NextResponse.json({ ok: false, message: "The free trial has already been used for this account." }, { status: 409 });
  }
  if (auth.owner.subscriptionStatus === "active") {
    return NextResponse.json({ ok: false, message: "A paid plan is already active." }, { status: 409 });
  }

  const startedAt = new Date();
  const trialDays = Math.max(1, settings?.trialDays ?? 14);
  const endsAt = new Date(startedAt.getTime() + trialDays * 24 * 60 * 60 * 1000);
  const updated = await BusinessOwnerModel.findOneAndUpdate(
    { _id: auth.businessId, trialGrantedOnce: { $ne: true }, subscriptionStatus: { $ne: "active" } },
    {
      $set: {
        plan: "Free Trial",
        planSlug: "free-trial",
        subscriptionStatus: "trial",
        trialStartedAt: startedAt,
        trialEndsAt: endsAt,
        trialGrantedOnce: true,
        trialPackageId: settings?.unlockedPackageId ?? null,
      },
    },
    { new: true },
  ).lean();

  if (!updated) {
    return NextResponse.json({ ok: false, message: "The trial could not be activated." }, { status: 409 });
  }
  return NextResponse.json({ ok: true, trialEndsAt: endsAt.toISOString(), plan: "Free Trial" });
}
