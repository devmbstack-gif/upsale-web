"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** `light` = dark text on light surfaces; `dark` = white text on dark surfaces */
  variant?: "light" | "dark" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
};

/** Intrinsic size of the cropped official wordmark PNGs (~3.38:1). */
const LOGO_WIDTH = 1612;
const LOGO_HEIGHT = 476;

const sizeStyles = {
  sm: { wrap: "h-8", height: 32 },
  md: { wrap: "h-9", height: 36 },
  lg: { wrap: "h-10", height: 40 },
  xl: { wrap: "h-12", height: 48 },
} as const;

let cachedBranding: { logoLight?: string; logoDark?: string } | null = null;

export function BrandLogo({
  variant = "auto",
  size = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  const { theme } = useTheme();
  const [branding, setBranding] = useState(cachedBranding);
  useEffect(() => {
    if (cachedBranding) return;
    void fetch("/api/public/branding")
      .then((response) => response.json())
      .then((data) => {
        cachedBranding = data.branding ?? {};
        setBranding(cachedBranding);
      })
      .catch(() => undefined);
  }, []);
  const resolved =
    variant === "auto" ? (theme === "light" ? "light" : "dark") : variant;
  const s = sizeStyles[size];
  const src = resolved === "light"
    ? branding?.logoLight || "/logo-light.png"
    : branding?.logoDark || "/logo-dark.png";
  const width = Math.round((s.height * LOGO_WIDTH) / LOGO_HEIGHT);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center overflow-visible",
        s.wrap,
        className,
      )}
    >
      <Image
        src={src}
        alt="UPSale"
        width={width}
        height={s.height}
        className="h-full w-auto max-w-none object-contain object-left"
        priority={priority}
        unoptimized
      />
    </span>
  );
}
