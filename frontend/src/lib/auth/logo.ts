import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX_BYTES = 1_500_000;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

export type SaveLogoResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

function logosDir() {
  return path.join(process.cwd(), "public", "uploads", "logos");
}

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

/** Signup-compatible helper — returns empty string on failure. */
export async function saveLogo(dataUrl: string | undefined) {
  if (!dataUrl) return "";
  const result = await saveLogoFromDataUrl(dataUrl);
  return result.ok ? result.url : "";
}

export async function saveLogoFromDataUrl(dataUrl: string): Promise<SaveLogoResult> {
  if (!dataUrl.startsWith("data:image/")) {
    return { ok: false, message: "Upload a PNG, JPG, or WebP image." };
  }
  const [meta, encoded] = dataUrl.split(",");
  if (!meta || !encoded) {
    return { ok: false, message: "Invalid image data." };
  }
  const type = meta.match(/^data:(image\/[a-z0-9.+-]+);base64$/i)?.[1]?.toLowerCase();
  if (!type || !ALLOWED.has(type)) {
    return { ok: false, message: "Only PNG, JPG, or WebP images are allowed." };
  }
  let buffer: Buffer;
  try {
    buffer = Buffer.from(encoded, "base64");
  } catch {
    return { ok: false, message: "Invalid image data." };
  }
  if (!buffer.length) {
    return { ok: false, message: "Invalid image data." };
  }
  if (buffer.length > MAX_BYTES) {
    return { ok: false, message: "Logo must be under 1.5 MB." };
  }

  const dir = logosDir();
  await mkdir(dir, { recursive: true });
  const filename = `${randomBytes(16).toString("hex")}.${extensionFor(type)}`;
  await writeFile(path.join(dir, filename), buffer);
  return { ok: true, url: `/uploads/logos/${filename}` };
}

/** Deletes a previously saved logo under /uploads/logos only. */
export async function deleteLogoFile(logoUrl: string | undefined | null) {
  if (!logoUrl) return;
  if (!logoUrl.startsWith("/uploads/logos/")) return;
  const filename = path.basename(logoUrl);
  if (!filename || filename.includes("..") || filename !== logoUrl.slice("/uploads/logos/".length)) {
    return;
  }
  try {
    await unlink(path.join(logosDir(), filename));
  } catch {
    /* already gone */
  }
}
