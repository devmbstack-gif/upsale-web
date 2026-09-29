import { NextResponse } from "next/server";
import { auth, setUpsaleSessionCookie } from "@/auth";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: Request) {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.redirect(new URL("/login?googleError=no-account", request.url));
  }

  try {
    await connectDB();
    const owner = await BusinessOwnerModel.findOne({ email });

    // Same gate as the Auth.js signIn callback — never create an account here.
    if (!owner || !owner.isVerified) {
      return NextResponse.redirect(new URL("/login?googleError=no-account", request.url));
    }

    await setUpsaleSessionCookie(owner);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?googleError=no-account", request.url));
  }
}
