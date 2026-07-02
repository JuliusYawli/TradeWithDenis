import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Privacy Policy", description: "How TradeWithDenis handles lead and customer information." };

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-8 max-w-3xl text-neutral-700">Lead details are collected so TradeWithDenis can respond to product inquiries, reservations, appointments, and financing requests. Replace this placeholder with a reviewed privacy policy before launch.</p>
      </main>
      <Footer settings={settings} />
    </>
  );
}
