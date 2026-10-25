import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { getPublicSiteSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Returns and Refunds", description: "How returns and refunds are discussed for TradeWithDennis in-shop purchases." };

export default async function ReturnsPage() {
  const settings = await getPublicSiteSettings();
  return <><Nav settings={settings} /><main className="container-page py-12"><article className="max-w-3xl space-y-6">
    <div><h1 className="text-3xl font-semibold tracking-tight">Returns and refunds</h1><p className="mt-4 text-sm font-medium text-neutral-500">Last updated: October 18, 2026</p></div>
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">No online sale</h2><p className="mt-3 leading-7 text-neutral-700">This website does not collect payment or complete a sale. Customers inspect the device and confirm the purchase, warranty, payment terms, and any return conditions at the shop before paying.</p></section>
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Confirm before purchase</h2><p className="mt-3 leading-7 text-neutral-700">Return or refund eligibility may depend on the device, its condition, the reason for the request, warranty coverage, and the written terms agreed at purchase. Ask the shop to explain the applicable conditions before payment. This page does not replace rights that cannot legally be excluded.</p></section>
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Requesting help</h2><p className="mt-3 leading-7 text-neutral-700">Keep your receipt and contact TradeWithDennis promptly at <a className="font-semibold text-red underline" href={`tel:${settings.phone ?? ""}`}>{settings.phone ?? "the shop"}</a> or visit {settings.address ?? "the shop"}. The business must confirm its final written return and refund rules before public launch.</p></section>
  </article></main><Footer settings={settings} /></>;
}
