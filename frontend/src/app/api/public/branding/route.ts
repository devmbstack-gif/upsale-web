import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SiteSectionCMSModel } from "@/lib/models/site-section-cms";

const defaults = { logoLight: "/logo-light.png", logoDark: "/logo-dark.png", favicon: "/favicon-32.png" };

export async function GET() {
  try {
    await connectDB();
    const section = await SiteSectionCMSModel.findOne({ sectionKey: "branding", locale: "en", isPublished: true }).lean();
    return NextResponse.json({ ok: true, branding: { ...defaults, ...(section?.content ?? {}) } });
  } catch {
    return NextResponse.json({ ok: true, branding: defaults });
  }
}
