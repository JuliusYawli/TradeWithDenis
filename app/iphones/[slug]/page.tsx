import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Footer } from "@/components/footer";
import { LeadForm } from "@/components/lead-form";
import { Nav } from "@/components/nav";
import { ProductCard } from "@/components/product-card";
import { financingFor, formatCedi } from "@/lib/finance";
import { getProduct, getProducts, getSiteSettings } from "@/lib/data";
import { stockImageForProduct } from "@/lib/iphone-pricing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product ? `${product.model} ${product.storage}` : "iPhone", description: product?.description ?? "iPhone product details" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [settings, product, allProducts] = await Promise.all([getSiteSettings(), getProduct(slug), getProducts()]);
  if (!product) notFound();

  const finance = financingFor(product);
  const similar = allProducts.filter((item) => item.slug !== product.slug).slice(0, 3);
  const imageUrls = product.image_urls.length ? product.image_urls : [stockImageForProduct(product.model, product.storage, product.condition)];
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.model} ${product.storage}`,
    brand: product.brand,
    image: imageUrls,
    offers: { "@type": "Offer", price: product.price, priceCurrency: "GHS", availability: "https://schema.org/InStock" }
  };

  return (
    <>
      <Nav settings={settings} />
      <main className="container-page py-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-white">
              <Image src={imageUrls[0]} alt={`${product.model} ${product.storage}`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {imageUrls.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-md border border-line bg-white">
                  <Image src={src} alt={product.model} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          </div>
          <section>
            <p className="text-sm font-bold uppercase tracking-wide text-red">{product.stock_status.replace("_", " ")}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{product.model} {product.storage}</h1>
            <p className="mt-3 text-neutral-600">{product.condition}{product.grade ? ` · Grade ${product.grade}` : ""} · {product.warranty_months} month warranty</p>
            <p className="mt-6 text-4xl font-black">{formatCedi(product.price)}</p>

            <div className="mt-6 grid gap-3 rounded-lg border border-line bg-white p-5 sm:grid-cols-2">
              {[
                ["Down payment", finance.downPayment],
                ["Financed balance", finance.financedBalance],
                ["Weekly payment", product.weekly_payment],
                ["Total weekly paid", finance.totalWeeklyPaid],
                ["Total paid", finance.totalPaid],
                ["Finance cost", finance.financeCost]
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-md bg-snow p-4">
                  <p className="text-sm text-neutral-500">{label}</p>
                  <p className="text-xl font-black">{formatCedi(Number(value))}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" href="#reserve">Book shop appointment</Link>
              <a className="btn-secondary" href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, "")}?text=I%20am%20interested%20in%20${encodeURIComponent(product.model)}`}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </section>
        </div>

        <section id="reserve" className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-black">Book a shop visit</h2>
            <p className="mt-2 text-neutral-600">This does not complete a sale online. The customer visits the shop to inspect the device, confirm terms, and complete the order.</p>
          </div>
          <LeadForm product={product} />
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-black">Similar products</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {similar.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
