"use client";

import AdminListCardsSkeleton from "@/components/admin/AdminListCardsSkeleton";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { useCallback, useEffect, useState } from "react";

type SectionListItem = {
  id: string;
  sectionKey: string;
  locale: string;
  content: Record<string, unknown>;
  isPublished: boolean;
  versionCount: number;
};

type Version = {
  id: string;
  content: Record<string, unknown>;
  savedAt?: string;
  note?: string;
};

export default function AdminCmsPage() {
  const [sections, setSections] = useState<SectionListItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [jsonText, setJsonText] = useState("{}");
  const [versions, setVersions] = useState<Version[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewImage, setPreviewImage] = useState<{ src: string; label: string } | null>(null);
  const selectedSection = sections.find((section) => section.id === selectedId);
  const isSeoSection = selectedSection?.sectionKey === "seo";
  const isBrandingSection = selectedSection?.sectionKey === "branding";

  function seoContent() {
    try {
      return JSON.parse(jsonText) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  function updateSeoField(key: string, value: unknown) {
    setJsonText(JSON.stringify({ ...seoContent(), [key]: value }, null, 2));
  }

  async function uploadBrandingImage(type: "logoLight" | "logoDark" | "favicon", file?: File) {
    if (!file) return;
    setSaving(true); setError(""); setMessage("");
    try {
      if (!file.type.match(/^image\/(png|jpeg|webp)$/) || file.size > 1_500_000) throw new Error("Use a PNG, JPG, or WebP image under 1.5 MB.");
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
      });
      const response = await fetch("/api/admin/branding/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, dataUrl }) });
      const data = await response.json() as { ok?: boolean; url?: string; message?: string };
      if (!response.ok || !data.url) throw new Error(data.message ?? "Upload failed.");
      updateSeoField(type, data.url);
      setMessage("Image uploaded. Save and publish to apply it across the website.");
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setSaving(false); }
  }

  const loadList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cms", { credentials: "same-origin" });
      const data = (await res.json()) as {
        ok: boolean;
        sections?: SectionListItem[];
        message?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Failed to load");
      setSections(data.sections ?? []);
      if (!selectedId && data.sections?.[0]) {
        setSelectedId(data.sections[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  const loadDetail = useCallback(async (id: string) => {
    if (!id) return;
    const res = await fetch(`/api/admin/cms/${id}`, { credentials: "same-origin" });
    const data = (await res.json()) as {
      ok: boolean;
      section?: {
        content: Record<string, unknown>;
        isPublished: boolean;
        versionHistory: Version[];
      };
      message?: string;
    };
    if (!res.ok || !data.ok || !data.section) {
      setError(data.message ?? "Failed to load section");
      return;
    }
    setJsonText(JSON.stringify(data.section.content ?? {}, null, 2));
    setIsPublished(data.section.isPublished);
    setVersions(data.section.versionHistory ?? []);
  }, []);

  useEffect(() => {
    void loadList();
  }, []);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function save(publish?: boolean) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const content = JSON.parse(jsonText) as Record<string, unknown>;
      const res = await fetch(`/api/admin/cms/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          content,
          isPublished: typeof publish === "boolean" ? publish : isPublished,
          note: "Editor save",
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Save failed");
      setMessage("Section saved.");
      await loadList();
      await loadDetail(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function rollback(versionId: string) {
    if (!confirm("Rollback to this version?")) return;
    const res = await fetch(`/api/admin/cms/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ rollbackVersionId: versionId }),
    });
    const data = (await res.json()) as { ok: boolean; message?: string };
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Rollback failed");
      return;
    }
    setMessage("Rolled back.");
    await loadDetail(selectedId);
    await loadList();
  }

  async function createSection() {
    if (!newKey.trim()) return;
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ sectionKey: newKey.trim(), locale: "en", content: {} }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      section?: { id: string };
      message?: string;
    };
    if (!res.ok || !data.ok) {
      setError(data.message ?? "Create failed");
      return;
    }
    setNewKey("");
    await loadList();
    if (data.section?.id) setSelectedId(data.section.id);
  }

  if (loading && sections.length === 0) {
    return <AdminListCardsSkeleton cards={4} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-3">
        <div className="card-interactive space-y-2 p-4">
          <Input
            label="New section key"
            placeholder="e.g. integrations"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={() => void createSection()}>
            Add section
          </Button>
        </div>
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`card-interactive w-full p-4 text-left transition ${
              selectedId === s.id ? "border-[rgba(196,181,253,0.45)]" : ""
            }`}
          >
            <p className="font-medium">
              {s.sectionKey}{" "}
              <span className="text-xs text-muted">({s.locale})</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {s.isPublished ? "Published" : "Draft"} · {s.versionCount} versions
            </p>
          </button>
        ))}
      </div>

      <div className="card-interactive space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">{isSeoSection ? "Website SEO" : isBrandingSection ? "Website branding" : "Edit content (JSON)"}</h2>
        {isSeoSection ? (
          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--hover-surface)]/30 p-4">
            <p className="text-sm text-muted">Published values control homepage search metadata and social sharing previews.</p>
            <Input label="Site name" value={String(seoContent().siteName ?? "")} onChange={(e) => updateSeoField("siteName", e.target.value)} />
            <Input label="SEO title" value={String(seoContent().title ?? "")} onChange={(e) => updateSeoField("title", e.target.value)} />
            <TextArea label="Meta description" value={String(seoContent().description ?? "")} onChange={(e) => updateSeoField("description", e.target.value)} />
            <Input label="Keywords (comma separated)" value={Array.isArray(seoContent().keywords) ? (seoContent().keywords as unknown[]).join(", ") : ""} onChange={(e) => updateSeoField("keywords", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
            <Input label="Canonical production URL" placeholder="https://upsale.app" value={String(seoContent().canonicalUrl ?? "")} onChange={(e) => updateSeoField("canonicalUrl", e.target.value)} />
            <Input label="Social sharing image URL" placeholder="/social-preview.jpg or https://…" value={String(seoContent().ogImage ?? "")} onChange={(e) => updateSeoField("ogImage", e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"><input type="checkbox" checked={seoContent().robotsIndex !== false} onChange={(e) => updateSeoField("robotsIndex", e.target.checked)} />Allow search indexing</label>
              <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"><input type="checkbox" checked={seoContent().robotsFollow !== false} onChange={(e) => updateSeoField("robotsFollow", e.target.checked)} />Allow link following</label>
            </div>
          </div>
        ) : null}
        {isBrandingSection ? (
          <div className="space-y-4 rounded-2xl border border-[var(--border)] p-4">
            <p className="text-sm text-muted">Upload the website wordmarks and browser favicon. Save and publish after uploading.</p>
            {([['logoLight', 'Logo for light backgrounds'], ['logoDark', 'Logo for dark backgrounds'], ['favicon', 'Browser favicon']] as const).map(([key, label]) => (
              <div key={key} className="space-y-3 rounded-xl border border-[var(--border)] p-3">
                <p className="text-sm font-medium">{label}</p>
                <div className={`flex min-h-24 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] p-4 ${key === "logoLight" ? "bg-white" : "bg-[#100d1c]"}`}>
                  {String(seoContent()[key] ?? "") ? (
                    <img src={String(seoContent()[key])} alt={`${label} preview`} className={key === "favicon" ? "h-16 w-16 object-contain" : "max-h-20 max-w-full object-contain"} />
                  ) : <span className="text-sm text-muted">No image uploaded</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--hover-surface)]">
                    {String(seoContent()[key] ?? "") ? "Replace image" : "Upload image"}
                    <input type="file" accept="image/png,image/jpeg,image/webp" disabled={saving} onChange={(e) => void uploadBrandingImage(key, e.target.files?.[0])} className="sr-only" />
                  </label>
                  <Button type="button" variant="secondary" disabled={!String(seoContent()[key] ?? "")} onClick={() => setPreviewImage({ src: String(seoContent()[key]), label })}>Preview</Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!isBrandingSection ? <TextArea
          label={isSeoSection ? "Advanced SEO JSON" : "Content JSON"}
          className="min-h-[220px] font-mono text-xs"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        /> : null}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" disabled={saving || !selectedId} onClick={() => void save()}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={saving || !selectedId}
            onClick={() => void save(true)}
          >
            Save & publish
          </Button>
        </div>
        {previewImage ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label={`${previewImage.label} preview`} onClick={() => setPreviewImage(null)}>
            <div className="w-full max-w-3xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between gap-3"><h3 className="font-display text-lg font-semibold">{previewImage.label}</h3><Button type="button" variant="secondary" onClick={() => setPreviewImage(null)}>Close</Button></div>
              <div className="flex min-h-64 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#fff_0%,#fff_50%,#100d1c_50%,#100d1c_100%)] p-8">
                <img src={previewImage.src} alt={previewImage.label} className="max-h-[60vh] max-w-full object-contain" />
              </div>
            </div>
          </div>
        ) : null}
        {error ? <p className="text-sm text-[var(--danger-text)]">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

        <div className="border-t border-[var(--border)] pt-4">
          <h3 className="text-sm font-semibold">Version history</h3>
          <ul className="mt-2 space-y-2">
            {versions
              .slice()
              .reverse()
              .map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs"
                >
                  <span className="text-muted">
                    {v.savedAt ? new Date(v.savedAt).toLocaleString() : "—"} · {v.note || "snapshot"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="!px-2 !py-1 text-xs"
                    onClick={() => void rollback(v.id)}
                  >
                    Rollback
                  </Button>
                </li>
              ))}
            {versions.length === 0 ? (
              <li className="text-xs text-muted">No versions yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
