import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bric",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UPSale — Turn walk-ins into customers you can message",
  description:
    "UPSale turns a counter QR code into a WhatsApp customer list, a one-time coupon, and the next offer for restaurants, salons, and retailers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bricolage.variable}`}>
      <body>{children}</body>
    </html>
  );
}
