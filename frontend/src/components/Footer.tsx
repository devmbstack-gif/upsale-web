import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const productLinks = [
  { href: "#features", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#demo", label: "Demo Video" },
  { href: "#integrations", label: "Integrations" },
] as const;

const accountLinks = [
  { href: "/login", label: "Sign In" },
  { href: "/signup", label: "Sign Up" },
] as const;

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/#contact", label: "Contact Sales" },
] as const;

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white";

  if (href.startsWith("#") || href.startsWith("/#")) {
    return (
      <li>
        <a href={href} className={className}>
          {label}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} className={className}>
        {label}
      </Link>
    </li>
  );
}

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-white/10 dark:bg-[#0a0814]/60 dark:shadow-[0_0_30px_rgba(120,50,255,0.1)] md:p-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex w-fit drop-shadow-[0_0_18px_rgba(124,58,237,0.35)]"
              aria-label="UPSale home"
            >
              <BrandLogo variant="auto" size="md" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500 dark:text-neutral-400">
              QR offers that turn walk-ins into WhatsApp customers.
            </p>
            <p className="mt-auto pt-2 text-xs text-slate-400 dark:text-neutral-500">
              © 2026 UPSale. All rights reserved.
            </p>
          </div>

          <FooterColumn title="Product">
            {productLinks.map((item) => (
              <FooterLink key={item.href} href={item.href} label={item.label} />
            ))}
          </FooterColumn>

          <FooterColumn title="Account">
            {accountLinks.map((item) => (
              <FooterLink key={item.href} href={item.href} label={item.label} />
            ))}
          </FooterColumn>

          <FooterColumn title="Legal & Support">
            {legalLinks.map((item) => (
              <FooterLink key={item.href} href={item.href} label={item.label} />
            ))}
          </FooterColumn>
        </div>
      </div>
    </footer>
  );
}
