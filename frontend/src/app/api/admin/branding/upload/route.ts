import { withSuperAdmin, jsonError, jsonOk } from "@/lib/admin/api";
import { callBackend } from "@/lib/server/backend";

export async function POST(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as { dataUrl?: string; type?: "logoLight" | "logoDark" | "favicon" } | null;
  if (!body?.dataUrl || !body.type || !["logoLight", "logoDark", "favicon"].includes(body.type)) return jsonError("Choose a valid branding image.");
  const { response, data } = await callBackend<{ url?: string; message?: string }>("/api/internal/media/logo", {
    businessId: `platform-${body.type.toLowerCase()}`,
    dataUrl: body.dataUrl,
  });
  if (!response.ok || !data.url) return jsonError(data.message ?? "Image upload failed.", response.status);
  return jsonOk({ url: data.url });
}
