import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ProductFilters } from "@/components/product-filters";
import { formatCedi } from "@/lib/finance";
import { getPublicProducts, getPublicSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "iPhone Catalog",
  description: "Browse available iPhones with transparent pricing and weekly payment plans."
};

export default async function IphonesPage() {
  const [settings, products] = await Promise.all([getPublicSiteSettings(), getPublicProducts()]);
  const inStockCount = products.filter((product) => product.stock_status === "in_stock").length;
  const lowestWeekly = products.length ? Math.min(...products.map((product) => product.weekly_payment)) : 0;
  const maxWarranty = products.length ? Math.max(...products.map((product) => product.warranty_months)) : 0;

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-8 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="section-eyebrow">Available stock</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Choose an iPhone, inspect it in shop, then complete payment.</h1>
              <p className="mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">Browse verified devices with clear cash prices, weekly plans, warranty details, and appointment booking before purchase.</p>
            </div>
            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-snow text-center">
              <div className="border-r border-line p-4">
                <p className="text-2xl font-semibold text-ink">{inStockCount}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">In stock</p>
              </div>
              <div className="border-r border-line p-4">
                <p className="text-2xl font-semibold text-ink">{lowestWeekly ? formatCedi(lowestWeekly) : "-"}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">From weekly</p>
              </div>
              <div className="p-4">
                <p className="text-2xl font-semibold text-ink">{maxWarranty || "-"} mo</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-500">Warranty</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-8">
          <ProductFilters products={products} />
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
