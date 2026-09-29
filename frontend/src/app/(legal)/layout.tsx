import type { ReactNode } from "react";
import { dmSans, outfit } from "@/lib/fonts";
import "@/styles/theme-tokens.css";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="dark"
      className={`${outfit.variable} ${dmSans.variable}`}
      style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)" }}
    >
      {children}
    </div>
  );
}
