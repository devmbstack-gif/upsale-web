import type { ReactNode } from "react";
import { dmSans, outfit } from "@/lib/fonts";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${outfit.variable} ${dmSans.variable} min-h-screen bg-background text-foreground transition-colors duration-200`}
    >
      {children}
    </div>
  );
}
