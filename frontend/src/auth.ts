import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE, type SessionPayload } from "@/lib/auth/session";
import { BusinessOwnerModel } from "@/lib/models/business-owner";
import { connectDB } from "@/lib/mongodb";

const NO_ACCOUNT_REDIRECT = "/login?googleError=no-account";

function sessionFromOwner(owner: {
  _id: unknown;
  email: string;
  businessName: string;
  category: string;
  country: string;
  currency: string;
  timezone: string;
  city: string;
  whatsapp: string;
  plan?: string;
}): SessionPayload {
  return {
    sub: String(owner._id),
    email: owner.email,
    businessName: owner.businessName,
    plan: owner.plan || "Free Trial",
    category: owner.category,
    country: owner.country,
    currency: owner.currency,
    timezone: owner.timezone,
    city: owner.city,
    whatsapp: owner.whatsapp,
    exp: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
  };
}

export async function setUpsaleSessionCookie(owner: Parameters<typeof sessionFromOwner>[0]) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(sessionFromOwner(owner)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 14 * 24 * 60 * 60,
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      if (!email) return NO_ACCOUNT_REDIRECT;

      let owner;
      try {
        await connectDB();
        owner = await BusinessOwnerModel.findOne({ email });
      } catch {
        return NO_ACCOUNT_REDIRECT;
      }

      // Existing verified accounts only — never create or auto-register.
      if (!owner || !owner.isVerified) {
        return NO_ACCOUNT_REDIRECT;
      }

      await BusinessOwnerModel.updateOne(
        { _id: owner._id },
        { $set: { googleLinked: true, googleLinkedAt: new Date() } },
      );

      try {
        await setUpsaleSessionCookie(owner);
      } catch {
        // Cookie may still be applied by /api/auth/google-complete.
      }

      return true;
    },
  },
});
