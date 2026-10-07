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
        "card-interactive overflow-hidden max-sm:border-0 max-sm:bg-transparent max-sm:shadow-none",
        className,
      )}
    >
      <div className="overflow-visible sm:overscroll-x-contain sm:overflow-x-auto sm:[scrollbar-width:thin]">{children}</div>
    </div>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <table className={cn("w-full text-left text-sm sm:min-w-[640px] max-sm:block", className)}>
      {children}
    </table>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[var(--border)] bg-[var(--hover-surface)] text-xs uppercase tracking-wide text-muted max-sm:hidden">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border)] max-sm:grid max-sm:gap-3 max-sm:divide-y-0">{children}</tbody>;
}

export function TR({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("transition-colors hover:bg-[var(--hover-surface)] max-sm:grid max-sm:min-w-0 max-sm:gap-2 max-sm:rounded-2xl max-sm:border max-sm:border-[var(--border)] max-sm:bg-surface/80 max-sm:p-4", className)}>
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
  label,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  label?: string;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn("px-4 py-3.5 text-foreground/90 md:px-6 max-sm:flex max-sm:min-w-0 max-sm:flex-wrap max-sm:items-center max-sm:justify-between max-sm:gap-2 max-sm:border-b max-sm:border-[var(--border)]/60 max-sm:px-0 max-sm:py-2 max-sm:last:border-b-0", className)}
    >
      {label ? <span className="hidden text-[0.68rem] font-semibold uppercase tracking-wide text-muted max-sm:block">{label}</span> : null}
      {children}
    </td>
  );
}
