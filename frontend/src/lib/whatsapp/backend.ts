import "server-only";

export async function callWhatsAppBackend<T>(path: string, body: unknown): Promise<{ response: Response; data: T }> {
  const url = process.env.BACKEND_INTERNAL_URL;
  const secret = process.env.INTERNAL_API_SECRET;
  if (!url || !secret) throw new Error("WhatsApp backend connection is not configured.");
  const response = await fetch(`${url}/api/internal/whatsapp/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-secret": secret },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as T;
  return { response, data };
}
