import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Financing Terms", description: "Transparent iPhone financing terms, deposits, weekly payments, and total cost." };

export default async function FinancingTermsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Financing Terms</h1>
        <div className="mt-8 max-w-3xl space-y-5 text-neutral-700">
          <p>Default plans use a 40% deposit and 12 weekly installments unless a product page shows a different setup.</p>
          <p>Every product page displays device price, down payment, financed balance, weekly payment, total weekly paid, total paid, and finance cost.</p>
          <p>Publish exact late payment, repossession, cancellation, and identity verification rules here before accepting financing applications.</p>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
