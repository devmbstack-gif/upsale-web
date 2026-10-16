import { NextResponse } from "next/server";

function getBackendWebhookUrl(request: Request) {
  const backendUrl = process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "");
  if (!backendUrl) return null;

  const incomingUrl = new URL(request.url);
  return `${backendUrl}/api/webhooks/whatsapp${incomingUrl.search}`;
}

export async function GET(request: Request) {
  const webhookUrl = getBackendWebhookUrl(request);
  if (!webhookUrl) {
    return NextResponse.json(
      { message: "WhatsApp webhook backend is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "GET",
      cache: "no-store",
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "text/plain; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "WhatsApp webhook backend is unavailable." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const webhookUrl = getBackendWebhookUrl(request);
  if (!webhookUrl) {
    return NextResponse.json(
      { message: "WhatsApp webhook backend is not configured." },
      { status: 503 },
    );
  }

  try {
    const rawBody = await request.arrayBuffer();
    const signature = request.headers.get("x-hub-signature-256");
    const headers = new Headers({
      "content-type": request.headers.get("content-type") || "application/json",
    });
    if (signature) headers.set("x-hub-signature-256", signature);

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: rawBody,
      cache: "no-store",
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "WhatsApp webhook backend is unavailable." },
      { status: 502 },
    );
  }
}
