import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Warranty", description: "TradeWithDenis warranty policy placeholders and device support terms." };

export default async function WarrantyPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <h1 className="text-4xl font-black tracking-tight">Warranty Policy</h1>
        <div className="mt-8 max-w-3xl space-y-5 text-neutral-700">
          <p>Each product lists its warranty period. Final warranty coverage should be confirmed on the invoice or receipt at purchase.</p>
          <p>Use this page to publish exact coverage for battery health, screen, Face ID, water damage exclusions, software locks, and return windows.</p>
          <p>Business registration: {settings.business_registration}</p>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
