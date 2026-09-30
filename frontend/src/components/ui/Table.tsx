import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function TableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-interactive overflow-hidden",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <table className={cn("w-full min-w-[640px] text-left text-sm", className)}>
      {children}
    </table>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[var(--border)] bg-[var(--hover-surface)] text-xs uppercase tracking-wide text-muted">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border)]">{children}</tbody>;
}

export function TR({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-[var(--hover-surface)]", className)}>
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 font-medium md:px-6", className)}>{children}</th>
  );
}

export function TD({
  children,
  className,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn("px-4 py-3.5 text-foreground/90 md:px-6", className)}
    >
      {children}
    </td>
  );
}
