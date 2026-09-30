import { Schema, model, models, type InferSchemaType } from "mongoose";

const versionHistorySchema = new Schema(
  {
    content: { type: Schema.Types.Mixed, required: true },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: "" },
  },
  { _id: true },
);

const siteSectionCmsSchema = new Schema(
  {
    sectionKey: { type: String, required: true, trim: true },
    locale: { type: String, required: true, default: "en", trim: true, lowercase: true },
    content: { type: Schema.Types.Mixed, default: {} },
    isPublished: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    versionHistory: { type: [versionHistorySchema], default: [] },
  },
  { timestamps: true },
);

siteSectionCmsSchema.index({ sectionKey: 1, locale: 1 }, { unique: true });

export type SiteSectionCMS = InferSchemaType<typeof siteSectionCmsSchema>;

export const SiteSectionCMSModel =
  models.SiteSectionCMS ||
  model("SiteSectionCMS", siteSectionCmsSchema, "site_section_cms");
