import "server-only";
import { CustomerModel } from "@/lib/models/customer";
import { PackageModel } from "@/lib/models/package";
import { TrialSettingsModel } from "@/lib/models/trial-settings";
import { UsageCounterModel } from "@/lib/models/usage-counter";

type LimitKey = "campaigns" | "aiGenerations";

export class UsageLimitError extends Error {
  constructor(message: string) { super(message); this.name = "UsageLimitError"; }
}

export async function getBusinessLimits(owner: {
  planSlug?: string;
  subscriptionStatus?: string;
  trialEndsAt?: Date | string | null;
  trialPackageId?: unknown;
}) {
  if (owner.subscriptionStatus === "trial") {
    if (owner.trialEndsAt && new Date(owner.trialEndsAt).getTime() < Date.now()) {
      throw new UsageLimitError("Your free trial has ended. Choose a plan to continue.");
    }
    const trial = await TrialSettingsModel.findOne({ key: "default" }).lean();
    if (!trial?.enabled) throw new UsageLimitError("The free trial is no longer active. Choose a plan to continue.");
    return trial.fairUsageCaps;
  }
  if (owner.subscriptionStatus !== "active") {
    throw new UsageLimitError(
      owner.subscriptionStatus === "past_due"
        ? "Your subscription payment is past due. Update payment details to continue."
        : "Your subscription is not active. Choose a plan to continue.",
    );
  }
  const plan = await PackageModel.findOne({ slug: owner.planSlug, isActive: true }).lean();
  if (!plan) throw new UsageLimitError("Your subscription plan is unavailable. Choose an active plan.");
  return plan.limits;
}

export async function assertCustomerCapacity(businessId: string, owner: Parameters<typeof getBusinessLimits>[0]) {
  const limits = await getBusinessLimits(owner);
  if (!limits.customers) return;
  const count = await CustomerModel.countDocuments({ businessId });
  if (count >= limits.customers) throw new UsageLimitError(`Your plan allows ${limits.customers} customers. Upgrade to capture more customers.`);
}

function period() { return new Date().toISOString().slice(0, 7); }

export async function reserveMonthlyUsage(
  businessId: string,
  owner: Parameters<typeof getBusinessLimits>[0],
  key: LimitKey,
) {
  const limits = await getBusinessLimits(owner);
  const limit = key === "campaigns" ? limits.campaignsPerMonth : limits.aiGenerations;
  if (!limit) return { unlimited: true as const, release: async () => undefined };
  const currentPeriod = period();
  await UsageCounterModel.updateOne(
    { businessId, period: currentPeriod },
    { $setOnInsert: { campaigns: 0, aiGenerations: 0 } },
    { upsert: true },
  );
  const updated = await UsageCounterModel.findOneAndUpdate(
    { businessId, period: currentPeriod, [key]: { $lt: limit } },
    { $inc: { [key]: 1 } },
    { new: true },
  ).lean();
  if (!updated) {
    const label = key === "campaigns" ? "campaign" : "AI generation";
    throw new UsageLimitError(`Your monthly ${label} limit of ${limit} is complete. Upgrade your plan to continue.`);
  }
  return {
    unlimited: false as const,
    used: updated[key],
    limit,
    release: async () => {
      await UsageCounterModel.updateOne(
        { businessId, period: currentPeriod, [key]: { $gt: 0 } },
        { $inc: { [key]: -1 } },
      );
    },
  };
}
