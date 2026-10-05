import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const PREFIX = "v1";

function encryptionKey(): Buffer {
  const secret = process.env.PLATFORM_SECRETS_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error("PLATFORM_SECRETS_KEY or JWT_SECRET must be configured.");
  return scryptSync(secret, "upsale-platform-secrets-v1", 32);
}

/** AES-256-GCM encrypt — returns `v1:iv:tag:ciphertext` (base64url). */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  if (plainText.startsWith(`${PREFIX}:`)) return plainText;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    PREFIX,
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":");
}

/** Decrypt a blob produced by `encryptSecret`. */
export function decryptSecret(payload: string): string {
  if (!payload) return "";
  if (!payload.startsWith(`${PREFIX}:`)) return payload;
  const [, ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted secret format");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Mask for API responses (never return full secrets). */
export function maskSecret(value: string | undefined | null): string {
  if (!value) return "";
  const plain = value.startsWith(`${PREFIX}:`) ? decryptSecret(value) : value;
  if (plain.length <= 4) return "••••";
  return `${"•".repeat(Math.min(12, plain.length - 4))}${plain.slice(-4)}`;
}
