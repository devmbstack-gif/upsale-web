"use client";

import { cn } from "@/lib/utils";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index → ~80ms steps */
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Extra ms on top of stagger */
  delayMs?: number;
  variant?: "up" | "scale";
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  delayMs = 0,
  variant = "up",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const style = {
    "--reveal-delay": `${delay * 80 + delayMs}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        variant === "scale" ? "reveal-scale" : "reveal",
        visible && "is-visible",
        className,
      )}
    >
      {children}
    </div>
  );
}
