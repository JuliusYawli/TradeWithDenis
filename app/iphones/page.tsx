import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ProductFilters } from "@/components/product-filters";
import { getPublicProducts, getPublicSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "iPhone Catalog",
  description: "Browse available iPhones with transparent pricing and weekly payment plans."
};

export default async function IphonesPage() {
  const [settings, products] = await Promise.all([getPublicSiteSettings(), getPublicProducts()]);

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-8 sm:py-12">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8">
          <p className="section-eyebrow">Available stock</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Available iPhones</h1>
          <p className="mt-3 max-w-2xl text-neutral-600">Search by model or storage, filter by condition and stock, then choose a phone to book a shop visit before purchase.</p>
        </div>
        <div className="mt-6 sm:mt-8">
          <ProductFilters products={products} />
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
