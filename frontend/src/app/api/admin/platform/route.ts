import { PlatformSettingsModel } from "@/lib/models/platform-settings";
import { writeAuditLog } from "@/lib/admin/audit";
import { maskSecret } from "@/lib/crypto/secrets";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

export async function GET() {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  let settings = await PlatformSettingsModel.findOne({ key: "default" });
  if (!settings) {
    settings = await PlatformSettingsModel.create({ key: "default" });
  }

  // getters decrypt — mask for response
  const openAi = settings.openAiApiKey || "";
  const wa = settings.waApiBaseUrl || "";
  const appUrl = settings.appPublicUrl || "";

  return jsonOk({
    settings: {
      openAiApiKeyMasked: maskSecret(openAi),
      openAiApiKeySet: Boolean(openAi),
      waApiBaseUrl: wa,
      appPublicUrl: appUrl,
    },
  });
}

export async function PUT(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    openAiApiKey?: string;
    waApiBaseUrl?: string;
    appPublicUrl?: string;
    clearOpenAiApiKey?: boolean;
  } | null;

  if (!body) return jsonError("Invalid body");

  let settings = await PlatformSettingsModel.findOne({ key: "default" });
  if (!settings) settings = await PlatformSettingsModel.create({ key: "default" });

  const previous = {
    openAiApiKeySet: Boolean(settings.openAiApiKey),
    waApiBaseUrl: settings.waApiBaseUrl || "",
    appPublicUrl: settings.appPublicUrl || "",
  };

  if (body.clearOpenAiApiKey) settings.openAiApiKey = "";
  else if (typeof body.openAiApiKey === "string" && body.openAiApiKey.trim()) {
    settings.openAiApiKey = body.openAiApiKey.trim();
  }
  if (typeof body.waApiBaseUrl === "string") {
    settings.waApiBaseUrl = body.waApiBaseUrl.trim();
  }
  if (typeof body.appPublicUrl === "string") {
    settings.appPublicUrl = body.appPublicUrl.trim();
  }

  await settings.save();

  await writeAuditLog({
    userId: auth.adminId,
    action: "CHANGE_PLATFORM_KEY",
    entity: "PlatformSettings:default",
    previousValue: previous,
    newValue: {
      openAiApiKeySet: Boolean(settings.openAiApiKey),
      waApiBaseUrl: settings.waApiBaseUrl || "",
      appPublicUrl: settings.appPublicUrl || "",
    },
  });

  return jsonOk({
    settings: {
      openAiApiKeyMasked: maskSecret(settings.openAiApiKey || ""),
      openAiApiKeySet: Boolean(settings.openAiApiKey),
      waApiBaseUrl: settings.waApiBaseUrl || "",
      appPublicUrl: settings.appPublicUrl || "",
    },
  });
}
