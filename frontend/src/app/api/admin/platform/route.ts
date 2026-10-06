import { PlatformSettingsModel } from "@/lib/models/platform-settings";
import { writeAuditLog } from "@/lib/admin/audit";
import { decryptSecret, encryptSecret, maskSecret } from "@/lib/crypto/secrets";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

type StoredSettings = {
  geminiApiKey?: string;
  openAiApiKey?: string;
  waApiBaseUrl?: string;
  appPublicUrl?: string;
};

function reveal(value?: string) {
  if (!value) return "";
  try {
    return decryptSecret(value);
  } catch {
    return "";
  }
}

async function readSettings() {
  const collection = PlatformSettingsModel.collection;
  let stored = (await collection.findOne({ key: "default" })) as StoredSettings | null;
  if (!stored) {
    await collection.insertOne({
      key: "default",
      geminiApiKey: "",
      openAiApiKey: "",
      waApiBaseUrl: "",
      appPublicUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    stored = (await collection.findOne({ key: "default" })) as StoredSettings;
  }
  return {
    geminiApiKey: reveal(stored.geminiApiKey || stored.openAiApiKey),
    waApiBaseUrl: reveal(stored.waApiBaseUrl),
    appPublicUrl: reveal(stored.appPublicUrl),
  };
}

function responseSettings(settings: Awaited<ReturnType<typeof readSettings>>) {
  return {
    geminiApiKeyMasked: maskSecret(settings.geminiApiKey),
    geminiApiKeySet: Boolean(settings.geminiApiKey),
    waApiBaseUrl: settings.waApiBaseUrl,
    appPublicUrl: settings.appPublicUrl,
  };
}

export async function GET() {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;
  return jsonOk({ settings: responseSettings(await readSettings()) });
}

export async function PUT(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    geminiApiKey?: string;
    waApiBaseUrl?: string;
    appPublicUrl?: string;
    clearGeminiApiKey?: boolean;
  } | null;
  if (!body) return jsonError("Invalid body");

  for (const [label, value] of [
    ["WhatsApp API base URL", body.waApiBaseUrl],
    ["App public URL", body.appPublicUrl],
  ] as const) {
    if (typeof value !== "string" || !value.trim()) continue;
    try {
      const url = new URL(value.trim());
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol");
    } catch {
      return jsonError(`${label} must be a valid HTTP or HTTPS URL.`);
    }
  }

  const previousSettings = await readSettings();
  const updates: Record<string, string | Date> = { updatedAt: new Date() };

  if (body.clearGeminiApiKey) {
    updates.geminiApiKey = "";
    updates.openAiApiKey = "";
  } else if (typeof body.geminiApiKey === "string" && body.geminiApiKey.trim()) {
    updates.geminiApiKey = encryptSecret(body.geminiApiKey.trim());
    updates.openAiApiKey = "";
  }
  if (typeof body.waApiBaseUrl === "string") {
    updates.waApiBaseUrl = body.waApiBaseUrl.trim() ? encryptSecret(body.waApiBaseUrl.trim()) : "";
  }
  if (typeof body.appPublicUrl === "string") {
    updates.appPublicUrl = body.appPublicUrl.trim() ? encryptSecret(body.appPublicUrl.trim()) : "";
  }

  await PlatformSettingsModel.collection.updateOne(
    { key: "default" },
    { $set: updates, $setOnInsert: { key: "default", createdAt: new Date() } },
    { upsert: true },
  );
  const saved = await readSettings();

  await writeAuditLog({
    userId: auth.adminId,
    action: "CHANGE_PLATFORM_KEY",
    entity: "PlatformSettings:default",
    previousValue: {
      geminiApiKeySet: Boolean(previousSettings.geminiApiKey),
      waApiBaseUrl: previousSettings.waApiBaseUrl,
      appPublicUrl: previousSettings.appPublicUrl,
    },
    newValue: {
      geminiApiKeySet: Boolean(saved.geminiApiKey),
      waApiBaseUrl: saved.waApiBaseUrl,
      appPublicUrl: saved.appPublicUrl,
    },
  });

  return jsonOk({ settings: responseSettings(saved) });
}
