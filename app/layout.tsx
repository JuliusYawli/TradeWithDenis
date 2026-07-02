import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tradewithdenis.com"),
  title: {
    default: "TradeWithDenis | iPhones & Apple Device Financing in Ghana",
    template: "%s | TradeWithDenis"
  },
  description: "Premium iPhone sales and transparent weekly payment plans in Ghana.",
  openGraph: {
    title: "TradeWithDenis",
    description: "Clean, transparent Apple device sales and financing in Ghana.",
    images: ["/og.svg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
