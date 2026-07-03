import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tradewithdennis.com"),
  title: {
    default: "TradeWithDennis | iPhones & Apple Device Financing in Ghana",
    template: "%s | TradeWithDennis"
  },
  description: "Premium iPhone sales and transparent weekly payment plans in Ghana.",
  openGraph: {
    title: "TradeWithDennis",
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
