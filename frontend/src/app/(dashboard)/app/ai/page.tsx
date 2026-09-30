"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { AI_DEAL_DRAFT_KEY, type AiDealDraft } from "@/lib/ai-deal-maker";
import { segmentLabel, type SegmentId } from "@/lib/segments";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Stats = {
  audience: SegmentId;
  audienceLabel: string;
  count: number;
  avgVisits: number;
  avgSpend: number;
  avgDaysSinceVisit: number;
  totalRedeemed: number;
  redemptionRate: number;
};

type Suggestion = {
  title: string;
  discountLabel: string;
  message: string;
  rationale: string;
  variant: number;
  maxDiscountHint: string;
};

const AUDIENCES: SegmentId[] = ["all", "new", "repeat", "vip", "at_risk"];

export default function AiDealMakerPage() {
  const router = useRouter();
  const [audience, setAudience] = useState<SegmentId>("all");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [discountLabel, setDiscountLabel] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/segments", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { counts: Record<string, number> };
      setCounts(data.counts ?? {});
    })();
  }, []);

  const generate = useCallback(
    async (nextAudience: SegmentId, variant?: number) => {
      setLoading(true);
      setError(null);
      setNote(null);
      setEditing(false);
      try {
        const res = await fetch("/api/ai/suggest", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audience: nextAudience,
            variant: variant ?? Math.floor(Math.random() * 3),
          }),
        });
        const data = (await res.json()) as {
          ok: boolean;
          message?: string;
          note?: string;
          stats?: Stats;
          suggestion?: Suggestion;
        };
        if (!res.ok || !data.ok || !data.suggestion) {
          setError(data.message ?? "Could not generate a suggestion.");
          return;
        }
        setStats(data.stats ?? null);
        setSuggestion(data.suggestion);
        setTitle(data.suggestion.title);
        setDiscountLabel(data.suggestion.discountLabel);
        setMessage(data.suggestion.message);
        setNote(data.note ?? null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void generate("all", 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial suggestion only
  }, []);

  function onRegenerate() {
    const nextVariant = ((suggestion?.variant ?? 0) + 1) % 3;
    void generate(audience, nextVariant);
  }

  function onApprove() {
    const draft: AiDealDraft = {
      title: title.trim(),
      message: message.trim(),
      discountLabel: discountLabel.trim(),
      audience,
      fromAi: true,
    };
    if (!draft.title || !draft.message) {
      setError("Title and WhatsApp message are required before approve.");
      return;
    }
    try {
      sessionStorage.setItem(AI_DEAL_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore quota */
    }
    const params = new URLSearchParams({
      fromAi: "1",
      title: draft.title,
      message: draft.message,
      discount: draft.discountLabel,
      audience: draft.audience,
    });
    router.push(`/app/deals?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Reveal>
        <div className="card-interactive space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">AI Deal Maker</h2>
              <p className="text-sm text-muted">
                Suggestions use your segment stats. Nothing is sent until you approve and finish on
                Deals.
              </p>
            </div>
            <Badge variant="pending">Never auto-sends</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground/90">Audience segment</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((id) => (
                <button
                  key={id}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setAudience(id);
                    void generate(id, 0);
                  }}
                  className={
                    audience === id
                      ? "rounded-xl border border-[rgba(196,181,253,0.4)] bg-brand-from/20 px-3 py-1.5 text-xs font-medium"
                      : "rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-muted hover:bg-[var(--hover-surface)]"
                  }
                >
                  {segmentLabel(id)}
                  {typeof counts[id] === "number" ? ` (${counts[id]})` : ""}
                </button>
              ))}
            </div>
          </div>

          {stats ? (
            <dl className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] bg-[var(--hover-surface)]/40 p-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">In segment</dt>
                <dd className="mt-1 font-semibold">{stats.count}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Avg visits</dt>
                <dd className="mt-1 font-semibold">{stats.avgVisits}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Avg spend</dt>
                <dd className="mt-1 font-semibold">{stats.avgSpend}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Days since visit</dt>
                <dd className="mt-1 font-semibold">{stats.avgDaysSinceVisit}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </Reveal>

      <Reveal delay={1}>
        <div className="card-interactive space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold">Suggested deal</h3>
            {loading ? <span className="text-sm text-muted">Generating…</span> : null}
          </div>

          {suggestion?.rationale ? (
            <p className="rounded-xl border border-[var(--border)] bg-brand-from/10 px-3 py-2 text-sm text-muted">
              {suggestion.rationale}
            </p>
          ) : null}

          {editing ? (
            <div className="grid gap-4">
              <Input
                label="Deal title"
                name="ai-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                label="Discount label"
                name="ai-discount"
                value={discountLabel}
                onChange={(e) => setDiscountLabel(e.target.value)}
              />
              <TextArea
                label="WhatsApp message"
                name="ai-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Title</p>
                <p className="mt-1 font-medium">{title || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Discount</p>
                <p className="mt-1 font-medium">{discountLabel || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">WhatsApp copy</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {message || "—"}
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted">
            {suggestion?.maxDiscountHint ??
              "Approve opens the Deals form with this draft. You still choose send now or schedule."}
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={loading || !suggestion} onClick={onApprove}>
              Approve → Deals
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading || !suggestion}
              onClick={() => setEditing((e) => !e)}
            >
              {editing ? "Done editing" : "Edit"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={onRegenerate}
            >
              Regenerate
            </Button>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {note ? <p className="text-sm text-muted">{note}</p> : null}
        </div>
      </Reveal>
    </div>
  );
}
