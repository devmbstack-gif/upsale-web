"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPortal } from "react-dom";

export function ConfirmDialog({ open, title, description, confirmLabel = "Delete", busy = false, onCancel, onConfirm }: {
  open: boolean; title: string; description: string; confirmLabel?: string; busy?: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-red-400/30 bg-red-500/10 text-red-300"><AlertTriangle size={21} /></span>
          <div className="min-w-0 flex-1"><h2 id="confirm-title" className="font-display text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{description}</p></div>
          <button type="button" className="rounded-lg p-1.5 text-muted hover:bg-[var(--hover-surface)] hover:text-foreground" onClick={onCancel} disabled={busy} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button type="button" className="!bg-red-600 hover:!bg-red-500" onClick={onConfirm} disabled={busy}>{busy ? "Deleting…" : confirmLabel}</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
