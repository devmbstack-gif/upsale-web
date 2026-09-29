"use client";

import { useId } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "light" | "dark" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
};

const sizeStyles = {
  sm: { wrap: "h-10 gap-2", icon: 36, text: "text-[1.4rem]" },
  md: { wrap: "h-12 gap-2.5", icon: 44, text: "text-[1.75rem]" },
  lg: { wrap: "h-14 gap-3", icon: 52, text: "text-[2rem]" },
  xl: { wrap: "h-[4.5rem] gap-3.5", icon: 68, text: "text-[2.75rem] md:text-[3rem]" },
} as const;

/** U bowl + upward arrow — matches public/upsale-logo.png proportions */
function LogoMark({
  size,
  className,
  gid,
}: {
  size: number;
  className?: string;
  gid: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 90 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gid}
          x1="10"
          y1="78"
          x2="68"
          y2="4"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5B21B6" />
          <stop offset="0.4" stopColor="#7C3AED" />
          <stop offset="0.75" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#EDE9FE" />
        </linearGradient>
      </defs>
      {/* Left stem + bowl + right stem (continuous) */}
      <path
        d="M18 14 L18 50 C18 63.807 29.193 75 43 75 C56.807 75 68 63.807 68 50 L68 32"
        stroke={`url(#${gid})`}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow shaft (extends right stem upward) */}
      <path
        d="M68 50 L68 20"
        stroke={`url(#${gid})`}
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow head */}
      <path
        d="M52 24 L68 4 L84 24"
        stroke={`url(#${gid})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function BrandLogo({
  variant = "auto",
  size = "md",
  className,
  priority: _priority,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const gid = useId().replace(/:/g, "");
  const resolved =
    variant === "auto" ? (theme === "light" ? "light" : "dark") : variant;
  const s = sizeStyles[size];

  return (
    <span
      className={cn("inline-flex items-center", s.wrap, className)}
      role="img"
      aria-label="UPSale"
    >
      <LogoMark size={s.icon} gid={`upsale-${gid}`} />
      <span
        className={cn(
          "font-display leading-none tracking-tight",
          s.text,
          resolved === "light" ? "text-zinc-900" : "text-white",
        )}
      >
        <span className="font-bold">UPS</span>
        <span className="font-medium opacity-90">ale</span>
      </span>
    </span>
  );
}
