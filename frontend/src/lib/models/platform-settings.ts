import { Schema, model, models, type InferSchemaType } from "mongoose";
import { decryptSecret, encryptSecret } from "@/lib/crypto/secrets";

function encryptedField(defaultValue = "") {
  return {
    type: String,
    default: defaultValue,
    set: (value: string) => {
      if (!value) return "";
      // Already encrypted blob
      if (value.startsWith("v1:")) return value;
      return encryptSecret(value);
    },
    get: (value: string) => {
      if (!value) return "";
      try {
        return decryptSecret(value);
      } catch {
        return "";
      }
    },
  };
}

const platformSettingsSchema = new Schema(
  {
    /** Singleton document key */
    key: { type: String, default: "default", unique: true },
    openAiApiKey: encryptedField(""),
    waApiBaseUrl: encryptedField(""),
    appPublicUrl: encryptedField(""),
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  },
);

export type PlatformSettings = InferSchemaType<typeof platformSettingsSchema>;

export const PlatformSettingsModel =
  models.PlatformSettings ||
  model("PlatformSettings", platformSettingsSchema, "platform_settings");
