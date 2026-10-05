import { SiteSectionCMSModel } from "@/lib/models/site-section-cms";
import { writeAuditLog } from "@/lib/admin/audit";
import { withSuperAdmin, jsonOk, jsonError } from "@/lib/admin/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Ctx) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const section = await SiteSectionCMSModel.findById(id).lean();
  if (!section) return jsonError("Section not found", 404);

  return jsonOk({
    section: {
      id: String(section._id),
      sectionKey: section.sectionKey,
      locale: section.locale,
      content: section.content ?? {},
      isPublished: section.isPublished,
      versionHistory: (section.versionHistory ?? []).map((v) => ({
        id: String(v._id),
        content: v.content,
        savedAt: v.savedAt,
        note: v.note,
      })),
    },
  });
}

export async function PATCH(request: Request, context: Ctx) {
  const auth = await withSuperAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    content?: Record<string, unknown>;
    isPublished?: boolean;
    note?: string;
    rollbackVersionId?: string;
  } | null;

  if (!body) return jsonError("Invalid body");

  const section = await SiteSectionCMSModel.findById(id);
  if (!section) return jsonError("Section not found", 404);

  const previousContent = section.content;

  if (body.rollbackVersionId) {
    const version = section.versionHistory?.id(body.rollbackVersionId);
    if (!version) return jsonError("Version not found", 404);
    section.versionHistory.push({
      content: previousContent,
      savedAt: new Date(),
      savedBy: auth.adminId as unknown as undefined,
      note: `Auto-save before rollback`,
    });
    section.content = version.content;
    section.updatedBy = auth.adminId as unknown as typeof section.updatedBy;
    await section.save();

    await writeAuditLog({
      userId: auth.adminId,
      action: "ROLLBACK_CMS_SECTION",
      entity: `SiteSectionCMS:${id}`,
      previousValue: previousContent,
      newValue: section.content,
    });

    return jsonOk({
      section: {
        id: String(section._id),
        content: section.content,
        isPublished: section.isPublished,
        versionCount: section.versionHistory.length,
      },
    });
  }

  if (body.content !== undefined) {
    section.versionHistory.push({
      content: previousContent,
      savedAt: new Date(),
      savedBy: auth.adminId as unknown as undefined,
      note: body.note ?? "Manual save",
    });
    // Keep last 20 versions
    if (section.versionHistory.length > 20) {
      section.versionHistory.splice(0, section.versionHistory.length - 20);
    }
    section.content = body.content;
  }

  if (typeof body.isPublished === "boolean") {
    section.isPublished = body.isPublished;
  }

  section.updatedBy = auth.adminId as unknown as typeof section.updatedBy;
  await section.save();

  await writeAuditLog({
    userId: auth.adminId,
    action:
      typeof body.isPublished === "boolean" && body.isPublished
        ? "PUBLISH_CMS_SECTION"
        : "UPDATE_CMS_SECTION",
    entity: `SiteSectionCMS:${id}`,
    previousValue: previousContent,
    newValue: section.content,
  });

  return jsonOk({
    section: {
      id: String(section._id),
      sectionKey: section.sectionKey,
      locale: section.locale,
      content: section.content,
      isPublished: section.isPublished,
      versionCount: section.versionHistory.length,
    },
  });
}
