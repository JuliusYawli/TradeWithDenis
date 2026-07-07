import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
