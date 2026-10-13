import { NextResponse } from "next/server";
import { auth, setUpsaleSessionCookie } from "@/auth";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

function getPublicOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedHost && !/^localhost(?::\d+)?$/i.test(forwardedHost)) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  const configuredUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Fall back to the request origin when an environment value is malformed.
    }
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const publicOrigin = getPublicOrigin(request);
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.redirect(new URL("/login?googleError=no-account", publicOrigin));
  }

  try {
    await connectDB();
    const owner = await BusinessOwnerModel.findOne({ email });

    // Same gate as the Auth.js signIn callback — never create an account here.
    if (!owner || !owner.isVerified) {
      return NextResponse.redirect(new URL("/login?googleError=no-account", publicOrigin));
    }

    await BusinessOwnerModel.updateOne(
      { _id: owner._id },
      { $set: { googleLinked: true, googleLinkedAt: new Date() } },
    );

    await setUpsaleSessionCookie(owner);
    return NextResponse.redirect(new URL("/dashboard", publicOrigin));
  } catch {
    return NextResponse.redirect(new URL("/login?googleError=no-account", publicOrigin));
  }
}
