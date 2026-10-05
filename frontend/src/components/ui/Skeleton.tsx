"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Single shimmer bone — uses theme `.skeleton` tokens. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden {...props} />;
}

type SkeletonPageProps = {
  children: ReactNode;
  className?: string;
};

/** Fade-in wrapper for route `loading.tsx` and client fetch placeholders. */
export function SkeletonPage({ children, className }: SkeletonPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0.55 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      aria-busy="true"
      aria-live="polite"
    >
      {children}
    </motion.div>
  );
}

/** Staggered fade for lists of skeleton rows/cards. */
export function SkeletonStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.045 } },
      }}
      aria-busy="true"
    >
      {children}
    </motion.div>
  );
}

export function SkeletonItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}
