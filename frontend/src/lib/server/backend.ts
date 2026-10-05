import "server-only";

export async function callBackend<T = Record<string, unknown>>(path: string, body: unknown) {
  const baseUrl = process.env.BACKEND_INTERNAL_URL;
  const secret = process.env.INTERNAL_API_SECRET;
  if (!baseUrl || !secret) throw new Error("Backend connection is not configured.");
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-secret": secret },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T;
  return { response, data };
}
