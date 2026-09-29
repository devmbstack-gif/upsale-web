import { cn } from "@/lib/utils";
import type { OfferStatus } from "@/lib/mock-data";

const statusStyles: Record<OfferStatus, string> = {
  active:
    "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-200 dark:border-emerald-400/25",
  paused:
    "bg-amber-500/15 text-amber-800 border-amber-500/25 dark:text-amber-200 dark:border-amber-400/25",
  expired:
    "bg-zinc-500/15 text-zinc-700 border-zinc-400/25 dark:text-zinc-300 dark:border-zinc-400/20",
  draft:
    "bg-violet-500/15 text-violet-800 border-violet-500/25 dark:text-violet-200 dark:border-violet-400/25",
};

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | OfferStatus | "redeemed" | "pending";
};

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const style =
    variant === "redeemed"
      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/25 dark:text-emerald-200 dark:border-emerald-400/25"
      : variant === "pending"
        ? "bg-amber-500/15 text-amber-800 border-amber-500/25 dark:text-amber-200 dark:border-amber-400/25"
        : variant === "default"
          ? "bg-[var(--hover-surface)] text-muted border-[var(--border)]"
          : statusStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className,
      )}
    >
      {children}
    </span>
  );
}
