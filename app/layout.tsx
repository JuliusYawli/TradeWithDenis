import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
