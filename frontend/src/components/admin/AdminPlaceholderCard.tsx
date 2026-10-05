"use client";

import type { ReactNode } from "react";

export function AdminPlaceholderCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="card-interactive mx-auto max-w-3xl p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Coming next
      </p>
      <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
