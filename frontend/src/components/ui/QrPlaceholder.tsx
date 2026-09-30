"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

type QrPlaceholderProps = {
  /** Full URL or text to encode (preferred when available) */
  value?: string;
  /** Used to build `/o/{seed}` when `value` is omitted */
  seed?: string;
  size?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Compact card for previews (landing phone mock) */
  compact?: boolean;
};

export function QrPlaceholder({
  value,
  seed = "upsale",
  size = 220,
  title = "Scan with your camera",
  subtitle,
  className,
  compact = false,
}: QrPlaceholderProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const payload = useMemo(() => {
    if (value?.trim()) return value.trim();
    if (origin) return `${origin}/o/${seed}`;
    return "";
  }, [value, seed, origin]);

  const moduleSize = compact ? Math.round(size * 0.7) : Math.round(size * 0.76);
  const quiet = compact ? 12 : 16;

  if (!payload) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-2xl bg-white/90",
          compact ? "h-[148px] w-[148px]" : "h-[240px] w-[240px]",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <figure
      className={cn("inline-flex max-w-full flex-col items-center gap-3", className)}
      aria-label={title}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white",
          compact
            ? "px-3 py-3 shadow-[0_8px_28px_-10px_rgba(15,23,42,0.35)]"
            : "px-4 py-4 shadow-[0_16px_48px_-16px_rgba(15,23,42,0.35)]",
        )}
      >
        <div
          className="mx-auto rounded-xl bg-white"
          style={{
            padding: quiet,
            width: moduleSize + quiet * 2,
            height: moduleSize + quiet * 2,
            boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.06)",
          }}
        >
          <QRCode
            value={payload}
            size={moduleSize}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#111827"
            title={title}
            style={{
              height: "auto",
              maxWidth: "100%",
              width: "100%",
              display: "block",
            }}
          />
        </div>
      </div>

      {!compact && (title || subtitle) ? (
        <figcaption className="text-center">
          {title ? (
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
              {title}
            </p>
          ) : null}
          {subtitle ? (
            <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-muted">{subtitle}</p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
