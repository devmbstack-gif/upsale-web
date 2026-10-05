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
        <h2 className="font-display text-lg font-semibold">Edit content (JSON)</h2>
        <TextArea
          label="Content JSON"
          className="min-h-[220px] font-mono text-xs"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
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
