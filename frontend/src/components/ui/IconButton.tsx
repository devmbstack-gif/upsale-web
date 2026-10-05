"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type IconTone = "neutral" | "danger" | "success" | "primary";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: LucideIcon;
  label: string;
  tone?: IconTone;
  href?: string;
  size?: "sm" | "md";
};

const tones: Record<IconTone, string> = {
  neutral:
    "border-[var(--border)] bg-surface-elevated text-muted hover:border-[rgba(196,181,253,0.35)] hover:text-foreground",
  danger:
    "border-red-400/30 bg-red-500/10 text-[var(--danger-text)] hover:bg-red-500/20 hover:border-red-400/45",
  success:
    "border-emerald-400/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/45",
  primary:
    "border-brand-from/30 bg-brand-from/10 text-brand-to hover:bg-brand-from/20 hover:border-brand-from/45",
};

const sizes = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-9 w-9 rounded-xl",
};

const iconSizes = {
  sm: 16,
  md: 18,
};

export function IconButton({
  icon: Icon,
  label,
  tone = "neutral",
  href,
  size = "sm",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center border transition-all duration-200",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-from/40",
    tones[tone],
    sizes[size],
    className,
  );

  const iconEl = <Icon size={iconSizes[size]} strokeWidth={2} aria-hidden />;

  if (href) {
    return (
      <Link href={href} className={classes} title={label} aria-label={label}>
        {iconEl}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      title={label}
      aria-label={label}
      {...props}
    >
      {iconEl}
    </button>
  );
}
