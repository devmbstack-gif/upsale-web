import { TrialSettingsModel } from "@/lib/models/trial-settings";
import { PackageModel } from "@/lib/models/package";
import { writeAuditLog } from "@/lib/admin/audit";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

export async function GET() {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  let settings = await TrialSettingsModel.findOne({ key: "default" }).lean();
  if (!settings) {
    settings = (
      await TrialSettingsModel.create({ key: "default" })
    ).toObject();
  }

  const packages = await PackageModel.find({ isActive: true })
    .select("name slug")
    .sort({ sortOrder: 1 })
    .lean();

  return jsonOk({
    settings: {
      enabled: settings.enabled,
      trialDays: settings.trialDays,
      unlockedPackageId: settings.unlockedPackageId
        ? String(settings.unlockedPackageId)
        : null,
      fairUsageCaps: settings.fairUsageCaps
        ? { ...settings.fairUsageCaps, offers: settings.fairUsageCaps.offers ?? 1 }
        : { offers: 1, customers: 100, campaignsPerMonth: 5, aiGenerations: 20 },
      paywallMessage: settings.paywallMessage,
    },
    packages: packages.map((p) => ({
      id: String(p._id),
      name: p.name,
      slug: p.slug,
    })),
  });
}

export async function PUT(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    enabled?: boolean;
    trialDays?: number;
    unlockedPackageId?: string | null;
    fairUsageCaps?: {
      offers?: number;
      customers?: number;
      campaignsPerMonth?: number;
      aiGenerations?: number;
    };
    paywallMessage?: string;
  } | null;

  if (!body) return jsonError("Invalid body");

  const previous = await TrialSettingsModel.findOne({ key: "default" }).lean();

  const update: Record<string, unknown> = {};
  if (typeof body.enabled === "boolean") update.enabled = body.enabled;
  if (typeof body.trialDays === "number" && body.trialDays >= 1) {
    update.trialDays = Math.floor(body.trialDays);
  }
  if (body.unlockedPackageId === null) update.unlockedPackageId = null;
  else if (typeof body.unlockedPackageId === "string" && body.unlockedPackageId) {
    update.unlockedPackageId = body.unlockedPackageId;
  }
  if (body.fairUsageCaps) {
    update.fairUsageCaps = {
      offers: Number(body.fairUsageCaps.offers ?? 1),
      customers: Number(body.fairUsageCaps.customers ?? 100),
      campaignsPerMonth: Number(body.fairUsageCaps.campaignsPerMonth ?? 5),
      aiGenerations: Number(body.fairUsageCaps.aiGenerations ?? 20),
    };
  }
  if (typeof body.paywallMessage === "string") {
    update.paywallMessage = body.paywallMessage.trim();
  }

  const next = await TrialSettingsModel.findOneAndUpdate(
    { key: "default" },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  await writeAuditLog({
    userId: auth.adminId,
    action: "UPDATE_TRIAL_SETTINGS",
    entity: "TrialSettings:default",
    previousValue: previous,
    newValue: next,
  });

  return jsonOk({
    settings: {
      enabled: next!.enabled,
      trialDays: next!.trialDays,
      unlockedPackageId: next!.unlockedPackageId
        ? String(next!.unlockedPackageId)
        : null,
      fairUsageCaps: { ...next!.fairUsageCaps, offers: next!.fairUsageCaps.offers ?? 1 },
      paywallMessage: next!.paywallMessage,
    },
  });
}
