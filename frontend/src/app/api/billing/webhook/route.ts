import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "");
  const signature = request.headers.get("stripe-signature");

  if (!backendUrl) {
    return NextResponse.json({ received: false, message: "Billing backend is not configured." }, { status: 503 });
  }
  if (!signature) {
    return NextResponse.json({ received: false, message: "Stripe signature is missing." }, { status: 400 });
  }

  try {
    const rawBody = await request.arrayBuffer();
    const response = await fetch(`${backendUrl}/api/internal/billing/webhook`, {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") || "application/json",
        "stripe-signature": signature,
      },
      body: rawBody,
      cache: "no-store",
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ received: false, message: "Billing webhook backend is unavailable." }, { status: 502 });
  }
}
