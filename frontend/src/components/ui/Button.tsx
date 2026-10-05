import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary:
    "btn-shine gradient-brand text-white shadow-lg shadow-brand-from/25 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-from/35",
  secondary:
    "bg-surface-elevated border border-[var(--border)] text-foreground hover:border-[rgba(196,181,253,0.4)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-from/10",
  ghost: "text-muted hover:text-foreground hover:bg-[var(--hover-surface)]",
  danger:
    "bg-red-500/15 border border-red-400/30 text-[var(--danger-text)] hover:bg-red-500/25 hover:-translate-y-0.5",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

export function Button({
  variant = "primary",
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
