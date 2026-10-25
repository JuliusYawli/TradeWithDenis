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
        <ProductFilters products={products} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
