"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { AI_DEAL_DRAFT_KEY, type AiDealDraft } from "@/lib/ai-deal-maker";
import { segmentLabel, type SegmentId } from "@/lib/segments";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
  cta?: string;
  postCaption?: string;
  generatedPostImage?: string;
  contactNumber?: string;
};

const AUDIENCES: SegmentId[] = ["all", "new", "repeat", "vip", "at_risk"];
const PRODUCT_DRAFT_KEY = "upsale-ai-product-image";
const PRODUCT_POST_KEY = "upsale-ai-generated-post";
const PRODUCT_CAPTION_KEY = "upsale-ai-product-caption";
const GENERATED_DEAL_KEY = "upsale-ai-generated-deal";

async function responseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) throw new Error(`The server returned an empty response (${response.status}). Make sure the backend is running and try again.`);
  try { return JSON.parse(text) as T; }
  catch { throw new Error(`The server returned an invalid response (${response.status}). Please try again.`); }
}

async function createBrandedPost(imageUrl: string, title: string, discount: string, contactNumber: string) {
  const image = new Image(); image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("Could not prepare the promotional post.")); image.src = imageUrl; });
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Could not prepare the promotional post.");
  const scale = Math.max(1080 / image.width, 1080 / image.height); const width = image.width * scale; const height = image.height * scale;
  ctx.drawImage(image, (1080 - width) / 2, (1080 - height) / 2, width, height);
  const shade = ctx.createLinearGradient(0, 420, 0, 1080); shade.addColorStop(0, "rgba(12,8,28,0)"); shade.addColorStop(1, "rgba(12,8,28,.96)"); ctx.fillStyle = shade; ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = "#a78bfa"; ctx.fillRect(72, 720, 150, 8);
  ctx.fillStyle = "white"; ctx.font = "700 72px Arial"; ctx.fillText(title.slice(0, 25), 72, 820, 930);
  if (discount) { ctx.fillStyle = "#c4b5fd"; ctx.font = "600 46px Arial"; ctx.fillText(discount.slice(0, 38), 72, 900, 930); }
  ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "500 28px Arial"; ctx.fillText(`WhatsApp ${contactNumber}`, 72, 980);
  ctx.textAlign = "right"; ctx.fillText("UPSale", 1008, 980); ctx.textAlign = "left";
  return canvas.toDataURL("image/jpeg", .9);
}

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
  const [productDataUrl, setProductDataUrl] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [generatedPostUrl, setGeneratedPostUrl] = useState("");
  const [productCaption, setProductCaption] = useState("");
  const [cta, setCta] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [includePost, setIncludePost] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem(PRODUCT_DRAFT_KEY);
    if (savedImage) setProductImageUrl(savedImage);
    const savedPost = localStorage.getItem(PRODUCT_POST_KEY);
    if (savedPost) setGeneratedPostUrl(savedPost);
    setProductCaption(localStorage.getItem(PRODUCT_CAPTION_KEY) ?? "");
    try {
      const savedDeal = JSON.parse(localStorage.getItem(GENERATED_DEAL_KEY) ?? "null") as { suggestion?: Suggestion; stats?: Stats; audience?: SegmentId; title?: string; discountLabel?: string; message?: string; postCaption?: string; includePost?: boolean } | null;
      if (savedDeal?.suggestion) {
        setSuggestion(savedDeal.suggestion); setStats(savedDeal.stats ?? null); setAudience(savedDeal.audience ?? "all");
        setTitle(savedDeal.title ?? savedDeal.suggestion.title); setDiscountLabel(savedDeal.discountLabel ?? savedDeal.suggestion.discountLabel);
        setMessage(savedDeal.message ?? savedDeal.suggestion.message); setPostCaption(savedDeal.postCaption ?? savedDeal.suggestion.postCaption ?? ""); setIncludePost(savedDeal.includePost !== false);
      }
    } catch { localStorage.removeItem(GENERATED_DEAL_KEY); }
    void (async () => {
      const res = await fetch("/api/segments", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = await responseJson<{ counts: Record<string, number> }>(res);
      setCounts(data.counts ?? {});
    })();
  }, []);

  async function selectProduct(file?: File) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 4_000_000) { setError("Use a PNG, JPG, or WebP product photo under 4 MB."); return; }
    setUploading(true); setError(null); setSuggestion(null); setStats(null); setGeneratedPostUrl(""); localStorage.removeItem(GENERATED_DEAL_KEY); localStorage.removeItem(PRODUCT_POST_KEY);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
      setProductDataUrl(dataUrl);
      const response = await fetch("/api/media/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl }) });
      const data = await responseJson<{ url?: string; message?: string }>(response);
      if (!response.ok || !data.url) throw new Error(data.message ?? "Product photo upload failed.");
      setProductImageUrl(data.url); setGeneratedPostUrl(""); setProductDataUrl("");
      localStorage.setItem(PRODUCT_DRAFT_KEY, data.url); localStorage.removeItem(PRODUCT_POST_KEY);
    } catch (e) { setError(e instanceof Error ? e.message : "Product photo upload failed."); }
    finally { setUploading(false); }
  }

  function removeProduct() {
    setProductDataUrl(""); setProductImageUrl(""); setGeneratedPostUrl(""); setProductCaption(""); setSuggestion(null); setTitle(""); setMessage(""); setPostCaption("");
    localStorage.removeItem(PRODUCT_DRAFT_KEY); localStorage.removeItem(PRODUCT_POST_KEY); localStorage.removeItem(PRODUCT_CAPTION_KEY); localStorage.removeItem(GENERATED_DEAL_KEY);
  }

  const generate = useCallback(
    async (nextAudience: SegmentId, variant?: number) => {
      if (!productDataUrl && !productImageUrl) {
        setError("Upload a product photo before generating an offer.");
        return;
      }
      setLoading(true);
      setError(null);
      setNote(null);
      setEditing(false);
      setGeneratedPostUrl("");
      localStorage.removeItem(PRODUCT_POST_KEY);
      try {
        let uploadedUrl = productImageUrl;
        if (!uploadedUrl && productDataUrl) {
          const uploadRes = await fetch("/api/media/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl: productDataUrl }) });
          const uploaded = await responseJson<{ ok?: boolean; url?: string; message?: string }>(uploadRes);
          if (!uploadRes.ok || !uploaded.url) throw new Error(uploaded.message ?? "Product photo upload failed.");
          uploadedUrl = uploaded.url; setProductImageUrl(uploadedUrl);
        }
        const res = await fetch("/api/ai/suggest", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audience: nextAudience,
            variant: variant ?? Math.floor(Math.random() * 3),
            productImageUrl: uploadedUrl,
            productDetails: productCaption.trim(),
          }),
        });
        const data = await responseJson<{
          ok: boolean;
          message?: string;
          note?: string;
          stats?: Stats;
          suggestion?: Suggestion;
        }>(res);
        if (!res.ok || !data.ok || !data.suggestion) {
          setError(data.message ?? "Could not generate a suggestion.");
          return;
        }
        setStats(data.stats ?? null);
        setSuggestion(data.suggestion);
        setTitle(data.suggestion.title);
        setDiscountLabel(data.suggestion.discountLabel);
        setMessage(data.suggestion.message);
        setCta(data.suggestion.cta ?? "Shop this offer now");
        setPostCaption(data.suggestion.postCaption ?? `${data.suggestion.title}\n${data.suggestion.message}`);
        let generatedPost = data.suggestion.generatedPostImage;
        if (!generatedPost) generatedPost = await createBrandedPost(uploadedUrl, data.suggestion.title, data.suggestion.discountLabel, data.suggestion.contactNumber ?? "+1 234 567 8900");
        if (generatedPost) {
          let postUploadRes = await fetch("/api/media/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl: generatedPost }) });
          let postUpload = await responseJson<{ url?: string }>(postUploadRes);
          if (!postUploadRes.ok || !postUpload.url) {
            const fallbackPost = await createBrandedPost(uploadedUrl, data.suggestion.title, data.suggestion.discountLabel, data.suggestion.contactNumber ?? "+1 234 567 8900");
            postUploadRes = await fetch("/api/media/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl: fallbackPost }) });
            postUpload = await responseJson<{ url?: string }>(postUploadRes);
          }
          if (postUploadRes.ok && postUpload.url) { setGeneratedPostUrl(postUpload.url); setProductDataUrl(""); localStorage.setItem(PRODUCT_POST_KEY, postUpload.url); }
          else throw new Error("The promotional post was created but could not be saved. Please try again.");
        }
        localStorage.setItem(GENERATED_DEAL_KEY, JSON.stringify({ suggestion: data.suggestion, stats: data.stats ?? null, audience: nextAudience, title: data.suggestion.title, discountLabel: data.suggestion.discountLabel, message: data.suggestion.message, postCaption: data.suggestion.postCaption ?? `${data.suggestion.title}\n${data.suggestion.message}`, includePost: true }));
        setNote(data.note ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not generate a suggestion.");
      } finally {
        setLoading(false);
      }
    },
    [productCaption, productDataUrl, productImageUrl],
  );

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
      cta: cta.trim(),
      postCaption: postCaption.trim(),
      productImageUrl: generatedPostUrl || productImageUrl,
      includePost,
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

          <div className="grid gap-4 rounded-xl border border-[var(--border)] p-4 sm:grid-cols-[220px_1fr]">
            <div className="relative">
            <label className="flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[var(--border)] bg-[var(--hover-surface)] text-center text-sm text-muted">
              {productDataUrl || productImageUrl ? <img src={productDataUrl || productImageUrl} alt="Product preview" className="h-36 w-full object-cover" /> : <span className="px-3">Upload product photo</span>}
              <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => void selectProduct(event.target.files?.[0])} />
            </label>
            {productDataUrl || productImageUrl ? <button type="button" onClick={removeProduct} className="absolute right-2 top-2 rounded-full bg-black/75 p-2 text-white" aria-label="Remove product photo"><X size={17} /></button> : null}
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <TextArea label="Product caption (optional)" value={productCaption} onChange={(event) => { setProductCaption(event.target.value); localStorage.setItem(PRODUCT_CAPTION_KEY, event.target.value); }} placeholder="Add product name or a short detail if you want. AI can also work from the image only." />
              {uploading ? <p className="text-sm text-brand-to">Uploading picture…</p> : <p className="text-xs text-muted">AI analyzes the photo and uses this optional caption as extra context.</p>}
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
            {loading ? <Skeleton className="h-4 w-24" /> : null}
          </div>

          {loading ? (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div>
                <Skeleton className="mb-1 h-3 w-12" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div>
                <Skeleton className="mb-1 h-3 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div>
                <Skeleton className="mb-1 h-3 w-28" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : suggestion?.rationale ? (
            <p className="rounded-xl border border-[var(--border)] bg-brand-from/10 px-3 py-2 text-sm text-muted">
              {suggestion.rationale}
            </p>
          ) : null}

          {!loading && editing ? (
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
              <TextArea label="Promotional post caption" value={postCaption} onChange={(e) => setPostCaption(e.target.value)} placeholder="Example: Fresh style, made for you. Visit Ryan Salon this weekend and enjoy 10% off." />
              <p className="text-xs text-muted">This caption appears with the generated post. It does not need {"{{name}}"} or Reply STOP.</p>
              <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 text-sm"><input type="checkbox" checked={includePost} onChange={(e) => setIncludePost(e.target.checked)} />Send product post with this deal</label>
            </div>
          ) : null}

          {!loading && !editing && suggestion ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Title</p>
                <p className="mt-1 font-medium">{title || "—"}</p>
              </div>
              {includePost ? <div className="space-y-3 rounded-xl border border-[var(--border)] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-brand-to">AI Generated Post</p><img src={generatedPostUrl || productImageUrl} alt="AI generated promotional post" className="mx-auto aspect-square w-full max-w-lg rounded-xl object-cover" /><div><p className="text-xs uppercase tracking-wide text-muted">Product caption</p><p className="mt-1 whitespace-pre-wrap text-sm">{postCaption}</p></div></div> : null}
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
          ) : null}

          {!loading && !suggestion ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] px-5 py-8 text-center">
              <p className="font-medium">No suggestion generated yet</p>
              <p className="mt-1 text-sm text-muted">Choose an audience, then generate a deal when you are ready.</p>
            </div>
          ) : null}

          <p className="text-xs text-muted">
            {suggestion?.maxDiscountHint ??
              "Approve opens the Deals form with this draft. You still choose send now or schedule."}
          </p>

          <div className="flex flex-wrap gap-2">
            {!suggestion ? (
              <Button type="button" disabled={loading} onClick={() => void generate(audience, 0)}>
                Generate suggestion
              </Button>
            ) : null}
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
