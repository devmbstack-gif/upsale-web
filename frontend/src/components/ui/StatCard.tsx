import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, hint, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "card-interactive group flex h-full min-h-[132px] flex-col justify-between p-5 md:min-h-[144px] md:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="min-h-[1.25rem] text-sm leading-5 text-muted transition-colors group-hover:text-brand-to">
            {label}
          </p>
          <p className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground transition-transform duration-300 group-hover:translate-x-0.5">
            {value}
          </p>
        </div>
        {icon ? (
          <div className="stat-icon-float flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-from/15 text-brand-to transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 min-h-[1rem] text-xs leading-4 text-muted/80">
        {hint ?? "\u00A0"}
      </p>
    </div>
  );
}
