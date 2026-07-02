import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ProductFilters } from "@/components/product-filters";
import { getProducts, getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "iPhone Catalog",
  description: "Browse available iPhones with transparent pricing and weekly payment plans."
};

export default async function IphonesPage() {
  const [settings, products] = await Promise.all([getSiteSettings(), getProducts()]);

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-12">
        <h1 className="text-4xl font-black tracking-tight">Available iPhones</h1>
        <p className="mt-3 max-w-2xl text-neutral-600">Search by model or storage, filter by condition and stock, then sort by the cost that matters most.</p>
        <div className="mt-8">
          <ProductFilters products={products} />
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
