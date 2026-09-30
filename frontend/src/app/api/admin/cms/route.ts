import { SiteSectionCMSModel } from "@/lib/models/site-section-cms";
import { writeAuditLog } from "@/lib/admin/audit";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

const DEFAULT_SECTIONS = [
  {
    sectionKey: "hero",
    locale: "en",
    content: {
      eyebrow: "QR to WhatsApp",
      headline: "Turn every walk-in into a customer you can message again",
      subtitle: "UPSale puts a discount on your counter.",
    },
  },
  {
    sectionKey: "pricing",
    locale: "en",
    content: {
      eyebrow: "Pricing",
      headline: "Plans that grow with your floor",
      subtitle: "Currency follows the country you pick.",
    },
  },
  {
    sectionKey: "footer",
    locale: "en",
    content: {
      blurb: "QR offers that turn walk-ins into WhatsApp customers.",
    },
  },
];

export async function GET() {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  let sections = await SiteSectionCMSModel.find().sort({ sectionKey: 1, locale: 1 }).lean();
  if (sections.length === 0) {
    await SiteSectionCMSModel.insertMany(
      DEFAULT_SECTIONS.map((s) => ({
        ...s,
        isPublished: false,
        updatedBy: auth.adminId,
        versionHistory: [],
      })),
    );
    sections = await SiteSectionCMSModel.find().sort({ sectionKey: 1, locale: 1 }).lean();
  }

  return jsonOk({
    sections: sections.map((s) => ({
      id: String(s._id),
      sectionKey: s.sectionKey,
      locale: s.locale,
      content: s.content ?? {},
      isPublished: s.isPublished,
      updatedAt: s.updatedAt,
      versionCount: s.versionHistory?.length ?? 0,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    sectionKey?: string;
    locale?: string;
    content?: Record<string, unknown>;
  } | null;

  const sectionKey = body?.sectionKey?.trim();
  const locale = (body?.locale ?? "en").trim().toLowerCase();
  if (!sectionKey) return jsonError("sectionKey is required");

  try {
    const created = await SiteSectionCMSModel.create({
      sectionKey,
      locale,
      content: body?.content ?? {},
      isPublished: false,
      updatedBy: auth.adminId,
      versionHistory: [],
    });

    await writeAuditLog({
      userId: auth.adminId,
      action: "UPDATE_CMS_SECTION",
      entity: `SiteSectionCMS:${created._id}`,
      newValue: { sectionKey, locale },
    });

    return jsonOk(
      {
        section: {
          id: String(created._id),
          sectionKey: created.sectionKey,
          locale: created.locale,
          content: created.content,
          isPublished: created.isPublished,
          versionCount: 0,
        },
      },
      201,
    );
  } catch {
    return jsonError("Section already exists for this locale", 409);
  }
}
