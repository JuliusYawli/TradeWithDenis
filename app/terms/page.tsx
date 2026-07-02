import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Terms", description: "TradeWithDenis website and purchase terms." };

export default async function TermsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <h1 className="text-4xl font-black tracking-tight">Terms</h1>
        <p className="mt-8 max-w-3xl text-neutral-700">Prices, stock, financing approvals, warranty coverage, and appointment times should be confirmed by TradeWithDenis before payment. Replace this placeholder with reviewed commercial terms before launch.</p>
      </main>
      <Footer settings={settings} />
    </>
  );
}
