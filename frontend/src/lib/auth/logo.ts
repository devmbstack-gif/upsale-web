import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export async function saveLogo(dataUrl: string | undefined) {
  if (!dataUrl?.startsWith("data:image/")) return "";
  const [meta, encoded] = dataUrl.split(",");
  if (!meta || !encoded) return "";
  const type = meta.match(/^data:(image\/(?:png|jpeg|webp));base64$/i)?.[1];
  if (!type) return "";
  const buffer = Buffer.from(encoded, "base64");
  if (!buffer.length || buffer.length > 1_500_000) return "";
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "logos");
  await mkdir(dir, { recursive: true });
  const filename = `${randomBytes(16).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/logos/${filename}`;
}
